import test from 'node:test';
import assert from 'node:assert/strict';
import {overworldBeaconRow,NAV_BEACON_SKY_RADIUS} from '../../src/systems/navigationBeaconStyle.js';

test('world column scales with raised eye, preserves occlusion and type, and is bounded',()=>{
  const close=overworldBeaconRow([0,1.5,0],[0,30,30]);
  const far=overworldBeaconRow([0,1.5,0],[0,1000,1000]);
  assert.ok(far.height>close.height);assert.ok(far.width>close.width);
  assert.equal(far.throughWalls,false);assert.equal(far.additive,true);
  assert.equal(far.opacity,.6);assert.equal(far.straight,false);
  const death=overworldBeaconRow([0,0,0],[0,500,500],{straight:true,height:100,opacity:.4});
  assert.equal(death.straight,true);assert.equal(death.height,100);assert.equal(death.opacity,.4);
  assert.equal(overworldBeaconRow([NaN,0,0],[0,0,0]),null);
  assert.equal(overworldBeaconRow([0,0,0],null),null);
});
test('Fallen Star style far clamp preserves direction and apparent beam size',()=>{
  const eye=[10,100,30],at=[10000,0,10000],distance=Math.hypot(...at.map((v,i)=>v-eye[i]));
  const row=overworldBeaconRow(at,eye),s=NAV_BEACON_SKY_RADIUS/distance;
  assert.ok(Math.abs(Math.hypot(...row.at.map((v,i)=>v-eye[i]))-4200)<1e-8);
  row.at.forEach((v,i)=>assert.ok(Math.abs((v-eye[i])-(at[i]-eye[i])*s)<1e-8));
  assert.ok(Math.abs(row.height/s-1000)<1e-8);assert.ok(Math.abs(row.width/s-12)<1e-8);
});
