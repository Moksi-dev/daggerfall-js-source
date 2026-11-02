import {build} from 'esbuild';
import {chromium} from 'playwright';
const bundle=await build({stdin:{contents:`export {mountEnhancedInventory} from './src/ui/enhanced/enhancedInventory.js';export {mountEnhancedTrade} from './src/ui/enhanced/enhancedTrade.js';export {createStackSplitDialog} from './src/ui/stackSplitDialog.js';export {setPref} from './src/systems/uiPrefs.js';`,resolveDir:process.cwd()},bundle:true,format:'iife',globalName:'SplitTest',write:false,banner:{js:'const __fixtureGlob=()=>({});'},define:{'import.meta.glob':'__fixtureGlob','import.meta.url':JSON.stringify('http://split.test/fixture.js')},external:['node:*'],logLevel:'error'});
const browser=await chromium.launch({headless:true,channel:'msedge'});
try{
  const page=await browser.newPage({viewport:{width:1200,height:800}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().url().startsWith('http://split.test/')?route.fulfill({contentType:'text/html',body:'<body><div id="host"></div></body>'}):route.abort());
  await page.goto('http://split.test/?skin=enhanced');await page.addScriptTag({content:bundle.outputFiles[0].text});
  const checks=await page.evaluate(async()=>{
    const checks=[],check=(ok,label)=>{if(!ok)throw Error(label);checks.push(label);};
    const host=document.querySelector('#host'),pause=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    let view,entity,hooks,commits,exits;
    const stack=extra=>({group:'Weapons',templateIndex:114,name:'Arrows',material:0,weightInKg:.02,stackCount:100,currentCondition:100,maxCondition:100,value:2,...extra});
    const total=items=>items.filter(it=>it.templateIndex===114).reduce((n,it)=>n+(it.stackCount??1),0);
    const open=async({pack=[],wagon=[],container=[],trade=false,mode='Sell',shelf=[]}={})=>{
      view?.unmount();commits=0;exits=0;entity={name:'Test',career:{name:'Warrior'},stats:{strength:100,endurance:50},items:[{templateIndex:93,group:'Transportation'},...pack],wagonItems:wagon,goldPieces:10000};
      SplitTest.setPref('ketaStackSplit',true);SplitTest.setPref('plusItemHover',false);
      hooks=trade?{mode,entity,packItems:()=>entity.items,shelfItems:()=>shelf,accepts:()=>true,isEquipped:()=>false,priceCtx:()=>({quality:0,skills:{}}),gold:()=>10000,weight:()=>({}),commit:()=>commits++,onExit:()=>exits++}:{entity,items:()=>entity.items,wagonItems:()=>entity.wagonItems,loot:{items:()=>container,storage:true},onExit:()=>exits++};
      view=trade?SplitTest.mountEnhancedTrade(host,hooks):SplitTest.mountEnhancedInventory(host,hooks);await pause();
    };
    const button=async text=>{const b=[...host.querySelectorAll('button')].find(b=>b.textContent===text);if(!b)throw Error('Missing button '+text);b.click();await pause();};
    const press=async(item,{trade=false,side='remote'}={})=>{
      const row=[...host.querySelectorAll('.itemrow')].find(r=>trade?r._tradeItem===item:r._padItem===item&&r._padFrom===side);
      if(!row)throw Error('Missing stack row '+JSON.stringify({trade,side,rows:[...host.querySelectorAll('.itemrow')].map(r=>r.textContent)}));
      row.dispatchEvent(new MouseEvent('click',{bubbles:true,button:0,ctrlKey:true}));await pause();
    };
    const dialog=()=>document.querySelector('dialog.keta-stack-split'),input=()=>dialog()?.querySelector('.split-number');
    const amount=n=>{input().value=String(n);input().dispatchEvent(new Event('input',{bubbles:true}));};
    const confirm=async()=>{dialog().querySelector('[aria-label="Confirm split transfer"]').click();await pause();};
    const key=async key=>{input().dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key,code:key}));await pause();};
    try{
      const arrows=stack();await open({wagon:[arrows]});await button('Wagon');
      hooks.loot.commit=()=>{commits++;return false;};await press(arrows);
      check(dialog().getBoundingClientRect().height<400,'Quantity dialog fits its content without a full-size inventory panel');
      check(!!dialog()&&input().value==='50'&&total(entity.wagonItems)===100,'Ctrl-click opens half-stack default without moving anything');
      dialog().querySelector('[aria-label="Increase quantity"]').click();check(input().value==='51','Plus changes quantity');
      dialog().querySelector('[aria-label="Decrease quantity"]').click();check(input().value==='50','Minus changes quantity');
      const slider=dialog().querySelector('.split-slider');slider.value='25';slider.dispatchEvent(new Event('input',{bubbles:true}));check(input().value==='25','Slider and quantity stay synchronized');
      amount('1.5');check(dialog().querySelector('[aria-label="Confirm split transfer"]').disabled,'Fractional quantity cannot commit');
      await key('Escape');check(!dialog()&&exits===0&&total(entity.wagonItems)===100,'Escape closes only split dialog and moves nothing');
      await press(arrows);amount(25);await key('Enter');
      check(!dialog()&&total(entity.wagonItems)===75&&total(entity.items)===25,'Enter transfers selected wagon quantity once');check(commits===0,'Wagon split does not call an unrelated container commit');
      const taken=entity.items.find(it=>it.templateIndex===114);await press(taken,{side:'local'});amount(10);await confirm();
      check(total(entity.wagonItems)===85&&total(entity.items)===15,'Partial pack-to-wagon transfer preserves total and merges compatible stack');
      SplitTest.setPref('ketaStackSplit',false);await press(entity.wagonItems.find(it=>it.templateIndex===114));check(!dialog()&&total(entity.wagonItems)<85&&total(entity.wagonItems)+total(entity.items)===100,'Disabled shortcut retains the native quantity-field row action');
      const loot=stack();await open({container:[loot]});hooks.loot.commit=(dir,item,n,apply)=>{commits++;check(dir==='take'&&n===12,'Container native commit receives exact chosen quantity');apply();};await press(loot);amount(12);await confirm();
      check(commits===1&&total(entity.items)===12&&loot.stackCount===88,'Container partial take uses native transaction');
      const sell=stack();await open({pack:[sell],trade:true});await press(sell,{trade:true});amount(20);await confirm();
      check(total(entity.items)===80&&commits===0,'Sell split stages selected amount without selling');await button('Clear');check(total(entity.items)===100,'Clearing staged sale restores partial stack');
      const buy=stack(),shelf=[buy];await open({trade:true,mode:'Buy',shelf});await press(buy,{trade:true});amount(8);await confirm();check(buy.stackCount===92&&commits===0,'Buy split stages eight items without committing a purchase');view.unmount();view=null;check(total(shelf)===100,'Closing Buy restores staged quantity');
      const single=stack({stackCount:1});await open({wagon:[single]});await button('Wagon');await press(single);check(!dialog()&&total(entity.wagonItems)===1,'Single item does not open split or transfer');
      const pending=stack();await open({wagon:[pending]});await button('Wagon');await press(pending);view.unmount();view=null;check(!dialog()&&pending.stackCount===100,'Owner unmount removes modal without mutation');
      const controller=SplitTest.createStackSplitDialog();let cap=100,applied=0;
      controller.open({owner:host,name:'Arrows',destination:'wagon',getMax:()=>cap,getTotal:()=>100,onConfirm:n=>applied+=n});amount(40);cap=20;await confirm();check(!!dialog()&&applied===0&&dialog().querySelector('[aria-label="Confirm split transfer"]').disabled,'Capacity shrink invalidates stale quantity at confirmation');
      amount(10);const staleButton=dialog().querySelector('[aria-label="Confirm split transfer"]');await confirm();staleButton.click();check(applied===10,'Detached old confirmation cannot transfer twice');
      controller.open({owner:host,name:'Arrows',destination:'wagon',getMax:()=>100,getTotal:()=>100,onConfirm:n=>applied+=n});dialog().querySelector('.split-actions button').click();check(!dialog()&&applied===10,'Cancel does not transfer');controller.close();
      return checks;
    }finally{view?.unmount();}
  });
  if(errors.length)throw Error(errors.join('; '));
  console.log(JSON.stringify({passed:true,checks,scope:'Synthetic native inventory/trade views in isolated headless Edge; no live account or game.'}));
}finally{await browser.close();}
