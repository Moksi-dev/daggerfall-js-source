import {build} from 'esbuild';
import {chromium} from 'playwright';
const bundle=await build({stdin:{contents:`export {DeathBeacon} from './src/render/deathBeacon.js';export {createOverworldBeaconHost} from './src/scenes/overworldBeaconHost.js';`,resolveDir:process.cwd()},bundle:true,format:'iife',globalName:'Beacons',write:false});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage();
  await page.route('**/*',r=>r.abort());
  await page.setContent('<canvas width="256" height="256"></canvas>');
  await page.addScriptTag({content:bundle.outputFiles[0].text});
  const result=await page.evaluate(async()=>{
    const checks=[],check=(yes,label)=>{if(!yes)throw Error(label);checks.push(label);};
    const canvas=document.querySelector('canvas'),gl=canvas.getContext('webgl2',{preserveDrawingBuffer:true});
    check(!!gl,'WebGL2 available');
    const view=new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
    const proj=new Float32Array([1,0,0,0,0,1,0,0,0,0,-1,-1,0,0,-.2,0]);
    const renderer={gl,_view:view,_proj:proj,endUiRun(){},markForeignPass(){}};
    gl.viewport(0,0,256,256);
    const beam=new Beacons.DeathBeacon(gl);
    const draw=(straight,time,depth=1)=>{
      gl.depthMask(true);gl.clearColor(0,0,0,0);gl.clearDepth(depth);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      beam.draw(renderer,[0,-3,-10],{height:6,width:1,opacity:.6,color:[.64,.86,1],straight,time,lowerWave:1,throughWalls:false});
      const pixels=new Uint8Array(256*256*4);gl.readPixels(0,0,256,256,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels;
    };
    const a=draw(true,0),b=draw(true,5),w1=draw(false,0),w2=draw(false,5),blocked=draw(true,0,0);
    check(a.some(v=>v>0),'Straight death beam has visible pixels');
    check(a.every((v,i)=>v===b[i]),'Death beam is static at different times');
    check(w1.some((v,i)=>v!==w2[i]),'Camp beam retains the wave');
    check(blocked.every(v=>v===0),'Opaque scenery depth blocks beam pixels');
    beam.dispose();
    let active=true,covered=false,reads=0,draws=0,largest=0,allDepth=true;
    const original=Beacons.DeathBeacon.prototype.drawMany;
    Beacons.DeathBeacon.prototype.drawMany=function(r,rows){draws++;largest=Math.max(largest,rows.length);allDepth&&=rows.every(row=>!row.throughWalls&&row.additive);return original.call(this,r,rows);};
    const host=Beacons.createOverworldBeaconHost({renderer,canvas,view:()=>({active,covered,eye:[0,30,30]}),rows:()=>{reads++;return Array.from({length:40},(_,i)=>({at:[i,0,-100],color:[1,.7,.3],time:1,straight:i%2===0}));}});
    try {
      for(let i=0;i<40;i++){host.frame();await new Promise(requestAnimationFrame);}
      check(draws>0&&largest===26,'Combined pass is capped at 26 beams');
      check(allDepth,'Raised-view beams retain depth testing and additive light');
      const before=reads;covered=true;host.frame();active=false;covered=false;host.frame();
      check(reads===before,'Covered and inactive maps do not read marker pools');
      check(gl.getError()===gl.NO_ERROR,'No GL errors after repeated combined draws');
    } finally {host.dispose();Beacons.DeathBeacon.prototype.drawMany=original;}
    return {passed:true,checks,scope:'Isolated synthetic WebGL; not live gameplay FPS.'};
  });
  console.log(JSON.stringify(result));
} finally {await browser.close();}
