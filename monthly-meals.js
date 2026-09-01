(function(){
  const SB='https://evmqqjtglapwnezbttds.supabase.co', KEY='sb_publishable_bri9jNvVFIyaynVhOHvBGA_9u4u527w';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const db=()=>window.supabase?.createClient?.(SB,KEY);
  const labels={desayuno:['☀️','Desayuno'],almuerzo:['🍝','Almuerzo'],merienda:['🥪','Merienda'],cena:['🌙','Cena']};
  let currentMonth=new Date().getMonth();
  let currentYear=new Date().getFullYear();
  let person='todos';

  function removeOldCasa(){
    const old=$('#casaRecentMeals');
    if(old) old.remove();
  }

  function addMonthTab(){
    const sec=$('#comidas');
    if(!sec) return;
    const tabs=sec.querySelector('.meal-log-tabs');
    if(!tabs) return;
    if(!tabs.querySelector('[data-meal-person="mes"]')){
      const b=document.createElement('button');
      b.type='button';
      b.dataset.mealPerson='mes';
      b.textContent='📆 Mes';
      tabs.appendChild(b);
      b.onclick=()=>showMonth();
    }
    if(!tabs.querySelector('[data-meal-person="todos"]')?.dataset.boundMonthTabs){
      tabs.querySelectorAll('button').forEach(b=>{
        if(b.dataset.mealPerson==='mes') return;
        b.dataset.boundMonthTabs='1';
        b.addEventListener('click',()=>{
          person=b.dataset.mealPerson||'todos';
          const view=$('#monthMealsView');
          if(view) view.remove();
        });
      });
    }
  }

  function showMonth(){
    const sec=$('#comidas'); if(!sec) return;
    const tabs=sec.querySelector('.meal-log-tabs');
    tabs?.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.mealPerson==='mes'));
    const list=$('#mealLogList'); if(list) list.style.display='none';
    let view=$('#monthMealsView');
    if(!view){
      view=document.createElement('div');
      view.id='monthMealsView';
      view.className='month-meals-view';
      sec.querySelector('.panel')?.appendChild(view);
    }
    view.innerHTML=`
      <div class="month-meals-head">
        <div>
          <span>HISTORIAL</span>
          <h2>📆 Comidas del mes</h2>
          <p>Visualiza todo lo que han comido, ordenado por día.</p>
        </div>
        <div class="month-controls">
          <button type="button" id="monthPrev">‹</button>
          <strong id="monthLabel"></strong>
          <button type="button" id="monthNext">›</button>
        </div>
      </div>
      <div class="month-filter">
        <button type="button" class="active" data-month-person="todos">Todos</button>
        <button type="button" data-month-person="Marbell">🌸 Marbell</button>
        <button type="button" data-month-person="Deivis">💙 Deivis</button>
        <button type="button" data-month-person="Los dos">👩👨🏻 Los dos</button>
      </div>
      <div id="monthMealsList"></div>`;
    $('#monthPrev').onclick=()=>{currentMonth--;if(currentMonth<0){currentMonth=11;currentYear--;}loadMonth()};
    $('#monthNext').onclick=()=>{currentMonth++;if(currentMonth>11){currentMonth=0;currentYear++;}loadMonth()};
    view.querySelectorAll('[data-month-person]').forEach(b=>b.onclick=()=>{view.querySelectorAll('[data-month-person]').forEach(x=>x.classList.remove('active'));b.classList.add('active');person=b.dataset.monthPerson;loadMonth()});
    loadMonth();
  }

  async function loadMonth(){
    const list=$('#monthMealsList'), label=$('#monthLabel');
    if(!list||!label)return;
    const monthName=new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric'}).format(new Date(currentYear,currentMonth,1));
    label.textContent=monthName.charAt(0).toUpperCase()+monthName.slice(1);
    list.innerHTML='<div class="month-loading">Cargando comidas…</div>';
    const start=`${currentYear}-${String(currentMonth+1).padStart(2,'0')}-01`;
    const endDate=new Date(currentYear,currentMonth+1,0).getDate();
    const end=`${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(endDate).padStart(2,'0')}`;
    const client=db();
    if(!client){list.innerHTML='<div class="empty">No se pudo conectar con las comidas.</div>';return;}
    let q=client.from('meal_log').select('*').gte('meal_date',start).lte('meal_date',end).order('meal_date',{ascending:false}).order('meal_type');
    if(person!=='todos') q=q.eq('person',person);
    const r=await q;
    if(r.error){list.innerHTML='<div class="empty">No pudimos cargar el historial.</div>';return;}
    const rows=r.data||[];
    if(!rows.length){list.innerHTML='<div class="month-empty"><span>🍽️</span><b>No hay comidas registradas este mes</b><small>Cuando registres comidas aparecerán aquí.</small></div>';return;}
    const groups={};
    rows.forEach(x=>(groups[x.meal_date]??=[]).push(x));
    list.innerHTML=Object.keys(groups).sort((a,b)=>b.localeCompare(a)).map(date=>{
      const d=new Date(date+'T12:00:00');
      const day=new Intl.DateTimeFormat('es-AR',{weekday:'long',day:'numeric',month:'long'}).format(d);
      return `<section class="month-day"><h3>${day.charAt(0).toUpperCase()+day.slice(1)}</h3><div class="month-day-meals">${groups[date].map(x=>{const l=labels[x.meal_type]||['🍽️','Comida'];return `<article><span class="month-meal-icon">${l[0]}</span><div><b>${l[1]}</b><strong>${esc(x.meal_name||'Sin nombre')}</strong><small>${x.person==='Marbell'?'🌸 Marbell':x.person==='Deivis'?'💙 Deivis':'👩👨🏻 Los dos'}${x.location?' · 📍 '+esc(x.location):''}</small></div></article>`}).join('')}</div></section>`;
    }).join('');
  }

  function restoreList(){
    const list=$('#mealLogList');
    if(list) list.style.display='';
    $('#monthMealsView')?.remove();
    const tabs=$('#comidas .meal-log-tabs');
    tabs?.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.mealPerson===person));
  }

  function style(){
    if($('#monthMealStyles'))return;
    const s=document.createElement('style');s.id='monthMealStyles';s.textContent=`
      .month-meals-view{margin-top:18px}
      .month-meals-head{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-bottom:18px}
      .month-meals-head span{font-size:11px;letter-spacing:1.5px;font-weight:800;color:#c47792}
      .month-meals-head h2{margin:4px 0;color:#513c46;font-size:24px}
      .month-meals-head p{margin:0;color:#987a85;font-size:13px}
      .month-controls{display:flex;align-items:center;gap:12px;background:#fff8fa;border:1px solid #f0dfe5;border-radius:16px;padding:5px}
      .month-controls button{width:40px;height:40px;border:0;border-radius:11px;background:#fff;color:#b96782;font-size:25px;cursor:pointer}
      .month-controls strong{min-width:135px;text-align:center;color:#513c46;text-transform:capitalize}
      .month-filter{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}
      .month-filter button{border:1px solid #f0dfe5;background:#fff;border-radius:13px;padding:9px 13px;color:#6d5360;font-weight:700;cursor:pointer}
      .month-filter button.active{background:#df8fac;color:#fff;border-color:#df8fac}
      .month-day{border:1px solid #f0dfe5;border-radius:18px;padding:15px;margin:10px 0;background:#fff}
      .month-day h3{margin:0 0 10px;color:#513c46;font-size:16px;text-transform:capitalize}
      .month-day-meals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .month-day-meals article{display:flex;gap:10px;align-items:center;background:#fff8fa;border-radius:14px;padding:11px}
      .month-meal-icon{font-size:21px}
      .month-day-meals article div{min-width:0}
      .month-day-meals b,.month-day-meals strong,.month-day-meals small{display:block}
      .month-day-meals b{font-size:11px;color:#c47792}
      .month-day-meals strong{font-size:14px;color:#513c46;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .month-day-meals small{font-size:10px;color:#987a85;margin-top:2px}
      .month-empty,.month-loading{padding:28px;text-align:center;color:#6d5360;background:#fff8fa;border:1px dashed #efdce4;border-radius:16px}
      .month-empty span{display:block;font-size:28px;margin-bottom:6px}.month-empty b,.month-empty small{display:block}.month-empty small{color:#987a85;margin-top:3px}
      @media(max-width:650px){.month-meals-head{display:block}.month-controls{margin-top:14px;justify-content:space-between}.month-day-meals{grid-template-columns:1fr}.month-controls strong{min-width:0;flex:1}}
    `;document.head.appendChild(s)
  }

  function boot(){
    removeOldCasa();
    style();
    addMonthTab();
    const obs=new MutationObserver(()=>{
      removeOldCasa();
      if($('#comidas')?.classList.contains('active')) addMonthTab();
    });
    obs.observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
})();