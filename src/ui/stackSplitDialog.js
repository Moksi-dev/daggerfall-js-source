import {getPref} from '../systems/uiPrefs.js';
import { PIXEL_STACK } from './pixelifyFive.js';

export const stackSplitEnabled=()=>getPref('ketaStackSplit')===true;
export const isStackSplitClick=e=>!!(e?.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey&&(e.button??0)===0);
export function splitQuantity(text,max){
  if(!/^\d+$/.test(String(text)))return null;
  const n=Number(text);return Number.isSafeInteger(n)&&n>=1&&n<=max?n:null;
}
const CSS=`
dialog.keta-stack-split {width:min(500px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:14px;height:fit-content;position:fixed;box-sizing:border-box;font-family:${PIXEL_STACK};color:#d8cfae;}
dialog.keta-stack-split::backdrop {background:rgba(0,0,0,.4);}
.keta-stack-split .dlg-btn {min-width:36px;padding:6px 12px;}
.keta-stack-split h2 {margin-bottom:8px;}
.keta-stack-split .split-name {overflow-wrap:anywhere;margin:4px 0 12px;}
.keta-stack-split .split-controls {display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.keta-stack-split label {display:flex;align-items:center;gap:6px;}
.keta-stack-split .split-number {width:90px;box-sizing:border-box;font:inherit;padding:6px;}
.keta-stack-split .split-slider {flex:1 1 130px;min-width:100px;}
.keta-stack-split .split-actions {display:flex;justify-content:flex-end;gap:8px;margin-top:12px;}
.keta-stack-split .split-status {display:block;min-height:1.4em;margin-top:10px;}
`;

// Owned by an inventory/trade view; no global polling, frame callbacks or listeners.
// The owning view routes its key handler here so Escape closes only this dialog.
export function createStackSplitDialog(){
  let active=null;
  const close=()=>{
    const old=active;if(!old)return;active=null;
    if(old.dialog.open)old.dialog.close();old.dialog.remove();
    if(old.focus?.isConnected)old.focus.focus();
  };
  return {
    get active(){return !!active;},close,
    key(e){
      if(!active)return false;
      e.stopImmediatePropagation?.();
      if(e.key==='Escape'||e.code==='Escape'){e.preventDefault();close();}
      else if((e.key==='Enter'||e.code==='Enter')&&!['BUTTON'].includes(e.target?.tagName)){e.preventDefault();active.confirm();}
      return true;
    },
    open({owner,name,destination,getMax,getTotal,onConfirm}){
      close();const doc=owner?.ownerDocument??globalThis.document;if(!doc)return false;
      const maximum=()=>{try{const n=Number(getMax());return Number.isSafeInteger(n)&&n>0?n:0;}catch{return 0;}};
      const max=maximum();if(max<1)return false;
      if(!doc.getElementById('keta-stack-split-style')){const style=doc.createElement('style');style.id='keta-stack-split-style';style.textContent=CSS;doc.head.append(style);}
      const make=(tag,cls,text)=>{const n=doc.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;};
      const dialog=make('dialog','keta-stack-split dlg-win px-win');dialog.setAttribute('aria-label','Split stack');
      const heading=make('h2',null,'Split stack'),title=make('p','split-name',name),controls=make('div','split-controls');
      const label=make('label',null,'Quantity'),number=make('input','split-number');number.type='text';number.inputMode='numeric';number.setAttribute('aria-label','Split quantity');
      const minus=make('button','dlg-btn','−'),plus=make('button','dlg-btn','+'),slider=make('input','split-slider');
      minus.type=plus.type='button';minus.setAttribute('aria-label','Decrease quantity');plus.setAttribute('aria-label','Increase quantity');
      slider.type='range';slider.min='1';slider.step='1';slider.max=String(max);slider.setAttribute('aria-label','Split quantity slider');
      const status=make('small','split-status'),actions=make('div','split-actions'),cancel=make('button','dlg-btn','Cancel'),confirm=make('button','dlg-btn','Move');
      status.setAttribute('aria-live','polite');cancel.type=confirm.type='button';confirm.setAttribute('aria-label','Confirm split transfer');
      const sync=()=>{
        const cap=maximum(),n=splitQuantity(number.value,cap);slider.max=String(Math.max(1,cap));
        confirm.disabled=n===null;number.setAttribute('aria-invalid',String(n===null));if(n!==null)slider.value=String(n);
        status.textContent=n===null?(cap?`Enter a whole number from 1 to ${cap}.`:'These items can no longer be moved.'):`${n} to ${destination} · ${Math.max(0,Number(getTotal())-n)} remaining`;
        minus.disabled=n===1||!cap;plus.disabled=n===cap||!cap;
      };
      const change=n=>{number.value=String(Math.max(1,Math.min(maximum()||1,n)));sync();};
      number.value=String(Math.max(1,Math.min(max,Math.floor(Number(getTotal())/2)||1)));
      number.oninput=sync;slider.oninput=()=>change(Number(slider.value));
      minus.onclick=()=>change((splitQuantity(number.value,maximum())??1)-1);plus.onclick=()=>change((splitQuantity(number.value,maximum())??0)+1);
      const submit=()=>{if(active?.dialog!==dialog)return;sync();const n=splitQuantity(number.value,maximum());if(n===null)return;close();onConfirm(n);};
      cancel.onclick=close;confirm.onclick=submit;dialog.oncancel=e=>{e.preventDefault();close();};
      label.append(number);controls.append(label,minus,plus,slider);actions.append(cancel,confirm);dialog.append(heading,title,controls,status,actions);
      active={dialog,confirm:submit,focus:doc.activeElement};doc.body.append(dialog);sync();dialog.showModal();number.focus();number.select();return true;
    },
  };
}
