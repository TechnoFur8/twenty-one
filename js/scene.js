/* ====================================================================
   3D SCENE
==================================================================== */
let renderer,scene,camera,clock;
let sawGroup,sawBlade,counterMesh,oppFigure,oppHead,oppArms=[],projLight,projLens;
let tvList=[],sparks=[],decals=[];
let cardGroups={you:null,opp:null,youT:null,oppT:null};
let backTex,hushTex,okTex,tblTex,faceCache={};
const PLAYER_Z=0.1, BOT_Z=-3.0, SAW_PLAY_Y=1.8, TABLE_Y=0;
function getFace(n){ if(!faceCache[n]) faceCache[n]=parchmentFace(n); return faceCache[n]; }

function initScene(){
  const cv=document.getElementById('scene');
  renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true});
  setGfx(settings.graphics);
  renderer.setSize(innerWidth,innerHeight);
  scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x000000,0.11);
  camera=new THREE.PerspectiveCamera(54,innerWidth/innerHeight,0.05,100);

  tblTex=tableTex();
  const top=new THREE.Mesh(new THREE.BoxGeometry(4.4,0.02,3.8),new THREE.MeshStandardMaterial({map:tblTex,roughness:.95}));
  top.position.set(0,TABLE_Y,-1.4);scene.add(top);
  const felt=new THREE.Mesh(new THREE.BoxGeometry(4.4,0.28,3.8),new THREE.MeshStandardMaterial({color:0x24302a,roughness:.97}));
  felt.position.set(0,TABLE_Y-0.15,-1.4);scene.add(felt);
  const rim=new THREE.Mesh(new THREE.BoxGeometry(4.75,0.4,4.15),new THREE.MeshStandardMaterial({color:0x120c09,roughness:1}));
  rim.position.set(0,TABLE_Y-0.30,-1.4);scene.add(rim);

  const dark=new THREE.MeshStandardMaterial({color:0x060707,roughness:1});
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),dark);floor.rotation.x=-Math.PI/2;floor.position.y=-0.6;scene.add(floor);
  const wall=new THREE.Mesh(new THREE.PlaneGeometry(50,20),dark);wall.position.set(0,6,-7.5);scene.add(wall);

  scene.add(new THREE.AmbientLight(0x1a221c,0.75));
  const key=new THREE.SpotLight(0xfff2e0,2.4,16,0.85,0.6,1);key.position.set(0,5.6,0.4);key.target.position.set(0,0,-1.6);scene.add(key,key.target);
  const warm=new THREE.PointLight(0xffb070,0.5,9);warm.position.set(3.4,1.6,-1);scene.add(warm);

  buildRoom();
  buildTVs();
  buildOpponent();
  buildSaw();
  buildProjector();

  counterMesh=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.55,0.18),new THREE.MeshStandardMaterial({map:counterTex(1,5,5),roughness:.6}));
  counterMesh.position.set(-1.05,2.6,-2.0);scene.add(counterMesh);

  clock=new THREE.Clock();animate();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}
function setGfx(level){
  const pr = level==='low'?0.7 : level==='high'?Math.min(devicePixelRatio,2) : Math.min(devicePixelRatio,1.4);
  if(renderer) renderer.setPixelRatio(pr);
}

