(function(){
  const SB='https://evmqqjtglapwnezbttds.supabase.co', KEY='sb_publishable_bri9jNvVFIyaynVhOHvBGA_9u4u527w';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const db=()=>window.supabase?.createClient?.(SB,KEY);

  function renderShell(){
    const hub=$('#casaHub');
    if(!hub || $('#casaRecentMeals')) return;

    const box=document.createElement('section');
    box.id='casaRecentMeals';
    box.className='casa-recent-meals';
    box.innerHTML=`
      <div class="casa-recent-head">
        <div>
          <span class="casa-recent-kicker">COMIDAS</span>
          <h2>🍽️ Últimas comidas</h2>
          <p>Un vistazo rápido a lo que han comido. Para ver todo, entra en <b>Comidas</b>.</p>
        </div>
        <button id="casaMealsLink" class="casa-recent-link" type="button">Ver todas →</button>
      </div>
      <div id="casaRecentList" class="casa-recent-list"></div>`;

    hub.appendChild(box);
    $('#casaMealsLink').onclick=()=>window.showScreen?.('comidas');
    load();
  }

  async function load(){
    const list=$('#casaRecentList');
    if(!list) return;
    const client=db();
    if(!client){
      list.innerHTML='<div class="casa-recent-empty">No se pudo cargar el historial.</div>';
      return;
    }

    const r=await client.from('meal_log').select('*').order('meal_date',{ascending:false}).order('created_at',{ascending:false}).limit(5);
    if(r.error){
      list.innerHTML='<div class="casa-recent-empty">No pudimos cargar las comidas.</div>';
      return;
    }

    const rows=r.data||[];
    const labels={
      desayuno:{icon:'☀️',name:'Desayuno'},
      almuerzo:{icon:'🍝',name:'Almuerzo'},
      merienda:{icon:'🥪',name:'Merienda'},
      cena:{icon:'🌙',name:'Cena'}
    };

    if(!rows.length){
      list.innerHTML='<div class="casa-recent-empty"><span>🍽️</span><div><b>Aún no hay comidas registradas</b><small>Cuando agreguen una comida, aparecerá aquí.</small></div></div>';
      return;
    }

    list.innerHTML=rows.map(x=>{
      const meal=labels[x.meal_type]||{icon:'🍽️',name:x.meal_type||'Comida'};
      const date=x.meal_date?new Date(x.meal_date+'T12:00:00').toLocaleDateString('es-AR',{day:'numeric',month:'short'}):'';
      const person=x.person==='Marbell'?'🌸 Marbell':x.person==='Deivis'?'💙 Deivis':'👩‍❤️‍👨 Los dos';
      return `<article class="casa-recent-item">
        <div class="casa-recent-icon">${meal.icon}</div>
        <div class="casa-recent-info">
          <div class="casa-recent-top"><b>${esc(meal.name)}</b><span>${esc(date)}</span></div>
          <strong>${esc(x.meal_name||'Sin nombre')}</strong>
          <small>${person}${x.location?` · 📍 ${esc(x.location)}`:''}</small>
        </div>
      </article>`;
    }).join('');
  }

  function style(){
    if($('#casaRecentMealStyles')) return;
    const s=document.createElement('style');
    s.id='casaRecentMealStyles';
    s.textContent=`
      .casa-recent-meals{margin-top:24px;background:#fff;border:1px solid #f0dfe5;border-radius:24px;padding:22px;box-shadow:0 8px 25px rgba(160,100,130,.06)}
      .casa-recent-head{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:16px}
      .casa-recent-kicker{font-size:11px;letter-spacing:1.5px;font-weight:800;color:#c47792}
      .casa-recent-head h2{margin:4px 0 3px;color:#513c46;font-size:22px}
      .casa-recent-head p{margin:0;color:#987a85;font-size:13px;line-height:1.45}
      .casa-recent-link{border:0;background:#fff0f5;color:#b96782;border-radius:12px;padding:10px 14px;font-weight:800;cursor:pointer;white-space:nowrap}
      .casa-recent-list{display:grid;gap:9px}
      .casa-recent-item{display:flex;align-items:center;gap:12px;background:#fff8fa;border:1px solid #f2e3e8;border-radius:15px;padding:12px 14px}
      .casa-recent-icon{width:38px;height:38px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:19px;flex:0 0 auto}
      .casa-recent-info{min-width:0;flex:1}
      .casa-recent-top{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:2px}
      .casa-recent-top b{font-size:12px;color:#c47792}
      .casa-recent-top span{font-size:11px;color:#aa9099;white-space:nowrap;text-transform:capitalize}
      .casa-recent-info>strong{display:block;color:#513c46;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .casa-recent-info small{display:block;color:#987a85;font-size:11px;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .casa-recent-empty{display:flex;align-items:center;gap:12px;padding:18px;background:#fff8fa;border:1px dashed #efdce4;border-radius:15px;color:#6d5360}
      .casa-recent-empty>span{font-size:24px}
      .casa-recent-empty b,.casa-recent-empty small{display:block}
      .casa-recent-empty small{color:#987a85;margin-top:3px}
      @media(max-width:600px){
        .casa-recent-meals{padding:17px;border-radius:20px}
        .casa-recent-head{display:block}
        .casa-recent-link{margin-top:12px}
        .casa-recent-item{padding:10px}
      }
    `;
    document.head.appendChild(s);
  }

  function boot(){
    style();
    renderShell();
    const obs=new MutationObserver(()=>{
      if($('#casa')?.classList.contains('active')) renderShell();
    });
    obs.observe(document.body,{attributes:true,attributeFilter:['class'],subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,900));
  else setTimeout(boot,900);
})();
