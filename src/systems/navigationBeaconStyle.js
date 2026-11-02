// Overworld beacons are world geometry, not vertical lines painted on the HUD.
// Same eye-relative far-plane clamp as the native Fallen Star (4200 < 6000m).
export const NAV_BEACON_SKY_RADIUS = 4200;
const point = p => p?.length === 3 && Array.from(p).every(Number.isFinite);
export function overworldBeaconRow(at, eye, {height=1000,opacity=.6,color,straight=false,lowerWave=1,time=0}={}) {
  if (!point(at) || !point(eye)) return null;
  const distance=Math.hypot(...at.map((v,i)=>v-eye[i]));
  const scale=Math.min(1,NAV_BEACON_SKY_RADIUS/Math.max(1,distance));
  const maximum=Number.isFinite(height)?Math.max(100,Math.min(1000,height)):1000;
  return {at:at.map((v,i)=>eye[i]+(v-eye[i])*scale),
    height:Math.min(maximum,Math.max(30,distance*.35))*scale,
    width:Math.min(12,Math.max(.5,distance*.004))*scale,
    opacity:Number.isFinite(opacity)?Math.max(.1,Math.min(.6,opacity)):.6,
    color,straight,lowerWave,time,throughWalls:false,additive:true};
}

