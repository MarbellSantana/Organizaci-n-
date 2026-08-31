/* Opción Los dos 👩👨🏻 para el registro de comidas */
(function(){
  function enhanceMealPerson(){
    const select=document.querySelector('#mlPerson');
    if(!select)return;
    if(!select.querySelector('option[value="Los dos"]')){
      const opt=document.createElement('option');
      opt.value='Los dos';
      opt.textContent='👩👨🏻 Los dos';
      select.appendChild(opt);
    }
  }
  const originalOpen=window.openMealLog;
  if(originalOpen){
    window.openMealLog=function(){ originalOpen(); setTimeout(enhanceMealPerson,0); };
  }
  const originalSave=window.saveMealLog;
  window.saveMealLog=async function(){
    const person=document.querySelector('#mlPerson')?.value;
    if(person!=='Los dos') return originalSave();
    if(!window.db)return window.toast ? window.toast('Supabase no está disponible') : null;
    const date=document.querySelector('#mlDate').value;
    const type=document.querySelector('#mlType').value;
    const name=document.querySelector('#mlName').value.trim();
    const location=document.querySelector('#mlLocation').value;
    const notes=document.querySelector('#mlNotes').value.trim()||null;
    if(!name)return window.toast ? window.toast('Escribe qué comida hiciste') : null;
    const rows=[
      {meal_date:date,meal_type:type,person:'Marbell',meal_name:name,location,notes},
      {meal_date:date,meal_type:type,person:'Deivis',meal_name:name,location,notes}
    ];
    const r=await window.db.from('meal_log').insert(rows).select();
    if(r.error)return window.toast ? window.toast(r.error.message) : null;
    if(Array.isArray(window.mealLogData))window.mealLogData.unshift(...(r.data||[]));
    if(typeof closeModal==='function')closeModal();
    if(typeof renderMealLog==='function')renderMealLog();
    if(window.toast)window.toast('Comida guardada para los dos 👩👨🏻');
  };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(enhanceMealPerson,1200));
  const observer=new MutationObserver(()=>enhanceMealPerson());
  observer.observe(document.body,{childList:true,subtree:true});
})();
