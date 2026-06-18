/* ====================================================================
   GAME LOGIC
==================================================================== */
const START_DIST=5;
const TRUMPS={
  c2:{name:'2-Card',ic:'2&#9666;',d:'Draw number 2 if in deck.',nameRu:'Карта 2',dRu:'Взять 2, если есть в колоде.'},c3:{name:'3-Card',ic:'3&#9666;',d:'Draw number 3 if in deck.',nameRu:'Карта 3',dRu:'Взять 3, если есть в колоде.'},
  c4:{name:'4-Card',ic:'4&#9666;',d:'Draw number 4 if in deck.',nameRu:'Карта 4',dRu:'Взять 4, если есть в колоде.'},c5:{name:'5-Card',ic:'5&#9666;',d:'Draw number 5 if in deck.',nameRu:'Карта 5',dRu:'Взять 5, если есть в колоде.'},
  c6:{name:'6-Card',ic:'6&#9666;',d:'Draw number 6 if in deck.',nameRu:'Карта 6',dRu:'Взять 6, если есть в колоде.'},c7:{name:'7-Card',ic:'7&#9666;',d:'Draw number 7 if in deck.',nameRu:'Карта 7',dRu:'Взять 7, если есть в колоде.'},
  bless:{name:'Bless',ic:'&#9760;',d:'Avoid death this round.',nameRu:'Благословение',dRu:'Избежать смерти в этом раунде.'},bloodshed:{name:'Bloodshed',ic:'&#10040;',d:'Draw a trump, bet +1.',nameRu:'Кровопролитие',dRu:'Взять козырь, ставка +1.'},
  destroy:{name:'Destroy',ic:'&#10039;',d:"Destroy opp's last trump.",nameRu:'Уничтожение',dRu:'Уничтожить последний козырь врага.'},disservice:{name:'Disservice',ic:'&#9635;',d:'Force opp to draw.',nameRu:'Услуга',dRu:'Заставить врага взять карту.'},
  exchange:{name:'Exchange',ic:'&#8644;',d:"Swap last card with opp.",nameRu:'Обмен',dRu:'Обменять последнюю карту с врагом.'},friendship:{name:'Friendship',ic:'&#9829;',d:'Both draw 2 trumps.',nameRu:'Дружба',dRu:'Оба берут по 2 козыря.'},
  go17:{name:'Go for 17',ic:'17',d:'Target becomes 17.',nameRu:'Цель 17',dRu:'Цель становится 17.'},go24:{name:'Go for 24',ic:'24',d:'Target becomes 24.',nameRu:'Цель 24',dRu:'Цель становится 24.'},
  go27:{name:'Go for 27',ic:'27',d:'Target becomes 27.',nameRu:'Цель 27',dRu:'Цель становится 27.'},hush:{name:'Hush',ic:'&#9824;',d:'Draw a hidden card.',nameRu:'Тишина',dRu:'Взять скрытую карту.'},
  oneUp:{name:'One-Up',ic:'&#9650;',d:'Bet +1.',nameRu:'Плюс один',dRu:'Ставка +1.'},twoUp:{name:'Two-Up',ic:'&#9211;',d:'Bet +2.',nameRu:'Плюс два',dRu:'Ставка +2.'},
  shield:{name:'Shield',ic:'&#128737;',d:'Bet -1.',nameRu:'Щит',dRu:'Ставка −1.'},shieldPlus:{name:'Shield+',ic:'&#128737;+',d:'Bet -2.',nameRu:'Щит+',dRu:'Ставка −2.'},
  remove:{name:'Remove',ic:'&#9003;',d:"Remove opp's last card.",nameRu:'Удаление',dRu:'Убрать последнюю карту врага.'},ret:{name:'Return',ic:'&#8617;',d:'Return your last card.',nameRu:'Возврат',dRu:'Вернуть свою последнюю карту.'},
  perfect:{name:'Perfect Draw',ic:'&#9733;&#9666;',d:'Draw best card, no bust.',nameRu:'Идеальный ход',dRu:'Лучшая карта без перебора.'},refresh:{name:'Refresh',ic:'&#10227;',d:'Discard all, deal fresh.',nameRu:'Обновление',dRu:'Сбросить всё, раздать заново.'},
  reincarnation:{name:'Reincarnation',ic:'&#9851;',d:"Destroy last trump + draw 1.",nameRu:'Перерождение',dRu:'Уничтожить козырь + взять 1.'},
};
const TKEYS=Object.keys(TRUMPS);
function tn(k){return settings.lang==='ru'?TRUMPS[k].nameRu:TRUMPS[k].name;}
function td(k){return settings.lang==='ru'?TRUMPS[k].dRu:TRUMPS[k].d;}
let G;
function newGame(){
  G={deck:[],target:21,baseBet:1,bet:1,round:1,
    player:{hand:[],trumps:[],dist:START_DIST},bot:{hand:[],trumps:[],dist:START_DIST},
    roundTrumps:[],turn:'player',phase:'idle',consec:0,timer:null,timeLeft:30,overkillSide:null,
    blessP:false,blessB:false};
}
function freshDeck(){G.deck=[];for(let i=1;i<=11;i++)G.deck.push(i);}
function drawRandom(){if(!G.deck.length)return null;const i=Math.floor(Math.random()*G.deck.length);return G.deck.splice(i,1)[0];}
function drawSpecific(n){const i=G.deck.indexOf(n);if(i<0)return null;return G.deck.splice(i,1)[0];}
function total(p){return p.hand.reduce((s,c)=>s+(c.overkill?0:c.v),0);}
function visibleTotal(p){return p.hand.filter(c=>!c.hidden&&!c.overkill).reduce((s,c)=>s+c.v,0);}
function hasHidden(p){return p.hand.some(c=>c.hidden);}
function rndTrump(){return TKEYS[Math.floor(Math.random()*TKEYS.length)];}
function give(p,n){for(let i=0;i<n;i++)p.trumps.push(rndTrump());}

