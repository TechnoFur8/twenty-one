/* ===== FINAL DEATH SEQUENCE (last round only) ===== */
function playEnding(w){
  G.phase='ending';enableActions(false);closeTray();clearTurnTimer();hideBanner();
  const loser = w==='player'?'bot':w==='bot'?'player':null;
  const pdeath = loser==='player';
  const dark=document.getElementById('deathDark');
  sawSpin=0.1;bladeYaw=Math.PI/2;     // stays sideways during the kill
  if(loser==='player'){sawTargetZ=PLAYER_Z+0.45;sawTargetY=1.3;}
  else if(loser==='bot'){sawTargetZ=BOT_Z+0.15;sawTargetY=1.5;}
  let tt=0;const maxCam=pdeath?0.04:0.022;
  const seq=setInterval(()=>{tt+=0.1;camShake=Math.min(maxCam,camShake+(pdeath?0.0012:0.0014));dark.style.opacity=Math.min(0.45,tt/(pdeath?4.6:3.6));},100);
  let dodge=null;
  if(loser==='bot'&&oppFigure){let p=0;dodge=setInterval(()=>{p+=1;
    const raise=Math.min(1.45,p*0.05);                       // arms swing up/back, away from the saw
    if(oppArms[0])oppArms[0].rotation.x=-raise+Math.sin(p*1.6)*0.12;
    if(oppArms[1])oppArms[1].rotation.x=-raise+Math.sin(p*1.6+1)*0.12;
    oppFigure.rotation.x=-Math.min(0.22,p*0.008);            // lean torso back
    if(oppHead)oppHead.rotation.x=-Math.min(0.32,p*0.012)+Math.sin(p*2.2)*0.05;  // head back + tremble
    oppFigure.position.x=Math.sin(p*2.4)*0.05;               // small flinch
  },60);}
  const approach = pdeath?4400:3000;                          // player death lingers longer
  setTimeout(()=>{
    clearInterval(seq);if(dodge)clearInterval(dodge);
    if(oppFigure)oppFigure.position.x=0;
    camShake=pdeath?0.055:0.032;
    if(loser==='player'){sawTargetY=0.7;confettiBurst();}
    else if(loser==='bot'){sawTargetZ=BOT_Z;sawTargetY=1.55;confettiBurst();}
    const hold = pdeath?2600:1600;
    setTimeout(()=>{
      camShake=0;
      if(oppArms[0])oppArms[0].rotation.x=0;if(oppArms[1])oppArms[1].rotation.x=0;
      if(oppHead)oppHead.rotation.set(0,0,0);if(oppFigure)oppFigure.rotation.set(0,0,0);
      endingFlash(w);
    },hold);
  },approach);
}
function endingFlash(w){
  if(w==='player')profile.wins++;else if(w==='bot')profile.losses++;saveProfile();
  const f=document.getElementById('flash'),blood=document.getElementById('blood'),dark=document.getElementById('deathDark');
  blood.classList.remove('show');dark.style.opacity='0';
  confettiBurst();                                   // celebrate either way
  f.style.transition='opacity .5s';f.style.background='#fff7e0';f.style.backgroundImage='';
  f.classList.add('show');
  setTimeout(()=>{f.classList.remove('show');},500);
  setTimeout(()=>{gameOver(w);},1100);
}
/* ====================================================================
   HUD
==================================================================== */
function renderHUD(){
  if(!G) return;
  const yt=total(G.player), el=document.getElementById('youTotal');
  el.textContent=yt+'/'+G.target;
  el.classList.toggle('bust',yt>G.target);
  el.classList.toggle('win',yt===G.target);
  document.getElementById('oppTotal').textContent=(hasHidden(G.bot)?'?+':'')+visibleTotal(G.bot)+'/'+G.target;
  if(counterMesh){counterMesh.material.map.dispose();counterMesh.material.map=counterTex(G.bet,G.bot.dist,G.player.dist);counterMesh.material.needsUpdate=true;}
}
function enableActions(on){
  document.getElementById('aDraw').classList.toggle('disabled',!on);
  document.getElementById('aPass').classList.toggle('disabled',!on);
  document.getElementById('aTrump').classList.toggle('disabled',!on);
}
function openTray(){
  if(!G||(!tourActive&&(G.turn!=='player'||G.phase!=='play')))return;
  const tr=document.getElementById('trumpTray');tr.classList.remove('hidden');
  tr.querySelectorAll('.trump').forEach(e=>e.remove());
  if(!G.player.trumps.length){const e=document.createElement('div');e.className='trump disabled';e.innerHTML='<div class="tt"><div class="tname">'+(settings.lang==='ru'?'Нет козырей':'No trumps')+'</div></div>';tr.appendChild(e);return;}
  G.player.trumps.forEach((k,idx)=>{const T=TRUMPS[k],ok=trumpUsable(k,G.player,G.bot);
    const d=document.createElement('div');d.className='trump'+(ok?'':' disabled');
    d.innerHTML='<div class="tic">'+T.ic+'</div><div class="tt"><div class="tname">'+tn(k)+'</div><div class="tdesc">'+td(k)+'</div></div>';
    if(ok&&!tourActive)d.onclick=()=>useTrump(idx);tr.appendChild(d);});
}
function closeTray(){document.getElementById('trumpTray').classList.add('hidden');}
function useTrump(idx){const k=G.player.trumps[idx];if(!k)return;
  G.player.trumps.splice(idx,1);applyTrump(k,G.player,G.bot);G.consec=0;
  toast('\u2605 '+L('you used','вы использовали козырь')+' "'+tn(k)+'"','good');renderHUD();renderCards3D();closeTray();openTray();}
