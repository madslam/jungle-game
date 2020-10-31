import {GAME_WIDTH, GAME_HEIGHT} from '../utils';
import Particle from '../Particle';

export default class Player {
  constructor({position, click, type, skin, drawCard}) {
    this.position = position;
    this.radius = 5;
    this.click = click;
    this.type = type;
    this.skin = skin;
    this.particles = this.initParticle ();
  }

  initParticle = () => {
    let particleArray = [];

    for (let i = 0; i < 10; i++) {
      let x = 0;
      let y = 0;
      let size = 1;
      let color = 'black';
      let weigth = 0;
      particleArray.push (new Particle ({x, y, size, color, weigth}));
    }
    return particleArray;
  };

  connect (context, particles) {
    let opacity = 1;
    particles.forEach ((particle, i) => {
      for (let a = i; a < particles.length; a++) {
        const distance =
          particle.x -
          particles[a].x * particle.x -
          particles[a].x +
          (particle.y - particles[a].y * particle.y - particles[a].y);
        if (distance < 200) {
          opacity = 1 - distance / 10000;
          context.strokeStyle = 'rgb(255,255,255' + opacity + ')';
          context.beginPath ();
          context.lineWidth = 1;
          context.moveTo (particle.x, particle.y);
          context.lineTo (particles[a].x, particles[a].y);
          context.stroke ();
        }
      }
    });
  }
  animateParticle (context) {
    console.log ('oklm', this.skin);
    if (this.skin === 'particle') {
      this.particles.forEach (particle => {
        particle.render (context);
      });
    }
    if (this.skin === 'circle') {
      this.particles.forEach (particle => {
        particle.renderCircle (context);
      });
    }
    if (this.skin === 'connect') {
      this.connect (context, this.particles);
    }
    this.particles.forEach (particle => {
      particle.update (this.position);
    });
  }

  render (state, context) {
    context.save ();

    context.translate (this.position.x, this.position.y);

    context.fillStyle = '#4ab7dd';
    context.lineWidth = 2;
    context.beginPath ();
    context.arc (0, 0, 10, 0, 2 * Math.PI);
    context.font = '20px Comic Sans MS';
    if (this.click) {
      context.fillStyle = 'red';
    }
    context.textAlign = 'center';
    if (this.type) {
      context.fillText (this.type, 0, 50);
    }
    context.fill ();

    context.restore ();
    this.animateParticle (context);
  }
}
