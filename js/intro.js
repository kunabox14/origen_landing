/* ============================================================
   ORIGEN · Motor de la intro cinematográfica
   Campo de partículas verdes (Three.js, WebGL aditivo) que
   convergen → forman el isotipo → giro 3D → se integran como la
   "O" del logotipo → revelado del wordmark → fade al sitio.
   Un solo bucle rAF · se autodestruye · primera visita (o ?intro=1).
   ============================================================ */
(function(){
  var root = document.documentElement;
  if(!root.classList.contains('intro-armed')) return;

  var intro = document.getElementById('origen-intro');
  var canvas = document.getElementById('origen-particles');
  var word = intro.querySelector('.intro-word');
  var mark = intro.querySelector('.intro-mark');
  var glowCore = intro.querySelector('.glow-core');
  var flash = intro.querySelector('.flash');
  var renderer, scene, camera, points, geo, mat, raf = 0;
  var revealed = false, running = true;

  function revealSite(){
    if(revealed) return; revealed = true; running = false;
    try{ localStorage.setItem('origen_intro_seen','1'); }catch(e){}
    var site = document.getElementById('site-root');
    intro.style.transition = 'opacity .6s ease';
    intro.style.opacity = '0';
    // Revelado dirigido por JS (transición inline) — robusto aunque el entorno
    // congele las animaciones CSS; nunca deja el sitio invisible.
    if(site){
      site.style.transition = 'opacity .85s ease, transform .85s cubic-bezier(.16,.84,.3,1), filter .85s ease';
      site.style.transform = 'scale(1.035)';
      site.style.filter = 'blur(6px)';
      site.style.opacity = '0';
    }
    root.classList.remove('intro-armed');
    if(site) site.style.opacity = '0';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      if(site){ site.style.opacity = '1'; site.style.transform = 'none'; site.style.filter = 'none'; }
    }); });
    setTimeout(function(){
      if(raf) cancelAnimationFrame(raf);
      if(site){ site.style.transition = ''; site.style.transform = ''; site.style.filter = ''; site.style.opacity = '1'; }
      if(intro && intro.parentNode) intro.parentNode.removeChild(intro);
      try{ if(renderer) renderer.dispose(); }catch(e){}
    }, 950);
  }

  // Si Three.js no carga, igual revelamos el sitio sin parpadeos.
  var failsafe = setTimeout(revealSite, 8000);
  if(typeof THREE === 'undefined'){ clearTimeout(failsafe); revealSite(); return; }

  // Geometría del wordmark: posición y tamaño de la "O" como fracción del SVG.
  var O_CX = 0.14663, O_CY = 0.41887, O_W = 0.24559, MARK_RATIO = 0.96262;

  try{
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth, h = window.innerHeight;
    var mobile = w < 760;
    var COUNT = mobile ? 1300 : 2800;
    var TAU = Math.PI * 2;

    renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:!mobile, alpha:true, powerPreference:'high-performance' });
    renderer.setPixelRatio(DPR);
    renderer.setSize(w, h, false);

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a130d, 0.045);
    camera = new THREE.PerspectiveCamera(55, w/h, 0.1, 100);
    camera.position.set(0, 0, 12);

    // Sprite circular suave (glow) generado en canvas.
    var tc = document.createElement('canvas'); tc.width = tc.height = 64;
    var tx = tc.getContext('2d');
    var rg = tx.createRadialGradient(32,32,0,32,32,32);
    rg.addColorStop(0,'rgba(255,255,255,1)');
    rg.addColorStop(0.25,'rgba(214,255,170,0.92)');
    rg.addColorStop(0.55,'rgba(150,220,110,0.35)');
    rg.addColorStop(1,'rgba(94,188,102,0)');
    tx.fillStyle = rg; tx.fillRect(0,0,64,64);
    var sprite = new THREE.CanvasTexture(tc);

    function mix(a,b,t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }
    var cLima=[0.733,0.910,0.357], cVerde=[0.369,0.737,0.400], cWhite=[0.95,1.0,0.86];

    var scatter = new Float32Array(COUNT*3);
    var gather  = new Float32Array(COUNT*3);
    var burst   = new Float32Array(COUNT*3);
    var pos     = new Float32Array(COUNT*3);
    var col     = new Float32Array(COUNT*3);

    for(var i=0;i<COUNT;i++){
      var k=i*3;
      // 1 · dispersión inicial en una esfera amplia
      var u=Math.random(), v=Math.random(), th=u*TAU, ph=Math.acos(2*v-1), rr=13+Math.random()*8;
      scatter[k]=rr*Math.sin(ph)*Math.cos(th); scatter[k+1]=rr*Math.sin(ph)*Math.sin(th); scatter[k+2]=rr*Math.cos(ph);
      // 2 · reunión: disco de energía giratorio que se concentra al centro
      var gr=Math.pow(Math.random(),0.7)*3.05, ga=Math.random()*TAU;
      var swirl=ga + gr*0.85;
      gather[k]=Math.cos(swirl)*gr; gather[k+1]=Math.sin(swirl)*gr*0.92; gather[k+2]=(Math.random()-0.5)*0.9;
      // 3 · estallido final radial hacia afuera
      var bn=Math.sqrt(gather[k]*gather[k]+gather[k+1]*gather[k+1])||1;
      burst[k]=gather[k]/bn*30+(Math.random()-0.5)*5;
      burst[k+1]=gather[k+1]/bn*30+(Math.random()-0.5)*5;
      burst[k+2]=(Math.random()-0.5)*12;
      // color por radio del disco: blanco-cálido → lima → verde
      var t=Math.min(gr/3.05,1);
      var c = t<0.5 ? mix(cWhite,cLima,t/0.5) : mix(cLima,cVerde,(t-0.5)/0.5);
      col[k]=c[0]; col[k+1]=c[1]; col[k+2]=c[2];
      pos[k]=scatter[k]; pos[k+1]=scatter[k+1]; pos[k+2]=scatter[k+2];
    }

    geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col,3));
    mat = new THREE.PointsMaterial({ size:mobile?0.20:0.16, map:sprite, vertexColors:true,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0, sizeAttenuation:true });
    points = new THREE.Points(geo, mat);
    points.rotation.x = -0.5;
    scene.add(points);

    window.addEventListener('resize', function(){
      w=window.innerWidth; h=window.innerHeight;
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
    });

    function clamp01(x){ return x<0?0:x>1?1:x; }
    function lerp(a,b,t){ return a+(b-a)*t; }
    function easeOutCubic(x){ return 1-Math.pow(1-x,3); }
    function easeInCubic(x){ return x*x*x; }
    function easeInOutCubic(x){ return x<0.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2; }

    // Línea de tiempo (segundos)
    var T_IN=0.2, T_GATHER0=1.3, T_GATHER=1.25, T_MARK0=2.35, T_MARK=0.6,
        T_SPIN0=3.0, T_SPIN=0.78, T_BURST0=3.35, T_BURST=0.85,
        T_INT0=3.95, T_INT=0.95, T_WORD0=5.05, T_WORD=0.85,
        T_FLASH0=5.0, T_HOLD=6.0, T_END=6.55;

    var t0 = performance.now();

    function frame(now){
      if(!running) return;
      var e=(now-t0)/1000;

      var gp = easeInOutCubic(clamp01((e-T_GATHER0)/T_GATHER));   // reunión
      var bp = easeInCubic(clamp01((e-T_BURST0)/T_BURST));        // estallido

      var p=geo.attributes.position.array;
      for(var i=0;i<COUNT;i++){
        var k=i*3;
        var gx=lerp(scatter[k],gather[k],gp), gy=lerp(scatter[k+1],gather[k+1],gp), gz=lerp(scatter[k+2],gather[k+2],gp);
        p[k]=lerp(gx,burst[k],bp); p[k+1]=lerp(gy,burst[k+1],bp); p[k+2]=lerp(gz,burst[k+2],bp);
      }
      geo.attributes.position.needsUpdate=true;

      points.rotation.z = e*0.55;
      points.rotation.x = -0.5 + Math.sin(e*0.4)*0.05;
      mat.opacity = clamp01((e-T_IN)/0.5) * (1-bp);

      // Cámara: dolly suave + leve órbita
      var cz=easeInOutCubic(clamp01(e/3.4));
      camera.position.z = 12 - cz*3.2 - bp*1.0;
      camera.position.x = Math.sin(e*0.3)*0.45;
      camera.position.y = Math.cos(e*0.24)*0.3;
      camera.lookAt(0,0,0);

      glowCore.style.opacity = (0.55*gp*(1-bp*0.6)).toFixed(3);

      // Isotipo (mark) — aparición, giro 3D e integración como "O"
      var mf = easeOutCubic(clamp01((e-T_MARK0)/T_MARK));         // aparición
      var sp = clamp01((e-T_SPIN0)/T_SPIN);                       // giro 3D
      var ry = easeInOutCubic(sp)*360;
      var ip = easeInOutCubic(clamp01((e-T_INT0)/T_INT));         // integración → O

      var cx0 = window.innerWidth/2, cy0 = window.innerHeight/2;
      var wr = word.getBoundingClientRect();
      var ww = wr.width || Math.min(window.innerWidth*0.62,560);
      var wh = wr.height || ww*132.5/419.4;
      var Ocx = (wr.width? wr.left : cx0-ww/2) + O_CX*ww;
      var Ocy = (wr.height? wr.top : cy0-wh/2) + O_CY*wh;
      var targetW = (O_W*ww)/MARK_RATIO;
      var formPx = Math.min(window.innerWidth, window.innerHeight)*0.26;

      var mLeft = lerp(cx0, Ocx, ip);
      var mTop  = lerp(cy0, Ocy, ip);
      var mW    = lerp(formPx, targetW, ip);
      var mScale = lerp(0.82, 1, mf);
      var markOp = mf;                                           // la O permanece: es el isotipo
      var pulse = Math.sin(e*3.2)*0.5+0.5;
      var glow = (10 + 18*mf) + (1-ip)*8*pulse;

      mark.style.left = mLeft.toFixed(1)+'px';
      mark.style.top = mTop.toFixed(1)+'px';
      mark.style.width = mW.toFixed(1)+'px';
      mark.style.opacity = markOp.toFixed(3);
      mark.style.transform = 'translate(-50%,-50%) rotateY('+ry.toFixed(1)+'deg) scale('+mScale.toFixed(3)+')';
      mark.style.filter = 'drop-shadow(0 0 '+glow.toFixed(1)+'px rgba(187,232,91,'+(0.55*mf).toFixed(2)+')) drop-shadow(0 0 '+(glow*2).toFixed(1)+'px rgba(94,188,102,'+(0.30*mf).toFixed(2)+'))';

      // Wordmark — "rigen" se revela SOLO cuando la O (isotipo) ya se asentó.
      // La O del wordmark se mantiene oculta de forma permanente (la aporta el
      // isotipo) y el resto de la palabra entra con un barrido izquierda→derecha.
      word.style.transform = 'translate(-50%,-50%)';
      var wp = easeOutCubic(clamp01((e-T_WORD0)/T_WORD));
      var clipL = 27.5;                       // % — borde derecho de la O
      var clipR = (1-wp)*(100-clipL);         // barrido que descubre "rigen"
      word.style.opacity = (e>=T_WORD0 ? 1 : 0);
      word.style.clipPath = 'inset(-12% '+clipR.toFixed(2)+'% -12% '+clipL+'%)';
      word.style.webkitClipPath = word.style.clipPath;
      word.style.filter = 'drop-shadow(0 6px 26px rgba(0,0,0,'+(0.35*wp).toFixed(2)+'))';

      // Destello de revelado
      if(e>=T_BURST0){
        var fl=clamp01((e-T_BURST0)/0.6);
        flash.style.transform='translate(-50%,-50%) scale('+(fl+0.05).toFixed(3)+')';
        flash.style.opacity=(Math.sin(fl*Math.PI)*0.85).toFixed(3);
      }
      if(e>=T_FLASH0){
        var f2=clamp01((e-T_FLASH0)/0.5);
        flash.style.transform='translate(-50%,-50%) scale('+(0.4+f2*0.9).toFixed(3)+')';
        flash.style.opacity=(Math.sin(f2*Math.PI)*0.5).toFixed(3);
      }

      renderer.render(scene,camera);
      if(e>=T_END){ clearTimeout(failsafe); revealSite(); return; }
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);

  }catch(err){ clearTimeout(failsafe); revealSite(); }
})();
