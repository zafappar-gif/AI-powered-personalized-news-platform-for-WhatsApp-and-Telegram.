import {useEffect,useRef} from 'react';
import {Motion} from './motion';

export default function Vector({motion,active}:{motion:Motion,active:boolean}) {
  const svg=useRef<SVGSVGElement>(null!);
  useEffect(()=>{
    const el=svg.current, node=(id:string)=>el.querySelector<SVGElement>('[data-part="'+id+'"]')!;
    const root=node('root'), ink=node('ink'), eyes=node('eyes'), pupils=[node('p0'),node('p1')], arms=[node('a0'),node('a1')], legs=[node('l0'),node('l1')], paper=node('paper');
    let frame=0, last=performance.now();
    function tick(now:number) {
      const p=motion.step((now-last)/1000); last=now;
      root.setAttribute('transform',`translate(${150+p.x*40} ${200-p.y*48}) rotate(${-p.tilt*23})`);
      ink.setAttribute('transform',`scale(${(1+p.shape*.22)/Math.sqrt(p.stretch)} ${p.stretch}) rotate(${-p.tilt*25})`);
      eyes.setAttribute('transform',`translate(0 -73) scale(1 ${p.blink})`);
      pupils.forEach((v,i)=>v.setAttribute('transform',`translate(${(p.scan+p.gazeX)*3} ${-(p.down+p.gazeY)*4})`));
      arms.forEach((v,i)=>v.setAttribute('transform',`translate(${i?39:-39} -56) rotate(${-(i?p.rightArm:p.leftArm)*55})`));
      legs.forEach((v,i)=>v.setAttribute('transform',`translate(${i?15:-15} -24) rotate(${(i?p.rightLeg:p.leftLeg)*42})`));
      paper.setAttribute('opacity',String(p.paper));
      if(active&&!motion.reduced) frame=requestAnimationFrame(tick);
    }
    tick(last); return ()=>cancelAnimationFrame(frame);
  },[motion,motion.action,motion.reduced,active]);
  return <svg className="vector" ref={svg} viewBox="0 0 300 260" aria-hidden="true"><defs><radialGradient id="satin" cx=".3" cy=".15" r=".88"><stop stopColor="#62616b"/><stop offset=".4" stopColor="#272730"/><stop offset="1" stopColor="#111117"/></radialGradient></defs>
    <g data-part="root">{[0,1].map(i=><g key={i} data-part={'l'+i}><path d="M0 0 Q-2 12 0 22" fill="none" stroke="#19191f" strokeWidth="10"/><ellipse cy="22" rx="9" ry="5" fill="#19191f"/></g>)}
    <g data-part="ink">{[0,1].map(i=><g key={i} data-part={'a'+i}><path d={`M0 0 Q${i?7:-7} 15 ${i?7:-7} 30`} fill="none" stroke="#202027" strokeWidth="8" strokeLinecap="round"/></g>)}
    <path fill="url(#satin)" d="M-43 -49 C-49 -74 -33 -93 -15 -105 C-2 -114 9 -117 14 -130 C19 -120 23 -106 29 -98 C44 -79 55 -54 42 -35 C29 -16 -33 -13 -43 -49Z"/>
    <g data-part="eyes">{[0,1].map(i=><g key={i} transform={`translate(${i?15:-15} ${i?-2:1})`}><ellipse rx="10" ry="13" fill="ivory"/><ellipse data-part={'p'+i} rx="4" ry="6" fill="#14141a"/></g>)}</g>
    <g data-part="paper"><path d="M-31 -63 L0 -59 31 -64 31 -34 0 -30 -31 -34Z" fill="#fff5db" stroke="#3b3833"/><path d="M-25 -55l18 3m-18 5 18 3m13 -9 18 -3m-18 11 18 -3" fill="none" stroke="#614c39" strokeWidth="2"/></g></g></g></svg>;
}
