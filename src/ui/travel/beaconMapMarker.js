import {paintMapPin,mapPinBox,MAP_PIN_COLORS} from '../map/mapPin.js';
// Small map annotations, drawn on the existing HUD canvas. No DOM tiles, timers,
// animated effects, extra render passes or persistent location tracking.
const TYPES=new Set(['campfire','tent','skull','flag','home']);
const COLORS=MAP_PIN_COLORS;
export const beaconKind=m=>TYPES.has(m?.beaconIcon)?m.beaconIcon:m?.deathId?'skull':null;
const short=value=>String(value??'').slice(0,30);
const distanceText=n=>n<1000?`${Math.round(n)} m`:`${(n/1000).toFixed(n<10000?1:0)} km`;
export function projectBeaconMarker(mark,feet){
  const type=beaconKind(mark);if(!type)return {};
  const valid=p=>p?.length===3&&Array.from(p).every(Number.isFinite);
  const distance=valid(mark.at)&&valid(feet)?Math.hypot(...mark.at.map((n,i)=>n-feet[i])):NaN;
  return {beaconIcon:type,beaconBeam:mark.beaconBeam!==false,
    beaconOpacity:Number.isFinite(mark.beaconOpacity)?Math.max(.1,Math.min(.6,mark.beaconOpacity)):.6,
    ...(mark.deathId?{deathId:mark.deathId}:{}),sub:Number.isFinite(distance)?distanceText(distance):short(mark.sub)};
}
export function beaconMapBox(q,vw){
  const half=q.held?12:Math.min(90,Math.max(14,Math.max(short(q.m.label).length,short(q.m.sub).length)*3.5+6));
  const cx=Math.max(half,Math.min(vw-half,q.x));
  return{x0:cx-half,x1:cx+half,y0:q.held?q.y-12:mapPinBox(q.x,q.y).y0,y1:q.y+(q.held?12:44)};
}
export function paintBeaconMapMarker(ctx,q,vw,font='system-ui, sans-serif'){
  const type=beaconKind(q.m);if(!type)return false;
  const{x,y,m}=q,color=/^#[\da-f]{6}$/i.test(m.color??'')?m.color:COLORS[type];
  ctx.save();ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  // The existing world render pass draws the beam through the raised camera.
  // This cached HUD canvas owns only the icon/subtext, never a fake screen beam.
  paintMapPin(ctx,type,x,y,{color,stem:!q.held});
  if(!q.held){
    const cx=Math.round(Math.max(90,Math.min(vw-90,x)));
    ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=2.5;ctx.strokeStyle='#17191b';ctx.lineJoin='round';
    for(const[text,dy,size,tint]of [[short(m.label),14,12,color],[short(m.sub),29,11,'#e6e0d2']]){
      if(!text)continue;ctx.font=`600 ${size}px ${font}`;ctx.strokeText(text,cx,Math.round(y+dy),174);ctx.fillStyle=tint;ctx.fillText(text,cx,Math.round(y+dy),174);
    }
  }
  ctx.restore();return true;
}
