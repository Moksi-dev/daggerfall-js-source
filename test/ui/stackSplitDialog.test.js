import test from 'node:test';
import assert from 'node:assert/strict';
import {splitQuantity,isStackSplitClick} from '../../src/ui/stackSplitDialog.js';
test('split quantity accepts only whole positive counts within current capacity',()=>{
  assert.equal(splitQuantity('75',150),75);assert.equal(splitQuantity('1',1),1);
  for(const text of ['',0,-1,'1.5','2e1','Infinity','NaN',' 2','151','9007199254740992'])assert.equal(splitQuantity(text,150),null);
  assert.equal(splitQuantity('75',50),null);
});
test('Ctrl left-click split excludes bulk gesture and other buttons/modifiers',()=>{
  const e={ctrlKey:true,button:0};assert.ok(isStackSplitClick(e));
  for(const change of [{ctrlKey:false},{shiftKey:true},{altKey:true},{metaKey:true},{button:2}])assert.equal(isStackSplitClick({...e,...change}),false);
});
