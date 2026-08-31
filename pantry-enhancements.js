(function(){
  function setupPantry(){
    const section=document.getElementById('casa');
    const list=document.getElementById('pantryList');
    if(!section||!list||document.getElementById('addPantryItem')) return;
    const head=section.querySelector('.head');
    const btn=document.createElement('button');
    btn.id='addPantryItem';
    btn.type='button';
    btn.className='primary';
    btn.textContent='＋ Agregar ingrediente';
    btn.addEventListener('click',()=>{
      if(typeof window.openHome==='function') window.openHome();
      else if(typeof window.modal==='function') window.modal('<h2>Agregar ingrediente 🏡</h2><p>No se pudo abrir el formulario. Recarga la página.</p>');
    });
    head?.appendChild(btn);
    const hint=document.createElement('div');
    hint.className='pantry-hint';
    hint.innerHTML='<b>🥫 Tu despensa</b><span>Agrega lo que tienes en casa y lo usaremos para darte ideas de comidas.</span>';
    section.insertBefore(hint,list);
  }
  function boot(){setupPantry();setTimeout(setupPantry,400);setTimeout(setupPantry,1200)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();