function sawZForDistances(){
  const lead=G.bot.dist-G.player.dist;          // >0 means player is losing
  const k=Math.max(-1,Math.min(1,lead/8));
  const mid=(PLAYER_Z+BOT_Z)/2;
  return mid + k*(PLAYER_Z-mid);
}

function startRound(){
  freshDeck();G.player.hand=[];G.bot.hand=[];G.roundTrumps=[];
  G.target=21;G.bet=G.baseBet;G.blessP=false;G.blessB=false;G.consec=0;G.overkillSide=null;
  give(G.player,2);give(G.bot,2);              // trumps dealt first
  G.turn='player';G.phase='deal';enableActions(false);closeTray();
  sawTargetY=SAW_PLAY_Y;sawSpin=0;bladeYaw=Math.PI/2;          // saw stands still, sideways, at round start
  toast(L('Round ','Раунд ')+G.round+L(' \u2014 bet ',' \u2014 ставка ')+G.baseBet,'');
  renderHUD();renderCards3D();                 // clean table (empty hands)
  setTV('WAIT');
  dealAnimation(()=>{ G.phase='play'; beginTurn(); });
}
function tweenVec(pos,to,dur,cb){
  const from=pos.clone(),t0=performance.now();
  (function go(){const k=Math.min(1,(performance.now()-t0)/dur),e=1-Math.pow(1-k,3);
    pos.lerpVectors(from,to,e);pos.y+=Math.sin(e*Math.PI)*0.22;
    if(k<1)requestAnimationFrame(go);else if(cb)cb();})();
}
function dealAnimation(done){
  const items=[
    {card:{v:drawRandom(),hidden:true,mine:true},side:'player',x:-0.23},
    {card:{v:drawRandom(),hidden:false,mine:true},side:'player',x:0.23},
    {card:{v:drawRandom(),hidden:true},side:'bot',x:-0.23},
    {card:{v:drawRandom(),hidden:false},side:'bot',x:0.23},
  ];
  const temps=[];let i=0;
  (function step(){
    if(i>=items.length){items.forEach(it=>(it.side==='player'?G.player:G.bot).hand.push(it.card));
      temps.forEach(m=>scene.remove(m));renderCards3D();if(done)done();return;}
    const it=items[i++],z=it.side==='player'?PLAYER_Z:BOT_Z;
    const tex=it.card.hidden?(it.side==='player'?getFace(it.card.v):backTex):getFace(it.card.v);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.54),new THREE.MeshStandardMaterial({map:tex,roughness:.85}));
    m.rotation.x=-Math.PI/2;m.rotation.z=it.side==='player'?0:Math.PI;
    m.position.set(3.3,0.75,0.6);scene.add(m);temps.push(m);
    tweenVec(m.position,new THREE.Vector3(it.x,TABLE_Y+0.012,z),520,()=>setTimeout(step,150));
  })();
}
function beginTurn(){
  clearTurnTimer();renderHUD();renderCards3D();
  document.getElementById('bustNote').classList.remove('show');
  if(G.turn==='player'){setTV('YOUR');enableActions(true);startTurnTimer();}
  else{setTV('OPP');enableActions(false);closeTray();
    const think=2000+Math.random()*3000;
    setTimeout(()=>{if(G.phase==='play')botTurn();},think);}
}
function afterAction(){
  if(G.consec>=2){resolveRound();return;}
  G.turn=G.turn==='player'?'bot':'player';beginTurn();
}
/* timer: 30s; FASTER! warning then countdown last 10s on TVs */
function startTurnTimer(){
  G.timeLeft=30;let warned=false;
  G.timer=setInterval(()=>{
    G.timeLeft--;
    if(G.timeLeft===11&&!warned){warned=true;const f=document.getElementById('fasterTag');f.classList.add('show');setTimeout(()=>f.classList.remove('show'),1600);}
    if(G.timeLeft<=10&&G.timeLeft>0){setTV('NUM',G.timeLeft);}
    if(G.timeLeft<=0){clearTurnTimer();triggerOverkill('player');}
  },1000);
}
function clearTurnTimer(){if(G&&G.timer)clearInterval(G.timer);if(G)G.timer=null;document.getElementById('fasterTag').classList.remove('show');}
function triggerOverkill(side){
  const p=side==='player'?G.player:G.bot;p.hand.push({overkill:true,mine:side==='player'});G.overkillSide=side;
  setTV('OVERKILL');toast((side==='player'?L('You','Вы'):L('Opponent','Противник'))+L(' hesitated \u2014 OVERKILL!',' замешкались \u2014 ПЕРЕБОР!'),'bad');
  renderCards3D();shakeAmt=0.05;setTimeout(()=>shakeAmt=0,700);enableActions(false);
  setTimeout(resolveRound,2000);
}
function playerDraw(){
  if(!G||G.turn!=='player'||G.phase!=='play')return;
  if(total(G.player)>G.target){const bn=document.getElementById('bustNote');bn.classList.add('show');setTimeout(()=>bn.classList.remove('show'),1500);subtitle(t('overkillpts'),1400);return;}
  const v=drawRandom();
  if(v==null){subtitle(L('Deck empty','Колода пуста'),1400);}
  else{G.player.hand.push({v,hidden:false,mine:true});G.consec=0;subtitle(phr('draw'));
    if(Math.random()<0.18){G.player.trumps.push(rndTrump());toast('\u2605 '+L('you received','вы получили козырь')+' "'+tn(G.player.trumps[G.player.trumps.length-1])+'"','good');}}
  renderCards3D();afterAction();
}
function playerPass(){
  if(!G||G.turn!=='player'||G.phase!=='play')return;
  G.consec++;subtitle(phr('pass'));afterAction();
}
/* BOT */
function botTurn(){
  if(G.phase!=='play')return;
  let used=true,guard=0;
  while(used&&guard++<6){ used=botMaybeTrump(); }
  const me=G.bot,tot=total(me),tgt=G.target;
  if(tot>tgt){ G.consec++; toast(L('Opponent keeps their hand.','Противник оставляет руку.'),'bot'); return botEnd(); }
  const safe=tgt-tot;
  if(safe>=5&&G.deck.length){botDraw();return botEnd();}
  if(safe>=3&&Math.random()<0.65&&G.deck.length){botDraw();return botEnd();}
  if(safe>=1&&Math.random()<0.3&&G.deck.length){botDraw();return botEnd();}
  G.consec++;toast(L('Opponent keeps their hand.','Противник оставляет руку.'),'bot');botEnd();
}
function botMaybeTrump(){
  const me=G.bot,opp=G.player,tot=total(me),tgt=G.target,ov=visibleTotal(opp);
  if((me.dist-G.bet)<=0&&!G.blessB){ if(useBT('bless')||useBT('shieldPlus')||useBT('shield')||useBT('destroy'))return true; }
  const need=tgt-tot,ct={2:'c2',3:'c3',4:'c4',5:'c5',6:'c6',7:'c7'}[need];
  if(need>0&&ct&&me.trumps.includes(ct)&&G.deck.includes(need)){ if(useBT(ct))return true; }
  if(tot<=tgt-2&&useBT('perfect'))return true;
  if(tot>tgt){ if(Math.abs(tot-24)<Math.abs(tot-tgt)&&useBT('go24'))return true;
               if(Math.abs(tot-27)<Math.abs(tot-tgt)&&useBT('go27'))return true;
               if(useBT('refresh'))return true; if(useBT('ret'))return true; }
  if(tot>=tgt-4&&tot<=tgt&&opp.dist<=5){ if(useBT('twoUp')||useBT('oneUp')||useBT('bloodshed'))return true; }
  if(ov>=tgt-3){ if(useBT('disservice'))return true; if(useBT('remove'))return true; }
  if(G.roundTrumps.some(tt=>!tt.dead&&tt.by==='player'&&['oneUp','twoUp','go24','go27'].includes(tt.type))){ if(useBT('destroy')||useBT('reincarnation'))return true; }
  if((me.dist-G.bet)<=2&&!G.blessB){ if(useBT('shield')||useBT('bless'))return true; }
  if(me.trumps.length>=4&&Math.random()<0.4){ if(useBT('friendship'))return true; }
  return false;
}
function useBT(key){const i=G.bot.trumps.indexOf(key);if(i<0)return false;if(!trumpUsable(key,G.bot,G.player))return false;
  G.bot.trumps.splice(i,1);applyTrump(key,G.bot,G.player);G.consec=0;toast('\u2620 '+L('opponent used','противник использовал козырь')+' "'+tn(key)+'"','bot');renderHUD();renderCards3D();return true;}
