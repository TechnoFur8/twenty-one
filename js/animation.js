/* ===== ANIMATION LOOP ===== */
let camPos=new THREE.Vector3(0,1.3,2.5);
let camTarPos=new THREE.Vector3(0,1.3,2.5);
let basePitch=-0.27, baseYaw=0, mYaw=0,mPitch=0;
let introPitch=null; // override during wake
let sawTargetY=7, sawTargetZ=-1.4, sawLeanZ=0, sawSpin=0.02, bladeYaw=0, shakeAmt=0, camShake=0;
function animate(){
  requestAnimationFrame(animate);
  const dt=clock.getDelta(), t=clock.getElapsedTime();
  if(sawBlade){ sawBlade.rotation.z+=sawSpin; sawBlade.rotation.y += (bladeYaw - sawBlade.rotation.y)*0.11;
    const facing=1-Math.min(1,Math.abs(sawBlade.rotation.y)/(Math.PI/2));   // 1 = spikes toward us, 0 = sideways
    sawBlade.rotation.x = 0.14*facing;                                       // tip the disc to point its face at the player
  }
  if(sawGroup){
    sawGroup.position.y += (sawTargetY-sawGroup.position.y)*0.05;
    sawGroup.position.z += ((sawTargetZ+sawLeanZ)-sawGroup.position.z)*0.018;
    sawGroup.rotation.z = Math.sin(t*1.3)*0.012 + (Math.random()-0.5)*shakeAmt;
  }
  // opponent idle (only during active play; wake/death control the head otherwise)
  if(oppHead&&G&&G.phase==='play'){ oppHead.rotation.y=Math.sin(t*0.4)*0.25; oppHead.rotation.z=Math.sin(t*1.7)*0.03;
    oppHead.rotation.x=(G.turn==='bot')?Math.sin(t*5)*0.05:0; }
  // tv flicker
  tvList.forEach((tv,i)=>{tv.mat.opacity=0.82+0.18*Math.abs(Math.sin(t*(3+i)+i));});
  // sparks
  for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.position.add(s.vel);s.vel.y-=(s.confetti?0.006:s.blood?0.013:0.01);s.life-=dt;
    if(s.confetti){s.rotation.x+=s.spin.x;s.rotation.y+=s.spin.y;s.rotation.z+=s.spin.z;s.position.x+=Math.sin((t+i)*2)*0.004;}
    if(!s.blood)s.scale.multiplyScalar(0.96);if(s.life<=0||s.position.y<TABLE_Y-0.6){scene.remove(s);sparks.splice(i,1);}}
  // camera
  camPos.lerp(camTarPos,0.05);
  camera.position.copy(camPos);
  if(camShake>0.001){camera.position.x+=(Math.random()-.5)*camShake*1.4;camera.position.y+=(Math.random()-.5)*camShake*1.4;}
  const pitch=(introPitch!=null?introPitch:basePitch)+mPitch;
  const yaw=baseYaw+mYaw;
  const dir=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  camera.lookAt(camPos.clone().add(dir));
  aimProjector();
  positionOppTotal();
  if(tourActive)layoutTour();
  renderer.render(scene,camera);
}

/* project opp total to screen, place left of opp cards */
function positionOppTotal(){
  const el=document.getElementById('oppTotal');
  if(!G||document.getElementById('hud').classList.contains('hidden')){return;}
  const n=G.bot.hand.length, span=0.46, startX=-(n-1)*span/2;
  const p=new THREE.Vector3(startX-0.55,TABLE_Y+0.25,BOT_Z);
  p.project(camera);
  el.style.left=((p.x*0.5+0.5)*innerWidth)+'px';
  el.style.top=((-p.y*0.5+0.5)*innerHeight)+'px';
}

/* status TVs incl. countdown number */
let lastTV={kind:'WAIT',num:0};
function setTV(kind,num){
  lastTV={kind,num};
  let txt=L('WAIT','ЖДИТЕ'),col='#d9534f';
  if(kind==='YOUR'){txt=L('YOUR\nTURN','ВАШ\nХОД');col='#eaeaea';}
  else if(kind==='OPP'){txt=L('OPPONENT','ПРОТИВНИК');col='#d9534f';}
  else if(kind==='LOSER'){txt=L('LOSER','ПРОИГРАЛ');col='#ff3b3b';}
  else if(kind==='WIN'){txt=L('WIN','ПОБЕДА');col='#7CFC8A';}
  else if(kind==='DRAW'){txt=L('DRAW','НИЧЬЯ');col='#eaeaea';}
  else if(kind==='OVERKILL'){txt=L('OVERKILL','ПЕРЕБОР');col='#ff2020';}
  else if(kind==='NUM'){txt=String(num);col='#ff3030';}
  tvList.forEach(tv=>{if(tv.kind==='status'){tv.mat.map.dispose();tv.mat.map=tvTex(txt,col);tv.mat.needsUpdate=true;}});
}
/* ====================================================================
   3D CARDS + PLACED TRUMPS
==================================================================== */
const MOD_TRUMPS=['bless','bloodshed','go17','go24','go27','oneUp','twoUp','shield','shieldPlus'];
function clearGroup(key){ if(cardGroups[key]){scene.remove(cardGroups[key]);
  cardGroups[key].traverse(o=>{if(o.material){if(o.material.map&&o.material.map.dispose)o.material.map.dispose();o.material.dispose();}});}
  cardGroups[key]=new THREE.Group();scene.add(cardGroups[key]); }
function renderCards3D(){
  if(!G) return;
  // number cards
  [['you',G.player,PLAYER_Z,true],['opp',G.bot,BOT_Z,false]].forEach(([k,p,z,isYou])=>{
    clearGroup(k);const g=cardGroups[k];
    const n=p.hand.length, span=0.46, startX=-(n-1)*span/2;
    p.hand.forEach((card,i)=>{
      let tex;
      if(card.overkill) tex=okTex;
      else if(isYou){ tex=card.hidden?(card.hush?hushTex:getFace(card.v)):getFace(card.v); } // owner sees own values
      else { tex = card.hidden ? (card.hush?hushTex:backTex) : getFace(card.v); }
      const m=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.54),new THREE.MeshStandardMaterial({map:tex,roughness:.85}));
      m.rotation.x=-Math.PI/2; m.rotation.z = isYou?0:Math.PI; // opp cards oriented to opponent's side
      m.position.set(startX+i*span, TABLE_Y+0.012, z);
      g.add(m);
    });
  });
  // placed modifier trumps
  [['youT','player',PLAYER_Z-0.62],['oppT','bot',BOT_Z+0.62]].forEach(([k,side,z])=>{
    clearGroup(k);const g=cardGroups[k];
    const list=G.roundTrumps.filter(tt=>!tt.dead&&tt.by===side&&MOD_TRUMPS.includes(tt.type));
    const n=list.length, span=0.34, startX=-(n-1)*span/2;
    list.forEach((tt,i)=>{
      const m=new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.4),new THREE.MeshStandardMaterial({map:trumpCardTex(tt.type),roughness:.8}));
      m.rotation.x=-Math.PI/2; m.position.set(startX+i*span, TABLE_Y+0.02, z);
      g.add(m);
    });
  });
}

