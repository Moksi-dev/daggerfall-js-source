import { DeathBeacon } from '../render/deathBeacon.js';
import { startPrograms, releasePrograms } from '../render/glProgram.js';
import { overworldBeaconRow } from '../systems/navigationBeaconStyle.js';

// Runs at the native post-opaque seam. A single bounded pass; no timers or HUD beams.
export function createOverworldBeaconHost({renderer,canvas,view,rows}) {
  let pass=null, ready=null, failed=false;
  const lost=()=>{pass=null;ready=null;failed=false;};
  canvas.addEventListener('webglcontextlost',lost);
  return {
    frame() {
      const state=view();
      if(!state?.active||state.covered||failed||renderer.gl.isContextLost())return;
      const points=rows().slice(0,26).map(row=>overworldBeaconRow(row.at,state.eye,row)).filter(Boolean);
      if(!points.length)return;
      try {
        ready??=startPrograms(renderer.gl,DeathBeacon.programs);
        if(!pass&&ready())pass=new DeathBeacon(renderer.gl);
        pass?.drawMany(renderer,points);
      } catch(error) {
        failed=true;
        console.warn('[Keta map beacons] Beams unavailable; map icons remain.',error);
      }
    },
    dispose() {
      pass?.dispose();
      if(ready&&!pass)releasePrograms(renderer.gl,DeathBeacon.programs);
      lost();canvas.removeEventListener('webglcontextlost',lost);
    },
  };
}
