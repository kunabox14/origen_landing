# Minimal CONCURRENT static file server (no admin / no URL-ACL needed) for local preview.
# Each connection is handled in its own runspace so speculative/preconnect sockets
# (opened by the browser without sending data) can't stall the accept loop.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 8000

$handler = {
  param($client, $root)
  $mime = @{
    ".html"="text/html; charset=utf-8"; ".htm"="text/html; charset=utf-8";
    ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8";
    ".mjs"="application/javascript; charset=utf-8";
    ".json"="application/json; charset=utf-8"; ".webmanifest"="application/manifest+json";
    ".svg"="image/svg+xml"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg";
    ".webp"="image/webp"; ".gif"="image/gif"; ".ico"="image/x-icon";
    ".woff2"="font/woff2"; ".woff"="font/woff"; ".ttf"="font/ttf"; ".txt"="text/plain; charset=utf-8"
  }
  try {
    $client.ReceiveTimeout = 8000
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII)
    $requestLine = $reader.ReadLine()
    if (-not $requestLine) { $client.Close(); return }
    $parts = $requestLine.Split(' ')
    $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
    $rawPath = ($rawPath -split '[?#]')[0]
    $decoded = [System.Uri]::UnescapeDataString($rawPath)
    if ($decoded -eq "/" -or $decoded -eq "") { $decoded = "/index.html" }
    $rel = $decoded.TrimStart('/').Replace('/', '\')
    $rootFull = [System.IO.Path]::GetFullPath($root)
    $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))

    if ($full.StartsWith($rootFull) -and (Test-Path $full -PathType Leaf)) {
      $ext = [System.IO.Path]::GetExtension($full).ToLower()
      $ct = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $body = [System.IO.File]::ReadAllBytes($full)
      $head = "HTTP/1.1 200 OK`r`nContent-Type: $ct`r`nContent-Length: $($body.Length)`r`nAccess-Control-Allow-Origin: *`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
    } else {
      $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $decoded")
      $head = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
    }
    $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
    $stream.Write($hb, 0, $hb.Length)
    $stream.Write($body, 0, $body.Length)
    $stream.Flush()
  } catch {
  } finally {
    try { $client.Close() } catch {}
  }
}

$pool = [RunspaceFactory]::CreateRunspacePool(1, 24)
$pool.Open()

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/ (concurrent)"

while ($true) {
  $client = $listener.AcceptTcpClient()
  $ps = [PowerShell]::Create()
  $ps.RunspacePool = $pool
  [void]$ps.AddScript($handler).AddArgument($client).AddArgument($root)
  [void]$ps.BeginInvoke()
}
