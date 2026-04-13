const $ = id => document.getElementById(id);

// Clock
(function tick(){const n=new Date();$('clockEl').textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');setTimeout(tick,10000);})();

// Toast
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}

// Screens
const screens={home:$('homeScreen'),explore:$('exploreScreen'),messages:$('messagesScreen'),profile:$('profileScreen'),notif:$('notifScreen'),spaceDetail:$('spaceDetailScreen')};
let cur='home',spaceFrom='home';
function go(name){if(name===cur)return;const c=screens[cur];if(c)c.classList.remove('active');const n=screens[name];if(n){n.classList.add('active');n.scrollTop=0;}cur=name;document.querySelectorAll('.nav-item[data-nav]').forEach(el=>el.classList.toggle('active',el.dataset.nav===name));}

// Nav
document.querySelectorAll('.nav-item[data-nav]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.nav)));
document.querySelectorAll('.back-btn[data-back]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.back)));
$('spaceBackBtn').addEventListener('click',()=>go(spaceFrom));

// Modals
function openM(id){$(id).classList.add('open');}
function closeM(id){$(id).classList.remove('open');}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));

// Get Started
$('getStartedBtn').addEventListener('click',()=>openM('modalGetStarted'));
$('closeGetStarted').addEventListener('click',()=>closeM('modalGetStarted'));
$('signupBtn').addEventListener('click',()=>{const n=$('signupName').value.trim();if(!n){toast('Please enter your name');return;}closeM('modalGetStarted');toast('Welcome, '+n+'! 🚀');$('profileName').textContent=n;$('profileAvatar').textContent=n.slice(0,2).toUpperCase();});

// Watch Intro
$('watchIntroBtn').addEventListener('click',()=>openM('modalWatchIntro'));
$('videoPlayBtn').addEventListener('click',()=>{$('videoPlayBtn').innerHTML='⏸';toast('▶ Playing TellasShare intro…');setTimeout(()=>{$('videoPlayBtn').innerHTML='<svg viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg>';},2500);});
$('closeWatchIntro').addEventListener('click',()=>{closeM('modalWatchIntro');openM('modalGetStarted');});

// Notifications
$('notifBtn').addEventListener('click',()=>{go('notif');$('notifDot').style.display='none';});
$('headerProfileBtn').addEventListener('click',()=>go('profile'));

// See all
$('seeAllBtn').addEventListener('click',()=>go('explore'));
$('viewAllBtn').addEventListener('click',()=>go('explore'));

// FAB
let fabOpen=false;
const fabBtn=$('fabBtn'),fabMenu=$('fabMenu');
fabBtn.addEventListener('click',()=>{fabOpen=!fabOpen;fabMenu.classList.toggle('open',fabOpen);fabBtn.classList.toggle('open',fabOpen);});
$('phone').addEventListener('click',e=>{if(fabOpen&&!fabBtn.contains(e.target)&&!fabMenu.contains(e.target)){fabOpen=false;fabMenu.classList.remove('open');fabBtn.classList.remove('open');}});
function closeFab(){fabOpen=false;fabMenu.classList.remove('open');fabBtn.classList.remove('open');}
$('fabShare').addEventListener('click',()=>{closeFab();openM('modalShare');});
$('fabCreate').addEventListener('click',()=>{closeFab();openM('modalCreate');});
$('fabInvite').addEventListener('click',()=>{closeFab();openM('modalInvite');});
$('sharePostBtn').addEventListener('click',()=>{closeM('modalShare');toast('Posted to your spaces! 🌌');});
$('closeShare').addEventListener('click',()=>closeM('modalShare'));
$('createSpaceBtn').addEventListener('click',()=>{closeM('modalCreate');toast('Space created! ✨');});
$('closeCreate').addEventListener('click',()=>closeM('modalCreate'));
$('sendInviteBtn').addEventListener('click',()=>{closeM('modalInvite');toast('Invite sent! 👥');});
$('closeInvite').addEventListener('click',()=>closeM('modalInvite'));

// Space data
const SD={
  nova:{name:'Nova Studio',icon:'🚀',badge:'live',members:'3,218',bg:'linear-gradient(135deg,#1e1040,#3b0f6e)',desc:'A creative hub for builders, artists, and space enthusiasts. Share your work, collaborate on projects, and explore new frontiers.',posts:[{av:'AK',cl:'av-ak',name:'Aria Kim',action:'Shared a constellation map',time:'2m'},{av:'CC',cl:'av-cc',name:'Cosmos_C',action:'Posted new artwork',time:'15m'},{av:'LV',cl:'av-lv',name:'Luna Vex',action:'Live session starting soon',time:'1h'}]},
  deep:{name:'Deep Space',icon:'🌌',badge:'new',members:'1,412',bg:'linear-gradient(135deg,#0a2018,#0f3d25)',desc:'Dive into the mysteries of the cosmos. Science, speculation, and wonder — all welcome here.',posts:[{av:'OT',cl:'av-ot',name:'Orion T.',action:'Joined Deep Space',time:'5m'},{av:'SG',cl:'av-sg',name:'StarGazer',action:'Shared a nebula photo',time:'30m'},{av:'DV',cl:'av-dv',name:'Dr. Vela',action:'Posted new research',time:'2h'}]},
  pulse:{name:'Pulse',icon:'⚡',badge:'new',members:'890',bg:'linear-gradient(135deg,#1e1040,#3b0f6e)',desc:'Real-time news, trends, and conversations at the speed of light. Stay ahead of everything.',posts:[{av:'AK',cl:'av-ak',name:'QuickNote',action:'Breaking: 5 new updates',time:'1m'},{av:'OT',cl:'av-ot',name:'Trend_X',action:'Posted trending thread',time:'20m'},{av:'LV',cl:'av-lv',name:'Flash',action:'Live updates happening',time:'45m'}]},
};
const joined={};

function openSpace(id,from){
  const d=SD[id]||SD.nova;spaceFrom=from||'home';
  $('sdTitle').textContent=d.name;$('sdName').textContent=d.name;
  $('sdBanner').style.background=d.bg;$('sdBanner').innerHTML='<span style="font-size:52px">'+d.icon+'</span>';
  $('sdMeta').innerHTML='<span>👥 '+d.members+' members</span><span>'+(d.badge==='live'?'🟢 Live now':'✨ New')+'</span>';
  $('sdDesc').textContent=d.desc;
  $('sdPosts').innerHTML=d.posts.map(p=>'<div class="activity-item"><div class="avatar '+p.cl+'">'+p.av+'</div><div class="activity-info"><div class="activity-name">'+p.name+'</div><div class="activity-action">'+p.action+'</div></div><div class="activity-time">'+p.time+'</div></div>').join('');
  const btn=$('joinBtn');
  if(joined[id]){btn.textContent='✓ Joined';btn.style.opacity='0.7';}else{btn.textContent='Join Space';btn.style.opacity='1';}
  go('spaceDetail');
}

document.querySelectorAll('[data-space]').forEach(el=>el.addEventListener('click',()=>openSpace(el.dataset.space,cur)));

$('joinBtn').addEventListener('click',function(){
  const id=Object.keys(SD).find(k=>SD[k].name===$('sdName').textContent)||'nova';
  if(!joined[id]){joined[id]=true;this.textContent='✓ Joined';this.style.opacity='0.7';toast('Joined '+SD[id].name+'! 🎉');}
  else toast('You\'re already a member!');
});

// Activity rows
document.querySelectorAll('.activity-item[data-user]').forEach(el=>el.addEventListener('click',()=>toast('Viewing '+el.dataset.user+'\'s profile')));

// Messages
document.querySelectorAll('.msg-item[data-msg]').forEach(el=>el.addEventListener('click',()=>{const b=el.querySelector('.msg-badge');if(b)b.remove();toast('Opening chat with '+el.dataset.msg);}));

// Profile
$('editProfileBtn').addEventListener('click',()=>openM('modalEditProfile'));
$('saveProfileBtn').addEventListener('click',()=>{const n=$('editName').value.trim();if(n){$('profileName').textContent=n;$('profileAvatar').textContent=n.slice(0,2).toUpperCase();}closeM('modalEditProfile');toast('Profile updated! ✅');});
$('closeEditProfile').addEventListener('click',()=>closeM('modalEditProfile'));
$('mySpacesBtn').addEventListener('click',()=>go('explore'));
$('savedBtn').addEventListener('click',()=>toast('Saved posts coming soon!'));
$('settingsBtn').addEventListener('click',()=>toast('Settings coming soon!'));
$('signOutBtn').addEventListener('click',()=>{toast('Signed out. See you soon! 👋');setTimeout(()=>go('home'),900);});
