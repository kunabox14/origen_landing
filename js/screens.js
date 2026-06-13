// Resuelve las maquetas de pantalla embebidas en los iframes.
// En esta build modular no hay datos embebidos (window.__screenHTML / __resources),
// por lo que cae al fallback y carga los archivos reales de screens/*.html.
(function(){
  var dh = window.__screenHTML || {};
  var fallback = { screenInicio: 'screens/inicio.html', screenCarrito: 'screens/carrito.html' };
  document.querySelectorAll('iframe[data-screen]').forEach(function(f){
    var id = f.getAttribute('data-screen');
    if (dh[id]) { f.removeAttribute('src'); f.setAttribute('srcdoc', dh[id]); }
    else { var res = (window.__resources && window.__resources[id]) ? window.__resources[id] : fallback[id]; if (res) f.src = res; }
  });
})();
