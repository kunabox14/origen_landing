/* Arma la intro solo en la 1ª visita y si el usuario no pidió menos movimiento.
   Se carga de forma SÍNCRONA en el <head> para añadir la clase `intro-armed`
   antes del primer pintado (evita el parpadeo del sitio bajo el overlay). */
(function(){
  try{
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var force = /[?&]intro=1/.test(location.search);
    // La intro se reproduce en CADA carga/recarga (salvo prefers-reduced-motion,
    // que se puede forzar con ?intro=1).
    if(!reduce || force) document.documentElement.classList.add('intro-armed');
  }catch(e){}
})();
