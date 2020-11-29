import {MOUSE_COLOR} from '../colors';
import Particle from '../Particle';

export default class Player {
  constructor({position, click, type, skin, id}) {
    this.id = id;
    this.position = position;
    this.radius = 30;
    this.click = click;
    this.type = type;
    this.skin = skin;
    this.particles = this.initParticle ();
    this.circ = 4 * (Math.sqrt (2) - 1) / 3;
    this.c = this.circ;
    this.count = Math.PI;
    this.disableClick = false;
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

    context.strokeStyle = MOUSE_COLOR;
    context.lineWidth = 2;
    context.fillStyle = MOUSE_COLOR;

    context.font = '20px Comic Sans MS';
    if (this.disableClick) {
      context.fillStyle = 'red';
      context.beginPath ();
      context.arc (0, 0, this.radius, 0, 2 * Math.PI);
      const img = new Image ();

      img.src = process.env.PUBLIC_URL + `/img/poop.png`;

      context.drawImage (img, -25, -25);

      context.restore ();

      return;
    }
    context.textAlign = 'center';
    if (this.type) {
      context.fillText (this.type, 0, 50);
    }
    this.drawBezierCircle (0, 0, this.radius, context);
    context.stroke ();

    context.restore ();
    this.animateParticle (context);
  }

  drawBezierCircle (cx, cy, r, context) {
    var offsetX = 5 * Math.sin (this.count);
    var offsetY = 5 * Math.cos (this.count * 2);
    r = r / 2;

    this.count += 0.01;

    context.translate (cx, cy); // translate to centerpoint

    context.beginPath ();

    // top right
    this.c = this.circ + 0.2 * Math.sin (this.count);
    context.moveTo (offsetX + 0, offsetY + -r);
    context.bezierCurveTo (
      offsetX + this.c * r,
      offsetY + -r,
      offsetX + r,
      offsetY + -this.c * r,
      offsetX + r,
      offsetY + 0
    );

    // bottom right
    this.c = this.circ + 0.2 * Math.cos (this.count);
    context.bezierCurveTo (
      offsetX + r,
      offsetY + this.c * r,
      offsetX + this.c * r,
      offsetY + r,
      offsetX + 0,
      offsetY + r
    );

    // bottom left
    this.c = this.circ + 0.2 * Math.sin (this.count * 2);
    context.bezierCurveTo (
      offsetX + -this.c * r,
      offsetY + r,
      offsetX + -r,
      offsetY + this.c * r,
      offsetX + -r,
      offsetY + 0
    );

    // top left
    this.c = this.circ + 0.2 * Math.cos (this.count + 1);
    context.bezierCurveTo (
      offsetX + -r,
      offsetY + -this.c * r,
      offsetX + -this.c * r,
      offsetY + -r,
      offsetX + 0,
      offsetY + -r
    );

    context.stroke ();
  }
}
