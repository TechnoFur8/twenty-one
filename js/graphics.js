/* ====================================================================
   CANVAS TEXTURES
==================================================================== */
function parchmentFace(num){
  const c=document.createElement('canvas');c.width=256;c.height=358;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,358);g.addColorStop(0,'#d9cfb4');g.addColorStop(.5,'#cdbf9f');g.addColorStop(1,'#c3b48f');
  x.fillStyle=g;x.fillRect(0,0,256,358);
  // vertical streaks
  x.globalAlpha=.10;for(let i=0;i<40;i++){x.fillStyle=Math.random()<.5?'#7a6f53':'#efe6cc';x.fillRect(Math.random()*256,0,1.5,358);}
  // dirt grain
  x.globalAlpha=.07;for(let i=0;i<200;i++){x.fillStyle='#3a3020';x.fillRect(Math.random()*256,Math.random()*358,2,2);}
  // blood specks
  x.globalAlpha=.5;for(let i=0;i<60;i++){x.fillStyle='#7a1410';const r=1+Math.random()*2.4;x.beginPath();x.arc(Math.random()*256,Math.random()*358,r,0,7);x.fill();}
  x.globalAlpha=1;
  // brushy number
  x.fillStyle='#141008';x.textAlign='center';x.textBaseline='middle';
  x.save();x.translate(128,178);x.rotate((Math.random()-.5)*.05);
  x.font='900 180px Georgia,serif';x.fillText(num,0,0);
  // brush overstroke
  x.globalAlpha=.25;x.font='900 188px Georgia';x.fillText(num,2,3);x.restore();
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;return tex;
}
function cardBack(label){
  const c=document.createElement('canvas');c.width=256;c.height=358;const x=c.getContext('2d');
  x.fillStyle='#1a1a1a';x.fillRect(0,0,256,358);
  x.strokeStyle='#2c2c2c';x.lineWidth=2;for(let i=-358;i<256;i+=14){x.beginPath();x.moveTo(i,0);x.lineTo(i+358,358);x.stroke();}
  x.strokeStyle='#3a3a3a';x.lineWidth=5;x.strokeRect(12,12,232,334);
  x.fillStyle='#cfcfcf';x.textAlign='center';x.textBaseline='middle';
  x.font='44px Georgia';x.fillText('\u2660',128,150);
  if(label){x.font='900 70px "Courier New"';x.fillText(label,128,230);}
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;return tex;
}
function overkillCardTex(){
  const c=document.createElement('canvas');c.width=256;c.height=358;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,358);g.addColorStop(0,'#3a0606');g.addColorStop(1,'#150202');
  x.fillStyle=g;x.fillRect(0,0,256,358);x.strokeStyle='#7a1010';x.lineWidth=5;x.strokeRect(8,8,240,342);
  x.fillStyle='#ff3030';x.textAlign='center';x.textBaseline='middle';
  x.font='900 150px Georgia';x.fillText('?',128,150);
  x.font='900 28px "Courier New"';x.fillText('OVERKILL',128,280);
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=4;return tex;
}
function trumpCardTex(key){
  const c=document.createElement('canvas');c.width=200;c.height=260;const x=c.getContext('2d');
  x.fillStyle='#f1f1ec';x.fillRect(0,0,200,260);x.strokeStyle='#9a9a9a';x.lineWidth=4;x.strokeRect(6,6,188,248);
  x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';
  const ICON={c2:'2',c3:'3',c4:'4',c5:'5',c6:'6',c7:'7',bless:'\u2620',bloodshed:'\u2738',
    go17:'17',go24:'24',go27:'27',oneUp:'\u25B2',twoUp:'\u23EB',shield:'\u25C9',shieldPlus:'\u25C9+'};
  x.font='900 120px "Courier New"';x.fillText(ICON[key]||'\u2605',100,120);
  x.font='700 22px "Courier New"';x.fillText('BET',100,205);
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=2;return tex;
}
function tableTex(){
  const c=document.createElement('canvas');c.width=1024;c.height=1024;const x=c.getContext('2d');
  const g=x.createRadialGradient(512,512,80,512,512,740);g.addColorStop(0,'#222c24');g.addColorStop(.55,'#1b231d');g.addColorStop(1,'#101610');
  x.fillStyle=g;x.fillRect(0,0,1024,1024);
  // felt noise (desaturated, dark)
  for(let i=0;i<90000;i++){const v=Math.random()*0.22;x.fillStyle='rgba('+(18+Math.random()*26|0)+','+(30+Math.random()*26|0)+','+(24+Math.random()*20|0)+','+v+')';x.fillRect(Math.random()*1024,Math.random()*1024,2,2);}
  // worn rub-patches (lighter bald felt)
  x.globalAlpha=.16;for(let i=0;i<22;i++){x.fillStyle='#39433a';x.beginPath();x.ellipse(Math.random()*1024,Math.random()*1024,50+Math.random()*150,30+Math.random()*90,Math.random()*6,0,7);x.fill();}
  // scratches
  x.globalAlpha=.22;for(let i=0;i<70;i++){x.strokeStyle='#080c09';x.lineWidth=0.6+Math.random()*2.6;x.beginPath();const sx=Math.random()*1024,sy=Math.random()*1024;x.moveTo(sx,sy);x.lineTo(sx+(Math.random()-.5)*320,sy+(Math.random()-.5)*150);x.stroke();}
  // dirt smudges
  for(let i=0;i<26;i++){x.fillStyle='rgba(6,9,6,'+(0.12+Math.random()*0.25)+')';x.beginPath();x.ellipse(Math.random()*1024,Math.random()*1024,40+Math.random()*150,30+Math.random()*100,Math.random()*6,0,7);x.fill();}
  // grime ring near center
  x.globalAlpha=.2;x.strokeStyle='#0a0f0b';x.lineWidth=30;x.beginPath();x.arc(512,560,300,0,7);x.stroke();
  // blood stains
  x.globalAlpha=1;
  x.globalAlpha=1;
  // faint spade emblem (no text)
  x.save();x.translate(512,648);x.fillStyle='rgba(14,20,15,.4)';x.textAlign='center';x.textBaseline='middle';
  x.font='80px Georgia';x.fillText('\u2660',0,0);x.restore();
  x.globalAlpha=1;
  // heavy edge vignette
  const vg=x.createRadialGradient(512,512,360,512,512,720);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=vg;x.fillRect(0,0,1024,1024);
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=8;return tex;
}
function tvTex(text,color){
  const c=document.createElement('canvas');c.width=512;c.height=320;const x=c.getContext('2d');
  x.fillStyle='#0c0f0c';x.fillRect(0,0,512,320);
  for(let y=0;y<320;y+=3){x.fillStyle='rgba(200,220,200,'+(0.04+Math.random()*0.05)+')';x.fillRect(0,y,512,2);}
  x.globalAlpha=.1;for(let i=0;i<700;i++){x.fillStyle='#fff';x.fillRect(Math.random()*512,Math.random()*320,2,2);}x.globalAlpha=1;
  if(text){x.fillStyle=color||'#e7e7e2';x.textAlign='center';x.textBaseline='middle';
    x.shadowColor=color||'#fff';x.shadowBlur=20;
    const lines=String(text).split('\n');
    lines.forEach((ln,i)=>{
      const longest=Math.max(...lines.map(s=>s.length));
      const fs=longest>8?54:longest>6?68:84;
      x.font='900 '+fs+'px "Courier New"';
      x.fillText(ln,256,160+(i-(lines.length-1)/2)*(fs+8));
    });
    x.shadowBlur=0;}
  const tex=new THREE.CanvasTexture(c);tex.anisotropy=2;return tex;
}
function counterTex(bet,opp,you){
  const c=document.createElement('canvas');c.width=256;c.height=256;const x=c.getContext('2d');
  x.fillStyle='#0a0a0a';x.fillRect(0,0,256,256);
  function cell(px,py,w,h,val,col){x.fillStyle='#000';x.fillRect(px,py,w,h);x.strokeStyle='#262626';x.lineWidth=3;x.strokeRect(px,py,w,h);
    x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';x.font='900 58px "Courier New"';x.fillText((val<10?'0':'')+val,px+w/2,py+h/2);}
  cell(18,90,90,120,bet,'#ff3b3b');cell(140,40,96,90,opp,'#fff');cell(140,135,96,90,you,'#fff');
  const tex=new THREE.CanvasTexture(c);return tex;
}
