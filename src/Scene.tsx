import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei/core/RoundedBox.js';
import * as T from 'three';
import { Motion } from './motion';

function inkBody() {
  const geometry=new T.SphereGeometry(1,48,36);
  const pos=geometry.attributes.position;
  const morph:number[]=[];
  for(let i=0;i<pos.count;i++) {
    const x=pos.getX(i), y=pos.getY(i), z=pos.getZ(i);
    const angle=Math.atan2(z,x);
    const crown=Math.max(0,y)**3;
    const rim=(1-y*y)*(.055*Math.cos(3*angle+.7)+.04*Math.sin(4*angle+y*2));
    const px=x*(.82-.2*y+rim)+.3*crown;
    const py=y*.87+.42*crown+.065*x;
    const pz=z*(.67-.12*y+rim);
    pos.setXYZ(i,px,py,pz);
    morph.push(px*(1.13+.2*Math.sin(3*angle)*(1-y*y)),py+.18*Math.cos(3*angle)*(1-y*y),pz*1.19);
  }
  geometry.morphAttributes.position=[new T.Float32BufferAttribute(morph,3)];
  geometry.computeVertexNormals(); return geometry;
}
function Ball({position,scale,color='#17171c'}:{position?:[number,number,number],scale:[number,number,number],color?:string}) {
  return <mesh position={position} scale={scale}><sphereGeometry args={[1,24,18]}/><meshStandardMaterial color={color} roughness={.32}/></mesh>;
}
function Limb({side,arm}:{side:number,arm?:boolean}) {
  const points=arm?[[0,0,0],[.075*side,-.19,.015],[.15*side,-.37,.06],[.14*side,-.55,.13]]:
    [[0,0,0],[side*.025,-.18,0],[side*.04,-.33,.045],[side*.055,-.46,.08]];
  const curve=useMemo(()=>new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),[side,arm]);
  return <><mesh><tubeGeometry args={[curve,14,arm?.072:.09,10,false]}/><meshStandardMaterial color="#19191e" roughness={.34}/></mesh>
    <Ball position={arm?[.14*side,-.56,.13]:[.055*side,-.46,.15]} scale={arm?[.107,.145,.10]:[.155,.098,.225]}/></>;
}
function Paper() {
  return <group>{[-1,1].map(side=><group key={side} position={[side*.265,0,0]} rotation={[0,side*.17,side*.035]}>
    <RoundedBox args={[.55,.57,.014]} radius={.012} smoothness={1}><meshStandardMaterial color="#fff4db"/></RoundedBox>
    {[.185,.095,.035,-.026,-.087,-.148].map((y,i)=><mesh key={y} position={[0,y,.015]}><planeGeometry args={[i===5?.28:.41,i===0?.055:.012]}/><meshBasicMaterial color={i===0?'#b34229':'#494743'}/></mesh>)}
  </group>)}</group>;
}
export function Actor({motion,active,onFail}:{motion:Motion,active:boolean,onFail:()=>void}) {
  const rig=useRef<T.Group>(null!), torso=useRef<T.Group>(null!), body=useRef<T.Mesh>(null!), paper=useRef<T.Group>(null!);
  const eyes=useRef<(T.Group|null)[]>([]), pupils=useRef<(T.Mesh|null)[]>([]), arms=useRef<(T.Group|null)[]>([]), legs=useRef<(T.Group|null)[]>([]);
  const geometry=useMemo(inkBody,[]);
  const {gl,invalidate,viewport}=useThree();
  useEffect(()=>{const el=gl.domElement; el.addEventListener('webglcontextlost',onFail); return ()=>el.removeEventListener('webglcontextlost',onFail)},[gl,onFail]);
  useEffect(()=>{invalidate()},[motion.action,motion.reduced,active,invalidate]);
  useFrame((_,dt)=>{
    const p=motion.step(dt), g=rig.current;
    g.position.set(p.x,-1.37+p.y,0); g.rotation.set(p.lean,p.turn,p.tilt*.5);
    torso.current.scale.set(1/Math.sqrt(p.stretch),p.stretch,1); torso.current.rotation.z=p.tilt;
    body.current.morphTargetInfluences![0]=p.shape;
    for(let i=0;i<2;i++) {
      const arm=arms.current[i]!, leg=legs.current[i]!, eye=eyes.current[i]!, pupil=pupils.current[i]!;
      arm.position.z=.04+p.paper*.32;
      arm.rotation.z=i?p.rightArm:p.leftArm;
      const elbow=arm.getObjectByName('elbow');
      if(elbow) {elbow.rotation.z=(i?1:-1)*(.15+.3*Math.abs(arm.rotation.z)); elbow.rotation.x=-.4*p.paper;} arm.rotation.x=-p.paper*1.18;
      leg.rotation.x=i?p.rightLeg:p.leftLeg;
      eye.scale.y=p.blink; pupil.position.set((p.gazeX+p.scan)*.055,(p.gazeY+p.down)*.074,.069);
    }
    paper.current.visible=p.paper>.01; paper.current.scale.setScalar(p.paper);
  });
  const fit=Math.min(1,viewport.width/3.6);
  return <group scale={fit}><group ref={rig}>
    {[-1,1].map((s,i)=><group key={s} ref={v=>{legs.current[i]=v}} position={[s*.34,.54,0]}><Limb side={s}/></group>)}
    <group ref={torso} position={[0,.45,0]}>
      <mesh ref={body} args={[geometry]} position={[0,.84,0]}><meshStandardMaterial color="#16161d" metalness={.16} roughness={.30}/></mesh>
      {[-1,1].map((s,i)=><group key={s}>
        <group ref={v=>{arms.current[i]=v}} position={[s*.73,.87,.04]}><Ball position={[s*.025,-.13,0]} scale={[.09,.21,.093]}/><group name="elbow" position={[s*.04,-.26,0]} scale={[1,.66,1]}><Limb side={s} arm/></group></group>
        <group ref={v=>{eyes.current[i]=v}} position={[s*.27,1.04+s*.038,.608]} rotation={[0,s*.22,s*.095]}>
          <Ball scale={[.175,.222,.085]} color="#fff8e7"/><mesh ref={v=>{pupils.current[i]=v}} scale={[.074,.103,.031]}><sphereGeometry args={[1,20,16]}/><meshBasicMaterial color="#18181b"/></mesh>
        </group>
      </group>)}
      <group ref={paper} position={[0,.53,.89]} rotation={[-.23,0,0]}><Paper/></group>
    </group></group></group>;
}
export default function Scene(props:{motion:Motion,active:boolean,onFail:()=>void}) {
  return <Canvas camera={{position:[0,.30,6.3],fov:39}} dpr={[1,1.5]} frameloop={props.active&&!props.motion.reduced?'always':'demand'}
    gl={{alpha:true,antialias:true,powerPreference:'low-power'}} fallback={<Fail fn={props.onFail}/>}>
    <Lights/>
    <Actor {...props}/></Canvas>;
}
export function Lights(){return <><hemisphereLight args={['#fff7ed','#8589ab',1.65]}/><directionalLight position={[-3,4,3]} intensity={3}/>
    <directionalLight position={[2,3,-2]} intensity={5} color="#ffe2c4"/><pointLight position={[1,2,3]} intensity={13}/>
    </>;
}
function Fail({fn}:{fn:()=>void}) { useEffect(fn,[fn]); return null; }
