import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {createRoot} from 'react-dom/client';
import {actions,Motion,type Action} from './motion';
import Vector from './Vector';
import './style.css';
const Scene=lazy(()=>import('./Scene'));
class Boundary extends Component<{onFail:()=>void,children:ReactNode},{failed:boolean}>{
  state={failed:false}; static getDerivedStateFromError(){return {failed:true}}
  componentDidCatch(){this.props.onFail()}
  render(){return this.state.failed?null:this.props.children}
}
const groups:[string,Action[]][]=[['Locomoción',['idle','walk','run','jump']],['Expresión',['wave','read','think','curious','surprise','morph']]];
const notes:Record<Action,string>={idle:'Respira despacio y parpadea entre titulares.',walk:'Avanza con pasos cortos y los brazos en contrapunto.',run:'Inclina el cuerpo y acelera la zancada.',jump:'Toma impulso y amortigua la caída.',wave:'Levanta el brazo y agita la mano.',read:'Despliega el diario y recorre las columnas.',think:'Acerca la mano a la cara y busca una idea.',curious:'Inclina el cuerpo para mirar más de cerca.',surprise:'Abre los ojos y levanta los brazos.',morph:'La tinta se ensancha y recupera su silueta.'};
function App(){
  const [action,setAction]=useState<Action>('idle'), [motion]=useState(()=>new Motion(setAction));
  const [svg,setSvg]=useState(()=>{
    try { const context=document.createElement('canvas').getContext('webgl2');
      if(!context) return true;
      context.getExtension('WEBGL_lose_context')?.loseContext(); return false;
    } catch { return true; }
  }), [paused,setPaused]=useState(false), [visible,setVisible]=useState(true);
  const [reduce,setReduce]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stage=useRef<HTMLButtonElement>(null!), fail=useCallback(()=>setSvg(true),[]);

  motion.reduced=reduce||paused;
  useEffect(()=>{const mq=matchMedia('(prefers-reduced-motion: reduce)'), change=()=>setReduce(mq.matches);
    mq.addEventListener('change',change); return ()=>mq.removeEventListener('change',change)},[]);
  useEffect(()=>{let intersecting=true;const sync=()=>setVisible(intersecting&&!document.hidden);
    const observer=new IntersectionObserver(([entry])=>{intersecting=entry.isIntersecting;sync()});
    observer.observe(stage.current); document.addEventListener('visibilitychange',sync);
    return ()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync)}},[]);
  function play(a:Action){motion.select(a)}
  return <main><header><span className="brand"><i aria-hidden="true">✳</i> Tinta</span><span>Estudio de movimiento</span></header>
    <div className="title"><h1>La Manchita<span>.</span></h1><p>Una criatura de tinta en la redacción.<br/>Probá sus movimientos y seguí su mirada.</p></div>
    <section className="lab" aria-label="Estudio interactivo"><div className="plate"><button className="stage" ref={stage} aria-label="Interactuar con Manchita" aria-describedby="gesture"
      onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();motion.target.x=2*(e.clientX-r.left)/r.width-1;motion.target.y=1-2*(e.clientY-r.top)/r.height}}
      onPointerLeave={()=>{motion.target.x=0;motion.target.y=0}} onClick={()=>play(action==='curious'?'jump':'curious')}>
      <span className="plateTop"><b>FIG. 01</b><span>{svg?'VECTOR / SVG':'VOLUMEN / 3D'}</span></span>
      <span className="floor"/><span className="render" aria-hidden="true">{svg?<Vector motion={motion} active={visible}/>:<Boundary onFail={fail}><Suspense fallback={null}><Scene motion={motion} active={visible} onFail={fail}/></Suspense></Boundary>}</span>
      <span className="plateBottom"><span>↗</span> <span id="gesture">Tocá la escena para interactuar</span></span>
    </button><div className="caption" aria-live="polite"><strong>{actions[action]}</strong><span>{notes[action]}</span></div></div>
    <aside><h2>Movimientos</h2>{groups.map(([label,items])=><fieldset key={label}><legend>{label}</legend><div className="buttons">{items.map(a=><button key={a} aria-pressed={action===a} onClick={()=>play(a)}>{actions[a]}</button>)}</div></fieldset>)}
    <label><input type="checkbox" checked={reduce||paused} disabled={reduce} onChange={e=>setPaused(e.target.checked)}/> Movimiento reducido</label></aside></section>
    <footer><span>Tinta / Laboratorio de personajes</span><span>Manchita · 01</span></footer>
  </main>
}
createRoot(document.getElementById('root')!).render(<App/>);
