/* ====================================================================
   NAVIGATION / SETTINGS / STATS
==================================================================== */
function openScreen(id){['menu','rules','other','settings','credits','stats','gameover'].forEach(s=>document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');}
function showMenu(){tourActive=false;document.getElementById('tour').classList.add('hidden');openScreen('menu');document.getElementById('hud').classList.add('hidden');document.body.classList.remove('playing');
  document.getElementById('tagline').textContent=phr("tag");sawTargetY=7;setTV('WAIT');
  resetScore();                                    // leaving to menu resets the running score
  document.getElementById('menuBlack').style.opacity='0';document.getElementById('menuBg').style.opacity='1';
  document.getElementById('tagline').style.opacity='1';document.getElementById('menuItems').style.opacity='1';}
function loadScore(){try{const s=JSON.parse(localStorage.getItem('to_score'));if(s)return s;}catch(e){}return {you:0,bot:0};}
function saveScore(s){localStorage.setItem('to_score',JSON.stringify(s));}
function resetScore(){saveScore({you:0,bot:0});}
function switchTab(tab){document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.getElementById('setGraphics').classList.toggle('hidden',tab!=='graphics');
  document.getElementById('setAudio').classList.toggle('hidden',tab!=='audio');
  document.getElementById('setLang').classList.toggle('hidden',tab!=='lang');}
function populateSettings(){
  document.querySelectorAll('#gfxOpt span').forEach(s=>s.classList.toggle('sel',s.dataset.v===settings.graphics));
  document.querySelectorAll('#langOpt span').forEach(s=>s.classList.toggle('sel',s.dataset.v===settings.lang));
  document.getElementById('volSlider').value=settings.volume;
}
function showSettings(){openScreen('settings');populateSettings();switchTab('graphics');}
function showStats(){openScreen('stats');
  document.getElementById('stNickInput').value=profile.nick;document.getElementById('stReg').textContent=profile.reg;
  document.getElementById('stGames').textContent=profile.games;document.getElementById('stWins').textContent=profile.wins;
  document.getElementById('stLoss').textContent=profile.losses;}

/* ====================================================================
   BOOT
==================================================================== */
function runBoot(){
  document.getElementById('menuBg').style.backgroundImage="url('"+ASSET_MENU+"')";
  document.getElementById('otherBg').style.backgroundImage="url('"+ASSET_OTHER+"')";
  ['setBg1','setBg2','setBg3'].forEach(id=>document.getElementById(id).style.backgroundImage="url('"+ASSET_SET+"')");
  const w=document.getElementById('bWelcome'),d=document.getElementById('bDisc'),l=document.getElementById('bLoad');
  setTimeout(()=>w.classList.add('show'),200);
  setTimeout(()=>w.classList.remove('show'),2000);
  setTimeout(()=>d.classList.add('show'),2600);
  setTimeout(()=>d.classList.remove('show'),5400);
  setTimeout(()=>l.classList.add('show'),6000);
  setTimeout(()=>l.classList.remove('show'),7700);
  setTimeout(()=>{document.getElementById('boot').classList.add('hidden');revealMenu();},8100);
}
function logoTrail(){
  const el=document.getElementById('logoImg');let n=0;
  const iv=setInterval(()=>{
    const r=el.getBoundingClientRect();
    const g=document.createElement('img');g.src=el.src;
    g.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;pointer-events:none;z-index:59;opacity:.45;filter:drop-shadow(0 0 8px rgba(255,255,255,.18));transition:opacity .5s';
    document.body.appendChild(g);requestAnimationFrame(()=>g.style.opacity='0');
    setTimeout(()=>g.remove(),520);
    if(++n>22)clearInterval(iv);
  },50);
  setTimeout(()=>clearInterval(iv),1250);
}
function revealMenu(){
  const menu=document.getElementById('menu'),bg=document.getElementById('menuBg'),blk=document.getElementById('menuBlack'),
        wrap=document.getElementById('logoWrap'),tag=document.getElementById('tagline'),items=document.getElementById('menuItems');
  menu.classList.remove('hidden');tag.textContent=phr("tag");
  blk.style.opacity='1';
  bg.style.transition='none';bg.style.opacity='1';            // menu bg fully opaque BENEATH the black, so the 3D scene never shows through
  wrap.style.transition='none';wrap.classList.remove('center');wrap.classList.add('offleft');  // start off the left edge
  requestAnimationFrame(()=>{
    bg.style.transition='opacity 1.2s';wrap.style.transition='';
    wrap.classList.remove('offleft');wrap.classList.add('center');logoTrail();                 // slide in from left -> center (with trail)
  });
  setTimeout(()=>{wrap.classList.remove('center');logoTrail();},1900);                          // center -> upper-left corner (with trail)
  setTimeout(()=>{tag.style.opacity='1';items.style.opacity='1';},2900);
  setTimeout(()=>{blk.style.opacity='0';},3100);                                                // reveal menu bg (already opaque underneath)
}

/* ====================================================================
   WIRE
==================================================================== */
function wire(){
  document.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{
    const g=el.dataset.go;
    if(g==='play')startMatch();
    else if(g==='tutorial')startTutorial();
    else if(g==='rules'){rulePage=0;renderRule();openScreen('rules');}
    else if(g==='other')openScreen('other');
  });
  document.getElementById('tourNext').onclick=tourNext;
  document.getElementById('tourPrev').onclick=tourPrev;
  document.getElementById('ruleNext').onclick=()=>{if(rulePage<RULE_PAGES.length-1){rulePage++;renderRule();}else showMenu();};
  document.getElementById('ruleBack').onclick=showMenu;
  document.getElementById('tSettings').onclick=showSettings;
  document.getElementById('tCredits').onclick=()=>openScreen('credits');
  document.getElementById('tStats').onclick=showStats;
  document.getElementById('otherReturn').onclick=showMenu;
  document.getElementById('setReturn').onclick=()=>openScreen('other');
  document.getElementById('credReturn').onclick=()=>openScreen('other');
  document.getElementById('statReturn').onclick=()=>openScreen('other');
  document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>switchTab(t.dataset.tab));
  document.querySelectorAll('#gfxOpt span').forEach(s=>s.onclick=()=>{settings.graphics=s.dataset.v;populateSettings();});
  document.querySelectorAll('#langOpt span').forEach(s=>s.onclick=()=>{settings.lang=s.dataset.v;populateSettings();applyI18n();
    if(!document.getElementById('rules').classList.contains('hidden'))renderRule();
    if(tourActive)renderTour();
    if(!document.getElementById('trumpTray').classList.contains('hidden'))openTray();
    setTV(lastTV.kind,lastTV.num);});
  document.getElementById('volSlider').oninput=e=>{settings.volume=+e.target.value;};
  document.getElementById('applyBtn').onclick=()=>{saveSettings();setGfx(settings.graphics);applyI18n();toast(settings.lang==='ru'?'Сохранено':'Saved','good');};
  document.getElementById('renameBtn').onclick=()=>{const v=document.getElementById('stNickInput').value.trim();if(v){profile.nick=v.slice(0,16);saveProfile();toast(settings.lang==='ru'?'Никнейм сохранён':'Nickname saved','good');}};
  document.getElementById('goAgain').onclick=startMatch;
  document.getElementById('goMenu').onclick=showMenu;
}

/* ====================================================================
   INIT
==================================================================== */
initScene();
(function(){const img=document.getElementById('logoImg');const wrap=document.createElement('div');wrap.id='logoWrap';img.parentNode.insertBefore(wrap,img);wrap.appendChild(img);})();
backTex=cardBack();hushTex=cardBack('H');okTex=overkillCardTex();
resetScore();
applyI18n();wire();runBoot();
