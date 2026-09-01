(function(){
  const SB='https://evmqqjtglapwnezbttds.supabase.co',KEY='sb_publishable_bri9jNvVFIyaynVhOHvBGA_9u4u527w';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const db=()=>window.supabase?.createClient?.(SB,KEY);
  let month=new Date(); month.setDate(1);
  let person='todos';

  function removeMealsFromCasa(){
    const hub=$('#casaHub');
    if(!hub)return;
    hub.querySelectorAll('[data-screen="comidas"]').forEach(x=>x.remove());
  }

  function addMonthToRecipes(){
    const sec=$('#recetas'); if(!sec)return;
    const tabs=sec.querySelector('.tabs'); if(!tabs)return;
    let b=tabs.querySelector('[data-recipes-view="month"]');
    if(!b){
      b=document.createElement('button');
      b.type='button'; b.dataset.recipesView='month'; b.textContent='📆 Mes';
      tabs.appendChild(b);
      b.onclick=()=>showMonth();
    }
    tabs.querySelectorAll('button').forEach(x=>{
      if(x===b)return;
      if(!x.dataset.boundRecipeView){x.dataset.boundRecipeView='1';x.addEventListener('click',()=>showRecipes())}
    });
  }

  function showRecipes(){
    const sec=$('#recetas'); if(!sec)return;
    const view=$('#recipesMonthView'); if(view)view.remove();
    $('#recipes')?.removeAttribute('style');
    sec.querySelector('.tabs')?.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.recipesView!=='month' && x.dataset.cat===window.currentCategory));
  }

  function showMonth(){
    const sec=$('#recetas'); if(!sec)return;
    sec.querySelector('.tabs')?.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.recipesView==='month'));
    const recipesGrid=$('#recipes'); if(recipesGrid)recipesGrid.style.display='none';
    let view=$('#recipesMonthView');
    if(!view){view=document.createElement('div');view.id='recipesMonthView';view.className='recipes-month-view';recipesGrid?.after(view)}
    view.innerHTML=`<div class="recipes-month-head"><div><span>HISTORIAL DE COMIDAS</span><h2>📆 Lo que hemos comido</h2><p>Todo lo registrado durante el mes, organizado por día.</p></div><div class="recipes-month-controls"><button type="button" id="rmPrev">‹</button><strong id="rmLabel"></strong><button type="button" id="rmNext">›</button></div></div><div class="recipes-month-filter"><button type="button" class="active" data-rm-person="todos">Todos</button><button type="button" data-rm-person="Marbell">🌸 Marbell</button><button type="button" data-rm-person="Deivis">💙 Deivis</button><button type="button" data-rm-person="Los dos">👩👨🏻 Los dos</button></div><div id="recipesMonthList"></div>`;
    $('#rmPrev').onclick=()=>{month.setMonth(month.getMonth()-1);loadMonth()};
    $('#rmNext').onclick=()=>{month.setMonth(month.getMonth()+1);loadMonth()};
    view.querySelectorAll('[data-rm-person]').forEach(x=>x.onclick=()=>{view.querySelectorAll('[data-rm-person]').forEach(y=>y.classList.remove('active'));x.classList.add('active');person=x.dataset.rmPerson;loadMonth()});
    loadMonth();
  }

  async function loadMonth(){
    const list=$('#recipesMonthList'),label=$('#rmLabel');if(!list||!label)return;
    const y=month.getFullYear(),m=month.getMonth();
    label.textContent=new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric'}).format(month).replace(/^./,c=>c.toUpperCase());
    list.innerHTML='<div class="month-loading">Cargando comidas…</div>';
    const start=`${y}-${String(m+1).padStart(2,'0')}-01`,endDate=new Date(y,m+1,0).getDate(),end=`${y}-${String(m+1).padStart(2,'0')}-${String(endDate).padStart(2,'0')}`;
    const client=db();if(!client)return;
    let q=client.from('meal_log').select('*').gte('meal_date',start).lte('meal_date',end).order('meal_date',{ascending:false}).order('meal_type');
    if(person!=='todos')q=q.eq('person',person);
    const r=await q;if(r.error){list.innerHTML='<div class="empty">No pudimos cargar el historial.</div>';return}
    const rows=r.data||[];
    if(!rows.length){list.innerHTML='<div class="month-empty"><span>🍽️</span><b>No hay comidas registradas este mes</b><small>Cuando registres comidas aparecerán aquí.</small></div>';return}
    const groups={};rows.forEach(x=>(groups[x.meal_date]??=[]).push(x));
    const labels={desayuno:['☀️','Desayuno'],almuerzo:['🍝','Almuerzo'],merienda:['🥪','Merienda'],cena:['🌙','Cena']};
    list.innerHTML=Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(date=>{const d=new Date(date+'T12:00:00'),day=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(d);return `<section class="recipes-month-day"><h3>${day.charAt(0).toUpperCase()+day.slice(1)}</h3><div>${groups[date].map(x=>{const l=labels[x.meal_type]||['🍽️','Comida'];return `<article><span>${l[0]}</span><div><b>${l[1]}</b><strong>${esc(x.meal_name||'Sin nombre')}</strong><small>${x.person==='Marbell'?'🌸 Marbell':x.person==='Deivis'?'💙 Deivis':'👩👨🏻 Los dos'}${x.location?' · 📍 '+esc(x.location):''}</small></div></article>`}).join('')}</div></section>`}).join('');
  }

  function style(){if($('#recipesHistoryStyles'))return;const s=document.createElement('style');s.id='recipesHistoryStyles';s.textContent=`.recipes-month-view{margin-top:20px}.recipes-month-head{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:18px}.recipes-month-head span{font-size:11px;letter-spacing:1.5px;font-weight:800;color:#c47792}.recipes-month-head h2{margin:4px 0;color:#513c46;font-size:24px}.recipes-month-head p{margin:0;color:#987a85;font-size:13px}.recipes-month-controls{display:flex;align-items:center;gap:8px;background:#fff8fa;border:1px solid #f0dfe5;border-radius:16px;padding:5px}.recipes-month-controls button{width:40px;height:40px;border:0;border-radius:11px;background:#fff;color:#b96782;font-size:25px;cursor:pointer}.recipes-month-controls strong{min-width:135px;text-align:center;color:#513c46;text-transform:capitalize}.recipes-month-filter{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.recipes-month-filter button{border:1px solid #f0dfe5;background:#fff;border-radius:13px;padding:9px 13px;color:#6d5360;font-weight:700;cursor:pointer}.recipes-month-filter button.active{background:#df8fac;color:#fff;border-color:#df8fac}.recipes-month-day{border:1px solid #f0dfe5;border-radius:18px;padding:15px;margin:10px 0;background:#fff}.recipes-month-day h3{margin:0 0 10px;color:#513c46;font-size:16px;text-transform:capitalize}.recipes-month-day>div{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.recipes-month-day article{display:flex;gap:10px;align-items:center;background:#fff8fa;border-radius:14px;padding:11px}.recipes-month-day article>span{font-size:21px}.recipes-month-day article div{min-width:0}.recipes-month-day b,.recipes-month-day strong,.recipes-month-day small{display:block}.recipes-month-day b{font-size:11px;color:#c47792}.recipes-month-day strong{font-size:14px;color:#513c46;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.recipes-month-day small{font-size:10px;color:#987a85;margin-top:2px}.month-empty,.month-loading{padding:28px;text-align:center;color:#6d5360;background:#fff8fa;border:1px dashed #efdce4;border-radius:16px}.month-empty span{display:block;font-size:28px;margin-bottom:6px}.month-empty b,.month-empty small{display:block}.month-empty small{color:#987a85;margin-top:3px}@media(max-width:650px){.recipes-month-head{display:block}.recipes-month-controls{margin-top:14px;justify-content:space-between}.recipes-month-controls strong{flex:1;min-width:0}.recipes-month-day>div{grid-template-columns:1fr}}`;document.head.appendChild(s)}

  function boot(){removeMealsFromCasa();addMonthToRecipes();style();const obs=new MutationObserver(()=>{removeMealsFromCasa();addMonthToRecipes()});obs.observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
})();
