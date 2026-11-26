import { gsap } from 'gsap';

export const actions = {
  idle: 'Respirar', walk: 'Caminar', run: 'Correr', jump: 'Saltar',
  wave: 'Saludar', read: 'Leer noticias', think: 'Pensar', curious: 'Curiosear',
  surprise: 'Sorprenderse', morph: 'Transformarse'
} as const;
export type Action = keyof typeof actions;
const duration: Partial<Record<Action, number>> = { jump: 1.35, wave: 2.6, surprise: 1.8, morph: 3.2 };
const ease = gsap.parseEase('sine.inOut');
const neutral = () => ({ x:0, y:0, tilt:0, turn:0, stretch:1, blink:1, leftArm:-0.18, rightArm:0.22,
  leftLeg:0, rightLeg:0, scan:0, down:0, paper:0, shape:0, lean:0, gazeX:0, gazeY:0 });
export type Pose = ReturnType<typeof neutral>;
const channels = Object.keys(neutral()) as (keyof Pose)[];
export class Motion {
  action: Action = 'idle';
  reduced = false;
  target = { x:0, y:0 };
  pose = neutral();
  private from = neutral();
  private time = 0;
  private clock = 0;
  constructor(private notify: (a:Action)=>void) {}
  select(action:Action) {
    this.from = { ...this.pose }; this.time = 0; this.action = action; this.notify(action);
  }
  step(delta:number) {
    const dt = Math.min(delta,.06);
    this.time += dt; this.clock += dt;
    const end = duration[this.action];
    if (!this.reduced && end && this.time >= end) this.select('idle');
    const t = this.reduced ? .57 : this.time, a = this.action, p = neutral();
    const s = Math.sin, abs = Math.abs;
    p.stretch += this.reduced ? 0 : .021*s(this.clock*2.5);
    const blink = this.clock % 3.8;
    p.blink = this.reduced ? 1 : 1-.94*Math.max(0,1-abs(blink-3.37)/.105);
    if (a==='walk' || a==='run') {
      const fast=a==='run', phase=t*(fast?10:5.4), stride=s(phase)*(fast?.96:.64);
      p.leftLeg=stride; p.rightLeg=-stride; p.leftArm-=stride*.65; p.rightArm+=stride*.65;
      p.y=abs(Math.cos(phase))*(fast?.16:.07); p.turn=.58; p.lean=fast?.23:.08; p.x=.38*s(t*1.2);
    } else if (a==='jump') {
      const air=Math.max(0,Math.min(1,(t-.2)/.78));
      p.y=2.65*air*(1-air); p.stretch+=t<.2?-.19*s(t/.2*Math.PI):t<.98?.12*s(Math.PI*air):-.18*s(Math.PI*Math.min(1,(t-.98)/.37));
      p.leftArm-=p.y; p.rightArm+=p.y; p.leftLeg=.52*p.y; p.rightLeg=-.34*p.y;
    } else if (a==='wave') { p.rightArm=1.85+.29*s(t*13); p.tilt=.08; }
    else if (a==='read') { p.paper=1; p.down=-.48; p.scan=.44*s(t*3); p.leftArm=.70; p.rightArm=-.70; p.lean=.15; }
    else if (a==='think') { p.leftArm=-2.65; p.scan=.55; p.down=.48; p.tilt=-.13; }
    else if (a==='curious') { p.tilt=.23; p.turn=-.22; p.stretch+=.09; p.scan=-.35; }
    else if (a==='surprise') { p.stretch+=.15; p.y=.13; p.leftArm=-1.7; p.rightArm=1.8; p.blink*=1.2; }
    else if (a==='morph') { p.shape=.5-.5*Math.cos(t*2*Math.PI/3.2); p.stretch-=.29*p.shape; p.tilt=.18*s(t*2); }
    const blend=this.reduced?1:ease(Math.min(1,this.time/.25));
    const follow=1-Math.exp(-dt*8);
    p.gazeX=this.reduced?0:this.pose.gazeX+(this.target.x-this.pose.gazeX)*follow;
    p.gazeY=this.reduced?0:this.pose.gazeY+(this.target.y-this.pose.gazeY)*follow;
    for(const k of channels) this.pose[k]=this.from[k]+(p[k]-this.from[k])*blend;
    return this.pose;
  }
}
