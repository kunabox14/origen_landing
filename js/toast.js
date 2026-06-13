/* CTAs · WhatsApp + aviso "Descarga la App"
   Muestra un toast efímero al pulsar cualquier elemento con [data-toast]. */
(function(){
  function toast(msg){
    var t=document.createElement('div');
    t.textContent=msg;
    t.style.cssText='position:fixed;left:50%;bottom:32px;transform:translateX(-50%) translateY(12px);background:#1B2E1E;color:#F6F1E7;font-family:var(--font-body),system-ui,sans-serif;font-size:15px;font-weight:600;padding:14px 22px;border-radius:999px;box-shadow:0 10px 30px -8px rgba(20,36,26,.5);border:1px solid rgba(187,232,91,.35);z-index:10000;opacity:0;transition:opacity .28s ease,transform .28s ease;pointer-events:none;max-width:90vw;text-align:center';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.opacity='1'; t.style.transform='translateX(-50%) translateY(0)'; });
    setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(12px)'; setTimeout(function(){ t.remove(); },320); }, 2600);
  }
  document.querySelectorAll('[data-toast]').forEach(function(el){
    function fire(e){ e.preventDefault(); toast(el.getAttribute('data-toast')); }
    el.addEventListener('click', fire);
    el.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ fire(e); } });
  });
})();
