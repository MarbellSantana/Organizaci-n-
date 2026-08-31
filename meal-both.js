/* Opción Los dos 👩👨🏻 para el registro de comidas */
(function(){
  const API='https://evmqqjtglapwnezbttds.supabase.co/rest/v1/meal_log';
  const KEY='sb_publishable_bri9jNvVFIyaynVhOHvBGA_9u4u527w';
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
  document.addEventListener('DOMContentLoaded',()=>setTimeout(enhanceMealPerson,1200));
  const observer=new MutationObserver(enhanceMealPerson);
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('button[onclick="saveMealLog()"]');
    if(!btn)return;
    const person=document.querySelector('#mlPerson')?.value;
    if(person!=='Los dos')return;
    e.preventDefault(); e.stopImmediatePropagation();
    const date=document.querySelector('#mlDate').value;
    const type=document.querySelector('#mlType').value;
    const name=document.querySelector('#mlName').value.trim();
    const location=document.querySelector('#mlLocation').value;
    const notes=document.querySelector('#mlNotes').value.trim()||null;
    if(!name){if(window.toast)window.toast('Escribe qué comida hiciste');return;}
    btn.disabled=true;
    try{
      const response=await fetch(API,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify([
        {meal_date:date,meal_type:type,person:'Marbell',meal_name:name,location,notes},
        {meal_date:date,meal_type:type,person:'Deivis',meal_name:name,location,notes}
      ])});
      if(!response.ok){const text=await response.text();throw new Error(text||'No se pudo guardar');}
      if(typeof closeModal==='function')closeModal();
      if(window.toast)window.toast('Comida guardada para los dos 👩👨🏻');
      setTimeout(()=>location.reload(),400);
    }catch(err){btn.disabled=false;if(window.toast)window.toast('No se pudo guardar la comida');console.error(err);}
  },true);
})();