function botDraw(){const v=drawRandom();if(v!=null){G.bot.hand.push({v,hidden:false});if(Math.random()<0.18)G.bot.trumps.push(rndTrump());}G.consec=0;toast(L('Opponent draws a card.','Противник берёт карту.'),'bot');}
function botEnd(){renderCards3D();renderHUD();setTimeout(afterAction,700);}

/* TRUMP MACHINERY */
function recompute(){let tg=21,bet=G.baseBet,bp=false,bb=false;
  for(const tt of G.roundTrumps){if(tt.dead)continue;switch(tt.type){
    case 'go17':tg=17;break;case 'go24':tg=24;break;case 'go27':tg=27;break;
    case 'oneUp':bet+=1;break;case 'twoUp':bet+=2;break;case 'bloodshed':bet+=1;break;
    case 'shield':bet-=1;break;case 'shieldPlus':bet-=2;break;
    case 'bless':(tt.by==='player')?bp=true:bb=true;break;}}
  G.target=tg;G.bet=Math.max(0,bet);G.blessP=bp;G.blessB=bb;}
function trumpUsable(key,user,opp){
  if(key==='destroy'||key==='reincarnation'){const s=user===G.player?'player':'bot';return G.roundTrumps.some(tt=>!tt.dead&&tt.by!==s);}
  if(key==='exchange')return opp.hand.some(c=>!c.overkill)&&user.hand.some(c=>!c.overkill);
  if(key==='remove')return opp.hand.some(c=>!c.hidden&&!c.overkill)&&G.deck.length>0;
  if(key==='ret')return user.hand.some(c=>!c.hidden&&!c.overkill);
  if(['disservice','perfect','hush','refresh'].includes(key))return G.deck.length>0;
  return true;}
