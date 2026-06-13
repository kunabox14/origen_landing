// Scroll reveal — aparición progresiva de los bloques al entrar en viewport.
(function(){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  var revealEls = document.querySelectorAll('.section .container > *, .prob-card, .paso, .benef-card, .producto, .testi, .plan');
  revealEls.forEach(function(el,i){
    el.classList.add('fade'); el.style.transitionDelay = (i % 4 * 60) + 'ms'; io.observe(el);
  });
  // Failsafe: quitar .fade elimina por completo la regla de opacity (visible al
  // instante, sin depender de que termine una transición) — seguro para
  // impresión/PDF/pestañas en segundo plano.
  setTimeout(function(){ revealEls.forEach(function(el){ el.classList.remove('fade'); }); }, 1100);
})();