let toastList=[];
function toast(m,k){if(!m)return;const log=document.getElementById('log');const el=document.createElement('div');
  el.className='toast '+(k||'');el.innerHTML=m;log.appendChild(el);toastList.push(el);
  if(toastList.length>4)toastList.shift().remove();
  setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),400);},3800);}
function showBanner(txt,cls){const b=document.getElementById('banner');b.textContent=txt;b.className='show '+(cls||'');}
function hideBanner(){document.getElementById('banner').className='';}
function gameOver(winner){
  G.phase='over';profile.games++;saveProfile();
  const score=loadScore();
  if(winner==='player')score.you++;else if(winner==='bot')score.bot++;
  saveScore(score);
  document.body.classList.remove('playing');document.getElementById('hud').classList.add('hidden');
  document.getElementById('gameover').classList.remove('hidden');
  const youWon=winner==='player';
  document.getElementById('goYouName').textContent=profile.nick;
  document.getElementById('goYouAv').firstChild.textContent=score.you;
  document.getElementById('goBotAv').firstChild.textContent=score.bot;
  document.getElementById('goYouAv').classList.toggle('dead',!youWon&&winner!=='draw');
  document.getElementById('goBotAv').classList.toggle('dead',youWon);
  setTV(youWon?'WIN':'LOSER');
}

/* ====================================================================
   INPUT : mouse-look + double-click draw/pass + cursor confirm label
==================================================================== */
let confirmMode=null,confirmT=null;
function setConfirm(m){confirmMode=m;const c=document.getElementById('confirm');c.textContent=m+'?';c.classList.add('show');
  clearTimeout(confirmT);confirmT=setTimeout(()=>{c.classList.remove('show');confirmMode=null;},1400);}