function buildRoom(){
  const wood=new THREE.MeshStandardMaterial({color:0x140f0a,roughness:1});
  const bookMat=[0x2a1d12,0x1c2417,0x241414,0x20201a].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
  // cabinet left
  const cab=new THREE.Mesh(new THREE.BoxGeometry(1.6,2.2,1.2),wood);cab.position.set(-4.2,0.5,-4.5);scene.add(cab);
  // shelf right
  const shelf=new THREE.Mesh(new THREE.BoxGeometry(0.4,2.4,2.2),wood);shelf.position.set(4.4,0.6,-4.8);scene.add(shelf);
  // book stacks (under TVs)
  function stack(px,pz){ let y=-0.45; for(let i=0;i<5+Math.floor(Math.random()*4);i++){const w=0.5+Math.random()*0.3,h=0.08+Math.random()*0.05,d=0.7;
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),bookMat[i%4]);b.position.set(px+(Math.random()-.5)*0.1,y+h/2,pz);b.rotation.y=(Math.random()-.5)*0.3;scene.add(b);y+=h;} return y; }
  stack(-3.4,-5.6);stack(-2.4,-5.9);stack(3.2,-5.7);stack(2.3,-5.9);
  // fallen lamp on floor
  const lampMat=new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.6,metalness:.4});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,1.6,8),lampMat);pole.position.set(-3.6,-0.5,-1.0);pole.rotation.z=Math.PI/2.3;scene.add(pole);
  const shade=new THREE.Mesh(new THREE.ConeGeometry(0.3,0.4,16,1,true),lampMat);shade.position.set(-4.3,-0.4,-1.0);shade.rotation.z=-Math.PI/2.3;scene.add(shade);
  const bulb=new THREE.PointLight(0xffd9a0,0.6,3);bulb.position.set(-4.2,-0.35,-1.0);scene.add(bulb);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8),new THREE.MeshBasicMaterial({color:0xffe3b0}));glow.position.copy(bulb.position);scene.add(glow);
}

function buildTVs(){
  const pos=[[-3.7,2.0,-5.4,0.5,'status'],[3.7,1.9,-5.4,-0.5,'status'],
    [-1.8,2.9,-6.2,0.22,'noise'],[1.7,2.9,-6.2,-0.22,'noise'],[0,1.5,-6.4,0,'status']];
  pos.forEach(p=>{
    const mat=new THREE.MeshBasicMaterial({map:tvTex(p[4]==='noise'?'':'WAIT','#d9534f'),transparent:true});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.45),mat);m.position.set(p[0],p[1],p[2]);m.rotation.y=p[3];scene.add(m);
    const fr=new THREE.Mesh(new THREE.BoxGeometry(2.45,1.7,0.14),new THREE.MeshStandardMaterial({color:0x0a0a0a,roughness:1}));
    fr.position.set(p[0],p[1],p[2]-0.09);fr.rotation.y=p[3];scene.add(fr);
    tvList.push({mat,kind:p[4]});
  });
}

