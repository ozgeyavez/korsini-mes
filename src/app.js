(function(){
const TZ='Europe/Istanbul',KEY='korsini-mes-v3',MIN=6e4,H=36e5,DAY=864e5;
const ROLES={lider:'Takım lideri',koparma:'Koparma operatörü',paketleme:'Paketleme operatörü',kalite:'Kalite uzmanı',bakim:'Bakım teknisyeni',yonetici:'Yönetici',admin:'Admin'};
const USERS=[
  {id:'u1',name:'Takım Lideri 1',ini:'TL',c:'#2fac66',role:'lider',note:'İşleri makinelere atar, onay verir'},
  {id:'u2',name:'Koparma Operatörü 1',ini:'KO',c:'#6fb0e1',role:'koparma',note:'Makinede işi başlatır, duruş girer'},
  {id:'u3',name:'Paketleme Operatörü 1',ini:'PO',c:'#ffd744',role:'paketleme',note:'Kamera sonuçlarını inceler, işi bitirir'},
  {id:'u6',name:'Kalite Uzmanı 1',ini:'KU',c:'#9fd7b8',role:'kalite',note:'Hata analizini ve uygunsuzlukları yönetir'},
  {id:'u7',name:'Bakım Teknisyeni 1',ini:'BT',c:'#b9d8f0',role:'bakim',note:'Arıza taleplerine müdahale eder, periyodik bakımı yapar'},
  {id:'u4',name:'Yönetici 1',ini:'Y1',c:'#a4b6be',role:'yonetici',note:'Bütün modülleri görür, otomasyonları kurar'},
  {id:'u5',name:'Admin 1',ini:'A1',c:'#dce6eb',role:'admin',note:'Ayarları ve yetkileri yönetir'}];
const CAN={
  plan:['lider','admin'],seePlan:['lider','yonetici','admin'],
  start:['koparma','lider','admin'],finish:['paketleme','lider','admin'],approve:['lider','admin'],
  seeQual:['kalite','lider','yonetici','admin'],editQual:['kalite','admin'],
  seeMaint:['bakim','lider','yonetici','admin'],editMaint:['bakim','admin'],
  seeTrack:['lider','kalite','bakim','yonetici','admin'],seeAuto:['lider','kalite','bakim','yonetici','admin'],editAuto:['yonetici','admin'],
  settings:['admin']};
const PERM_ROWS=[['seePlan','Planlamayı görür'],['plan','İş atar, sıralar'],['start','İşi başlatır, duruş girer'],['finish','Kamera hatasını inceler, işi bitirir'],['approve','Eksik adetle bitirmeyi onaylar'],['seeQual','Kalite modülünü görür'],['editQual','Uygunsuzluk açar, kapatır'],['seeMaint','Bakım modülünü görür'],['editMaint','Arızaya müdahale eder, bakımı kapatır'],['seeAuto','Otomasyonları görür'],['editAuto','Otomasyon kurar, değiştirir'],['settings','Ayarları değiştirir']];
const TECH={'Injection Molding IML':'#2fac66','Thermoforming IML':'#6fb0e1','Blow Molding IML':'#ffd744','SealPPeel':'#a4b6be','NextCycle IML':'#1c784c'};
const CHANNELS=['Uygulama','SMS','E-posta'];
const SEVS=['Bilgi','Uyarı','Kritik'];
const SEVC={Bilgi:'st-info',Uyarı:'st-warn',Kritik:'st-stop'};
const RESULTS={none:'Yalnızca bildirim',action:'Aksiyon aç',ncr:'Uygunsuzluk aç',maint:'Bakım talebi aç'};
const DECISIONS=['Koli yeniden sayıldı','Karışan etiketler ayıklandı','Koli hurdaya ayrıldı','Müşteriye bildirildi'];
const ICON={
  proc:'<path d="M4 6h16M4 12h10M4 18h6"/>',mac:'<rect x="3" y="4" width="8" height="7" rx="1.5"/><rect x="13" y="4" width="8" height="7" rx="1.5"/><rect x="3" y="13" width="8" height="7" rx="1.5"/><rect x="13" y="13" width="8" height="7" rx="1.5"/>',
  plan:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',qual:'<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  maint:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',act:'<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 13l2 2 4-4"/>',
  auto:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>'};
const svg=k=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON[k]}</svg>`;

let S,user=null;
const U={teyit:{},sel:{},stopPick:{},onlyErr:{},review:null,tab:{},modal:null,bell:false,err:''};
const LOGO=()=>document.getElementById('logo-tpl').innerHTML;
const $=s=>document.querySelector(s);
const val=id=>{const e=document.getElementById(id);return e?e.value.trim():''};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const N=n=>Math.round(n).toLocaleString('tr-TR');
const T=ts=>new Intl.DateTimeFormat('tr-TR',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}).format(ts);
const D=ts=>new Intl.DateTimeFormat('tr-TR',{timeZone:TZ,day:'numeric',month:'short'}).format(ts);
const DT=ts=>new Intl.DateTimeFormat('tr-TR',{timeZone:TZ,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(ts);
const dayKey=ts=>new Intl.DateTimeFormat('en-CA',{timeZone:TZ}).format(ts);
const can=k=>!!user&&CAN[k].includes(user.role);
const mins=ts=>Math.max(0,Math.floor((Date.now()-ts)/MIN));
const dur=m=>m<60?m+' dk':Math.floor(m/60)+' sa '+(m%60)+' dk';
const P1=v=>v.toFixed(1).replace('.',',');
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let toastT;
function toast(msg,bad){const t=$('#toast');t.textContent=msg;t.className='toast show'+(bad?' bad':'');clearTimeout(toastT);toastT=setTimeout(()=>t.className='toast',2800)}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({S,uid:user&&user.id}))}catch(e){}}
function save(){runAuto();persist()}
const codeLabel=c=>(S.errorCodes.find(e=>e.code===c)||{label:c}).label;
const M=id=>S.machines.find(m=>m.id===id);
const mName=id=>(M(id)||{name:id||'—'}).name;
const W=id=>S.orders[id];
const produced=wo=>wo.boxes.reduce((a,b)=>a+b.count,0);
const errs=wo=>wo.boxes.filter(b=>b.result!=='OK');
const pct=wo=>wo.qty?produced(wo)/wo.qty*100:0;
const techTag=o=>`<span class="tech" style="--tc:${TECH[o.tech]||'var(--faint)'}">${esc(o.tech)} · ${esc(o.enh)}</span>`;
const avatar=u=>`<span class="avatar" style="background:${u.c}">${u.ini}</span>`;
const PILL={run:'<span class="pill st-run">Çalışıyor</span>',stop:'<span class="pill st-stop">Duruş</span>',idle:'<span class="pill st-idle">Boşta</span>'};
const nextId=p=>{S.seq[p]=(S.seq[p]||0)+1;return p+'-'+String(S.seq[p]).padStart(3,'0')};
const me=()=>user?user.name:'Sistem';
function audit(what,detail){S.audit.unshift({ts:Date.now(),user:me(),what,detail:detail||''});if(S.audit.length>300)S.audit.length=300}
const roleList=rs=>rs.map(r=>ROLES[r]).join(', ');
const pmLate=t=>Date.now()>t.last+t.days*DAY;
const pmDue=t=>t.last+t.days*DAY;

/* ---------- örnek veri ---------- */
function makeBoxes(wo,n,start,rate,bias,r){
  const gap=Math.min(6*MIN,(Date.now()-start)/Math.max(n,1));
  for(let k=0;k<n;k++){
    const i=wo.boxes.length+1,ts=start+k*gap;let result='OK',count=wo.perBox;
    if(r()<rate){const x=r();result=x<bias[0]?'CMIX':x<bias[0]+bias[1]?'PMIX':'QTY'}
    if(result==='QTY')count=wo.perBox+(r()<.7?-1:1)*(8+Math.floor(r()*70));
    const old=result!=='OK'&&k<n-6;
    wo.boxes.push({no:'K'+wo.id.slice(3)+'-'+String(i).padStart(3,'0'),ts,count,result,reviewed:old,decision:old?DECISIONS[0]:'',note:old?'Koli ayrıldı, etiketler yeniden sayıldı.':''});
  }
}
const PRODUCTS=[
  ['Süt Ürünleri A.Ş.','IM-DAI-50412','Yoğurt kabı 500 g yan etiket','Injection Molding IML','UltraGloss','Süt ürünleri',2000],
  ['Süt Ürünleri A.Ş.','TF-DAI-25031','Ayran bardağı 250 ml etiketi','Thermoforming IML','Matte','Süt ürünleri',2500],
  ['Dondurma Gıda','IM-ICE-10077','Dondurma kutusu 1 L kapak etiketi','Injection Molding IML','Metallic','Dondurma',2500],
  ['Dondurma Gıda','IM-ICE-05018','Dondurma kutusu 500 ml yan etiket','Injection Molding IML','SuperClear','Dondurma',2000],
  ['Boya Kimya','IM-PNT-25005','Boya kovası 2,5 L etiketi','Injection Molding IML','Laminated','Boya ve dış mekân',1500],
  ['Kozmetik Ltd.','IM-PCB-20044','Krem kavanozu 200 ml etiketi','Injection Molding IML','Metallic','Kişisel bakım',1000],
  ['Ev Bakım A.Ş.','BM-HCL-30012','Deterjan şişesi 3 L etiketi','NextCycle IML','HDPE','Ev bakım',1600],
  ['Margarin Gıda','IM-BUT-50020','Margarin kabı 500 g kapak etiketi','Injection Molding IML','Barrier','Tereyağı ve margarin',2500],
  ['Boya Kimya','IM-PNT-15009','Boya kovası 15 L etiketi','Injection Molding IML','Laminated','Boya ve dış mekân',1000],
  ['Ev Bakım A.Ş.','BM-HCL-15027','Yumuşatıcı şişesi 1,5 L etiketi','Blow Molding IML','DoubleSided','Ev bakım',2200],
  ['Şekerleme A.Ş.','TF-CNF-30008','Şekerleme kutusu 300 g etiketi','Thermoforming IML','Reverse','Şekerleme',1000],
  ['Süt Ürünleri A.Ş.','SP-DAI-07511','Yoğurt kapağı 75 mm kalıp kesim','SealPPeel','Peelable','Süt ürünleri',2500],
  ['Hazır Yemek A.Ş.','TF-FOD-40016','Hazır yemek kabı 400 g etiketi','Thermoforming IML','RetortProof','Gıda',1500],
  ['İçecek A.Ş.','BM-BEV-33002','Hazır içecek şişesi 330 ml etiketi','Blow Molding IML','VariableData','İçecek',1000]];
function seed(){
  const r=rng(11),now=Date.now();
  const QTY=[72000,120000,150000,90000,60000,40000,80000,200000,25000,110000,30000,250000,45000,20000],DUE=[0,1,0,2,-1,1,-1,0,3,4,5,2,6,7];
  const orders={};
  PRODUCTS.forEach((p,i)=>{const id='IE-'+(24571+i);orders[id]={id,customer:p[0],code:p[1],name:p[2],tech:p[3],enh:p[4],app:p[5],perBox:p[6],qty:QTY[i],due:now+DUE[i]*DAY,status:'havuz',machine:null,boxes:[],confirm:'',startedAt:null,finishedAt:null,approvalRequested:false,approved:false}});
  const machines=[1,2,3,4,5].map(i=>({id:'B'+i,name:'Bitirme-'+i,status:'idle',current:null,queue:[],stopReason:null,stopSince:null,idleSince:now-(20+i*7)*MIN,camera:'10.138.10.200'}));
  const put=(mi,oi)=>{const m=machines[mi],o=orders['IE-'+(24571+oi)];o.status='sirada';o.machine=m.id;m.queue.push(o.id);return o};
  const run=(mi,oi,hours,n,rate,bias,tey)=>{const o=put(mi,oi),m=machines[mi];m.queue.shift();m.current=o.id;m.status='run';o.status='calisiyor';o.startedAt=now-hours*H;o.confirm=tey;makeBoxes(o,n,o.startedAt,rate,bias,r);return o};
  run(0,0,3.2,34,.09,[.35,.35,.3],'T-88412');put(0,1);
  run(2,2,4.5,52,.13,[.2,.6,.2],'T-88397');put(2,3);
  run(3,4,1.8,12,.17,[.3,.2,.5],'T-88420');
  machines[3].status='stop';machines[3].stopReason='Arıza';machines[3].stopSince=now-18*MIN;
  put(1,5);
  const st={seq:{AK:3,UG:2,BT:3,OT:0}};
  const pmT=[['Kamera lensi temizliği',1],['Koparma bıçağı kontrolü',7],['Konveyör kayışı kontrolü',14],['Kamera kalibrasyonu',30]];
  const lastAgo={B1:[.4,3,6,12],B2:[.5,9,4,20],B3:[.3,2,10,12],B4:[.6,5,15,26],B5:[.2,1,3,8]};
  const pm=[];machines.forEach(m=>pmT.forEach((t,i)=>pm.push({id:m.id+'-'+i,machine:m.id,name:t[0],days:t[1],last:now-lastAgo[m.id][i]*DAY,owner:'bakim'})));
  return {machines,orders,seq:st.seq,
    products:PRODUCTS.map(p=>({code:p[1],name:p[2],customer:p[0],tech:p[3],enh:p[4],app:p[5],perBox:p[6]})),
    stopReasons:[{n:'Malzeme bekleme',maint:false},{n:'Arıza',maint:true},{n:'Ayar',maint:false},{n:'Kamera hatası',maint:true},{n:'Operatör yok',maint:false}],
    errorCodes:[{code:'CMIX',label:'C. Mixup',desc:'Koliye farklı bir ürünün etiketi karışmış'},{code:'PMIX',label:'P. Mixup',desc:'Koliye farklı bir baskının etiketi karışmış'},{code:'QTY',label:'Adet hatası',desc:'Kolideki etiket adedi beklenenden farklı'}],
    rules:{assigned:true,first:true,noOpen:true,teyit:true,reviewed:true,minPctOn:true,minPct:98},
    shifts:[{n:'1. vardiya',s:'08:00',e:'16:00'},{n:'2. vardiya',s:'16:00',e:'24:00'},{n:'3. vardiya',s:'00:00',e:'08:00'}],
    autos:[
      {id:1,on:true,name:'Uzun duruş',metric:'stopMin',op:'ge',th:15,sev:'Kritik',roles:['lider','bakim'],ch:['Uygulama','SMS'],res:'action',owner:'lider',days:1},
      {id:2,on:true,name:'Mixup alarmı',metric:'mix',op:'ge',th:3,sev:'Kritik',roles:['kalite','lider'],ch:['Uygulama','SMS'],res:'ncr',owner:'kalite',days:1},
      {id:3,on:true,name:'Yüksek kamera hata oranı',metric:'errRate',op:'gt',th:15,sev:'Uyarı',roles:['kalite'],ch:['Uygulama'],res:'action',owner:'kalite',days:2},
      {id:4,on:true,name:'İncelenmemiş hatalı koli birikti',metric:'unrev',op:'ge',th:5,sev:'Uyarı',roles:['lider','paketleme'],ch:['Uygulama'],res:'none',owner:'lider',days:1},
      {id:5,on:true,name:'Periyodik bakım gecikti',metric:'pmLate',op:'ge',th:1,sev:'Uyarı',roles:['bakim'],ch:['Uygulama','E-posta'],res:'none',owner:'bakim',days:1},
      {id:6,on:false,name:'Sırada iş varken makine boşta',metric:'idleQ',op:'ge',th:20,sev:'Bilgi',roles:['lider'],ch:['Uygulama'],res:'none',owner:'lider',days:1}],
    autoState:{},runs:[],notifs:[],
    actions:[
      {id:'AK-001',title:'Bitirme-2 koparma bıçağı değişim planı',src:'Elle açıldı',machine:'B2',owner:'bakim',due:now+2*DAY,status:'Devam ediyor',created:now-2*DAY,note:''},
      {id:'AK-002',title:'Boya Kimya etiketleri için koli adedi teyidi',src:'Elle açıldı',machine:'B4',owner:'kalite',due:now-1*DAY,status:'Açık',created:now-3*DAY,note:''},
      {id:'AK-003',title:'Vardiya başı kamera test kolisi talimatı',src:'Elle açıldı',machine:null,owner:'lider',due:now-4*DAY,status:'Tamamlandı',created:now-6*DAY,note:'Talimat panoya asıldı.'}],
    ncrs:[
      {id:'UG-001',machine:'B3',wo:'IE-24573',code:'PMIX',boxes:2,desc:'İki kolide 500 ml baskısına ait etiket bulundu.',status:'Kapatıldı',decision:'Karışan etiketler ayıklandı',root:'Önceki işin artık etiketleri birleştirme istasyonunda kalmış.',created:now-2*DAY,closed:now-1.6*DAY,src:'Elle açıldı'},
      {id:'UG-002',machine:'B1',wo:'IE-24571',code:'CMIX',boxes:1,desc:'Kolide farklı ürün koduna ait etiket.',status:'İncelemede',decision:'',root:'',created:now-5*H,closed:null,src:'Elle açıldı'}],
    maint:[
      {id:'BT-001',machine:'B4',type:'Arıza',desc:'Koparma makinesinde Arıza nedeniyle duruş',status:'Açık',created:now-18*MIN,startedAt:null,doneAt:null,note:'',src:'Duruş kaydı'},
      {id:'BT-002',machine:'B3',type:'Kamera hatası',desc:'Görüntü işleme kamerası bağlantı kopması',status:'Tamamlandı',created:now-26*H,startedAt:now-25.8*H,doneAt:now-25.1*H,note:'Kamera ağ kablosu yenilendi.',src:'Duruş kaydı'},
      {id:'BT-003',machine:'B1',type:'Arıza',desc:'Konveyör kayışı kaydı',status:'Tamamlandı',created:now-3*DAY,startedAt:now-3*DAY+12*MIN,doneAt:now-3*DAY+58*MIN,note:'Kayış gerginliği ayarlandı.',src:'Duruş kaydı'}],
    pm,audit:[{ts:now-H,user:'Admin 1',what:'Örnek veri yüklendi',detail:''}]};
}
function load(){
  try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);S=d.S;user=USERS.find(u=>u.id===d.uid)||null;return}}catch(e){}
  S=seed();runAuto(true);
}

/* ---------- akıllı otomasyon motoru ---------- */
const METRICS={
  stopMin:{n:'Süren duruş süresi',u:'dk',v:m=>m.status==='stop'&&m.stopSince?mins(m.stopSince):0},
  mix:{n:'Çalışan işte C. ve P. Mixup sayısı',u:'koli',v:m=>{const w=m.current&&W(m.current);return w?w.boxes.filter(b=>b.result==='CMIX'||b.result==='PMIX').length:0}},
  errRate:{n:'Son 20 kolide hata oranı',u:'%',v:m=>{const w=m.current&&W(m.current);if(!w||w.boxes.length<10)return null;const l=w.boxes.slice(-20);return Math.round(l.filter(b=>b.result!=='OK').length/l.length*100)}},
  unrev:{n:'İncelenmemiş hatalı koli',u:'koli',v:m=>{const w=m.current&&W(m.current);return w?errs(w).filter(b=>!b.reviewed).length:0}},
  pmLate:{n:'Geciken periyodik bakım',u:'adet',v:m=>S.pm.filter(t=>t.machine===m.id&&pmLate(t)).length},
  idleQ:{n:'Sırada iş varken boşta kalma süresi',u:'dk',v:m=>m.status==='idle'&&m.queue.length&&m.idleSince?mins(m.idleSince):0}};
const OPS={gt:'>',ge:'≥',lt:'<',le:'≤',eq:'='};
const OPN={gt:'> üzerinde',ge:'≥ en az',lt:'< altında',le:'≤ en fazla',eq:'= eşit'};
const test=(v,op,th)=>v!=null&&({gt:v>th,ge:v>=th,lt:v<th,le:v<=th,eq:v===th})[op];
const fmtV=(k,v)=>METRICS[k].u==='%'?'%'+v:v+' '+METRICS[k].u;
function runAuto(silent){
  let fired=[];
  S.autos.forEach(a=>{S.machines.forEach(m=>{
    const key=a.id+':'+m.id,v=METRICS[a.metric].v(m),hit=a.on&&test(v,a.op,a.th);
    if(hit&&!S.autoState[key]){fired.push(fire(a,m,v))}
    S.autoState[key]=!!hit;})});
  if(fired.length&&!silent)setTimeout(()=>{toast('Otomasyon: '+fired[0].title+(fired.length>1?' (+'+(fired.length-1)+')':''));updBell()},1800);
  return fired;
}
function fire(a,m,v){
  const run={id:nextId('OT'),ts:Date.now(),auto:a.id,name:a.name,machine:m.id,value:fmtV(a.metric,v),sev:a.sev,roles:[...a.roles],ch:[...a.ch],res:null,title:a.name+' · '+m.name};
  const body=`${METRICS[a.metric].n}: ${run.value} (eşik ${OPS[a.op]} ${fmtV(a.metric,a.th)})`;
  if(a.res==='action'){const x={id:nextId('AK'),title:a.name+': '+m.name,src:'Otomasyon: '+a.name,machine:m.id,owner:a.owner,due:Date.now()+a.days*DAY,status:'Açık',created:Date.now(),note:body};S.actions.unshift(x);run.res=x.id}
  if(a.res==='ncr'){const w=m.current&&W(m.current);const x={id:nextId('UG'),machine:m.id,wo:w?w.id:null,code:a.metric==='mix'?'PMIX':'QTY',boxes:a.metric==='mix'?v:0,desc:body,status:'Açık',decision:'',root:'',created:Date.now(),closed:null,src:'Otomasyon: '+a.name};S.ncrs.unshift(x);run.res=x.id}
  if(a.res==='maint'){const x={id:nextId('BT'),machine:m.id,type:'Arıza',desc:body,status:'Açık',created:Date.now(),startedAt:null,doneAt:null,note:'',src:'Otomasyon: '+a.name};S.maint.unshift(x);run.res=x.id}
  S.runs.unshift(run);
  S.notifs.unshift({id:run.id,ts:run.ts,title:run.title,body:body+(run.res?' · '+run.res+' açıldı':''),sev:a.sev,roles:[...a.roles],ch:[...a.ch],read:{}});
  return run;
}
function notify(title,body,roles,sev){S.notifs.unshift({id:'N'+Date.now()+Math.random().toString(36).slice(2,5),ts:Date.now(),title,body,sev:sev||'Bilgi',roles,ch:['Uygulama'],read:{}})}
const myNotifs=()=>S.notifs.filter(n=>user.role==='admin'||user.role==='yonetici'||n.roles.includes(user.role));
const unread=()=>myNotifs().filter(n=>!n.read[user.id]).length;

/* ---------- iş kuralları ---------- */
function startRules(m,woId,teyit){
  const wo=W(woId),R=S.rules,out=[];
  if(R.assigned)out.push({l:'İş bu makineye atanmış olmalı',ok:!!wo&&wo.machine===m.id,why:wo?'İş başka bir makineye atanmış':'Önce sıradan bir iş seçin'});
  if(R.first)out.push({l:'İş, makinenin sırasındaki ilk iş olmalı',ok:!!wo&&m.queue[0]===woId,why:m.queue[0]?'Sıradaki ilk iş '+m.queue[0]+'. Önce onu başlatın ya da planlamada sırayı değiştirin.':'Makinenin sırasında iş yok'});
  if(R.noOpen)out.push({l:'Makinede açık başka bir iş olmamalı',ok:!m.current,why:'Makinede açık iş var: '+m.current+'. Önce paketlemede bitirilmeli.'});
  if(R.teyit)out.push({l:'Operatör teyit numarasını girmiş olmalı',ok:(teyit||'').trim().length>=4,why:'Teyit numarasını girin (en az 4 karakter)'});
  const openBT=S.maint.find(b=>b.machine===m.id&&b.status!=='Tamamlandı');
  out.push({l:'Makinede açık arıza talebi olmamalı',ok:!openBT,why:openBT?openBT.id+' henüz tamamlanmadı. Bakım ekibi talebi kapatınca iş başlatılabilir.':''});
  return out;
}
function finishRules(wo){
  const R=S.rules,out=[];
  if(R.reviewed){const n=errs(wo).filter(b=>!b.reviewed).length;out.push({k:'rev',l:'Bütün hatalı koliler incelenmiş olmalı',ok:n===0,why:n+' hatalı koli henüz incelenmedi'})}
  if(R.minPctOn){const p=pct(wo);out.push({k:'pct',l:'Paketlenen adet siparişin en az %'+R.minPct+"'i olmalı",ok:p>=R.minPct||wo.approved,why:'Şu an %'+P1(p)+'. Takım liderinin onayı gerekiyor.',appr:wo.approved&&p<R.minPct})}
  return out;
}
const ruleList=rs=>'<ul class="rules">'+rs.map(r=>`<li class="${r.ok?'ok':'no'}"><span class="ic">${r.ok?'✓':'✕'}</span><div>${esc(r.l)}${r.ok?(r.appr?'<small style="color:var(--ok)">Takım lideri onayladı</small>':''):'<small>'+esc(r.why)+'</small>'}</div></li>`).join('')+'</ul>';

/* ---------- kabuk ---------- */
const NAVG=[
  ['Üretim',[['prosesler','Prosesler','proc',1],['makineler','Makinelerim','mac',1],['planlama','Planlama','plan','seePlan']]],
  ['Kalite',[['kalite','Kalite Kontrol','qual','seeQual']]],
  ['Bakım',[['bakim','Bakım Yönetimi','maint','seeMaint']]],
  ['Takip',[['aksiyonlar','Aksiyonlar','act','seeTrack'],['otomasyonlar','Akıllı Otomasyonlar','auto','seeAuto']]],
  ['Yönetim',[['ayarlar','Ayarlar','set','settings']]]];
const navOk=i=>i[3]===1||can(i[3]);
const route=()=>(location.hash||'').slice(1)||'prosesler';
function counts(){
  return {kalite:S.ncrs.filter(n=>n.status!=='Kapatıldı').length,bakim:S.maint.filter(b=>b.status!=='Tamamlandı').length+S.pm.filter(pmLate).length,
    aksiyonlar:S.actions.filter(a=>a.status!=='Tamamlandı'&&a.due<Date.now()).length};
}
function render(){
  const app=$('#app');
  if(!user){app.innerHTML=viewLogin();return}
  let r=route();const flat=NAVG.flatMap(g=>g[1]);
  const it=flat.find(i=>i[0]===r);if(it&&!navOk(it))r='makineler';
  let body;
  if(r.startsWith('makine-')&&M(r.slice(7)))body=viewMachine(M(r.slice(7)));
  else body=({makineler:viewMachines,planlama:viewPlan,kalite:viewQuality,bakim:viewMaint,aksiyonlar:viewActions,otomasyonlar:viewAutos,ayarlar:viewSettings}[r]||(()=>{r='prosesler';return viewProcs()}))();
  const nk=r.startsWith('makine-')?'makineler':r,cn=counts(),un=unread();
  app.innerHTML=`<header class="hdr"><div class="hdr-in">
      <a class="prod" href="#prosesler" aria-label="Ana sayfa">${LOGO()}<span class="sep"></span><div><b>Korsini MES</b><small>Bitirme hattı</small></div></a>
      <span class="spacer"></span><span class="clock" id="clock"></span>
      <button class="btn primary sm" data-act="sim" title="Çalışan makinelere yeni koliler ekler">▶<span class="sim-t">Üretimi canlandır</span></button>
      <div class="bellw"><button class="bell" data-act="bell" aria-label="Bildirimler">${svg('bell')}<span class="n" id="bell-n" ${un?'':'hidden'}>${un}</span></button>${U.bell?bellPanel():''}</div>
      <div class="me">${avatar(user)}<div><b>${esc(user.name)}</b><span>${ROLES[user.role]}</span></div><button data-act="logout">Değiştir</button></div>
    </div><div class="tri"><i></i><i></i><i></i></div></header>
    <div class="shell"><nav class="side" aria-label="Modüller">${NAVG.map(([g,items])=>{const ok=items.filter(navOk);return ok.length?`<div class="grp"><span class="label">${g}</span>${ok.map(i=>`<a href="#${i[0]}" class="${nk===i[0]?'on':''}">${svg(i[2])}${i[1]}${cn[i[0]]?`<span class="cnt">${cn[i[0]]}</span>`:''}</a>`).join('')}</div>`:''}).join('')}</nav>
    <main class="content">${body}</main></div>${U.modal?modalHtml():''}`;
  tick();
  if(r==='planlama')bindDnD();
}
function bellPanel(){
  const ns=myNotifs().slice(0,25);
  return `<div class="bellp" role="dialog" aria-label="Bildirimler"><div class="bh"><b>Bildirimler</b>${ns.length?'<button class="btn ghost sm" data-act="readall">Hepsini okundu yap</button>':''}</div>
  ${ns.length?ns.map(n=>`<div class="nitem ${n.read[user.id]?'':'unread'}"><div style="display:flex;justify-content:space-between;gap:8px"><b>${esc(n.title)}</b><span class="pill ${SEVC[n.sev]}">${n.sev}</span></div><span>${esc(n.body)}</span><small>${DT(n.ts)} · ${esc(roleList(n.roles))} · ${esc(n.ch.join(', '))}</small></div>`).join(''):'<div class="empty">Henüz bildirim yok.</div>'}</div>`;
}
function updBell(){const b=$('#bell-n');if(!b)return;const u=unread();b.textContent=u;b.hidden=!u}

function viewLogin(){
  return `<div class="login">
    <section class="login-art"><div>${LOGO()}</div>
      <div><span class="label">Korsini · Bitirme hattı</span><h1 style="margin-top:10px">Üretim takip sistemi</h1><p>İş emrini makineye atayın, koparmada kurallarla başlatın, paketlemede kamera kontrolüyle bitirin. Kalite, bakım ve otomasyonlar aynı yerde.</p></div>
      <div class="blocks" aria-hidden="true"><i></i><i></i><i></i></div>
      <span class="muted" style="font-size:12.5px;position:relative">Prototip · Ekranlardaki iş emirleri, kamera ve bakım kayıtları örnek veridir.</span></section>
    <section class="login-form"><div><h2>Giriş yapın</h2><p class="muted" style="margin:4px 0 0">Denemek için bir rol seçin.</p></div>
      <div class="users">${USERS.map(u=>`<button class="user-btn" data-act="login" data-id="${u.id}">${avatar(u)}<div><strong>${esc(u.name)}</strong><span>${ROLES[u.role]} · ${esc(u.note)}</span></div><span class="go">›</span></button>`).join('')}</div>
      <button class="btn ghost sm" style="justify-self:start" data-act="reset">Örnek veriye dön</button></section></div>`;
}
const tabs=(page,list,def)=>{const cur=U.tab[page]||def;return {cur,html:`<div class="ptabs" role="tablist">${list.map(([k,l,c])=>`<button role="tab" aria-selected="${cur===k}" class="${cur===k?'on':''}" data-act="tab" data-p="${page}" data-v="${k}">${l}${c!=null?`<span class="c">${c}</span>`:''}</button>`).join('')}</div>`}};
const kpi=(l,v,color,sm)=>`<div class="stat"><span class="label">${l}</span><b class="num" ${color?`style="color:${color}"`:''}>${v}</b>${sm?`<small>${sm}</small>`:''}</div>`;
const table=(cols,rows,empty)=>rows.length?`<div class="tablewrap"><table><thead><tr>${cols.map(c=>`<th class="${c[2]||''}">${c[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr class="${r._cls||''}">${cols.map(c=>`<td class="${c[2]||''}">${c[1](r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<div class="empty">${empty||'Henüz kayıt yok.'}</div>`;

/* ---------- üretim ---------- */
function viewProcs(){
  return `<div class="head"><div><h1>Prosesler</h1><p>Etiket baskıdan başlar, kesimden geçer ve paketlemede koliye girer.</p></div></div>
  <div class="procs">
    <button class="proc soon" data-act="soon" data-name="Baskı"><span class="tag">Yakında</span><span class="step">01</span><h2>Baskı</h2><p>Baskı makinelerinin takibi sonraki sürümde eklenecek.</p></button>
    <button class="proc soon" data-act="soon" data-name="Kesim"><span class="tag">Yakında</span><span class="step">02</span><h2>Kesim</h2><p>Kesim makinelerinin takibi sonraki sürümde eklenecek.</p></button>
    <a class="proc live" href="#makineler"><span class="tag">Aktif</span><span class="step">03</span><h2>Paketleme</h2><p>${S.machines.length} bitirme makinesi. İş koparmada başlar, paketlemede kamera kontrolüyle biter.</p><span class="go">Makinelerim →</span></a>
  </div>
  <div class="flow"><span class="label">Bitirme makinesinde akış</span><i>Koparma</i>→<i>Birleştirme</i>→<i>Görüntü işleme ve koli etiketi</i>→<i>Palet</i></div>`;
}
function machineFlags(m){
  const bt=S.maint.find(b=>b.machine===m.id&&b.status!=='Tamamlandı'),late=S.pm.filter(t=>t.machine===m.id&&pmLate(t)).length,ug=S.ncrs.filter(n=>n.machine===m.id&&n.status!=='Kapatıldı').length;
  return (bt||late||ug)?`<div class="flags">${bt?`<span class="chip c-bad">${bt.id} · ${esc(bt.status)}</span>`:''}${late?`<span class="chip c-warn">${late} bakım gecikti</span>`:''}${ug?`<span class="chip c-info">${ug} açık uygunsuzluk</span>`:''}</div>`:'';
}
function machineCard(m){
  const wo=m.current&&W(m.current),st=m.status;let job;
  if(wo){const p=Math.min(100,pct(wo)),e=errs(wo).length;
    job=`<div class="job"><span class="mono" style="color:var(--brand-deep)">${wo.id} · ${esc(wo.code)}</span><b>${esc(wo.name)}</b><span class="muted" style="font-size:13px">${esc(wo.customer)}</span>${techTag(wo)}</div>
    <div class="meter"><div class="ring" style="--p:${p.toFixed(0)}"><span class="num">%${p.toFixed(0)}</span></div>
      <div class="t num"><span><b>${N(produced(wo))}</b> / ${N(wo.qty)} etiket</span><span>${wo.boxes.length} koli · <span class="chip ${e?'c-bad':'c-ok'}">${e} hatalı</span></span></div></div>
    ${st==='stop'?`<div class="stopband">● ${esc(m.stopReason)} · <span data-since="${m.stopSince}">${dur(mins(m.stopSince))}</span></div>`:''}
    ${wo.approvalRequested&&!wo.approved?'<span class="chip c-warn">Bitirme onayı bekliyor</span>':''}`;
  }else{const nx=m.queue[0]&&W(m.queue[0]);
    job=`<div class="job"><b class="muted">Makine boşta</b>${nx?`<span style="font-size:13px">Sıradaki: <span class="mono">${nx.id}</span> · ${esc(nx.name)}</span>${techTag(nx)}`:'<span class="muted" style="font-size:13px">Sırada iş yok. Planlamadan iş atanabilir.</span>'}</div>`}
  return `<a class="mcard ${st}" href="#makine-${m.id}"><div class="row"><h2>${esc(m.name)}</h2>${PILL[st]}</div>${job}${machineFlags(m)}
    <div class="foot"><span>Sırada ${m.queue.length} iş</span>${wo?`<span>Başlangıç ${T(wo.startedAt)}</span>`:''}</div></a>`;
}
function viewMachines(){
  const ms=S.machines,c=s=>ms.filter(m=>m.status===s).length,today=dayKey(Date.now());let te=0;
  Object.values(S.orders).forEach(o=>o.boxes.forEach(b=>{if(b.result!=='OK'&&dayKey(b.ts)===today)te++}));
  return `<div class="head"><div><div class="crumb"><a href="#prosesler">Prosesler</a>/<span>Paketleme</span></div><h1>Makinelerim</h1><p>Bir makineye dokunarak işi başlatın ya da kamera sonuçlarını açın.</p></div>
    ${can('seePlan')?'<a class="btn" href="#planlama">Planlamaya git</a>':''}</div>
  <div class="strip">${kpi('Çalışıyor',c('run'),'var(--ok)')}${kpi('Duruş',c('stop'),c('stop')?'var(--bad)':'')}${kpi('Boşta',c('idle'))}${kpi('Bugün hatalı koli',te,te?'var(--bad)':'')}</div>
  <div class="mgrid">${ms.map(machineCard).join('')}</div>`;
}
function viewMachine(m){
  const wo=m.current&&W(m.current);let cur;
  if(wo){
    cur=`<div class="bigjob"><span class="id">${wo.id}</span><b>${esc(wo.name)}</b><span class="muted">${esc(wo.customer)} · <span class="mono">${esc(wo.code)}</span></span>${techTag(wo)}</div>
    <dl class="kv"><dt>Başlangıç</dt><dd>${DT(wo.startedAt)}</dd><dt>Teyit no</dt><dd class="mono">${esc(wo.confirm)}</dd><dt>Uygulama</dt><dd>${esc(wo.app)}</dd><dt>Sipariş</dt><dd class="num">${N(wo.qty)} etiket · koli başı ${N(wo.perBox)}</dd></dl>
    ${m.status==='stop'?`<div class="stopband">● Duruş · ${esc(m.stopReason)} · <span data-since="${m.stopSince}">${dur(mins(m.stopSince))}</span></div>`:''}
    ${can('start')?(m.status==='run'
      ?(U.stopPick[m.id]?`<div class="sub"><span class="label">Duruş nedeni seçin</span><div class="reasons">${S.stopReasons.map(r=>`<button data-act="stop" data-m="${m.id}" data-r="${esc(r.n)}">${esc(r.n)}${r.maint?'<small>Bakım talebi açılır</small>':''}</button>`).join('')}</div><button class="btn ghost sm" style="justify-self:start" data-act="stopcancel" data-m="${m.id}">Vazgeç</button></div>`
        :`<div class="btns"><button class="btn danger big" data-act="stoppick" data-m="${m.id}">Durdur</button></div>`)
      :`<div class="btns"><button class="btn primary big" data-act="resume" data-m="${m.id}">Devam et</button></div>`):''}`;
  }else cur='<div class="empty">Makinede çalışan iş yok.</div>';
  const sel=U.sel[m.id]&&m.queue.includes(U.sel[m.id])?U.sel[m.id]:m.queue[0];
  const startBlock=m.queue.length?`
    <div class="qlist">${m.queue.map((id,i)=>{const o=W(id);return `<button class="qitem ${id===sel?'sel':''}" data-act="sel" data-m="${m.id}" data-id="${id}"><span class="ord">${i+1}.</span><span class="t"><b>${esc(o.name)}</b><span><span class="mono">${o.id} · ${esc(o.code)}</span> · ${esc(o.customer)} · ${N(o.qty)} etiket · termin ${D(o.due)}</span></span></button>`}).join('')}</div>
    ${can('start')?`<div class="field"><label class="label" for="teyit-${m.id}">Teyit numarası</label><input class="input mono" id="teyit-${m.id}" data-teyit="${m.id}" placeholder="Örn. T-88431" value="${esc(U.teyit[m.id]||'')}" autocomplete="off"></div>
    <div id="rules-${m.id}">${startRulesBlock(m,sel)}</div>`:'<p class="muted" style="margin:0">İşi koparma operatörü başlatır.</p>'}`
    :`<div class="empty">Bu makinenin sırasında iş yok.${can('plan')?' <a href="#planlama">Planlamadan iş atayın.</a>':''}</div>`;
  const left=`<section class="panel"><div class="panel-h"><div><span class="label">Koparma makinesi</span><h2>Çalışan iş</h2></div></div>${cur}${machineFlags(m)}
    <div class="sub"><div><span class="label">Koparma makinesi</span><h2>Sıradaki işi başlat</h2></div>${startBlock}</div></section>`;
  let right;
  if(wo){
    const e=errs(wo),cnt=c=>e.filter(b=>b.result===c).length,only=!!U.onlyErr[m.id];
    const rows=[...wo.boxes].reverse().filter(b=>!only||b.result!=='OK').slice(0,40);
    const fr=finishRules(wo),allOk=fr.every(r=>r.ok),revOk=(fr.find(r=>r.k==='rev')||{ok:true}).ok,pr=fr.find(r=>r.k==='pct');
    let fb;
    if(!can('finish'))fb='<p class="muted" style="margin:0">İşi paketleme operatörü bitirir.</p>';
    else if(allOk)fb=`<button class="btn primary big" data-act="finish" data-m="${m.id}">İşi bitir</button>`;
    else if(revOk&&pr&&!pr.ok)fb=can('approve')?`<button class="btn dark big" data-act="approve" data-m="${m.id}">Onayla ve bitir</button>`
      :wo.approvalRequested?'<button class="btn big" disabled>Takım lideri onayı bekleniyor</button>'
      :`<button class="btn big" data-act="askapprove" data-m="${m.id}">Takım liderinden onay iste</button>`;
    else fb='<button class="btn primary big" disabled>İşi bitir</button>';
    right=`<section class="panel"><div class="panel-h"><div><span class="label">Paketleme makinesi · Görüntü işleme</span><h2>Kamera sonuçları</h2></div>
      <div class="seg"><button class="${only?'':'on'}" data-act="filter" data-m="${m.id}" data-v="0">Tüm koliler</button><button class="${only?'on':''}" data-act="filter" data-m="${m.id}" data-v="1">Yalnızca hatalılar</button></div></div>
      <div class="boxes"><div class="box"><span class="label">Toplam koli</span><b class="num">${wo.boxes.length}</b></div>
        <div class="box good"><span class="label">Hatasız</span><b class="num">${wo.boxes.length-e.length}</b></div>
        ${S.errorCodes.map(c=>`<div class="box ${cnt(c.code)?'err':''}" title="${esc(c.desc)}"><span class="label">${esc(c.label)}</span><b class="num">${cnt(c.code)}</b></div>`).join('')}</div>
      <div style="display:grid;gap:6px"><div style="display:flex;justify-content:space-between;gap:10px;font-size:13.5px"><span class="muted">Paketlenen</span><span class="num"><b>${N(produced(wo))}</b> / ${N(wo.qty)} · %${P1(Math.min(999,pct(wo)))}</span></div><div class="bar"><span style="width:${Math.min(100,pct(wo))}%"></span></div></div>
      ${rows.length?`<div class="tablewrap"><table><thead><tr><th>Koli no</th><th>Saat</th><th>Adet</th><th>Sonuç</th><th>Sipariş bilgisi</th><th></th></tr></thead><tbody>
      ${rows.map(b=>{const bad=b.result!=='OK',key=wo.id+'|'+b.no;
        let r=`<tr class="${bad?'err':''}"><td class="mono">${b.no}</td><td class="num">${T(b.ts)}</td><td class="num">${N(b.count)}</td>
        <td>${bad?`<span class="chip c-bad">${esc(codeLabel(b.result))}</span>`:'<span class="chip c-ok">Hatasız</span>'}</td>
        <td>${bad?`<div class="match"><span><span class="mono">${wo.id}</span> · ${esc(wo.customer)}</span><span class="mono">${esc(wo.code)}</span><span class="muted num">Beklenen ${N(wo.perBox)} · Kamera ${N(b.count)}</span></div>`:'<span class="muted">—</span>'}</td>
        <td>${bad?(b.reviewed?`<span class="chip c-idle" title="${esc(b.note)}">${esc(b.decision||'İncelendi')}</span>`:(can('finish')?`<button class="btn sm" data-act="review" data-k="${esc(key)}">İncele</button>`:'<span class="chip c-warn">Bekliyor</span>')):''}</td></tr>`;
        if(U.review===key)r+=`<tr class="note-row"><td colspan="6"><div class="inl"><select class="input" id="dec-input" aria-label="Karar">${DECISIONS.map(d=>`<option>${d}</option>`).join('')}</select><input class="input" id="note-input" placeholder="Not, örn. 3 etiket ayıklandı" autocomplete="off"><label class="small" style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="ncr-input"> Uygunsuzluk aç</label><button class="btn primary sm" data-act="reviewed" data-k="${esc(key)}">Kaydet</button><button class="btn ghost sm" data-act="reviewcancel">Vazgeç</button></div></td></tr>`;
        return r}).join('')}</tbody></table></div>`:`<div class="empty">${only?'Bu işte hatalı koli yok.':'Henüz koli okunmadı.'}</div>`}
      <div class="sub"><div><span class="label">Paketleme makinesi</span><h2>İşi bitir</h2></div>${ruleList(fr)}<div class="btns">${fb}</div></div></section>`;
  }else right='<section class="panel"><div><span class="label">Paketleme makinesi · Görüntü işleme</span><h2>Kamera sonuçları</h2></div><div class="empty">Makinede çalışan iş yok. Koparmada bir iş başlayınca kamera kayıtları burada görünür.</div></section>';
  return `<div class="head"><div><div class="crumb"><a href="#prosesler">Prosesler</a>/<a href="#makineler">Paketleme</a>/<span>${esc(m.name)}</span></div>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><h1>${esc(m.name)}</h1>${PILL[m.status]}</div></div><a class="btn" href="#makineler">← Makinelerim</a></div>
  <div class="cols">${left}${right}</div>`;
}
function startRulesBlock(m,sel){
  const rs=startRules(m,sel,U.teyit[m.id]),ok=rs.every(r=>r.ok);
  return `<div style="display:grid;gap:12px"><span class="label">Başlatma kuralları</span>${ruleList(rs)}<div class="btns"><button class="btn primary big" data-act="start" data-m="${m.id}" data-id="${sel||''}" ${ok?'':'disabled'}>${ok?'İşi başlat':'Kurallar sağlanmadı'}</button></div></div>`;
}
function woCard(o,ctx){
  const dk=dayKey(o.due),td=dayKey(Date.now()),cls=dk<td?'late':dk===td?'today':'';
  const due=dk<td?'<span class="chip c-bad">Termin geçti · '+D(o.due)+'</span>':dk===td?'<span class="chip c-warn">Termin bugün</span>':'<span class="muted" style="font-size:12.5px">Termin '+D(o.due)+'</span>';
  const running=o.status==='calisiyor',p=can('plan');let acts='';
  if(p&&ctx.type==='pool')acts=`<div class="acts"><select data-assign="${o.id}" aria-label="${o.id} makineye ata"><option value="">Makineye ata…</option>${S.machines.map(m=>`<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select></div>`;
  if(p&&ctx.type==='queue')acts=`<div class="acts"><button class="iconbtn" data-act="up" data-id="${o.id}" ${ctx.i===0?'disabled':''} aria-label="Yukarı taşı">↑</button><button class="iconbtn" data-act="down" data-id="${o.id}" ${ctx.last?'disabled':''} aria-label="Aşağı taşı">↓</button><button class="btn sm ghost" data-act="unassign" data-id="${o.id}">Havuza al</button></div>`;
  return `<div class="wo ${cls} ${running?'running':''}" ${p&&!running?`draggable="true" data-drag="${o.id}"`:''}>
    <div class="r"><span class="mono" style="color:var(--brand-deep)">${o.id} · ${esc(o.code)}</span>${running?'<span class="pill st-run">Çalışıyor</span>':ctx.type==='queue'?'<span class="muted mono" style="font-size:12px">'+(ctx.i+1)+'. sıra</span>':''}</div>
    <b>${esc(o.name)}</b><span class="muted" style="font-size:12.5px">${esc(o.customer)}</span>${techTag(o)}
    <div class="r"><span class="num">${N(o.qty)} etiket</span>${due}</div>${acts}</div>`;
}
function viewPlan(){
  const pool=Object.values(S.orders).filter(o=>o.status==='havuz').sort((a,b)=>a.due-b.due);
  return `<div class="head"><div><div class="crumb"><a href="#prosesler">Prosesler</a>/<span>Paketleme</span></div><h1>Planlama</h1><p>${can('plan')?'Havuzdaki işi bir makinenin sütununa sürükleyin ya da “Makineye ata” ile seçin.':'Planı yalnızca görüntülüyorsunuz. Atamayı takım lideri yapar.'}</p></div>
    <div class="legend"><span><i style="background:var(--bad)"></i>Termini geçmiş</span><span><i style="background:var(--yellow)"></i>Termini bugün</span><span><i style="background:var(--brand)"></i>Çalışıyor</span></div></div>
  <div class="plan">
    <section class="pool" data-drop="pool"><div class="col-h"><h2>İş havuzu</h2><span class="chip c-idle">${pool.length} iş</span></div>
      ${pool.length?pool.map(o=>woCard(o,{type:'pool'})).join(''):'<div class="empty">Havuzda bekleyen iş yok.</div>'}</section>
    <div class="board"><div class="board-in" style="--n:${S.machines.length}">
      ${S.machines.map(m=>{const cur=m.current&&W(m.current);
        return `<section class="col" data-drop="${m.id}"><div class="col-h"><h3>${esc(m.name)}</h3>${PILL[m.status]}</div>
        ${cur?woCard(cur,{type:'cur'}):''}${m.queue.map((id,i)=>woCard(W(id),{type:'queue',i,last:i===m.queue.length-1})).join('')}
        ${!cur&&!m.queue.length?'<div class="empty" style="padding:18px;font-size:13px">İş atanmadı</div>':''}</section>`}).join('')}
    </div></div></div>`;
}

/* ---------- kalite ---------- */
function allBoxes(){const out=[];Object.values(S.orders).forEach(o=>o.boxes.forEach(b=>out.push({o,b})));return out}
function viewQuality(){
  const ab=allBoxes(),bad=ab.filter(x=>x.b.result!=='OK'),today=dayKey(Date.now()),tb=ab.filter(x=>dayKey(x.b.ts)===today),tbad=tb.filter(x=>x.b.result!=='OK');
  const openN=S.ncrs.filter(n=>n.status!=='Kapatıldı');
  const t=tabs('kalite',[['analiz','Kamera hata analizi'],['ug','Uygunsuzluklar',openN.length],['koli','Hatalı koliler',bad.filter(x=>!x.b.reviewed).length]],'analiz');
  let body='';
  if(t.cur==='analiz'){
    const codes=S.errorCodes;
    const rowsM=S.machines.map(m=>{const xs=ab.filter(x=>x.o.machine===m.id),e=xs.filter(x=>x.b.result!=='OK');return {m,n:xs.length,e:e.length,by:Object.fromEntries(codes.map(c=>[c.code,e.filter(x=>x.b.result===c.code).length]))}});
    const max=Math.max(1,...rowsM.flatMap(r=>codes.map(c=>r.by[c.code])));
    const cell=v=>`<td class="v num" style="background:color-mix(in srgb,var(--bad) ${Math.round(v/max*38)}%,transparent);color:${v?'var(--fg)':'var(--faint)'}">${v}</td>`;
    const byCust={};bad.forEach(x=>{byCust[x.o.customer]=(byCust[x.o.customer]||0)+1});
    const cust=Object.entries(byCust).sort((a,b)=>b[1]-a[1]);
    body=`<div class="strip">${kpi('Bugün kontrol edilen koli',N(tb.length))}${kpi('Bugün hatalı koli',tbad.length,tbad.length?'var(--bad)':'')}${kpi('Bugünkü hata oranı','%'+P1(tb.length?tbad.length/tb.length*100:0),'', 'Kamera sonucuna göre')}${kpi('Açık uygunsuzluk',openN.length,openN.length?'var(--info)':'')}</div>
    <div class="cols2"><section class="panel"><div><span class="label">Makine × hata kodu</span><h2>Hatalar nerede oluşuyor?</h2></div>
      <div class="tablewrap heat"><table style="min-width:520px"><thead><tr><th>Makine</th><th class="r">Koli</th>${codes.map(c=>`<th class="r">${esc(c.label)}</th>`).join('')}<th class="r">Oran</th></tr></thead><tbody>
      ${rowsM.map(r=>`<tr><td><b>${esc(r.m.name)}</b></td><td class="r num">${r.n}</td>${codes.map(c=>cell(r.by[c.code])).join('')}<td class="r num">%${P1(r.n?r.e/r.n*100:0)}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="panel"><div><span class="label">Müşteri bazında</span><h2>Hangi siparişlerde hata var?</h2></div>
      ${cust.length?`<div style="display:grid;gap:10px">${cust.map(([c,v])=>`<div style="display:grid;gap:4px"><div style="display:flex;justify-content:space-between;font-size:14px"><span>${esc(c)}</span><b class="num">${v} koli</b></div><div class="bar"><span style="width:${v/cust[0][1]*100}%;background:var(--bad)"></span></div></div>`).join('')}</div>`:'<div class="empty">Hatalı koli yok.</div>'}</section></div>`;
  }
  if(t.cur==='ug'){
    body=`<div class="btns" style="justify-content:space-between"><p class="muted" style="margin:0">Uygunsuzluk; hatalı koli incelenirken, otomasyonla ya da elle açılır. Kapatmak için karar ve kök neden zorunludur.</p>${can('editQual')?'<button class="btn primary" data-act="modal" data-k="ncrNew">Yeni uygunsuzluk</button>':''}</div>
    ${table([['No',n=>`<b class="mono">${n.id}</b>`],['Açılış',n=>DT(n.created)],['Makine · İş',n=>`${esc(mName(n.machine))}${n.wo?`<br><span class="mono muted small">${n.wo} · ${esc(W(n.wo)?W(n.wo).customer:'')}</span>`:''}`],['Hata',n=>`<span class="chip c-bad">${esc(codeLabel(n.code))}</span>`],['Açıklama',n=>`${esc(n.desc)}<br><span class="muted small">${esc(n.src)}</span>`],['Durum',n=>`<span class="pill ${n.status==='Kapatıldı'?'st-run':n.status==='İncelemede'?'st-warn':'st-stop'}">${n.status}</span>${n.decision?`<br><span class="small muted">${esc(n.decision)}</span>`:''}`],['',n=>can('editQual')&&n.status!=='Kapatıldı'?`<div class="btns">${n.status==='Açık'?`<button class="btn sm" data-act="ncrStart" data-id="${n.id}">İncelemeye al</button>`:''}<button class="btn sm primary" data-act="modal" data-k="ncrClose" data-id="${n.id}">Kapat</button></div>`:'']],S.ncrs,'Henüz uygunsuzluk yok.')}`;
  }
  if(t.cur==='koli'){
    const rows=bad.sort((a,b)=>b.b.ts-a.b.ts).slice(0,80).map(x=>Object.assign({_cls:x.b.reviewed?'':'err'},x));
    body=table([['Koli no',x=>`<span class="mono">${x.b.no}</span>`],['Saat',x=>DT(x.b.ts)],['Makine',x=>esc(mName(x.o.machine))],['Sipariş',x=>`<span class="mono">${x.o.id}</span> · ${esc(x.o.customer)}<br><span class="mono muted small">${esc(x.o.code)}</span>`],['Hata',x=>`<span class="chip c-bad">${esc(codeLabel(x.b.result))}</span>`],['Adet',x=>`<span class="num">${N(x.b.count)} / ${N(x.o.perBox)}</span>`,'r'],['Karar',x=>x.b.reviewed?esc(x.b.decision||'İncelendi'):`<a class="btn sm" href="#makine-${x.o.machine}">Makinede incele</a>`]],rows,'Hatalı koli yok.');
  }
  return `<div class="head"><div><div class="crumb"><span>Kalite</span></div><h1>Kalite Kontrol</h1><p>Görüntü işleme kamerasının bulduğu hatalar, sipariş bilgisiyle birlikte.</p></div></div>${t.html}${body}`;
}

/* ---------- bakım ---------- */
function viewMaint(){
  const open=S.maint.filter(b=>b.status!=='Tamamlandı'),done=S.maint.filter(b=>b.status==='Tamamlandı'&&b.startedAt);
  const mttr=done.length?Math.round(done.reduce((a,b)=>a+(b.doneAt-b.created),0)/done.length/MIN):0;
  const late=S.pm.filter(pmLate);
  const t=tabs('bakim',[['talep','Arıza talepleri',open.length],['pm','Periyodik bakım planı',late.length]],'talep');
  let body='';
  if(t.cur==='talep'){
    body=`<div class="btns" style="justify-content:space-between"><p class="muted" style="margin:0">Operatör makineyi Arıza ya da Kamera hatası nedeniyle durdurunca talep kendiliğinden açılır. Talep tamamlanmadan o makinede yeni iş başlatılamaz.</p>${can('editMaint')||can('start')?'<button class="btn primary" data-act="modal" data-k="btNew">Arıza bildir</button>':''}</div>
    ${table([['No',b=>`<b class="mono">${b.id}</b>`],['Makine',b=>`<b>${esc(mName(b.machine))}</b><br><span class="muted small">${esc(b.type)}</span>`],['Açıklama',b=>`${esc(b.desc)}<br><span class="muted small">${esc(b.src)}${b.note?' · '+esc(b.note):''}</span>`],['Açılış',b=>DT(b.created)],['Süre',b=>{const end=b.doneAt||Date.now();return `<span class="num">${dur(Math.round((end-b.created)/MIN))}</span>`},'r'],['Durum',b=>`<span class="pill ${b.status==='Tamamlandı'?'st-run':b.status==='Müdahalede'?'st-warn':'st-stop'}">${b.status}</span>`],['',b=>can('editMaint')&&b.status!=='Tamamlandı'?`<div class="btns">${b.status==='Açık'?`<button class="btn sm" data-act="btStart" data-id="${b.id}">Müdahaleye başla</button>`:''}<button class="btn sm primary" data-act="modal" data-k="btDone" data-id="${b.id}">Tamamla</button></div>`:'']],S.maint,'Henüz arıza talebi yok.')}`;
  }
  if(t.cur==='pm'){
    const rows=[...S.pm].sort((a,b)=>pmDue(a)-pmDue(b)).map(x=>Object.assign({_cls:pmLate(x)?'err':''},x));
    body=`<p class="muted" style="margin:0">Her makine için tekrarlayan bakım işleri. Süresi geçen iş kırmızı görünür ve “Periyodik bakım gecikti” otomasyonu bakım ekibine haber verir.</p>
    ${table([['Makine',x=>`<b>${esc(mName(x.machine))}</b>`],['Bakım işi',x=>esc(x.name)],['Periyot',x=>x.days===1?'Her gün':x.days+' günde bir'],['Son yapılış',x=>DT(x.last)],['Sıradaki',x=>{const d=pmDue(x),late=pmLate(x);return late?`<span class="chip c-bad">${Math.max(1,Math.floor((Date.now()-d)/DAY))} gün gecikti</span>`:dayKey(d)===dayKey(Date.now())?'<span class="chip c-warn">Bugün</span>':D(d)}],['',x=>can('editMaint')?`<button class="btn sm ${pmLate(x)?'primary':''}" data-act="pmDone" data-id="${x.id}">Yapıldı</button>`:'']],rows)}`;
  }
  return `<div class="head"><div><div class="crumb"><span>Bakım</span></div><h1>Bakım Yönetimi</h1><p>Arıza talepleri ve bitirme makinelerinin periyodik bakım planı.</p></div></div>
  <div class="strip">${kpi('Açık arıza talebi',open.filter(b=>b.status==='Açık').length,open.length?'var(--bad)':'')}${kpi('Müdahalede',open.filter(b=>b.status==='Müdahalede').length,'')}${kpi('Ortalama onarım süresi',mttr+' dk','','Talep açılışından tamamlanmaya')}${kpi('Geciken periyodik bakım',late.length,late.length?'var(--warn)':'')}</div>${t.html}${body}`;
}

/* ---------- takip: aksiyonlar ---------- */
function viewActions(){
  const now=Date.now(),open=S.actions.filter(a=>a.status!=='Tamamlandı'),late=open.filter(a=>a.due<now);
  const mine=S.actions.filter(a=>a.owner===user.role);
  const t=tabs('aksiyonlar',[['mine','Bana atananlar',mine.filter(a=>a.status!=='Tamamlandı').length],['late','Gecikenler',late.length],['all','Hepsi',S.actions.length]],'mine');
  const rows=(t.cur==='mine'?mine:t.cur==='late'?late:S.actions).map(a=>Object.assign({_cls:a.status!=='Tamamlandı'&&a.due<now?'err':''},a));
  const nextSt={Açık:'Devam ediyor','Devam ediyor':'Tamamlandı'};
  return `<div class="head"><div><div class="crumb"><span>Takip</span></div><h1>Aksiyonlar</h1><p>Otomasyonların açtığı ve elle açılan bütün işler tek listede.</p></div><button class="btn primary" data-act="modal" data-k="actNew">Yeni aksiyon</button></div>
  <div class="strip">${kpi('Açık',open.length)}${kpi('Geciken',late.length,late.length?'var(--bad)':'')}${kpi('Otomasyondan gelen',S.actions.filter(a=>a.src.startsWith('Otomasyon')).length,'var(--info)')}${kpi('Tamamlanan',S.actions.length-open.length,'var(--ok)')}</div>
  ${t.html}${table([['No',a=>`<b class="mono">${a.id}</b>`],['Aksiyon',a=>`<b>${esc(a.title)}</b>${a.note?`<br><span class="muted small">${esc(a.note)}</span>`:''}`],['Kaynak',a=>`<span class="chip ${a.src.startsWith('Otomasyon')?'c-info':'c-idle'}">${esc(a.src)}</span>`],['Makine',a=>esc(a.machine?mName(a.machine):'—')],['Sorumlu',a=>esc(ROLES[a.owner])],['Hedef',a=>a.status!=='Tamamlandı'&&a.due<now?`<span class="chip c-bad">Gecikti · ${Math.max(1,Math.floor((now-a.due)/DAY))} gün</span>`:D(a.due)],['Durum',a=>`<span class="pill ${a.status==='Tamamlandı'?'st-run':a.status==='Devam ediyor'?'st-warn':'st-idle'}">${a.status}</span>`],['',a=>nextSt[a.status]&&(a.owner===user.role||['admin','yonetici','lider'].includes(user.role))?`<button class="btn sm ${a.status==='Devam ediyor'?'primary':''}" data-act="actNext" data-id="${a.id}">${a.status==='Açık'?'Başla':'Tamamla'}</button>`:'']],rows,t.cur==='mine'?'Size atanmış aksiyon yok.':'Henüz kayıt yok.')}`;
}

/* ---------- takip: akıllı otomasyonlar ---------- */
function autoSentence(a){
  return `<div class="sentence"><span>Eğer</span><span class="tok when">${esc(METRICS[a.metric].n)}</span><span class="tok when">${OPS[a.op]} ${fmtV(a.metric,a.th)}</span><span>olursa</span><span>→</span>
  <span class="tok">${esc(roleList(a.roles))}</span><span class="tok">${esc(a.ch.join(', '))}</span><span class="tok then">${RESULTS[a.res]}${a.res!=='none'?': '+esc(ROLES[a.owner])+', '+a.days+' gün':''}</span></div>`;
}
function viewAutos(){
  const ed=can('editAuto');
  const t=tabs('otomasyonlar',[['setup','Otomasyonlar',S.autos.filter(a=>a.on).length+'/'+S.autos.length],['runs','Gerçekleşenler',S.runs.length]],'setup');
  let body;
  if(t.cur==='setup')body=`<div class="autos">${S.autos.map(a=>`<div class="auto ${a.on?'':'off'}"><div class="ico">${svg('auto')}</div>
    <div style="min-width:0"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><h3>${esc(a.name)}</h3><span class="pill ${SEVC[a.sev]}">${a.sev}</span><span class="muted small">${S.runs.filter(r=>r.auto===a.id).length} kez gerçekleşti</span></div>${autoSentence(a)}</div>
    <div class="btns">${ed?`<button class="btn sm ghost" data-act="modal" data-k="auto" data-id="${a.id}">Düzenle</button>`:''}<label class="switch" title="${a.on?'Açık':'Kapalı'}"><input type="checkbox" data-autoon="${a.id}" ${a.on?'checked':''} ${ed?'':'disabled'} aria-label="${esc(a.name)} açık"><span></span></label></div></div>`).join('')}</div>`;
  else body=table([['Zaman',r=>DT(r.ts)],['Otomasyon',r=>`<b>${esc(r.name)}</b>`],['Makine',r=>esc(mName(r.machine))],['Değer',r=>`<span class="num">${esc(r.value)}</span>`],['Önem',r=>`<span class="pill ${SEVC[r.sev]}">${r.sev}</span>`],['Alıcılar',r=>`<span class="small">${esc(roleList(r.roles))}<br><span class="muted">${esc(r.ch.join(', '))}</span></span>`],['Sonuç',r=>r.res?`<span class="chip c-info mono">${r.res}</span>`:'<span class="muted small">Bildirim</span>']],S.runs,'Henüz gerçekleşen otomasyon yok. “Üretimi canlandır” ile veri üretin.');
  return `<div class="head"><div><div class="crumb"><span>Takip</span></div><h1>Akıllı Otomasyonlar</h1><p>Koşulu kurarsınız; sistem durumu yakaladığında ilgili kişilere haber verir, gerekirse aksiyon, uygunsuzluk ya da bakım talebi açar.</p></div>${ed?'<button class="btn primary" data-act="modal" data-k="auto">Yeni otomasyon</button>':''}</div>${t.html}${body}`;
}

/* ---------- yönetim: ayarlar ---------- */
function viewSettings(){
  const t=tabs('ayarlar',[['users','Kullanıcılar ve yetkiler'],['mac','Makineler'],['prod','Ürünler'],['stop','Duruş nedenleri'],['err','Kamera hata kodları'],['rules','İş kuralları'],['shift','Vardiyalar'],['audit','Denetim izi']],'users');
  const R=S.rules,tg=(k,l)=>`<label class="toggle"><span>${l}</span><input type="checkbox" data-rule="${k}" ${R[k]?'checked':''}></label>`;
  let b='';
  if(t.cur==='users'){
    const rk=Object.keys(ROLES);
    b=`<div class="cols2"><section class="panel"><h2>Kullanıcılar</h2>${table([['Kullanıcı',u=>`<div style="display:flex;gap:10px;align-items:center">${avatar(u)}<b>${esc(u.name)}</b></div>`],['Rol',u=>esc(ROLES[u.role])]],USERS)}</section>
    <section class="panel"><h2>Rol bazlı yetkiler</h2><div class="tablewrap perm"><table style="min-width:760px"><thead><tr><th>Yetki</th>${rk.map(k=>`<th class="r" style="text-align:center">${ROLES[k]}</th>`).join('')}</tr></thead><tbody>
    ${PERM_ROWS.map(([k,l])=>`<tr><td>${l}</td>${rk.map(r=>`<td class="v">${CAN[k].includes(r)?'<span class="yes">✓</span>':'<span class="no">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="hint" style="margin:0">Prototipte yetkiler sabit. Canlı sistemde admin bu tablodan değiştirebilecek.</p></section></div>`;
  }
  if(t.cur==='mac')b=`<section class="panel"><h2>Makineler</h2>${table([['Kod',m=>`<span class="mono">${m.id}</span>`],['Makine adı',m=>`<input class="input" style="min-height:40px" data-mname="${m.id}" value="${esc(m.name)}" aria-label="${m.id} adı">`],['Kamera adresi',m=>`<input class="input mono" style="min-height:40px" data-mcam="${m.id}" value="${esc(m.camera||'')}" aria-label="${m.id} kamera adresi">`],['Periyodik bakım',m=>S.pm.filter(x=>x.machine===m.id).length+' iş'],['Durum',m=>PILL[m.status]]],S.machines)}
    <div class="defrow"><input class="input" id="new-machine" placeholder="Yeni makine adı, örn. Bitirme-6"><button class="btn" data-act="addm">Makine ekle</button></div></section>`;
  if(t.cur==='prod')b=`<section class="panel"><div class="panel-h"><h2>Ürünler <span class="muted small">${S.products.length}</span></h2><button class="btn primary sm" data-act="modal" data-k="prodNew">Yeni ürün</button></div>
    ${table([['Ürün kodu',p=>`<b class="mono">${esc(p.code)}</b>`],['Ürün',p=>esc(p.name)],['Müşteri',p=>esc(p.customer)],['Teknoloji',p=>`<span class="tech" style="--tc:${TECH[p.tech]||'var(--faint)'}">${esc(p.tech)}</span>`],['İyileştirme',p=>esc(p.enh)],['Koli başı',p=>`<span class="num">${N(p.perBox)}</span>`,'r']],S.products)}
    <p class="hint" style="margin:0">Ürün aileleri MCC IML ürün yelpazesinden alındı. Kodlar örnektir; firmanın gerçek kod listesiyle değiştirilecek.</p></section>`;
  if(t.cur==='stop')b=`<section class="panel"><h2>Duruş nedenleri</h2>${table([['Neden',r=>esc(r.n)],['Bakım talebi açar',(r)=>`<label class="switch"><input type="checkbox" data-smaint="${esc(r.n)}" ${r.maint?'checked':''} aria-label="${esc(r.n)} bakım talebi açar"><span></span></label>`],['',(r)=>`<button class="btn sm ghost" data-act="delr" data-n="${esc(r.n)}">Sil</button>`]],S.stopReasons)}
    <div class="defrow"><input class="input" id="new-reason" placeholder="Yeni duruş nedeni"><button class="btn" data-act="addr">Ekle</button></div></section>`;
  if(t.cur==='err')b=`<section class="panel"><h2>Kamera hata kodları</h2><div class="deflist">
      ${S.errorCodes.map((c,i)=>`<div class="defrow"><span class="mono muted" style="width:46px">${c.code}</span><input class="input" style="max-width:160px" data-elabel="${i}" value="${esc(c.label)}" aria-label="${c.code} adı"><input class="input" data-edesc="${i}" value="${esc(c.desc)}" aria-label="${c.code} açıklaması"></div>`).join('')}</div>
      <p class="hint" style="margin:0">Kodlar görüntü işleme sisteminden gelir. Ekranda görünen adı ve açıklamayı buradan değiştirebilirsiniz.</p></section>`;
  if(t.cur==='rules')b=`<div class="defs"><section class="panel"><h2>İş başlatma (koparma)</h2><div class="deflist">${tg('assigned','İş bu makineye atanmış olmalı')}${tg('first','İş, sıradaki ilk iş olmalı')}${tg('noOpen','Makinede açık başka iş olmamalı')}${tg('teyit','Teyit numarası girilmiş olmalı')}<label class="toggle"><span>Makinede açık arıza talebi olmamalı</span><input type="checkbox" checked disabled></label></div></section>
    <section class="panel"><h2>İş bitirme (paketleme)</h2><div class="deflist">${tg('reviewed','Bütün hatalı koliler incelenmiş olmalı')}${tg('minPctOn','Paketlenen adet sınırı')}
    <div class="defrow"><label for="minpct" style="flex:1">Sınır (sipariş adedinin yüzdesi)</label><input class="input num" style="width:110px" type="number" min="50" max="110" id="minpct" value="${R.minPct}"></div></div></section></div>`;
  if(t.cur==='shift')b=`<section class="panel"><h2>Vardiyalar</h2><div class="deflist">${S.shifts.map((s,i)=>`<div class="defrow"><input class="input" style="max-width:200px" data-shn="${i}" value="${esc(s.n)}" aria-label="Vardiya adı"><input class="input num" style="max-width:130px" type="time" data-shs="${i}" value="${s.s}" aria-label="Başlangıç"><span class="muted">–</span><input class="input num" style="max-width:130px" type="time" data-she="${i}" value="${s.e==='24:00'?'00:00':s.e}" aria-label="Bitiş"></div>`).join('')}</div></section>`;
  if(t.cur==='audit')b=table([['Zaman',a=>DT(a.ts)],['Kullanıcı',a=>esc(a.user)],['İşlem',a=>`<b>${esc(a.what)}</b>`],['Ayrıntı',a=>esc(a.detail)]],S.audit.slice(0,150));
  return `<div class="head"><div><div class="crumb"><span>Yönetim</span></div><h1>Ayarlar</h1><p>Değişiklikler hemen kaydedilir ve denetim izine yazılır.</p></div><button class="btn" data-act="reset">Örnek veriye dön</button></div>${t.html}${b}`;
}

/* ---------- pencereler ---------- */
const opts=(list,cur)=>list.map(x=>{const [v,l]=Array.isArray(x)?x:[x,x];return `<option value="${esc(v)}" ${String(v)===String(cur)?'selected':''}>${esc(l)}</option>`}).join('');
const checks=(name,list,cur)=>`<div class="checks">${list.map(([v,l])=>`<label><input type="checkbox" name="${name}" value="${esc(v)}" ${cur.includes(v)?'checked':''}> ${esc(l)}</label>`).join('')}</div>`;
const fld=(l,inner,hint)=>`<div class="field"><span class="lbl">${l}</span>${inner}${hint?`<span class="hint">${hint}</span>`:''}</div>`;
const roleOpts=Object.entries(ROLES);
const machOpts=()=>S.machines.map(m=>[m.id,m.name]);
function modalHtml(){
  const md=U.modal;let title='',body='',ok='Kaydet';
  if(md.k==='auto'){const a=md.id?S.autos.find(x=>x.id==md.id):{name:'',metric:'stopMin',op:'ge',th:10,sev:'Uyarı',roles:['lider'],ch:['Uygulama'],res:'none',owner:'lider',days:1,on:true};
    title=md.id?'Otomasyonu düzenle':'Yeni otomasyon';
    body=`${fld('Otomasyon adı',`<input class="input" id="a-name" value="${esc(a.name)}" placeholder="Örn. Uzun duruş">`)}
    <div class="label">Koşul</div><div class="grid3">${fld('Ölçüt',`<select class="input" id="a-metric">${opts(Object.entries(METRICS).map(([k,v])=>[k,v.n+' ('+v.u+')']),a.metric)}</select>`)}${fld('Koşul',`<select class="input" id="a-op">${opts(Object.entries(OPN),a.op)}</select>`)}${fld('Eşik',`<input class="input num" id="a-th" type="number" value="${a.th}">`)}</div>
    <span class="hint">Koşul her bitirme makinesi için ayrı kontrol edilir. Durum düzelip yeniden oluşunca otomasyon tekrar çalışır.</span>
    <div class="label">Bildirim</div>${fld('Kime haber verilsin?',checks('a-roles',roleOpts,a.roles))}${fld('Hangi kanaldan?',checks('a-ch',CHANNELS.map(c=>[c,c]),a.ch))}${fld('Önem',`<select class="input" id="a-sev">${opts(SEVS,a.sev)}</select>`)}
    <div class="label">Sonuç</div><div class="grid3">${fld('Ne yapılsın?',`<select class="input" id="a-res">${opts(Object.entries(RESULTS),a.res)}</select>`)}${fld('Sorumlu',`<select class="input" id="a-owner">${opts(roleOpts,a.owner)}</select>`)}${fld('Süre (gün)',`<input class="input num" id="a-days" type="number" min="1" max="30" value="${a.days}">`)}</div>
    ${md.id?`<button class="btn ghost sm danger" style="justify-self:start" data-act="autoDel" data-id="${a.id}">Otomasyonu sil</button>`:''}`;}
  if(md.k==='actNew'){title='Yeni aksiyon';body=`${fld('Başlık',`<input class="input" id="x-title" placeholder="Örn. Bitirme-3 birleştirme istasyonu düzeni">`)}<div class="grid3">${fld('Makine',`<select class="input" id="x-m"><option value="">Genel</option>${opts(machOpts(),'')}</select>`)}${fld('Sorumlu',`<select class="input" id="x-owner">${opts(roleOpts,'lider')}</select>`)}${fld('Süre (gün)',`<input class="input num" id="x-days" type="number" min="1" max="60" value="2">`)}</div>${fld('Açıklama',`<textarea class="input" id="x-note"></textarea>`)}`;ok='Aksiyonu aç'}
  if(md.k==='ncrNew'){title='Yeni uygunsuzluk';body=`<div class="grid2">${fld('Makine',`<select class="input" id="n-m">${opts(machOpts(),'B1')}</select>`)}${fld('Hata kodu',`<select class="input" id="n-code">${opts(S.errorCodes.map(c=>[c.code,c.label]),'CMIX')}</select>`)}</div>${fld('Etkilenen koli sayısı',`<input class="input num" id="n-boxes" type="number" min="0" value="1">`)}${fld('Açıklama',`<textarea class="input" id="n-desc" placeholder="Ne görüldü?"></textarea>`)}`;ok='Uygunsuzluk aç'}
  if(md.k==='ncrClose'){const n=S.ncrs.find(x=>x.id===md.id);title=n.id+' · Kapat';body=`<p class="muted" style="margin:0">${esc(n.desc)}</p>${fld('Karar',`<select class="input" id="n-dec">${opts(DECISIONS,n.decision||DECISIONS[1])}</select>`)}${fld('Kök neden',`<textarea class="input" id="n-root" placeholder="Hata neden oluştu? Örn. önceki işin etiketleri birleştirme istasyonunda kalmış.">${esc(n.root)}</textarea>`,'Kök neden yazılmadan uygunsuzluk kapatılamaz.')}`;ok='Kapat'}
  if(md.k==='btNew'){title='Arıza bildir';body=`<div class="grid2">${fld('Makine',`<select class="input" id="b-m">${opts(machOpts(),'B1')}</select>`)}${fld('Tür',`<select class="input" id="b-type">${opts(['Arıza','Kamera hatası','Elektrik','Diğer'],'Arıza')}</select>`)}</div>${fld('Açıklama',`<textarea class="input" id="b-desc" placeholder="Ne oldu?"></textarea>`)}`;ok='Talep aç'}
  if(md.k==='btDone'){const b=S.maint.find(x=>x.id===md.id);title=b.id+' · Tamamla';body=`<p class="muted" style="margin:0">${esc(mName(b.machine))} · ${esc(b.desc)}</p>${fld('Yapılan işlem',`<textarea class="input" id="b-note" placeholder="Örn. Kamera ağ kablosu yenilendi."></textarea>`,'Yapılan işlem yazılmadan talep tamamlanamaz.')}`;ok='Tamamla'}
  if(md.k==='prodNew'){title='Yeni ürün';body=`<div class="grid2">${fld('Ürün kodu',`<input class="input mono" id="p-code" placeholder="IM-DAI-50413">`)}${fld('Müşteri',`<input class="input" id="p-cust">`)}</div>${fld('Ürün adı',`<input class="input" id="p-name" placeholder="Yoğurt kabı 1 kg yan etiket">`)}<div class="grid3">${fld('Teknoloji',`<select class="input" id="p-tech">${opts(Object.keys(TECH),'Injection Molding IML')}</select>`)}${fld('İyileştirme',`<input class="input" id="p-enh" placeholder="UltraGloss">`)}${fld('Koli başı adet',`<input class="input num" id="p-box" type="number" min="1" value="2000">`)}</div>`;ok='Ürünü ekle'}
  return `<div class="scrim" data-act="closeScrim"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh"><h2>${esc(title)}</h2><button class="iconbtn" data-act="closeModal" aria-label="Kapat">✕</button></div>${body}${U.err?`<div class="err-line">${esc(U.err)}</div>`:''}<div class="mf"><button class="btn ghost" data-act="closeModal">Vazgeç</button><button class="btn primary" data-act="modalSave">${ok}</button></div></div></div>`;
}
const checked=name=>[...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i=>i.value);
function modalSave(){
  const md=U.modal,fail=m=>{U.err=m;render()};
  if(md.k==='auto'){const name=val('a-name'),th=parseFloat(val('a-th')),roles=checked('a-roles'),ch=checked('a-ch'),days=parseInt(val('a-days'),10);
    if(!name)return fail('Otomasyon adını yazın.');if(isNaN(th))return fail('Eşik bir sayı olmalı.');if(!roles.length)return fail('En az bir alıcı rol seçin.');if(!ch.length)return fail('En az bir kanal seçin.');if(!(days>=1&&days<=30))return fail('Süre 1–30 gün olmalı.');
    const o={name,metric:val('a-metric'),op:val('a-op'),th,sev:val('a-sev'),roles,ch,res:val('a-res'),owner:val('a-owner'),days};
    if(md.id){const a=S.autos.find(x=>x.id==md.id);Object.assign(a,o);S.machines.forEach(m=>delete S.autoState[a.id+':'+m.id]);audit('Otomasyon güncellendi',name);toast('Otomasyon kaydedildi')}
    else{const id=Math.max(0,...S.autos.map(a=>a.id))+1;S.autos.push(Object.assign({id,on:true},o));audit('Otomasyon eklendi',name);toast('Otomasyon eklendi')}}
  if(md.k==='actNew'){const t=val('x-title'),d=parseInt(val('x-days'),10);if(!t)return fail('Başlık yazın.');if(!(d>=1))return fail('Süre en az 1 gün olmalı.');
    const a={id:nextId('AK'),title:t,src:'Elle açıldı',machine:val('x-m')||null,owner:val('x-owner'),due:Date.now()+d*DAY,status:'Açık',created:Date.now(),note:val('x-note')};S.actions.unshift(a);notify('Yeni aksiyon: '+t,a.id+' size atandı',[a.owner]);audit('Aksiyon açıldı',a.id+' · '+t);toast(a.id+' açıldı')}
  if(md.k==='ncrNew'){const d=val('n-desc');if(!d)return fail('Açıklama yazın.');const m=M(val('n-m'));
    const n={id:nextId('UG'),machine:m.id,wo:m.current,code:val('n-code'),boxes:parseInt(val('n-boxes'),10)||0,desc:d,status:'Açık',decision:'',root:'',created:Date.now(),closed:null,src:'Elle açıldı'};S.ncrs.unshift(n);notify('Uygunsuzluk açıldı: '+n.id,m.name+' · '+d,['kalite','lider'],'Uyarı');audit('Uygunsuzluk açıldı',n.id);toast(n.id+' açıldı')}
  if(md.k==='ncrClose'){const r=val('n-root');if(r.length<5)return fail('Kök nedeni yazın.');const n=S.ncrs.find(x=>x.id===md.id);n.status='Kapatıldı';n.decision=val('n-dec');n.root=r;n.closed=Date.now();audit('Uygunsuzluk kapatıldı',n.id+' · '+n.decision);toast(n.id+' kapatıldı')}
  if(md.k==='btNew'){const d=val('b-desc');if(!d)return fail('Ne olduğunu yazın.');const b=openBT(val('b-m'),val('b-type'),d,'Elle bildirildi');toast(b.id+' açıldı, bakım ekibine haber verildi')}
  if(md.k==='btDone'){const n=val('b-note');if(n.length<3)return fail('Yapılan işlemi yazın.');const b=S.maint.find(x=>x.id===md.id);b.status='Tamamlandı';b.doneAt=Date.now();b.startedAt=b.startedAt||Date.now();b.note=n;notify(b.id+' tamamlandı',mName(b.machine)+' · '+n,['lider','koparma']);audit('Bakım talebi tamamlandı',b.id+' · '+n);toast(b.id+' tamamlandı')}
  if(md.k==='prodNew'){const c=val('p-code'),nm=val('p-name');if(!c||!nm)return fail('Ürün kodu ve adı zorunlu.');if(S.products.some(p=>p.code===c))return fail('Bu ürün kodu zaten var.');
    S.products.unshift({code:c,name:nm,customer:val('p-cust')||'—',tech:val('p-tech'),enh:val('p-enh')||'—',app:'—',perBox:parseInt(val('p-box'),10)||1000});audit('Ürün eklendi',c);toast('Ürün eklendi')}
  U.modal=null;U.err='';save();render();
}
function openBT(mid,type,desc,src){const b={id:nextId('BT'),machine:mid,type,desc,status:'Açık',created:Date.now(),startedAt:null,doneAt:null,note:'',src};S.maint.unshift(b);notify('Bakım talebi: '+b.id,mName(mid)+' · '+desc,['bakim','lider'],'Kritik');audit('Bakım talebi açıldı',b.id+' · '+mName(mid));return b}

/* ---------- işlemler ---------- */
function assign(woId,mid){
  const o=W(woId);if(!o||o.status==='calisiyor'||o.status==='bitti')return;
  S.machines.forEach(m=>{m.queue=m.queue.filter(x=>x!==woId)});
  if(mid==='pool'){o.status='havuz';o.machine=null;toast(o.id+' havuza alındı')}
  else{const m=M(mid);m.queue.push(woId);o.status='sirada';o.machine=mid;toast(o.id+' → '+m.name)}
  audit('İş ataması',o.id+' → '+(mid==='pool'?'Havuz':mName(mid)));save();render();
}
function simulate(){
  const r=Math.random;let n=0;
  S.machines.forEach(m=>{if(m.status!=='run'||!m.current)return;const wo=W(m.current),k=1+Math.floor(r()*3);
    for(let i=0;i<k;i++){if(produced(wo)>=wo.qty)break;
      const no='K'+wo.id.slice(3)+'-'+String(wo.boxes.length+1).padStart(3,'0');let res='OK',c=wo.perBox;const x=r();
      if(x<.06)res='CMIX';else if(x<.11)res='PMIX';else if(x<.16){res='QTY';c=wo.perBox-(8+Math.floor(r()*60))}
      wo.boxes.push({no,ts:Date.now()-(k-i-1)*20000,count:c,result:res,reviewed:false,decision:'',note:''});n++}});
  const f=runAuto(true);persist();render();
  toast(n?n+' yeni koli kamera kontrolünden geçti'+(f.length?' · '+f.length+' otomasyon çalıştı':''):'Çalışan makine yok. Önce bir işi başlatın.',!n);
}
function finish(m){
  const wo=W(m.current);wo.status='bitti';wo.finishedAt=Date.now();m.current=null;m.status='idle';m.idleSince=Date.now();m.stopReason=null;m.stopSince=null;
  audit('İş bitirildi',wo.id+' · '+m.name+' · %'+P1(pct(wo)));save();render();toast(wo.id+' bitti. '+m.name+' boşta.');
}
document.addEventListener('click',e=>{
  if(U.bell&&!e.target.closest('.bellw')){U.bell=false;render();return}
  const el=e.target.closest('[data-act]');if(!el)return;
  const a=el.dataset.act,m=el.dataset.m&&M(el.dataset.m);
  if(a==='closeScrim'&&e.target!==el)return;
  switch(a){
    case 'login':user=USERS.find(u=>u.id===el.dataset.id);persist();if(!location.hash)location.hash='prosesler';render();break;
    case 'logout':user=null;U.bell=false;persist();render();break;
    case 'reset':S=seed();runAuto(true);Object.assign(U,{teyit:{},sel:{},stopPick:{},onlyErr:{},review:null,tab:{},modal:null,bell:false,err:''});persist();render();toast('Örnek veri yüklendi');break;
    case 'soon':toast(el.dataset.name+' prosesi yakında eklenecek');break;
    case 'sim':simulate();break;
    case 'bell':U.bell=!U.bell;render();break;
    case 'readall':myNotifs().forEach(n=>n.read[user.id]=1);persist();render();break;
    case 'tab':U.tab[el.dataset.p]=el.dataset.v;render();break;
    case 'modal':U.modal={k:el.dataset.k,id:el.dataset.id};U.err='';render();break;
    case 'closeModal':case 'closeScrim':U.modal=null;U.err='';render();break;
    case 'modalSave':modalSave();break;
    case 'sel':U.sel[m.id]=el.dataset.id;render();break;
    case 'start':{const wo=W(el.dataset.id);if(!wo||!startRules(m,wo.id,U.teyit[m.id]).every(r=>r.ok))return;
      m.queue=m.queue.filter(x=>x!==wo.id);m.current=wo.id;m.status='run';wo.status='calisiyor';wo.startedAt=Date.now();wo.confirm=(U.teyit[m.id]||'').trim();
      U.teyit[m.id]='';U.sel[m.id]=null;audit('İş başlatıldı',wo.id+' · '+m.name+' · teyit '+wo.confirm);save();render();toast(wo.id+' başladı · '+m.name);break}
    case 'stoppick':U.stopPick[m.id]=true;render();break;
    case 'stopcancel':U.stopPick[m.id]=false;render();break;
    case 'stop':{const rs=S.stopReasons.find(x=>x.n===el.dataset.r);m.status='stop';m.stopReason=el.dataset.r;m.stopSince=Date.now();U.stopPick[m.id]=false;audit('Duruş',m.name+' · '+el.dataset.r);
      let msg=m.name+' durdu · '+el.dataset.r;if(rs&&rs.maint){const b=openBT(m.id,el.dataset.r,'Koparma makinesinde '+el.dataset.r+' nedeniyle duruş','Duruş kaydı');msg+=' · '+b.id+' açıldı'}
      save();render();toast(msg);break}
    case 'resume':m.status='run';m.stopReason=null;m.stopSince=null;audit('Duruş bitti',m.name);save();render();toast(m.name+' çalışmaya devam ediyor');break;
    case 'filter':U.onlyErr[m.id]=el.dataset.v==='1';render();break;
    case 'review':U.review=el.dataset.k;render();setTimeout(()=>{const i=$('#note-input');i&&i.focus()},0);break;
    case 'reviewcancel':U.review=null;render();break;
    case 'reviewed':{const [wid,no]=el.dataset.k.split('|'),wo=W(wid),b=wo.boxes.find(x=>x.no===no);b.reviewed=true;b.decision=val('dec-input');b.note=val('note-input');
      let msg=no+' incelendi';if(($('#ncr-input')||{}).checked){const n={id:nextId('UG'),machine:wo.machine,wo:wo.id,code:b.result,boxes:1,desc:no+' · '+codeLabel(b.result)+(b.note?' · '+b.note:''),status:'Açık',decision:'',root:'',created:Date.now(),closed:null,src:'Koli incelemesi'};S.ncrs.unshift(n);notify('Uygunsuzluk açıldı: '+n.id,n.desc,['kalite'],'Uyarı');msg+=' · '+n.id+' açıldı'}
      audit('Hatalı koli incelendi',no+' · '+b.decision);U.review=null;save();render();toast(msg);break}
    case 'finish':if(finishRules(W(m.current)).every(r=>r.ok))finish(m);break;
    case 'askapprove':W(m.current).approvalRequested=true;notify('Bitirme onayı bekleniyor',m.name+' · '+m.current+' sipariş adedinin altında',['lider'],'Uyarı');save();render();toast('Takım liderine onay isteği gönderildi');break;
    case 'approve':{const wo=W(m.current);wo.approved=true;audit('Eksik adetle bitirme onayı',wo.id);if(finishRules(wo).every(r=>r.ok))finish(m);break}
    case 'up':case 'down':{const o=W(el.dataset.id),mm=M(o.machine),i=mm.queue.indexOf(o.id),j=a==='up'?i-1:i+1;if(j<0||j>=mm.queue.length)return;[mm.queue[i],mm.queue[j]]=[mm.queue[j],mm.queue[i]];save();render();break}
    case 'unassign':assign(el.dataset.id,'pool');break;
    case 'ncrStart':{const n=S.ncrs.find(x=>x.id===el.dataset.id);n.status='İncelemede';audit('Uygunsuzluk incelemeye alındı',n.id);save();render();break}
    case 'btStart':{const b=S.maint.find(x=>x.id===el.dataset.id);b.status='Müdahalede';b.startedAt=Date.now();audit('Bakım müdahalesi başladı',b.id);save();render();toast(b.id+' müdahalede');break}
    case 'pmDone':{const t=S.pm.find(x=>x.id===el.dataset.id);t.last=Date.now();audit('Periyodik bakım yapıldı',mName(t.machine)+' · '+t.name);save();render();toast(t.name+' yapıldı');break}
    case 'actNext':{const x=S.actions.find(y=>y.id===el.dataset.id);x.status=x.status==='Açık'?'Devam ediyor':'Tamamlandı';audit('Aksiyon durumu',x.id+' → '+x.status);save();render();break}
    case 'autoDel':{const i=S.autos.findIndex(x=>x.id==el.dataset.id);audit('Otomasyon silindi',S.autos[i].name);S.autos.splice(i,1);U.modal=null;save();render();toast('Otomasyon silindi');break}
    case 'addm':{const v=val('new-machine');if(!v){toast('Makine adını yazın',true);return}let i=S.machines.length+1;while(M('B'+i))i++;S.machines.push({id:'B'+i,name:v,status:'idle',current:null,queue:[],stopReason:null,stopSince:null,idleSince:Date.now(),camera:''});audit('Makine eklendi',v);save();render();toast(v+' eklendi');break}
    case 'addr':{const v=val('new-reason');if(!v){toast('Duruş nedenini yazın',true);return}S.stopReasons.push({n:v,maint:false});audit('Duruş nedeni eklendi',v);save();render();toast('Duruş nedeni eklendi');break}
    case 'delr':S.stopReasons=S.stopReasons.filter(r=>r.n!==el.dataset.n);audit('Duruş nedeni silindi',el.dataset.n);save();render();break;
  }
});
document.addEventListener('input',e=>{const t=e.target;
  if(t.dataset.teyit){const m=M(t.dataset.teyit);U.teyit[m.id]=t.value;const sel=U.sel[m.id]&&m.queue.includes(U.sel[m.id])?U.sel[m.id]:m.queue[0];const box=$('#rules-'+m.id);if(box)box.innerHTML=startRulesBlock(m,sel)}});
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;
  if(d.assign&&t.value)assign(d.assign,t.value);
  else if(d.autoon){const a=S.autos.find(x=>x.id==d.autoon);a.on=t.checked;audit(a.on?'Otomasyon açıldı':'Otomasyon kapatıldı',a.name);save();render();toast(a.name+(a.on?' açıldı':' kapatıldı'))}
  else if(d.rule){S.rules[d.rule]=t.checked;audit('İş kuralı',d.rule+' → '+(t.checked?'açık':'kapalı'));persist();toast('Kural güncellendi')}
  else if(t.id==='minpct'){const v=Math.max(50,Math.min(110,+t.value||98));audit('Bitirme adet sınırı','%'+S.rules.minPct+' → %'+v);S.rules.minPct=v;t.value=v;persist();toast('Sınır %'+v+' oldu')}
  else if(d.mname){const v=t.value.trim();if(v){audit('Makine adı',M(d.mname).name+' → '+v);M(d.mname).name=v;persist();toast('Makine adı güncellendi')}}
  else if(d.mcam){M(d.mcam).camera=t.value.trim();audit('Kamera adresi',d.mcam+' → '+t.value.trim());persist();toast('Kamera adresi güncellendi')}
  else if(d.smaint){const r=S.stopReasons.find(x=>x.n===d.smaint);r.maint=t.checked;audit('Duruş nedeni',r.n+' bakım talebi '+(t.checked?'açar':'açmaz'));persist();toast('Güncellendi')}
  else if(d.elabel){S.errorCodes[+d.elabel].label=t.value.trim()||S.errorCodes[+d.elabel].code;audit('Hata kodu',S.errorCodes[+d.elabel].code+' → '+t.value.trim());persist();toast('Hata kodu güncellendi')}
  else if(d.edesc){S.errorCodes[+d.edesc].desc=t.value.trim();persist()}
  else if(d.shn){S.shifts[+d.shn].n=t.value.trim();persist()}
  else if(d.shs){S.shifts[+d.shs].s=t.value;audit('Vardiya',S.shifts[+d.shs].n+' başlangıç '+t.value);persist();toast('Vardiya güncellendi')}
  else if(d.she){S.shifts[+d.she].e=t.value;audit('Vardiya',S.shifts[+d.she].n+' bitiş '+t.value);persist();toast('Vardiya güncellendi')}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&(U.modal||U.bell)){U.modal=null;U.bell=false;render()}
  if(e.key==='Enter'&&e.target.id==='note-input'){const b=document.querySelector('[data-act="reviewed"]');b&&b.click()}});
function bindDnD(){
  document.querySelectorAll('[data-drag]').forEach(el=>el.addEventListener('dragstart',ev=>{ev.dataTransfer.setData('text/plain',el.dataset.drag);ev.dataTransfer.effectAllowed='move'}));
  document.querySelectorAll('[data-drop]').forEach(z=>{
    z.addEventListener('dragover',ev=>{ev.preventDefault();z.classList.add('drag')});
    z.addEventListener('dragleave',ev=>{if(!z.contains(ev.relatedTarget))z.classList.remove('drag')});
    z.addEventListener('drop',ev=>{ev.preventDefault();z.classList.remove('drag');const id=ev.dataTransfer.getData('text/plain');if(id)assign(id,z.dataset.drop)})});
}
function tick(){
  const c=$('#clock');if(c)c.textContent=new Intl.DateTimeFormat('tr-TR',{timeZone:TZ,weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}).format(Date.now());
  document.querySelectorAll('[data-since]').forEach(el=>el.textContent=dur(mins(+el.dataset.since)));
}
setInterval(()=>{tick();if(S&&user){const f=runAuto();if(f.length)persist()}},15000);
window.addEventListener('hashchange',()=>{U.review=null;U.bell=false;render();window.scrollTo(0,0)});
load();render();
})();