function clearConfirm(){const c=document.getElementById('confirm');c.classList.remove('show');confirmMode=null;clearTimeout(confirmT);}
addEventListener('mousemove',e=>{
  const c=document.getElementById('confirm');c.style.left=(e.clientX+18)+'px';c.style.top=(e.clientY-14)+'px';
  if(tourActive)return;
  if(!document.body.classList.contains('playing'))return;
  const cx=innerWidth/2,cy=innerHeight/2,sens=settings.sens||2.0;
  const maxYaw=0.55*(sens/2),maxPitch=0.30*(sens/2);
  mYaw=((e.clientX-cx)/cx)*maxYaw;
  mPitch=Math.max(-0.42,Math.min(0.34,-((e.clientY-cy)/cy)*maxPitch));
});
addEventListener('mousedown',e=>{
  if(!G||G.phase!=='play'||G.turn!=='player')return;
  if(document.getElementById('trumpTray').contains(e.target))return;
  if(e.target.closest('#actions'))return;
  if(e.button===0){ if(confirmMode==='draw'){clearConfirm();playerDraw();} else setConfirm('draw'); }
  else if(e.button===2){ e.preventDefault(); if(confirmMode==='pass'){clearConfirm();playerPass();} else setConfirm('pass'); }
});
addEventListener('contextmenu',e=>{ if(document.body.classList.contains('playing'))e.preventDefault(); });
addEventListener('keydown',e=>{
  if(tourActive){
    if(e.key==='Enter'||e.key==='ArrowRight'){e.preventDefault();tourNext();}
    else if(e.key==='ArrowLeft'){e.preventDefault();tourPrev();}
    else if(e.key==='Escape'){endTour('menu');}
    return;
  }
  if(G&&G.phase==='play'&&G.turn==='player'){
    const k=e.key.toLowerCase();
    if(k==='l')playerDraw();
    else if(k==='m')playerPass();
    else if(e.key===' '){e.preventDefault();const tr=document.getElementById('trumpTray');tr.classList.contains('hidden')?openTray():closeTray();}
  }
  if(e.key==='Escape')closeTray();
});