function applyTrump(key,user,opp){
  const s=user===G.player?'player':'bot',mine=user===G.player;
  switch(key){
    case 'c2':case 'c3':case 'c4':case 'c5':case 'c6':case 'c7':{const v=drawSpecific(+key.slice(1));if(v!=null)user.hand.push({v,hidden:false,mine});G.roundTrumps.push({type:key,by:s});break;}
    case 'go17':case 'go24':case 'go27':                       // only ONE "Go for..." card on the table at a time
      for(let i=G.roundTrumps.length-1;i>=0;i--){const t=G.roundTrumps[i].type;if(t==='go17'||t==='go24'||t==='go27')G.roundTrumps.splice(i,1);}
      G.roundTrumps.push({type:key,by:s});break;
    case 'oneUp':case 'twoUp':case 'shield':case 'shieldPlus':case 'bless':G.roundTrumps.push({type:key,by:s});break;
    case 'bloodshed':user.trumps.push(rndTrump());G.roundTrumps.push({type:'bloodshed',by:s});break;
    case 'hush':{const v=drawRandom();if(v!=null)user.hand.push({v,hidden:true,mine,hush:true});G.roundTrumps.push({type:'hush',by:s});break;}
    case 'perfect':{const tg=G.target,tot=total(user);let best=null;for(const c of G.deck)if(tot+c<=tg&&(best==null||c>best))best=c;if(best!=null){drawSpecific(best);user.hand.push({v:best,hidden:false,mine});}G.roundTrumps.push({type:'perfect',by:s});break;}
    case 'refresh':{user.hand.forEach(c=>{if(!c.overkill&&typeof c.v==='number')G.deck.push(c.v);});user.hand=[];const h=drawRandom();if(h!=null)user.hand.push({v:h,hidden:true,mine});const o=drawRandom();if(o!=null)user.hand.push({v:o,hidden:false,mine});G.roundTrumps.push({type:'refresh',by:s});break;}
    case 'ret':{for(let i=user.hand.length-1;i>=0;i--){if(!user.hand[i].hidden&&!user.hand[i].overkill){G.deck.push(user.hand[i].v);user.hand.splice(i,1);break;}}G.roundTrumps.push({type:'ret',by:s});break;}
    case 'remove':{for(let i=opp.hand.length-1;i>=0;i--){if(!opp.hand[i].hidden&&!opp.hand[i].overkill){G.deck.push(opp.hand[i].v);opp.hand.splice(i,1);break;}}G.roundTrumps.push({type:'remove',by:s});break;}
    case 'disservice':{const v=drawRandom();if(v!=null)opp.hand.push({v,hidden:false,mine:!mine});G.roundTrumps.push({type:'disservice',by:s});break;}
    case 'exchange':{const a=lastReal(user.hand),b=lastReal(opp.hand);if(a>=0&&b>=0){const tmp=user.hand[a].v;user.hand[a].v=opp.hand[b].v;opp.hand[b].v=tmp;user.hand[a].hidden=false;}G.roundTrumps.push({type:'exchange',by:s});break;}
    case 'friendship':give(user,2);give(opp,2);G.roundTrumps.push({type:'friendship',by:s});break;
    case 'destroy':case 'reincarnation':{for(let i=G.roundTrumps.length-1;i>=0;i--){const tt=G.roundTrumps[i];if(!tt.dead&&tt.by!==s){tt.dead=true;break;}}if(key==='reincarnation')user.trumps.push(rndTrump());G.roundTrumps.push({type:key,by:s});break;}
  }
  recompute();
}
function lastReal(h){for(let i=h.length-1;i>=0;i--)if(!h[i].overkill)return i;return -1;}

