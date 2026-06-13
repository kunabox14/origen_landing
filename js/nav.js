// Desplazamiento suave para los enlaces ancla internos (#seccion).
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2){ e.preventDefault(); return; }
      var t = null; try { t = document.querySelector(href); } catch (err) { return; }
      if (t){ e.preventDefault(); window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' }); }
    });
  });
})();