function buildOpponent(){
  oppFigure=new THREE.Group();
  const jacket=new THREE.MeshStandardMaterial({color:0x8d8470,roughness:1});
  const jacketD=new THREE.MeshStandardMaterial({color:0x6c6450,roughness:1});
  const sack=new THREE.MeshStandardMaterial({color:0x9c8f72,roughness:1});
  const skin=new THREE.MeshStandardMaterial({color:0x6b5a47,roughness:1});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.5,0.64,1.3,12),jacket);torso.position.y=0.64;oppFigure.add(torso);
  const seam=new THREE.Mesh(new THREE.BoxGeometry(0.06,1.25,0.05),jacketD);seam.position.set(0,0.64,0.56);oppFigure.add(seam);
  // pocket
  const pk=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.2,0.04),jacketD);pk.position.set(0.26,0.55,0.55);oppFigure.add(pk);
  const sh=new THREE.Mesh(new THREE.BoxGeometry(1.55,0.38,0.62),jacket);sh.position.y=1.2;oppFigure.add(sh);
  oppArms=[];
  [-1,1].forEach(side=>{
    const arm=new THREE.Group();
    const up=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.14,0.72,10),jacket);up.position.set(0,-0.3,0.06);up.rotation.x=0.35;arm.add(up);
    const fore=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.1,0.9,10),jacket);fore.position.set(0,-0.82,0.5);fore.rotation.x=1.35;arm.add(fore);
    const hand=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.08,0.36),skin);hand.position.set(0,-1.18,0.98);arm.add(hand); // flat palm on table
    arm.position.set(side*0.66,1.16,0.05);arm.rotation.z=side*0.12;
    oppFigure.add(arm);oppArms.push(arm);
  });
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.2,0.2,8),jacket);neck.position.y=1.34;oppFigure.add(neck);
  oppHead=new THREE.Group();
  const hg=new THREE.BoxGeometry(0.64,0.72,0.54,4,4,4),pa=hg.attributes.position;
  for(let i=0;i<pa.count;i++){const y=pa.getY(i),taper=1-(y/0.36)*0.16;
    pa.setX(i,pa.getX(i)*taper*(1+(Math.random()-.5)*0.1));pa.setZ(i,pa.getZ(i)*taper*(1+(Math.random()-.5)*0.1));pa.setY(i,y*(1+(Math.random()-.5)*0.05));}
  pa.needsUpdate=true;hg.computeVertexNormals();
  oppHead.add(new THREE.Mesh(hg,sack));
  const eyeM=new THREE.MeshBasicMaterial({color:0x120d08});
  const hi=new THREE.MeshBasicMaterial({color:0xe8e4d6});
  [-0.15,0.15].forEach(dx=>{
    const e=new THREE.Mesh(new THREE.CircleGeometry(0.085,14),eyeM);e.position.set(dx,0.02,0.275);oppHead.add(e);
    const g=new THREE.Mesh(new THREE.CircleGeometry(0.028,10),hi);g.position.set(dx-0.025,0.06,0.277);oppHead.add(g); // teary highlight
  });
  // sad/worried brows (inner ends raised)
  [-1,1].forEach(side=>{const br=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.022,0.02),eyeM);br.position.set(side*0.15,0.17,0.275);br.rotation.z=-side*0.32;oppHead.add(br);});
  // small open scared mouth
  const mouth=new THREE.Mesh(new THREE.CircleGeometry(0.05,14),eyeM);mouth.scale.set(0.75,1.3,1);mouth.position.set(0,-0.22,0.275);oppHead.add(mouth);
  [-0.18,0.18].forEach(dx=>{const peak=new THREE.Mesh(new THREE.ConeGeometry(0.13,0.32,6),sack);peak.position.set(dx,0.44,0);peak.rotation.z=dx<0?0.48:-0.48;oppHead.add(peak);});
  const tie=new THREE.Mesh(new THREE.TorusGeometry(0.23,0.045,6,16),jacketD);tie.position.y=0.34;tie.rotation.x=Math.PI/2;oppHead.add(tie);
  oppHead.position.y=1.66;oppFigure.add(oppHead);
  oppFigure.scale.setScalar(0.8);
  oppFigure.position.set(0,-0.05,-4.2);scene.add(oppFigure);
}

function buildSaw(){
  sawGroup=new THREE.Group();
  const rust=new THREE.MeshStandardMaterial({color:0x1a1512,roughness:.85,metalness:.25,side:THREE.DoubleSide});
  const bld=new THREE.MeshStandardMaterial({color:0x090807,roughness:.7,metalness:.2,side:THREE.DoubleSide});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.13,4.4,12),new THREE.MeshStandardMaterial({color:0x0c0a08,roughness:.9,metalness:.3}));
  pole.position.y=2.2;sawGroup.add(pole);
  const bracket=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.5,0.16),rust);bracket.position.y=0.2;sawGroup.add(bracket);
  sawBlade=new THREE.Group();
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.18,20),rust);hub.rotation.x=Math.PI/2;sawBlade.add(hub);
  sawBlade.add(new THREE.Mesh(new THREE.TorusGeometry(0.5,0.06,10,36),rust));
  // chain ring (small dark links)
  const link=new THREE.MeshStandardMaterial({color:0x1c1814,roughness:.55,metalness:.5});
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const lk=new THREE.Mesh(new THREE.TorusGeometry(0.035,0.013,6,10),link);
    lk.position.set(Math.cos(a)*0.5,Math.sin(a)*0.5,0.05);lk.rotation.x=Math.PI/2;lk.rotation.z=a;sawBlade.add(lk);}
  // dark red rivets (not blue)
  const rivet=new THREE.MeshStandardMaterial({color:0x3a120e,roughness:.5,metalness:.35});
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const b=new THREE.Mesh(new THREE.SphereGeometry(0.032,8,8),rivet);b.position.set(Math.cos(a)*0.34,Math.sin(a)*0.34,0.09);sawBlade.add(b);}
  const N=14;
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2;const bl=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.82,4),bld);bl.scale.z=0.34;
    const dir=new THREE.Vector3(Math.cos(a),Math.sin(a),0);bl.position.copy(dir.clone().multiplyScalar(0.82));
    bl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);bl.rotateZ(0.2);sawBlade.add(bl);}
  const cap=new THREE.Mesh(new THREE.SphereGeometry(0.16,16,16),rust);cap.position.z=0.09;sawBlade.add(cap);
  sawBlade.position.y=-0.1;sawGroup.add(sawBlade);
  sawGroup.position.set(0,7,-1.4);scene.add(sawGroup);
}

