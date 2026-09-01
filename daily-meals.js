(function(){
  const SB='https://evmqqjtglapwnezbttds.supabase.co', KEY='sb_publishable_bri9jNvVFIyaynVhOHvBGA_9u4u527w';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const db=()=>window.supabase?.createClient?.(SB,KEY);
  const mealTypes=[['desayuno','☀️','Desayuno'],['almuerzo','🍝','Almuerzo'],['merienda','🥪','Merienda'],['cena','🌙','Cena']];
  const locations=['Casa','Calle','Mamá','Otro'];
  function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function titleCaseDay(){return new Intl.DateTimeFormat('es-AR',{weekday:'long'}).format(new Date()).toUpperCase()}
  function dateLabel(){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date()).replace(/^./,c=>c.toUpperCase())}
  async function render(){
    const sec=$('#comidas'); if(!sec)return;
    const panel=sec.querySelector('.panel'); if(!panel)return;
    const old=$('#mealCalendarFixed'); if(old)old.style.display='none';
    const box=$('#dailyMealCard');
    if(!box){
      const el=document.createElement('div');el.id='dailyMealCard';el.className='daily-meal-card';
      el.innerHTML=`<div class="daily-meal-title"><div><h2 id="dailyDayName">${titleCaseDay()}</h2><p id="dailyDate">${dateLabel()}</p></div><span class="daily-flower">🌸</span></div><div class="daily-meal-person"><button class="active" data-daily-person="Los dos">👩👨🏻 Los dos</button><button data-daily-person="Marbell">🌸 Marbell</button><button data-daily-person="Deivis">💙 Deivis</button></div><div id="dailyMealFields"></div><button class="primary full" id="saveDailyMeals">Guardar comidas del día ✨</button></div>`;
      panel.appendChild(el);
      el.querySelectorAll('[data-daily-person]').forEach(b=>b.onclick=()=>{el.querySelectorAll('[data-daily-person]').forEach(x=>x.classList.remove('active'));b.classList.add('active');load()});
      $('#saveDailyMeals').onclick=save;
    }
    load();
  }
  async function load(){
    const host=$('#dailyMealFields'); if(!host)return;
    const person=$('#dailyMealCard .active')?.dataset.dailyPerson||'Los dos';
    const r=await db().from('meal_log').select('*').eq('meal_date',today()).eq('person',person).order('meal_type');
    const rows=r.error?[]:(r.data||[]); const by={};rows.forEach(x=>by[x.meal_type]=x);
    host.innerHTML=mealTypes.map(([type,icon,label])=>{const x=by[type]||{};return `<div class="daily-meal-row"><div class="daily-meal-label"><span>${icon}</span><b>${label}</b></div><input id="daily-${type}" value="${esc(x.meal_name||'')}" placeholder="¿Qué comieron?" autocomplete="off"><select id="daily-loc-${type}">${locations.map(v=>`<option value="${v}" ${x.location===v?'selected':''}>${v==='Casa'?'🏠 En casa':v==='Calle'?'🍽️ En la calle':v==='Mamá'?'🏡 En lo de mamá':'📍 Otro lugar'}</option>`).join('')}</select></div>`}).join('');
  }
  async function save(){
    const client=db(); if(!client)return window.toast?.('No se pudo conectar con Supabase');
    const person=$('#dailyMealCard .active')?.dataset.dailyPerson||'Los dos',date=today();
    const rows=mealTypes.map(([type])=>{const name=$(`#daily-${type}`)?.value.trim();const location=$(`#daily-loc-${type}`)?.value||'Casa';return name?{meal_date:date,meal_type:type,meal_name:name,person,location}:null}).filter(Boolean);
    const del=await client.from('meal_log').delete().eq('meal_date',date).eq('person',person);
    if(del.error)return window.toast?.(del.error.message);
    if(rows.length){const ins=await client.from('meal_log').insert(rows);if(ins.error)return window.toast?.(ins.error.message)}
    window.toast?.('Comidas guardadas 🌸');
    if(window.renderAll)window.renderAll();
  }
  function style(){if($('#dailyMealStyles'))return;const s=document.createElement('style');s.id='dailyMealStyles';s.textContent=`#dailyMealCard{margin-top:4px;background:#fff;border:1px solid #f0dfe5;border-radius:26px;padding:24px;box-shadow:0 10px 30px rgba(160,100,130,.07)}.daily-meal-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.daily-meal-title h2{margin:0;font-size:clamp(30px,7vw,46px);font-weight:800;letter-spacing:.5px;color:#513c46;font-family:Nunito,system-ui,sans-serif}.daily-meal-title p{margin:5px 0 0;color:#987a85;font-size:16px;text-transform:capitalize}.daily-flower{width:54px;height:54px;border-radius:18px;background:#fff0f5;display:flex;align-items:center;justify-content:center;font-size:28px}.daily-meal-person{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.daily-meal-person button{border:1px solid #f0dfe5;background:#fff;border-radius:14px;padding:10px 14px;color:#6d5360;font-weight:700}.daily-meal-person button.active{background:#df8fac;color:#fff;border-color:#df8fac}.daily-meal-row{display:grid;grid-template-columns:145px 1fr 150px;gap:12px;align-items:center;background:#fff8fa;border:1px solid #f1dfe6;border-radius:20px;padding:13px;margin:10px 0}.daily-meal-label{display:flex;align-items:center;gap:10px;color:#513c46}.daily-meal-label span{font-size:24px}.daily-meal-row input,.daily-meal-row select{width:100%;box-sizing:border-box;border:1px solid #ead7df;border-radius:13px;padding:12px;background:#fff;color:#513c46;font:inherit}.daily-meal-row input:focus,.daily-meal-row select:focus{outline:2px solid #f2c1d2;border-color:#df8fac}.daily-meal-card .full{margin-top:12px}@media(max-width:650px){#dailyMealCard{padding:18px;border-radius:22px}.daily-meal-title h2{font-size:34px}.daily-meal-row{grid-template-columns:1fr;gap:8px;padding:14px}.daily-meal-label{margin-bottom:2px}.daily-meal-row input,.daily-meal-row select{font-size:15px}.daily-flower{width:46px;height:46px;font-size:24px}}`;document.head.appendChild(s)}
  function boot(){style();render();const obs=new MutationObserver(()=>{if($('#comidas')?.classList.contains('active'))render()});obs.observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,1200));else setTimeout(boot,1200);
})();