/* RESOLUTION */
function rank(tot,tg){return tot>tg?1000+tot:tg-tot;}
function resolveRound(){
  clearTurnTimer();enableActions(false);closeTray();G.phase='reveal';
  document.getElementById('bustNote').classList.remove('show');
  G.player.hand.forEach(c=>c.hidden=false);G.bot.hand.forEach(c=>c.hidden=false);
  renderCards3D();renderHUD();
  const pt=total(G.player),bt=total(G.bot),tg=G.target;let result;
  if(G.overkillSide==='player')result='lose';else if(G.overkillSide==='bot')result='win';
  else{const rp=rank(pt,tg),rb=rank(bt,tg);result=rp<rb?'win':rp>rb?'lose':'draw';}
  subtitle(phr('winner'),2200);
  let msg='',tv='DRAW';
  if(result==='draw'){msg=L('DRAW','НИЧЬЯ');tv='DRAW';toast(L('Draw. The Judge stays still.','Ничья. Судья замер.'),'');}
  else{const loser=result==='lose'?G.player:G.bot;const bless=result==='lose'?G.blessP:G.blessB;
    if(bless)toast((loser===G.player?L('You were','Вы'):L('Opponent was','Противник'))+L(' Blessed \u2014 no distance lost!',' благословлён \u2014 дистанция сохранена!'),'good');
    else loser.dist=Math.max(0,loser.dist-G.bet);
    msg=result==='win'?L('WIN','ПОБЕДА'):L('LOSE','ПОРАЖЕНИЕ');tv=result==='win'?'WIN':'LOSER';}
  setTV(tv);
  const lastRound = G.player.dist<=0 || G.bot.dist<=0;   // this round kills someone
  if(result!=='draw'){                                  // stays facing us; drops a little, spins toward the loser
    const spin = lastRound?0.12:0.035;                  // tense slow spin, but accelerated on the final round
    setTimeout(()=>{bladeYaw=Math.PI/2;sawTargetY=SAW_PLAY_Y-0.55;sawSpin=spin;sawTargetZ=sawZForDistances();},700);
    if(!lastRound)setTimeout(()=>{sawTargetY=SAW_PLAY_Y;sawSpin=0;},1900);   // rise + stop for the next round
  }
  if(result==='lose'){document.body.classList.add('shake');setTimeout(()=>document.body.classList.remove('shake'),350);}
  setTimeout(()=>showBanner(msg,result==='win'?'win':result==='lose'?'lose':''),700);
  renderHUD();
  const matchOver = G.player.dist<=0 || G.bot.dist<=0;
  setTimeout(()=>{hideBanner();
    if(matchOver){
      let w = G.player.dist<=0?'bot' : G.bot.dist<=0?'player' :
              (G.player.dist>G.bot.dist?'player':G.bot.dist>G.player.dist?'bot':'draw');
      playEnding(w); return;
    }
    G.round++;G.baseBet++;startRound();
  },2700);
}

