function LightParticle (x, y, radius, color) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = color;

  this.update = function (context) {
    this.draw (context);
  };

  this.draw = function (context) {
    context.save ();
    context.beginPath ();
    context.arc (this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.shadowColor = this.color;
    context.shadowBlur = 15;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.fillStyle = this.color;
    context.fill ();
    context.closePath ();
    context.restore ();
  };
}

export const initializeParticles = function (context, width, height) {
  const particleCount = 70;
  var lightParticles = [];

  var timer = 0;
  var opacity = 1;
  var speed = 0.0005;
  var colors = ['#0952BD', '#A5BFF0', '#118CD6', '#1AAEE8', '#F2E8C9'];
  for (var i = 0; i < particleCount; i++) {
    var randomColorIndex = Math.floor (Math.random () * 6);
    var randomRadius = Math.random () * 2;

    // Ensure particles are spawned past screen width and height so
    // there will be no missing stars when rotating canvas
    var x = Math.random () * (width + 200) - (width + 200) / 2;
    var y = Math.random () * (height + 200) - (height + 200) / 2;
    lightParticles.push (
      new LightParticle (x, y, randomRadius, colors[randomColorIndex])
    );
  }
  animate (context, opacity, speed, timer, lightParticles, width, height);
};

function animate (
  context,
  opacity,
  speed,
  timer,
  lightParticles,
  width,
  height
) {
  /*window.requestAnimationFrame (() =>
    animate (context, opacity, speed, timer, lightParticles)
  );*/

  context.save ();
  if (false) {
    // Ease into the new opacity
    var desiredOpacity = 0.01;
    opacity += (desiredOpacity - opacity) * 0.03;
    context.fillStyle = 'rgba(18, 18, 18,' + opacity + ')';

    // Ease into the new speed
    var desiredSpeed = 0.012;
    speed += (desiredSpeed - speed) * 0.01;
    timer += speed;
  } else {
    // Ease back to the original opacity
    var originalOpacity = 1;
    opacity += (originalOpacity - opacity) * 0.01;
    context.fillStyle = 'white';

    // Ease back to the original speed
    var originalSpeed = 0.001;
    speed += (originalSpeed - speed) * 0.01;
    timer += speed;
  }

  context.clearRect (0, 0, width, height);
  context.translate (width / 2, height / 2);
  context.rotate (timer);

  for (var i = 0; i < lightParticles.length; i++) {
    lightParticles[i].update (context);
  }

  context.restore ();
}
