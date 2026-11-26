import assert from 'node:assert/strict';
import { Motion, actions } from '../src/motion.ts';
const model = new Motion(()=>{});
const tick = n => {for(let i=0;i<n;i++) model.step(1/60)};
for (const action of Object.keys(actions)) {
  model.select(action); tick(25);
  assert.equal(model.action, action);
  assert.ok(Object.values(model.pose).every(Number.isFinite));
}
model.select('jump'); tick(32); assert.ok(model.pose.y>.6);
tick(75); assert.equal(model.action,'idle'); assert.equal(model.pose.y,0);
model.target.x=1; tick(8); assert.ok(model.pose.gazeX>0 && model.pose.gazeX<1);
model.reduced=true; model.select('read'); tick(1);
const still={...model.pose}; tick(120); assert.deepEqual(model.pose,still);
console.log('OK · poses, salto, aterrizaje, mirada y movimiento reducido');
