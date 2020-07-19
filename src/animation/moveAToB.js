var lastStep = 0;

export const move = (context, position) => {
  const particle = {
    position: {
      x: 100,
      y: 100,
    },
  };
  function easeOutBounce (t, b, c, d) {
    if ((t /= d) < 1 / 2.75) {
      return c * (7.5625 * t * t) + b;
    } else if (t < 2 / 2.75) {
      return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
    } else if (t < 2.5 / 2.75) {
      return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
    } else {
      return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
    }
  }
  const objectReturn = (object, basePosition) => {
    const duration = 500;
    let time = 0;

    const timer = setInterval (function () {
      time = time + 1;
      let elapsed = time;
      if (elapsed > duration) {
        elapsed = duration;
      }
      var x = easeOutBounce (
        elapsed,
        object.position.x,
        basePosition.x - object.position.x,
        duration
      );
      var y = easeOutBounce (
        elapsed,
        object.position.y,
        basePosition.y - object.position.y,
        duration
      );
      const objectPosition = {
        x: Math.round (x * 100) / 100,
        y: Math.round (y * 100) / 100,
      };
      object.position = objectPosition;

      if (
        Math.round (object.position.x) === basePosition.x &&
        Math.round (object.position.y) === basePosition.y
      ) {
        console.log ('coucou');
        clearInterval (timer);
        time = 0;
        return;
      }
      renderParticles ();
    }, 10);
    return timer;
  };

  function renderParticles () {
    context.save ();
    context.beginPath ();
    context.translate (particle.position.x, particle.position.y);
    context.arc (0, 0, 10, 0, 2 * Math.PI);
    context.fillStyle = 'blue';
    context.fill ();
    context.stroke ();
    context.restore ();
  }
  objectReturn (particle, position);
};
