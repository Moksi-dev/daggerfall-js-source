// One small pixel-art pin family. The foot is the map location; icon heads
// replace the native round ball. No textures, image scaling, timers or DOM.
export const MAP_PIN_COLORS=Object.freeze({campfire:'#ffc879',tent:'#b6dc96',skull:'#a4dcff',flag:'#ffd76a',home:'#e8c98b'});
const PIXELS={
  campfire:[
    '       x        ','      xxx       ','      xox       ','   x  xoox      ',
    '   xxxxooox     ','   xooxooox x   ','  xxooooooxxx   ','  xooooooooox   ',
    '  xooooooooox   ','   xooooooox    ','    xooooox     ','     xxxxx      ',
    ' xxxxx  xxxxx   ',' xoooxxxxooox   ','  xxxooooxxx    ','     xxxx       ',
  ],
  tent:[
    '       xx       ','      xxxx      ','     xxooxx     ','    xxooooxx    ',
    '   xxoooxooxx   ','  xxoooxxxooxx  ',' xxoooxxxxxooxx ','xxoooxxxxxxxooxx',
    'xoooxxxxxxxxxoox','xxxxxxxxxxxxxxxx',
  ],
  skull:[
    '    xxxxxxxx    ','   xxooooooxx   ','  xxooooooooxx  ','  xoooooooooox  ',
    '  xooxxooxxoox  ','  xooxxooxxoox  ','  xoooo xxooox  ','   xxooooooxx   ',
    '    xoxooxox    ','    xxxxxxxx    ',
  ],
  flag:[
    '       xxxxxxxxx','       xoooooox ','       xooooox  ','       xoooox   ',
    '       xooooox  ','       xoooooox ','       xxxxxxxxx','       xx       ',
    '       xx       ','       xx       ',
  ],
  home:[
    '       xx       ','      xxxx      ','     xxooxx     ','    xxooooxx    ',
    '   xxooooooxx   ','  xxooooooooxx  ',' xxooooooooooxx ','xxxxxxxxxxxxxxxx',
    '  xoooooooooox  ','  xooxxoooxoox  ','  xooxxoooxoox  ','  xoooooxxxoox  ',
    '  xoooox xooox  ','  xoooox xooox  ','  xxxxxx xxxxx  ',
  ],
};

export function mapPinBox(x,y,size=16) {
  const scale=Math.max(.5,Math.min(2,size/16));
  return {x0:Math.round(x-8*scale)-3,x1:Math.round(x+8*scale)+3,y0:Math.round(y-24*scale)-3,y1:Math.round(y)+4};
}
export function paintMapPin(ctx,type,x,y,{color=MAP_PIN_COLORS[type],size=16,stem=true,hover=false}={}) {
  if(!PIXELS[type]||!ctx?.save||![x,y,size].every(Number.isFinite))return false;
  const pixels=PIXELS[type],scale=Math.max(.5,Math.min(2,size/16));
  const ox=x-8*scale,oy=y-((stem?16:0)+pixels.length/2)*scale;
  const t=ctx.getTransform?.(),aligned=t&&t.b===0&&t.c===0&&t.a>0&&t.d>0&&typeof ctx.setTransform==='function';
  const sx=aligned?t.a:1,sy=aligned?t.d:1,tx=aligned?t.e:0,ty=aligned?t.f:0;
  const snapX=n=>Math.round(n*sx+tx),snapY=n=>Math.round(n*sy+ty);
  const rect=(x0,y0,w,h)=>{
    const a=snapX(x0),b=snapY(y0);
    ctx.rect(a,b,Math.max(1,snapX(x0+w)-a),Math.max(1,snapY(y0+h)-b));
  };
  ctx.save();
  if(aligned)ctx.setTransform(1,0,0,1,0,0);
  ctx.shadowBlur=0;
  ctx.shadowOffsetX=0;
  ctx.shadowOffsetY=0;
  if(stem){
    ctx.fillStyle='#211b10';
    ctx.beginPath();
    rect(x-scale,oy+(pixels.length-1)*scale,3*scale,y-oy-(pixels.length-1)*scale);
    rect(x-scale,y-scale,3*scale,3*scale);
    ctx.fill();
    ctx.fillStyle='#e6d9b6';
    ctx.beginPath();
    rect(x,oy+pixels.length*scale,scale,y-oy-pixels.length*scale);
    ctx.fill();
  }
  for(const [key,tint]of [['x',hover?'#fff2b0':'#211b10'],['o',color]]){
    ctx.fillStyle=tint;
    ctx.beginPath();
    for(let j=0;j<pixels.length;j++)for(let i=0;i<pixels[j].length;i++)if(pixels[j][i]===key)rect(ox+i*scale,oy+j*scale,scale,scale);
    ctx.fill();
  }
  ctx.restore();
  return true;
}
