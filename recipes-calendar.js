/* Recetas + calendario mensual de comidas */
(function(){
  const escR=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const catLabels={desayuno:'☀️ Desayuno',almuerzo:'🍝 Almuerzo',merienda:'🥪 Merienda',cena:'🌙 Cena'};
  function recipeForm(){
    modal(`<h2>Agregar receta 🍳</h2>
      <div class="field"><label>NOMBRE</label><input id="rName" placeholder="Ej. Pastel de papa"></div>
      <div class="field"><label>CATEGORÍA</label><select id="rCat"><option value="desayuno">☀️ Desayuno</option><option value="almuerzo">🍝 Almuerzo</option><option value="merienda">🥪 Merienda</option><option value="cena">🌙 Cena</option><option value="jugos">🍓 Jugos</option></select></div>
      <div class="field"><label>INGREDIENTES</label><textarea id="rIngredients" rows="5" placeholder="Papa - 500 g\nCarne - 300 g\nCebolla - 1"></textarea><small>Escribe un ingrediente por línea. Puedes poner cantidad después de un guion.</small></div>
      <div class="field"><label>PREPARACIÓN</label><textarea id="rPrep" rows="5" placeholder="Describe cómo preparar la receta..."></textarea></div>
      <button type="button" class="primary full" id="saveNewRecipe">Guardar receta ♡</button>`);
    document.querySelector('#saveNewRecipe').onclick=saveRecipe;
  }
  async function saveRecipe(){
    if(!window.db)return toast('Supabase no está disponible');
    const name=document.querySelector('#rName')?.value.trim(); if(!name)return toast('Escribe el nombre de la receta');
    const category=document.querySelector('#rCat').value;
    const preparation=document.querySelector('#rPrep').value.trim();
    const lines=document.querySelector('#rIngredients').value.split('\n').map(x=>x.trim()).filter(Boolean);
    const ingredients=lines.map(line=>{const p=line.split(/\s+-\s+/);return {ingredient_name:p[0].trim(),quantity:p.slice(1).join(' - ').trim()||null}});
    const rr=await window.db.from('recipes').insert({name,category,preparation}).select().single();
    if(rr.error)return toast(rr.error.message);
    if(ingredients.length){const ri=await window.db.from('recipe_ingredients').insert(ingredients.map(x=>({...x,recipe_id:rr.data.id})));if(ri.error){await window.db.from('recipes').delete().eq('id',rr.data.id);return toast(ri.error.message)}}
    const fresh=await window.db.from('recipes').select('*,recipe_ingredients(*)').eq('id',rr.data.id).single();
    if(!fresh.error)window.data.recipes.push(fresh.data); else window.data.recipes.push({...rr.data,recipe_ingredients:ingredients});
    closeModal();renderRecipes(category);renderSuggestions();updateHomeStats();toast('Receta guardada 🍳');
  }
  window.openRecipeForm=recipeForm;

  function renderCalendar(){
    const section=document.querySelector('#comidas');if(!section)return;
    const old=document.querySelector('#mealCalendar');if(old)old.remove();
    const panel=section.querySelector('.panel'); if(!panel)return;
    const list=window.mealLogData||[];
    const now=new Date(); let year=window.mealCalYear??now.getFullYear(), month=window.mealCalMonth??now.getMonth();
    const first=new Date(year,month,1), days=new Date(year,month+1,0).getDate(), start=(first.getDay()+6)%7;
    const map={};list.forEach(x=>{if(String(x.meal_date).slice(0,7)===`${year}-${String(month+1).padStart(2,'0')}`)(map[x.meal_date]??=[]).push(x)});
    const box=document.createElement('div');box.id='mealCalendar';box.className='panel';
    let html=`<div class="calendar-head"><button type="button" class="secondary" id="calPrev">‹</button><h2>${first.toLocaleDateString('es-AR',{month:'long',year:'numeric'})}</h2><button type="button" class="secondary" id="calNext">›</button></div><div class="calendar-grid weekdays">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<b>${x}</b>`).join('')}</div><div class="calendar-grid">`;
    for(let i=0;i<start;i++)html+='<div class="cal-day empty-day"></div>';
    for(let d=1;d<=days;d++){const key=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`, meals=map[key]||[];html+=`<div class="cal-day"><strong>${d}</strong>${meals.slice(0,4).map(x=>`<div class="cal-meal" title="${escR(x.meal_name)}">${catLabels[x.meal_type]||x.meal_type}: ${escR(x.meal_name)}</div>`).join('')}${meals.length>4?`<small>+${meals.length-4} más</small>`:''}</div>`}
    html+='</div><p class="calendar-note">Cada día muestra lo que registraste como comido. 🌸</p>';
    box.innerHTML=html; panel.parentNode.insertBefore(box,panel);
    box.querySelector('#calPrev').onclick=()=>{month--;if(month<0){month=11;year--}window.mealCalMonth=month;window.mealCalYear=year;renderCalendar()};
    box.querySelector('#calNext').onclick=()=>{month++;if(month>11){month=0;year++}window.mealCalMonth=month;window.mealCalYear=year;renderCalendar()};
  }
  window.renderMealCalendar=renderCalendar;
  const oldRender=window.renderMealLog;
  document.addEventListener('DOMContentLoaded',()=>{
    const add=document.querySelector('#addRecipe');if(add)add.onclick=recipeForm;
    const comidas=document.querySelector('[data-screen="comidas"]');if(comidas)comidas.addEventListener('click',()=>setTimeout(renderCalendar,100));
    setTimeout(()=>{if(document.querySelector('#comidas.screen.active'))renderCalendar()},1200);
  });
  const wait=setInterval(()=>{if(window.mealLogData!==undefined){clearInterval(wait);const orig=window.renderMealLog;if(typeof orig==='function')window.renderMealLog=function(){orig();renderCalendar()};renderCalendar()}},300);
})();