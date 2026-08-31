// Mejora: permite registrar comidas hechas fuera de casa.
(function(){
  function addStreetOption(){
    const select=document.querySelector('#mlLocation');
    if(!select || select.dataset.streetReady)return;
    if(!Array.from(select.options).some(o=>o.value==='Calle')){
      const o=document.createElement('option');o.value='Calle';o.textContent='🍽️ Calle / afuera';select.appendChild(o);
    }
    select.dataset.streetReady='1';
  }
  const observer=new MutationObserver(addStreetOption);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',addStreetOption);
})();