function buildProjector(){
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.32,0.7),new THREE.MeshStandardMaterial({color:0x161616,roughness:.6,metalness:.4}));
  g.add(body);
  projLens=new THREE.Mesh(new THREE.CircleGeometry(0.11,20),new THREE.MeshBasicMaterial({color:0xffffff}));
  projLens.position.set(0,0,-0.36);projLens.rotation.y=Math.PI;g.add(projLens);
  g.position.set(1.9,0.2,-0.4);g.rotation.y=0.5;scene.add(g);
  projLight=new THREE.SpotLight(0xffffff,0,8,0.45,0.5,1.5);
  projLight.position.set(1.9,0.45,-0.4);projLight.target.position.set(0,0,0.4);
  scene.add(projLight,projLight.target);
}
function aimProjector(){
  if(!projLight||!G) return;
  const onPlayer = G.turn==='player';
  projLight.target.position.set(0,0, onPlayer?PLAYER_Z:BOT_Z+0.3);
  const active = G.phase==='play';
  projLight.intensity = active?2.6:0;
  projLens.material.color.setRGB(active?1:0.2,active?1:0.2,active?1:0.2);
}

/* sparks at scratch */
function spawnSparks(x,y,z){
  const mat=new THREE.MeshBasicMaterial({color:0xffd27a});
  for(let i=0;i<18;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(0.02,4,4),mat);
    s.position.set(x,y,z);s.vel=new THREE.Vector3((Math.random()-.5)*0.12,Math.random()*0.12,(Math.random()-.5)*0.12);
    s.life=0.5+Math.random()*0.3;scene.add(s);sparks.push(s);}
}
function bloodSplatTex(){
  const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');
  x.clearRect(0,0,256,256);
  for(let i=0;i<160;i++){const a=Math.random()*7,d=Math.random()*120;const r=2+Math.random()*16;
    x.fillStyle='rgba('+(110+Math.random()*60|0)+',0,0,'+(0.4+Math.random()*0.5)+')';
    x.beginPath();x.arc(128+Math.cos(a)*d,128+Math.sin(a)*d,r,0,7);x.fill();}
  const t=new THREE.CanvasTexture(c);return t;
}
const CONFETTI_COLORS=[0xff5c5c,0xffd23f,0x4cd964,0x3fa9ff,0xb06cff,0xff7fd4,0xffffff,0xff9f40];
function spawnConfetti(x,y,z,n){
  for(let i=0;i<n;i++){
    const col=CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)];
    const s=new THREE.Mesh(new THREE.PlaneGeometry(0.06,0.09),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}));
    s.position.set(x+(Math.random()-.5)*0.5,y,z+(Math.random()-.5)*0.4);
    s.rotation.set(Math.random()*6,Math.random()*6,Math.random()*6);
    s.vel=new THREE.Vector3((Math.random()-.5)*0.12,0.07+Math.random()*0.13,(Math.random()-.5)*0.12);
    s.spin=new THREE.Vector3((Math.random()-.5)*0.35,(Math.random()-.5)*0.35,(Math.random()-.5)*0.35);
    s.life=2.6+Math.random()*1.4;s.blood=true;s.confetti=true;scene.add(s);sparks.push(s);
  }
}
function confettiBurst(){
  let n=0;const bi=setInterval(()=>{
    spawnConfetti(0,2.5,-1.2,18);    // rains down from above the table
    spawnConfetti(0,1.4,-1.0,10);    // bursts up near the table
    if(++n>10)clearInterval(bi);
  },130);
}