/* ====================================================================
   WAKE-UP INTRO + MATCH START
==================================================================== */
function startMatch(){
  tourActive=false;document.getElementById('tour').classList.add('hidden');
  ['menu','rules','other','settings','credits','stats','gameover'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.getElementById('hud').classList.add('hidden');closeTray();
  document.body.classList.add('playing');
  newGame();G.phase='intro';setTV('WAIT');
  // clean table: remove any leftover cards / placed trumps / blood from a previous game
  ['you','opp','youT','oppT'].forEach(k=>clearGroup(k));
  decals.forEach(d=>scene.remove(d));decals=[];
  document.getElementById('blood').classList.remove('show');
  document.getElementById('deathDark').style.opacity='0';
  if(oppFigure){oppFigure.position.set(0,-0.05,-4.2);oppFigure.rotation.set(0,0,0);oppFigure.scale.setScalar(0.8);}
  if(oppArms[0]){oppArms[0].rotation.x=0;}if(oppArms[1]){oppArms[1].rotation.x=0;}
  if(oppHead)oppHead.rotation.set(1.0,0,0);          // opponent starts with head down on the table
  camShake=0;shakeAmt=0;
  sawTargetY=7;bladeYaw=0;sawSpin=0.06;sawTargetZ=-1.4;sawLeanZ=0;          // faces us with the spikes the whole time
  if(sawBlade)sawBlade.rotation.y=0;
  camTarPos.set(0,0.5,0.9);camPos.set(0,0.5,0.9);introPitch=-0.95;mYaw=0;mPitch=0;
  const lids=document.getElementById('lids'),top=document.getElementById('lidTop'),bot=document.getElementById('lidBot');
  lids.classList.remove('hidden');top.style.transition='none';bot.style.transition='none';top.style.height='50%';bot.style.height='50%';
  const wd=document.getElementById('wakeDark');wd.style.transition='none';wd.style.opacity='1';   // everything dark
  requestAnimationFrame(()=>{top.style.transition='height .45s';bot.style.transition='height .45s';wd.style.transition='opacity 1.8s';});
  subtitle(phr("wake"),3000);
  // blink twice
  setTimeout(()=>{top.style.height='10%';bot.style.height='10%';},500);    // crack open
  setTimeout(()=>{top.style.height='42%';bot.style.height='42%';},1000);   // blink 1 close
  setTimeout(()=>{top.style.height='8%';bot.style.height='8%';},1450);     // open
  setTimeout(()=>{top.style.height='36%';bot.style.height='36%';},1850);   // blink 2 close
  setTimeout(()=>{top.style.height='0%';bot.style.height='0%';wd.style.opacity='0';},2300);  // full open + smooth brighten
  // raise own head + opponent lifts head, together
  setTimeout(()=>{tweenIntro();tweenOppWake();},2150);
  // saw sequence: descend facing us, scratch low, rise, then turn sideways for the game
  setTimeout(()=>{sawTargetY=1.55;sawSpin=0.07;},4100);                       // descends facing us, spinning
  setTimeout(()=>{sawTargetY=1.2;sawLeanZ=0;shakeAmt=0.02;spawnSparks(0,TABLE_Y+0.05,-1.4);spawnSparks(0.35,TABLE_Y+0.05,-1.4);spawnSparks(-0.3,TABLE_Y+0.05,-1.4);},5200);  // drop low: bottom spikes scratch the table
  setTimeout(()=>{sawTargetY=SAW_PLAY_Y;sawLeanZ=0;shakeAmt=0;sawSpin=0.02;sawTargetZ=sawZForDistances();},6100);  // rises back up
  setTimeout(()=>{bladeYaw=Math.PI/2;sawSpin=0;},6900);                       // turns sideways and stops
  setTimeout(()=>{lids.classList.add('hidden');document.getElementById('hud').classList.remove('hidden');startRound();},7600);
}
function tweenOppWake(){
  if(!oppHead)return;const t0=performance.now(),dur=1700,p0=oppHead.rotation.x;
  (function step(){const k=Math.min(1,(performance.now()-t0)/dur),e=k*k*(3-2*k);
    oppHead.rotation.x=p0+(0-p0)*e;if(k<1)requestAnimationFrame(step);})();
}
function tweenIntro(){
  const t0=performance.now(),dur=1700,p0=introPitch;camTarPos.set(0,1.3,2.5);
  (function step(){const k=Math.min(1,(performance.now()-t0)/dur),e=k*k*(3-2*k);
    introPitch=p0+(basePitch-p0)*e;if(k<1)requestAnimationFrame(step);else introPitch=null;})();
}

/* ====================================================================
   RULES
==================================================================== */
const RULE_PAGES=[
 {h:'What is TWENTY ONE?',p:"- The goal is to score 21 points by drawing numbered cards.\n\n[How to win?]\n- Score closest to 21 without going over.\n- If both bust, the closer score wins.\n- Equal score is a draw.",v:'winlose',
  hRu:'Что такое TWENTY ONE?',pRu:"- Цель — набрать 21 очко, беря карты.\n\n[Как победить?]\n- Набрать ближе всего к 21, не превысив.\n- Если оба перебрали — ближе к 21 побеждает.\n- Равные очки — ничья."},
 {h:'CARDS',p:"Cards are numbered 1 to 11. All unique \u2014 no repeats, so you can never draw a card already on the table.",v:'impossible',
  hRu:'КАРТЫ',pRu:"Карты пронумерованы от 1 до 11. Все уникальны \u2014 повторов нет, поэтому нельзя взять карту, уже лежащую на столе."},
 {h:'PROGRESS OF THE GAME',p:"- Each round both players draw 2 cards (first one hidden) and receive trumps.\n\n- On your turn draw a card or pass. Turns alternate; the round ends only when both pass in a row.\n\n- Then cards are revealed and the loser approaches his demise.",v:'man',
  hRu:'ХОД ИГРЫ',pRu:"- В начале раунда оба берут 2 карты (первая скрыта) и получают козыри.\n\n- В свой ход возьмите карту или пропустите. Ходы чередуются; раунд кончается, когда оба пропускают подряд.\n\n- Затем карты открываются, и проигравший приближается к гибели."},
 {h:'TRUMPS',p:"[What are they?]\n- Special cards with game-altering effects.\n\n[When?]\n- As many as you like on your turn.\n\n[How to get them?]\n- A few each hand, plus a chance when you draw.",v:'star',
  hRu:'КОЗЫРИ',pRu:"[Что это?]\n- Особые карты с эффектами.\n\n[Когда?]\n- Сколько угодно в свой ход.\n\n[Как получить?]\n- Несколько в начале и шанс при взятии карты."},
 {h:'NOT FOR LIFE, BUT TO DEATH.',p:"The JUDGE weighs before you. Each loss lowers your distance by the BET, which rises each round.\n\nBottom number = distance to YOU.\nTop number = distance to your OPPONENT.\nRed number = current BET.\n\nWhoever reaches zero dies.",v:'skull',
  hRu:'НЕ НА ЖИЗНЬ, А НА СМЕРТЬ.',pRu:"Перед вами весы СУДЬИ. Каждое поражение уменьшает дистанцию на СТАВКУ, растущую каждый раунд.\n\nНижнее число — дистанция до ВАС.\nВерхнее — до ПРОТИВНИКА.\nКрасное — текущая СТАВКА.\n\nЧья дистанция дойдёт до нуля — умрёт."},
];
let rulePage=0;
function renderRule(){const pg=RULE_PAGES[rulePage],b=document.getElementById('ruleBody');const ru=settings.lang==='ru';let v='';
  const WIN=L('WIN','ПОБЕДА'),LOSE=L('LOSE','ПОРАЖЕНИЕ');
  if(pg.v==='winlose')v='<div class="rule-visual"><div><div style="display:flex;gap:6px"><div class="minicard">10</div><div class="minicard">11</div></div><div class="label-wl">'+WIN+'</div></div><div style="width:20px"></div><div><div style="display:flex;gap:6px"><div class="minicard">10</div><div class="minicard">11<div class="bigx">&#10005;</div></div><div class="minicard">1</div></div><div class="label-wl">'+LOSE+'</div></div></div>';
  if(pg.v==='impossible')v='<div class="rule-visual"><div class="minicard">5<div class="bigx">&#10005;</div></div><div class="minicard">5</div></div><div class="label-wl" style="color:var(--blood)">'+L('IMPOSSIBLE','НЕВОЗМОЖНО')+'</div>';
  if(pg.v==='man')v='<div class="rule-visual"><div style="width:104px;height:104px;border:5px solid var(--blood);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--blood);font-size:32px;font-weight:800">21-</div></div><div class="label-wl">'+L('2 CARDS &middot; 1 MAN','2 КАРТЫ &middot; 1 ЧЕЛОВЕК')+'</div>';
  if(pg.v==='star')v='<div class="rule-visual"><div class="minicard" style="font-size:34px">&#9733;</div><div style="font-size:30px">&#10142;</div><div class="label-wl">'+WIN+'</div></div>';
  if(pg.v==='skull')v='<div class="skull">&#9760;</div>';
  b.innerHTML='<h3>'+(ru?pg.hRu:pg.h)+'</h3><p>'+(ru?pg.pRu:pg.p)+'</p>'+v;
  document.getElementById('ruleNext').textContent=rulePage<RULE_PAGES.length-1?L('NEXT','ДАЛЕЕ'):L('OK','ОК');
}

/* ===== GUIDED TOUR (runs over the live scene with arrows) ===== */
const TOUR_STEPS=[
 {target:'center',
  h:'Welcome to the lesson',hRu:'Добро пожаловать в обучение',
  p:"This is a learning card game about numbers and decisions. I'll point out everything on screen \u2014 use BACK / NEXT to move through the guide.",
  pRu:"Это обучающая карточная игра про числа и решения. Я покажу всё на экране \u2014 листайте кнопками «НАЗАД» / «ДАЛЕЕ»."},
 {target:()=>cardAnchor('player'), r:120,
  h:'Your cards',hRu:'Ваши карты',
  p:"These are your cards on the table. The first is face-down (hidden), the second is face-up. Cards are numbered 1\u201311 and every number is unique \u2014 no duplicates.",
  pRu:"Это ваши карты на столе. Первая закрыта (скрыта), вторая открыта. Карты пронумерованы 1\u201311, каждое число уникально \u2014 повторов нет."},
 {target:'youTotal',
  h:'Your total',hRu:'Ваша сумма',
  p:"Your running total. The goal is to get as close to the <b>target (21)</b> as you can <b>without going over</b>. Go over and you bust and lose the round.",
  pRu:"Ваша текущая сумма. Цель \u2014 подойти как можно ближе к <b>цели (21)</b>, <b>не превысив</b> её. Перебор \u2014 и раунд проигран."},
 {target:'oppTotal',
  h:'Opponent total',hRu:'Сумма противника',
  p:"Your opponent's visible total. Their hidden card shows as <b>?</b>, so you never see their full hand until the reveal.",
  pRu:"Видимая сумма противника. Скрытая карта показана как <b>?</b>, поэтому всю руку вы видите только при вскрытии."},
 {target:()=>cardAnchor('player'), r:120,
  h:'Taking a turn',hRu:'Ваш ход',
  p:"On your turn you do ONE thing:\n\u2022 <b>DRAW</b> \u2014 double-click the LEFT mouse button (or L).\n\u2022 <b>PASS</b> \u2014 double-click the RIGHT mouse button (or M).\nA \u201Cdraw? / pass?\u201D label appears so you can confirm.",
  pRu:"В свой ход вы делаете ОДНО действие:\n\u2022 <b>ВЗЯТЬ</b> \u2014 двойной щелчок ЛЕВОЙ кнопкой мыши (или L).\n\u2022 <b>ПРОПУСТИТЬ</b> \u2014 двойной щелчок ПРАВОЙ кнопкой (или M).\nПоявится подсказка «взять? / пропустить?»."},
 {target:'aDraw',
  h:'Controls',hRu:'Управление',
  p:"These hints stay on screen during your turn. Turns alternate with the opponent, and the round ends only when <b>both of you pass in a row</b>.",
  pRu:"Эти подсказки видны в ваш ход. Ходы чередуются с противником, а раунд кончается, только когда <b>оба пропускают подряд</b>."},
 {target:'trumpTray',
  h:'Trump cards',hRu:'Козыри',
  p:"Your trump cards. Click one to use its effect \u2014 you may use several per turn. Examples: <b>Go for 17/24/27</b> changes the target, <b>One-Up / Two-Up</b> raise the bet, <b>Bless</b> protects your distance.",
  pRu:"Ваши козыри. Нажмите, чтобы применить эффект \u2014 за ход можно несколько. Примеры: <b>Цель 17/24/27</b> меняет цель, <b>Плюс один / Плюс два</b> повышают ставку, <b>Благословение</b> защищает дистанцию."},
 {target:()=>counterMesh?counterMesh.position.clone():new THREE.Vector3(-1.05,2.6,-2.0), r:85,
  h:'The counter',hRu:'Счётчик',
  p:"The judge's counter. <b>Left (red)</b> = the current bet. <b>Top</b> = opponent's distance. <b>Bottom</b> = your distance. Both start at 5.",
  pRu:"Счётчик судьи. <b>Слева (красное)</b> \u2014 текущая ставка. <b>Сверху</b> \u2014 дистанция противника. <b>Снизу</b> \u2014 ваша дистанция. Обе начинаются с 5."},
 {target:()=>sawGroup?sawGroup.position.clone():new THREE.Vector3(0,1.8,-1.4), r:95,
  h:'Distance & bet',hRu:'Дистанция и ставка',
  p:"The loser of each round loses distance equal to the <b>bet</b>, which starts at 1 and rises by 1 every round \u2014 so it advances faster over time. Reach 0 and the match is over.",
  pRu:"Проигравший раунд теряет дистанцию, равную <b>ставке</b>: она начинается с 1 и растёт на 1 каждый раунд \u2014 поэтому со временем приближается быстрее. Дойдёт до 0 \u2014 матч окончен."},
 {target:'center',
  h:"You're ready!",hRu:'Вы готовы!',
  p:"Tip: drawing is safe at a low total, but near the target a single card can bust you. Watch your opponent and save trumps for the right moment.\n\nPress START PLAYING when you're ready.",
  pRu:"Совет: при низкой сумме брать безопасно, но у самой цели одна карта может привести к перебору. Следите за противником и берегите козыри.\n\nНажмите «НАЧАТЬ ИГРУ», когда будете готовы."},
];
let tourActive=false, tourStep=0;
function cardAnchor(side){
  const z=side==='player'?PLAYER_Z:BOT_Z;
  return new THREE.Vector3(0,TABLE_Y+0.05,z+0.25);
}
function projectPt(v){const p=v.clone().project(camera);return {x:(p.x*0.5+0.5)*innerWidth,y:(-p.y*0.5+0.5)*innerHeight};}
function tourTargetRect(step){
  if(step.target==='center')return null;
  if(typeof step.target==='string'){
    const el=document.getElementById(step.target);
    if(el&&!el.classList.contains('hidden')){const r=el.getBoundingClientRect();
      if(r.width>0)return {x:r.left-8,y:r.top-8,w:r.width+16,h:r.height+16};}
    return null;
  }
  const pt=projectPt(step.target()),rad=step.r||80;
  return {x:pt.x-rad,y:pt.y-rad,w:rad*2,h:rad*2};
}
function layoutTour(){
  const step=TOUR_STEPS[tourStep];
  const box=document.getElementById('tourBox'),hi=document.getElementById('tourHi'),line=document.getElementById('tourLine');
  const rect=tourTargetRect(step);
  const bw=box.offsetWidth||340,bh=box.offsetHeight||200;
  if(!rect){ // centered, no arrow/highlight
    hi.style.display='none';line.style.display='none';
    box.style.left=Math.round((innerWidth-bw)/2)+'px';
    box.style.top=Math.round((innerHeight-bh)/2)+'px';
    return;
  }
  hi.style.display='block';
  hi.style.left=rect.x+'px';hi.style.top=rect.y+'px';hi.style.width=rect.w+'px';hi.style.height=rect.h+'px';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const tcx=rect.x+rect.w/2,tcy=rect.y+rect.h/2;
  const gap=54;                                            // clear space between the box and the element
  const leftRoom=rect.x, rightRoom=innerWidth-(rect.x+rect.w),
        topRoom=rect.y, bottomRoom=innerHeight-(rect.y+rect.h);
  let side;                                                // pick the side with the most room so the box never covers the target
  if(rightRoom>=bw+gap+12)side='right';
  else if(leftRoom>=bw+gap+12)side='left';
  else if(bottomRoom>=bh+gap+12)side='bottom';
  else if(topRoom>=bh+gap+12)side='top';
  else side=(rightRoom>=leftRoom)?'right':'left';
  let bx,by,sx,sy;
  if(side==='right'){bx=rect.x+rect.w+gap;by=clamp(tcy-bh/2,16,innerHeight-bh-16);sx=bx;sy=by+bh/2;}
  else if(side==='left'){bx=rect.x-gap-bw;by=clamp(tcy-bh/2,16,innerHeight-bh-16);sx=bx+bw;sy=by+bh/2;}
  else if(side==='bottom'){by=rect.y+rect.h+gap;bx=clamp(tcx-bw/2,16,innerWidth-bw-16);sx=bx+bw/2;sy=by;}
  else {by=rect.y-gap-bh;bx=clamp(tcx-bw/2,16,innerWidth-bw-16);sx=bx+bw/2;sy=by+bh;}
  box.style.left=Math.round(bx)+'px';box.style.top=Math.round(by)+'px';
  // arrow ends just OUTSIDE the element edge (toward the box), so the head never sits over the content
  const hw=rect.w/2+12,hh=rect.h/2+12, ux=sx-tcx, uy=sy-tcy;
  const sc=Math.min(Math.abs(ux)>1?hw/Math.abs(ux):1e9, Math.abs(uy)>1?hh/Math.abs(uy):1e9);
  const ex=tcx+ux*sc, ey=tcy+uy*sc;
  line.setAttribute('d','M'+Math.round(sx)+','+Math.round(sy)+' L'+Math.round(ex)+','+Math.round(ey));
  line.style.display='block';
}
function renderTour(){
  const step=TOUR_STEPS[tourStep],ru=settings.lang==='ru';
  document.getElementById('tourTitle').textContent=ru?step.hRu:step.h;
  document.getElementById('tourNote').innerHTML=ru?step.pRu:step.p;
  document.getElementById('tourDots').innerHTML=TOUR_STEPS.map((_,i)=>'<span class="'+(i===tourStep?'on':'')+'"></span>').join('');
  document.getElementById('tourPrev').classList.toggle('hide',tourStep===0);
  const last=tourStep===TOUR_STEPS.length-1, skip=document.getElementById('tourSkip');
  skip.textContent=last?t('menu'):t('tutskip');
  skip.onclick=last?()=>endTour('menu'):()=>{tourStep=TOUR_STEPS.length-1;renderTour();};
  document.getElementById('tourNext').textContent=tourStep<TOUR_STEPS.length-1?t('tutnext'):t('tutstart');
  // open the tray only on the trumps step
  if(step.target==='trumpTray')openTray(); else closeTray();
  requestAnimationFrame(layoutTour);
}
function startTutorial(){
  ['menu','rules','other','settings','credits','stats','gameover'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  document.body.classList.add('playing');
  newGame();
  ['you','opp','youT','oppT'].forEach(k=>clearGroup(k));
  decals.forEach(d=>scene.remove(d));decals=[];
  document.getElementById('blood').classList.remove('show');
  document.getElementById('deathDark').style.opacity='0';
  document.getElementById('wakeDark').style.opacity='0';
  document.getElementById('lids').classList.add('hidden');
  if(oppFigure){oppFigure.position.set(0,-0.05,-4.2);oppFigure.rotation.set(0,0,0);oppFigure.scale.setScalar(0.8);}
  if(oppArms[0])oppArms[0].rotation.x=0;if(oppArms[1])oppArms[1].rotation.x=0;
  if(oppHead)oppHead.rotation.set(0,0,0);
  camShake=0;shakeAmt=0;introPitch=null;mYaw=0;mPitch=0;
  camTarPos.set(0,1.3,2.5);camPos.set(0,1.3,2.5);
  sawTargetY=SAW_PLAY_Y;sawTargetZ=-1.4;sawLeanZ=0;sawSpin=0;bladeYaw=Math.PI/2;
  if(sawGroup)sawGroup.position.set(0,SAW_PLAY_Y,-1.4);if(sawBlade)sawBlade.rotation.y=Math.PI/2;
  // a sample frozen hand so the HUD and table are populated
  G.player.hand=[{v:7,hidden:true,mine:true},{v:9,hidden:false,mine:true}];
  G.bot.hand=[{v:6,hidden:true},{v:8,hidden:false}];
  give(G.player,2);give(G.bot,2);
  G.phase='tutorial';G.turn='player';
  document.getElementById('hud').classList.remove('hidden');
  enableActions(true);setTV('YOUR');
  renderHUD();renderCards3D();
  tourStep=0;tourActive=true;
  document.getElementById('tour').classList.remove('hidden');
  renderTour();
}
function tourNext(){ if(tourStep<TOUR_STEPS.length-1){tourStep++;renderTour();} else endTour('play'); }
function tourPrev(){ if(tourStep>0){tourStep--;renderTour();} }
function endTour(go){
  tourActive=false;closeTray();
  document.getElementById('tour').classList.add('hidden');
  if(go==='play')startMatch(); else showMenu();
}

