'use strict';
(() => {
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const W=1280,H=720,DURATION=60;
const ITEM_MAX_TILT=.12,ITEM_CLEARANCE=176;
const bgm=$('bgm');bgm.volume=.28;
document.body.append($('landing'));
const questions=[
 {category:'建築節能',text:'夏天吹冷氣時，室內溫度設定在 26–28 度並搭配電風扇，相對節能又涼快，對不對？',answer:true,explanation:'冷氣每調高 1 度就能省約 6% 的電喔！'},
 {category:'生物多樣性',text:'一座森林裡如果住著鳥類、青蛙、蜜蜂和許多不同種類的動植物（生物多樣性高），面對乾旱或病蟲害時，會比只有單一種樹木的森林更有抵抗力，對不對？',answer:true,explanation:'物種越豐富多元，大自然的抗災免疫力就越強！'},
 {category:'氣候風險',text:'在氣候風險中，「暴露度」是指有很多居民、學校、房子和馬路剛好位在容易淹水或土石流等危險區域內，請問是否正確？',answer:true,explanation:'沒錯！當人與物資都在危險地盤（暴露度高），災情就會更嚴重！'}
];
let state='landing',score=0,elapsed=0,spawn=0,stageTime=0,bossIndex=0,bossRemaining=5,answered=false,selectedQuestions=[],items=[],particles=[],floats=[],playerX=225,targetX=225,clock=0,last=0,returnState='playing',keys=new Set(),muted=false,audio=null,catchBounce=0,warningSecond=0;
const itemImages=Art.icons.map(i=>{const im=new Image();im.src=i.src;return im;});
const playerImage=new Image();playerImage.src='assets/player-boy.png';
const leaves=Array.from({length:15},()=>({x:Math.random()*W,y:Math.random()*H,s:4+Math.random()*5,v:9+Math.random()*12,p:Math.random()*6.28}));
function show(id,visible){$(id).hidden=!visible;}
function screen(next){for(const id of ['landing','countdown','paused','boss','result'])show(id,id===next);const active=['playing','boss','paused','countdown'].includes(next);show('hud',active);show('quit',active);show('game-hint',next==='playing');document.body.classList.toggle('at-home',next==='landing');state=next;updateBossWarning();syncMusic();}
function syncMusic(){bgm.muted=muted;if(state==='playing'&&!muted){if(bgm.paused)bgm.play()?.catch(()=>{});}else bgm.pause();}
function updateBossWarning(){
 const remaining=(bossIndex+1)*20-elapsed;
 const active=state==='playing'&&bossIndex<2&&remaining>0&&remaining<=3+1e-8;
 show('boss-warning',active);$('game-shell').classList.toggle('boss-warning-active',active);
 if(!active){warningSecond=0;return;}
 const second=Math.max(1,Math.ceil(remaining-1e-8));
 $('warning-number').textContent=second;
 if(second!==warningSecond){warningSecond=second;tone(660,.15,'triangle',.055);tone(880,.2,'triangle',.04,.15);}
}
function updateHud(){ $('score').textContent=score;$('time').textContent=Math.ceil(Math.max(0,DURATION-elapsed));$('progress').style.width=`${100*(1-elapsed/DURATION)}%`;$('hud').classList.toggle('danger',elapsed>=50); }
function initAudio(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(AC)audio=new AC();}if(audio?.state==='suspended')audio.resume().catch(()=>{});}
function tone(frequency,duration,type='sine',volume=.055,delay=0){if(!audio||muted||audio.state!=='running')return;const t=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+duration+.02);}
function sound(kind){if(kind==='good'){tone(660,.16);tone(990,.24,'sine',.05,.1);}else if(kind==='bad'){tone(140,.2,'triangle',.075);tone(95,.23,'triangle',.06,.08);}else if(kind==='boss'){[392,523,659,523].forEach((f,i)=>tone(f,.19,'triangle',.07,i*.12));}else if(kind==='win'){[523,659,784,1046].forEach((f,i)=>tone(f,.3,'sine',.07,i*.13));}else tone(490,.1);}
function reset(){initAudio();bgm.pause();bgm.currentTime=0;items=[];particles=[];floats=[];keys.clear();score=0;elapsed=0;spawn=.55;bossIndex=0;stageTime=0;playerX=targetX=W/2;selectedQuestions=[...questions].sort(()=>Math.random()-.5).slice(0,2);updateHud();$('count-number').textContent='3';screen('countdown');sound('tick');}
function beginBoss(){items=[];floats=[];bossRemaining=5;answered=false;const q=selectedQuestions[bossIndex];$('question').textContent=q.text;$('boss-category').textContent=q.category;$('boss-seconds').textContent='5';show('boss-clock',true);show('boss-feedback',false);document.querySelector('.answer-buttons').hidden=false;screen('boss');sound('boss');$('true').focus({preventScroll:true});}
function answer(value){if(state!=='boss'||answered)return;answered=true;stageTime=0;const q=selectedQuestions[bossIndex],correct=value===q.answer;score+=correct?20:-20;updateHud();document.querySelector('.answer-buttons').hidden=true;show('boss-clock',false);show('boss-feedback',true);$('feedback-title').textContent=correct?'太棒了！🎉 成功防禦氣候危機！':value===null?'時間到！⚠️ 危機擴大了！':'哎呀！⚠️ 危機擴大了！';$('explanation').textContent=`正確答案：○ 正確。${q.explanation}`;$('boss-points').textContent=correct?'+20 分':'−20 分';$('boss-points').style.color=correct?'#438052':'#d16c53';sound(correct?'win':'bad');if(correct)burst(W/2,320,true,35);else shake();$('boss-continue').focus({preventScroll:true});}
function continueBoss(){if(state!=='boss'||!answered)return false;bossIndex++;answered=false;stageTime=0;spawn=.6;keys.clear();initAudio();screen('playing');canvas.focus({preventScroll:true});return true;}
function pause(){if(!['playing','boss','countdown'].includes(state))return;returnState=state;screen('paused');keys.clear();}
function resume(){if(state!=='paused')return;initAudio();screen(returnState);}
function quit(){items=[];particles=[];floats=[];keys.clear();score=0;elapsed=0;bossIndex=0;stageTime=0;bossRemaining=5;answered=false;selectedQuestions=[];catchBounce=0;screen('landing');bgm.currentTime=0;updateHud();$('start').focus({preventScroll:true});}
function finish(){items=[];keys.clear();screen('result');$('final-score').textContent=score;const win=score>=100;$('result-medal').textContent=win?'🏅':'🌱';$('result-title').textContent=win?'超級氣候小院士':'低碳生活小尖兵';$('result-message').textContent=win?'恭喜你！🎉 積分達標，獲得精美小禮物資格！':'差一點點！再試一次，挑戰 100 分拿禮物！';show('reward',win);sound(win?'win':'good');if(win)burst(W/2,150,true,65);$('again').focus({preventScroll:true});}
function shake(){const shell=$('game-shell');shell.classList.remove('shake');void shell.offsetWidth;shell.classList.add('shake');}
function burst(x,y,good,count=16){for(let i=0;i<count;i++)particles.push({x,y,vx:(Math.random()-.5)*230,vy:-80-Math.random()*180,life:.65+Math.random()*.4,max:1,color:good?['#f5cf58','#8dbe69','#fff7c5'][i%3]:['#e79172','#efbb8e'][i%2],size:3+Math.random()*5});}
function spawnItem(){
 // A card reserves its horizontal corridor until it leaves the screen or is
 // caught. Faster cards cannot overtake and overlap cards further below.
 const positions=Array.from({length:7},(_,i)=>100+i*180+(Math.random()-.5)*4);
 const available=positions.filter(x=>items.every(item=>Math.abs(item.x-x)>=ITEM_CLEARANCE));
 if(!available.length)return false;
 const x=available[Math.floor(Math.random()*available.length)],good=Math.random()<.7;
 const group=Art.icons.map((i,n)=>({...i,n})).filter(i=>i.good===good),icon=group[Math.floor(Math.random()*group.length)];
 items.push({x,y:-80,vy:125+Math.random()*40+elapsed*.75,angle:(Math.random()-.5)*.09,spin:(Math.random()-.5)*.035,n:icon.n,good,index:icon.index,hit:false});
 return true;
}
function caught(item){score+=item.good?10:-10;catchBounce=1;updateHud();burst(item.x,item.y,item.good);floats.push({x:item.x,y:item.y-10,text:item.good?'+10':'−10',life:.9,good:item.good});sound(item.good?'good':'bad');if(!item.good)shake();}
function roundRect(x,y,w,h,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function background(){const gradient=ctx.createLinearGradient(0,0,0,H);gradient.addColorStop(0,'#66c9f0');gradient.addColorStop(.55,'#b4e8ff');gradient.addColorStop(1,'#e4f7ed');ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#fff0ae';ctx.beginPath();ctx.arc(W-180,145,57,0,Math.PI*2);ctx.fill();
 for(const c of [{x:105,y:135,s:1.3},{x:420,y:218,s:.9},{x:890,y:105,s:1.1},{x:1050,y:260,s:.8}]){ctx.save();ctx.translate((c.x+clock*4)%(W+160)-40,c.y);ctx.scale(c.s,c.s);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.ellipse(0,0,43,15,0,0,7);ctx.ellipse(23,-12,23,21,0,0,7);ctx.ellipse(51,0,34,15,0,0,7);ctx.fill();ctx.restore();}
 ctx.fillStyle='#a7d892';ctx.beginPath();ctx.moveTo(0,470);ctx.bezierCurveTo(240,375,400,540,650,455);ctx.bezierCurveTo(900,375,1100,440,W,450);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
 ctx.fillStyle='#80c66e';ctx.beginPath();ctx.moveTo(0,570);ctx.bezierCurveTo(260,470,500,560,740,510);ctx.bezierCurveTo(960,470,1100,540,W,510);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
 ctx.save();ctx.globalAlpha=.3;ctx.strokeStyle='#799f68';ctx.lineWidth=4;for(const t of [{x:190,y:370,s:1},{x:990,y:365,s:1.2},{x:1090,y:420,s:.7}]){ctx.save();ctx.translate(t.x,t.y);ctx.scale(t.s,t.s);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,120);ctx.stroke();ctx.rotate(clock*.18);for(let i=0;i<3;i++){ctx.rotate(Math.PI*2/3);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-13,-25,0,-57);ctx.quadraticCurveTo(7,-22,0,0);ctx.fillStyle='#91b27b';ctx.fill();}ctx.restore();}ctx.restore();
 for(const t of [{x:25,y:425,s:1.8},{x:1235,y:450,s:1.6},{x:106,y:535,s:1}]){ctx.save();ctx.translate(t.x,t.y);ctx.scale(t.s,t.s);ctx.strokeStyle='#91ad72';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,109);ctx.stroke();ctx.fillStyle='#9dbd76';for(const [x,y,r]of [[-12,6,25],[12,-12,28],[25,21,24],[-13,29,25],[6,34,28]]){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}ctx.restore();}
 ctx.fillStyle='#5eac58';ctx.beginPath();ctx.ellipse(W/2,H+100,W*.8,170,0,0,7);ctx.fill();
 for(const l of leaves){ctx.save();ctx.translate(l.x+Math.sin(clock*.5+l.p)*17,l.y);ctx.rotate(Math.sin(clock*.4+l.p));ctx.fillStyle='#8eb36860';ctx.beginPath();ctx.ellipse(0,0,l.s,l.s*.4,-.5,0,7);ctx.fill();ctx.restore();}
}
function drawItem(item){ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.angle);ctx.shadowColor='#54703730';ctx.shadowBlur=12;ctx.shadowOffsetY=5;const im=itemImages[item.n];if(im.complete&&im.naturalWidth){const width=144,height=width*im.naturalHeight/im.naturalWidth;ctx.drawImage(im,-width/2,52-height,width,height);}ctx.restore();}
// 將道具的旋轉矩形轉換至頭部橢圓座標，檢查矩形與單位圓相交。
// 碰撞區僅涵蓋海報小男生的頭髮與臉，不包含身體、手或籃子。
function touchesHead(item,y,x){
 const headX=x+36,headY=H-192-catchBounce*8,rx=53,ry=49;
 const im=itemImages[item.n],ratio=im?.naturalWidth&&im?.naturalHeight?im.naturalHeight/im.naturalWidth:96/119;
 const height=144*ratio,c=Math.cos(item.angle),s=Math.sin(item.angle);
 const corners=[[-72,52-height],[72,52-height],[72,52],[-72,52]].map(([px,py])=>({x:(item.x+px*c-py*s-headX)/rx,y:(y+px*s+py*c-headY)/ry}));
 let inside=true,nearest=Infinity;
 for(let i=0;i<4;i++){
  const a=corners[i],b=corners[(i+1)%4],dx=b.x-a.x,dy=b.y-a.y;
  if(dx*(-a.y)-dy*(-a.x)<0)inside=false;
  const t=Math.max(0,Math.min(1,-(a.x*dx+a.y*dy)/(dx*dx+dy*dy)));
  nearest=Math.min(nearest,(a.x+t*dx)**2+(a.y+t*dy)**2);
 }
 return inside||nearest<=1;
}
function crossedHead(item,previousY,previousX){
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(item.y-previousY),Math.abs(playerX-previousX))/12));
 for(let step=0;step<=steps;step++){const t=step/steps;if(touchesHead(item,previousY+(item.y-previousY)*t,previousX+(playerX-previousX)*t))return true;}
 return false;
}
function render(){ctx.clearRect(0,0,W,H);background();if(state!=='landing'){
 ctx.fillStyle='#3e6f4c30';ctx.beginPath();ctx.ellipse(playerX+43,H-48,55,10,0,0,7);ctx.fill();if(playerImage.complete&&playerImage.naturalWidth)ctx.drawImage(playerImage,playerX-35,H-248-catchBounce*8,140,202);for(const item of items)drawItem(item);
 }for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.life*5);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore();}ctx.globalAlpha=1;
 for(const f of floats){ctx.globalAlpha=Math.min(1,f.life*2);ctx.fillStyle=f.good?'#387b46':'#ce644e';ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.font='900 30px "Guardian Round", sans-serif';ctx.textAlign='center';ctx.strokeText(f.text,f.x,f.y);ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;
}
function tick(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;clock+=dt;
 if(state!=='paused'){for(const l of leaves){l.y+=l.v*dt;if(l.y>H+10)l.y=-10;}for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=350*dt;}particles=particles.filter(p=>p.life>0);for(const f of floats){f.y-=55*dt;f.life-=dt;}floats=floats.filter(f=>f.life>0);catchBounce=Math.max(0,catchBounce-dt*5);}
 if(state==='countdown'){const old=Math.floor(stageTime);stageTime+=dt;const index=Math.floor(stageTime);if(index!==old&&index<4)sound('tick');$('count-number').textContent=index<3?String(3-index):'GO!';if(stageTime>=3.7){screen('playing');canvas.focus?.();}}
 else if(state==='playing'){
  const next=elapsed+dt;
  if(bossIndex<2&&next>=(bossIndex+1)*20){elapsed=(bossIndex+1)*20;beginBoss();updateHud();}
  else if(next>=DURATION){elapsed=DURATION;updateHud();finish();}
  else{elapsed=next;const previousX=playerX;const dir=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);if(dir)targetX=Math.max(90,Math.min(W-110,targetX+dir*780*dt));playerX+=(targetX-playerX)*Math.min(1,dt*16);spawn-=dt;if(spawn<=0)spawn=spawnItem() ? .63+Math.random()*.28 : .12;
   for(const item of items){const prev=item.y;item.vy+=6*dt;item.y+=item.vy*dt;item.angle=Math.max(-ITEM_MAX_TILT,Math.min(ITEM_MAX_TILT,item.angle+item.spin*dt));if(crossedHead(item,prev,previousX)){item.hit=true;caught(item);}}
   items=items.filter(i=>!i.hit&&i.y<H+60);updateHud();
  }
 }else if(state==='boss'&&!answered){bossRemaining=Math.max(0,bossRemaining-dt);$('boss-seconds').textContent=Math.ceil(bossRemaining);if(bossRemaining<=0)answer(null);}
 updateBossWarning();render();requestAnimationFrame(tick);
}
function position(e){if(state!=='playing')return;const rect=canvas.getBoundingClientRect();targetX=Math.max(90,Math.min(W-110,(e.clientX-rect.left)/rect.width*W));}
canvas.addEventListener('pointerdown',e=>{if(state==='playing'){canvas.setPointerCapture(e.pointerId);position(e);}});canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)position(e);});
// Capture runs before answer-button handlers, so the answering click cannot
// also dismiss its own feedback. A new click resumes immediately.
document.addEventListener('click',e=>{if(state!=='boss'||!answered||e.target.closest('#quit,#pause,#sound,a'))return;if(continueBoss())e.stopPropagation();},true);
document.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','a','d'].includes(k)&&state==='playing'){e.preventDefault();keys.add(k);}if(k==='Escape'){if(state==='paused')resume();else pause();}});document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase().startsWith('arrow')?e.key:e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
$('start').onclick=reset;$('again').onclick=reset;$('restart').onclick=reset;$('pause').onclick=pause;$('resume').onclick=resume;$('quit').onclick=quit;$('true').onclick=()=>answer(true);$('false').onclick=()=>answer(false);$('boss-continue').onclick=continueBoss;
$('sound').onclick=()=>{muted=!muted;$('sound').innerHTML=muted?'♪<span>音效關閉</span>':'♫<span>音效開啟</span>';$('sound').setAttribute('aria-label',muted?'開啟音效':'關閉音效');$('sound').setAttribute('aria-pressed',String(muted));syncMusic();if(!muted){initAudio();sound('good');}};
$('open-guide').onclick=$('mobile-guide').onclick=()=>$('guide-dialog').showModal();$('resources').onclick=()=>$('resource-dialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
// 高 DPI 畫布維持固定遊戲座標，縮放不影響物理或觸控位置。
function resize(){const ratio=Math.min(devicePixelRatio||1,2);canvas.width=W*ratio;canvas.height=H*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);}window.addEventListener('resize',resize);resize();requestAnimationFrame(tick);
})();
