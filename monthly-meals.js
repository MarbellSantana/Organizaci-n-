(function(){
  const SB='https://evmqqjtglapwnezbttds.supabase.co', KEY='sb_publishable_bri9jNvVFIyaynVhOHvBGA_9u4u527w';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const db=()=>window.supabase?.createClient?.(SB,KEY);
  let cursor=new Date(); cursor.setDate(1);
  function monthName(){return cursor.toLocaleDateString('es-AR',{month:'long',year:'numeric'}).replace(/^./,c=>c.toUpperCase())}
  function renderShell(){
    const hub=$('#casaHub'); if(!hub)return;
    if($('#casaMonthlyMeals'))return;
    const box=document.createElement('div');
    box.id='casaMonthlyMeals'; box.className='casa-monthly-meals';
    box.innerHTML=`<div class="casa-month-head"><div><span class="casa-month-kicker">HISTORIAL</span><h2>🍽️ Lo que hemos comido</h2><p>Todo el mes organizado como calendario.</p></div><div class="casa-month-controls"><button id="casaPrevMonth" type="button" aria-label="Mes anterior">‹</button><strong id="casaMonthLabel">${monthName()}</strong><button id="casaNextMonth" type="button" aria-label="Mes siguiente">›</button></div></div><div class="casa-weekdays"><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span></div><div id="casaMonthGrid" class="casa-month-grid"></div>`;
    hub.appendChild(box);
    $('#casaPrevMonth').onclick=()=>{cursor.setMonth(cursor.getMonth()-1);load()};
    $('#casaNextMonth').onclick=()=>{cursor.setMonth(cursor.getMonth()+1);load()};
    load();
  }
  async function load(){
    const grid=$('#casaMonthGrid'),label=$('#casaMonthLabel'); if(!grid)return;
    label.textContent=monthName();
    const y=cursor.getFullYear(),m=cursor.getMonth();
    const start=`${y}-${String(m+1).padStart(2,'0')}-01`;
    const endDate=new Date(y,m+1,1); const end=`${endDate.getFullYear()}-${String(endDate.getMonth()+1).padStart(2,'0')}-01`;
    const firstDay=(new Date(y,m,1).getDay()+6)%7;
    const days=new Date(y,m+1,0).getDate();
    const client=db(); let rows=[];
    if(client){const r=await client.from('meal_log').select('*').gte('meal_date',start).lt('meal_date',end).order('meal_type');if(!r.error)rows=r.data||[]}
    const by={}; rows.forEach(x=>(by[x.meal_date]??=[]).push(x));
    const cells=[];
    for(let i=0;i<firstDay;i++)cells.push('<div class="casa-day empty-day"></div>');
    for(let d=1;d<=days;d++){
      const date=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const items=by[date]||[];
      const today=new Date(); const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
      const mealIcons={desayuno:'☀️',almuerzo:'🍝',merienda:'🥪',cena:'🌙'};
      const content=items.map(x=>`<div class="casa-day-meal"><span>${mealIcons[x.meal_type]||'🍽️'}</span><b>${esc(x.meal_name)}</b></div>`).join('');
      cells.push(`<div class="casa-day ${isToday?'today':''}"><div class="casa-day-number">${d}</div>${content||'<div class="casa-day-empty">—</div>'}</div>`);
    }
    while(cells.length%7)cells.push('<div class="casa-day empty-day"></div>');
    grid.innerHTML=cells.join('');
  }
  function style(){if($('#casaMonthlyMealStyles'))return;const s=document.createElement('style');s.id='casaMonthlyMealStyles';s.textContent=`.casa-monthly-meals{margin-top:24px;background:#fff;border:1px solid #f0dfe5;border-radius:26px;padding:24px;box-shadow:0 10px 30px rgba(160,100,130,.07)}.casa-month-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:20px}.casa-month-kicker{font-size:12px;letter-spacing:1.5px;font-weight:800;color:#c47792}.casa-month-head h2{margin:5px 0 3px;color:#513c46;font-size:28px}.casa-month-head p{margin:0;color:#987a85}.casa-month-controls{display:flex;align-items:center;gap:10px}.casa-month-controls strong{text-transform:capitalize;min-width:150px;text-align:center;color:#513c46}.casa-month-controls button{border:0;width:42px;height:42px;border-radius:14px;background:#fff0f5;color:#b96782;font-size:28px;cursor:pointer}.casa-weekdays,.casa-month-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px}.casa-weekdays{margin-bottom:8px}.casa-weekdays span{text-align:center;font-weight:800;color:#987a85;font-size:13px}.casa-day{min-height:112px;background:#fff8fa;border:1px solid #f1dfe6;border-radius:16px;padding:9px;overflow:hidden}.casa-day.today{border:2px solid #df8fac;background:#fff4f7}.casa-day-number{font-weight:900;color:#513c46;font-size:16px;margin-bottom:7px}.casa-day-meal{display:flex;align-items:flex-start;gap:5px;background:#fff;border:1px solid #f1e3e8;border-radius:9px;padding:5px;margin:4px 0;font-size:11px;line-height:1.2;color:#6d5360}.casa-day-meal span{flex:0 0 auto}.casa-day-meal b{font-weight:700;word-break:break-word}.casa-day-empty{color:#d5bcc5;font-size:12px}.empty-day{background:transparent;border-color:transparent}@media(max-width:700px){.casa-monthly-meals{padding:15px;border-radius:22px}.casa-month-head{display:block}.casa-month-controls{margin-top:14px;justify-content:space-between}.casa-month-controls strong{min-width:0}.casa-weekdays,.casa-month-grid{gap:4px}.casa-weekdays span{font-size:11px}.casa-day{min-height:88px;padding:6px;border-radius:12px}.casa-day-number{font-size:14px;margin-bottom:4px}.casa-day-meal{font-size:9px;padding:4px;border-radius:7px;gap:3px}.casa-day-meal span{font-size:10px}}`;document.head.appendChild(s)}
  function boot(){style();renderShell();const obs=new MutationObserver(()=>{if($('#casa')?.classList.contains('active'))renderShell()});obs.observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));else setTimeout(boot,900);
})();