/* Mejoras de Organización: compras por categoría + gastos + servicios */
(function(){
  const categories=[
    ['frutas','🍎 Frutas'],['verduras','🥦 Verduras'],['carnes','🥩 Carnes'],['lacteos','🥛 Lácteos'],
    ['almacen','🥫 Almacén'],['congelados','🧊 Congelados'],['bebidas','🥤 Bebidas'],['limpieza','🧹 Limpieza'],['higiene','🧴 Higiene'],['otros','📦 Otros']
  ];
  let expenseData={services:[],personal:[]}, expenseTab='services';
  const esc2=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const money2=n=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(Number(n)||0);
  const toast2=t=>window.toast?tost(t):document.querySelector('#toast')&&(document.querySelector('#toast').textContent=t,document.querySelector('#toast').style.display='block',setTimeout(()=>document.querySelector('#toast').style.display='none',2200));
  function toastSafe(t){if(window.toast)window.toast(t);else{const e=document.querySelector('#toast');if(e){e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',2200)}}}
  function currentMonth(){return new Date().toISOString().slice(0,7)+'-01'}
  function openBuyEnhanced(){
    modal(`<h2>Agregar a compras 🛒</h2>
      <div class="field"><label>PRODUCTO</label><input id="fName" placeholder="Ej. banana"></div>
      <div class="field"><label>CATEGORÍA</label><select id="fCategory">${categories.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</select></div>
      <div class="field"><label>CANTIDAD</label><input id="fQty" placeholder="Ej. 1 kg"></div>
      <div class="field"><label>PRECIO ESTIMADO</label><input id="fPrice" type="number" min="0" placeholder="0"></div>
      <button type="button" class="primary full" onclick="saveBuyEnhanced()">Guardar</button>`);
  }
  async function saveBuyEnhanced(){
    if(!db)return toastSafe('Supabase no está disponible');
    const name=document.querySelector('#fName').value.trim(); if(!name)return toastSafe('Escribe un producto');
    const row={name,category:document.querySelector('#fCategory').value,quantity:document.querySelector('#fQty').value.trim(),estimated_price:Number(document.querySelector('#fPrice').value)||0};
    let r=await db.from('shopping_items').insert(row).select().single();
    if(r.error && /category/i.test(r.error.message)){
      delete row.category; r=await db.from('shopping_items').insert(row).select().single();
    }
    if(r.error)return toastSafe(r.error.message);
    data.buys.unshift(r.data);closeModal();renderBuysEnhanced();renderBudget();stats();toastSafe('Agregado a '+(categories.find(c=>c[0]===row.category)?.[1]||'compras')+' ♡');
  }
  window.saveBuyEnhanced=saveBuyEnhanced;
  function renderBuysEnhanced(){
    const e=document.querySelector('#buyList');if(!e)return;
    const list=data.buys.filter(x=>!x.purchased);
    const groups={}; categories.forEach(c=>groups[c[0]]=[]);
    list.forEach(x=>(groups[x.category]||(groups.otros=[])).push(x));
    e.innerHTML=categories.map(c=>groups[c[0]].length?`<div class="buy-category"><h3>${c[1]}</h3>${groups[c[0]].map(x=>`<div class="item"><div><b>${esc2(x.name)}</b><small>${esc2(x.quantity||'Sin cantidad')} · ${money2(x.estimated_price)}</small></div><div><button type="button" onclick="buyDone('${x.id}')">✓ Comprado</button><button type="button" class="secondary" onclick="deleteBuy('${x.id}')">Eliminar</button></div></div>`).join('')}</div>`:'').join('') || '<div class="empty">Tu lista está vacía ♡</div>';
    const bl=document.querySelector('#budgetList');if(bl)bl.innerHTML=list.map(x=>`<div class="item"><div><b>${esc2(x.name)}</b><small>${esc2(x.quantity||'')}</small></div><b>${money2(x.estimated_price)}</b></div>`).join('')||'<div class="empty">No hay compras pendientes.</div>';
  }
  async function deleteBuy(id){if(!db)return;const r=await db.from('shopping_items').delete().eq('id',id);if(r.error)return toastSafe(r.error.message);data.buys=data.buys.filter(x=>x.id!==id);renderBuysEnhanced();renderBudget();stats();toastSafe('Producto eliminado');}
  window.deleteBuy=deleteBuy;
  async function loadExpenses(){
    if(!db)return;
    const [s,p]=await Promise.all([db.from('services').select('*').eq('month',currentMonth()).order('due_day'),db.from('expenses').select('*').eq('category','personal').gte('expense_date',currentMonth()).order('expense_date',{ascending:false})]);
    expenseData.services=s.error?[]:(s.data||[]);expenseData.personal=p.error?[]:(p.data||[]);renderExpenses();
  }
  function renderExpenses(){
    const serviceTotal=expenseData.services.reduce((a,x)=>a+Number(x.amount||0),0), personalTotal=expenseData.personal.reduce((a,x)=>a+Number(x.amount||0),0);
    const set=(id,v)=>{const e=document.querySelector('#'+id);if(e)e.textContent=money2(v)};
    set('serviceTotal',serviceTotal);set('personalTotal',personalTotal);set('expenseTotal',serviceTotal+personalTotal);
    const e=document.querySelector('#expenseList');if(!e)return;
    const list=expenseTab==='services'?expenseData.services:expenseData.personal;
    e.innerHTML=list.length?list.map(x=>`<div class="item"><div><b>${esc2(x.name)}</b><small>${x.due_day?'Vence el día '+x.due_day:''}${x.expense_date?' · '+x.expense_date:''}${x.notes?' · '+esc2(x.notes):''}</small></div><div><b>${money2(x.amount)}</b><button type="button" class="secondary" onclick="deleteExpense('${x.id}','${expenseTab}')">Eliminar</button></div></div>`).join(''):'<div class="empty">Todavía no tienes gastos registrados.</div>';
  }
  function openExpense(){
    modal(`<h2>Agregar gasto 💸</h2><div class="tabs"><button type="button" class="active" id="serviceFormTab" onclick="showExpenseForm('service')">🏠 Servicio</button><button type="button" id="personalFormTab" onclick="showExpenseForm('personal')">🌸 Personal</button></div><div id="expenseForm"></div>`);showExpenseForm('service');
  }
  function showExpenseForm(type){
    document.querySelector('#expenseForm').innerHTML=type==='service'?`<div class="field"><label>SERVICIO</label><select id="serviceName">${['Luz','Agua','Gas','Internet','ABL','DirecTV'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>IMPORTE</label><input id="serviceAmount" type="number" min="0" placeholder="0"></div><div class="field"><label>DÍA DE VENCIMIENTO</label><input id="serviceDue" type="number" min="1" max="31" placeholder="Ej. 10"></div><div class="field"><label>NOTA</label><input id="serviceNote" placeholder="Opcional"></div><button type="button" class="primary full" onclick="saveService()">Guardar servicio</button>`:`<div class="field"><label>GASTO PERSONAL</label><input id="personalName" placeholder="Ej. peluquería, ropa, salida..."></div><div class="field"><label>IMPORTE</label><input id="personalAmount" type="number" min="0" placeholder="0"></div><div class="field"><label>FECHA</label><input id="personalDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field"><label>NOTA</label><input id="personalNote" placeholder="Opcional"></div><button type="button" class="primary full" onclick="savePersonalExpense()">Guardar gasto</button>`;
  }
  window.showExpenseForm=showExpenseForm;
  async function saveService(){if(!db)return toastSafe('Supabase no está disponible');const r=await db.from('services').insert({name:document.querySelector('#serviceName').value,amount:Number(document.querySelector('#serviceAmount').value)||0,due_day:Number(document.querySelector('#serviceDue').value)||null,month:currentMonth(),notes:document.querySelector('#serviceNote').value.trim()||null}).select().single();if(r.error)return toastSafe(r.error.message);expenseData.services.push(r.data);closeModal();renderExpenses();toastSafe('Servicio guardado 🏠');}
  window.saveService=saveService;
  async function savePersonalExpense(){if(!db)return toastSafe('Supabase no está disponible');const name=document.querySelector('#personalName').value.trim();if(!name)return toastSafe('Escribe el gasto');const r=await db.from('expenses').insert({name,category:'personal',amount:Number(document.querySelector('#personalAmount').value)||0,expense_date:document.querySelector('#personalDate').value,notes:document.querySelector('#personalNote').value.trim()||null}).select().single();if(r.error)return toastSafe(r.error.message);expenseData.personal.unshift(r.data);closeModal();renderExpenses();toastSafe('Gasto guardado 🌸');}
  window.savePersonalExpense=savePersonalExpense;
  async function deleteExpense(id,type){if(!db)return;const r=await db.from(type==='services'?'services':'expenses').delete().eq('id',id);if(r.error)return toastSafe(r.error.message);if(type==='services')expenseData.services=expenseData.services.filter(x=>x.id!==id);else expenseData.personal=expenseData.personal.filter(x=>x.id!==id);renderExpenses();toastSafe('Gasto eliminado');}
  window.deleteExpense=deleteExpense;
  document.addEventListener('DOMContentLoaded',()=>{
    const buy=document.querySelector('#addBuy');if(buy)buy.onclick=openBuyEnhanced;
    const expense=document.querySelector('#addExpense');if(expense)expense.onclick=openExpense;
    document.addEventListener('click',e=>{const b=e.target.closest('[data-exp-tab]');if(!b)return;expenseTab=b.dataset.expTab;document.querySelectorAll('[data-exp-tab]').forEach(x=>x.classList.toggle('active',x===b));renderExpenses();});
    setTimeout(()=>{renderBuysEnhanced();loadExpenses();},900);
  });
})();