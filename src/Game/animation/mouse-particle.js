import {GAME_WIDTH, GAME_HEIGHT, updatePosition} from '../utils';
import Particle from '../Particle';

export const initParticle = () => {
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
export const connect = (context, particles) => {
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
};
export const animateParticle = (context, mousePlayer, playerRef) => {
  context.clearRect (0, 0, GAME_WIDTH, GAME_HEIGHT);
  Object.values (mousePlayer).forEach (({particles, position, skin}) => {
    const currentPlayer = playerRef.current;
    const positionPlayer = updatePosition (currentPlayer, position);
    if (skin === 'particle') {
      particles.forEach (particle => {
        particle.render (context);
      });
    }
    if (skin === 'circle') {
      particles.forEach (particle => {
        particle.renderCircle (context);
      });
    }
    if (skin === 'connect') {
      connect (context, particles);
    }
    particles.forEach (particle => {
      particle.update (positionPlayer);
    });
  });
  requestAnimationFrame (() =>
    animateParticle (context, mousePlayer, playerRef)
  );
};
