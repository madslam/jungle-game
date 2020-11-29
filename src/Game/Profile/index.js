CanvasRenderingContext2D.prototype.roundRect = function (
  posx,
  posy,
  width,
  height,
  radius,
  healthBarValue
) {
  const x = posx - width / 2;
  const y = posy - height / 2;

  this.beginPath ();
  this.moveTo (x + radius, y);
  this.arcTo (x + width, y, x + width, y + height, radius);
  this.arcTo (x + width, y + height, x, y + height, radius);
  this.arcTo (x, y + height, x, y, radius);
  this.arcTo (x, y, x + width, y, radius);
  this.lineWidth = 4;
  this.strokeStyle = '#f986c8';
  this.stroke ();
  this.closePath ();

  const health = width / 100 * (100 - healthBarValue);

  if (healthBarValue !== 0) {
    const radiusEnd = healthBarValue === 100 ? radius : 0;
    this.beginPath ();
    this.moveTo (x + radius, y);
    this.arcTo (x + width - health, y, x + width, y + height, radiusEnd);
    this.arcTo (x + width - health, y + height, x, y + height, radiusEnd);
    this.arcTo (x, y + height, x, y, radius);
    this.arcTo (x, y, x + width, y, radius);
    this.fillStyle = 'white';
    this.fill ('nonzero');
    this.closePath ();
  }

  return this;
};

export default class Profile {
  constructor({
    position,
    name,
    radius,
    health,
    nextHealth,
    isAlive,
    isPlaying,
    timePerRound,
    img,
  }) {
    this.position = position;
    this.radius = radius;
    this.name = name;
    this.health = health;
    this.nextHealth = nextHealth;
    this.isAlive = isAlive;
    this.timePerRound = timePerRound;
    this.isPlaying = isPlaying;
    this.weight = 0.01;
    this.opacity = 1;
    this.img = img;
  }

  drawName (context) {
    context.save ();
    context.font = '15px Comic Sans MS';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    if (this.isPlaying) {
      context.font = '24px Comic Sans MS';
      context.shadowColor = '#5cbde8';
      context.shadowBlur = 20;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      let timePassed =
        this.timePerRound - Math.floor ((Date.now () - this.isPlaying) / 1000);
      if (timePassed < 0) {
        timePassed = 0;
      }
      context.fillText (timePassed, this.position.x, this.position.y);
      context.beginPath ();
      context.strokeStyle = 'white';
      context.lineWidth = 4;
      const start = Math.PI / -2;
      const circum = Math.PI * 2;

      const curr =
        (Date.now () - this.isPlaying) / 1000 / this.timePerRound * 100;
      const end = circum * curr / 100 + start;
      context.arc (
        this.position.x,
        this.position.y,
        this.radius,
        start,
        end,
        false
      );

      context.stroke ();
    }

    context.fillText (this.name, this.position.x, this.position.y - 40);
    context.globalAlpha = 1;
    context.restore ();
  }
  render (state, context) {
    // Screen edges
    // Delete if it goes out of bounds
    context.save ();
    context.translate (this.position.x, this.position.y);

    context.fillStyle = 'steelblue';
    if (this.img) {
      context.save ();
      const img = new Image ();
      img.src = this.img;
      if (this.isPlaying) {
        context.globalAlpha = 0.4;
      }
      context.beginPath ();
      context.arc (0, 0, this.radius, 0, Math.PI * 2, true);
      context.closePath ();
      context.clip ();

      context.drawImage (
        img,
        -this.radius,
        -this.radius,
        this.radius * 2,
        this.radius * 2
      );

      context.beginPath ();
      context.arc (0, 0, this.radius, 0, Math.PI * 2, true);
      context.clip ();
      context.closePath ();
      context.restore ();
    }
    context.beginPath ();
    context.strokeStyle = 'steelblue';

    context.arc (0, 0, this.radius, 0, 2 * Math.PI);
    context.stroke ();

    if (!this.isAlive) {
      context.lineWidth = 6;
      context.strokeStyle = 'red';
      context.beginPath ();

      context.moveTo (0 - 26, 0 - 26);
      context.lineTo (0 + 26, 0 + 26);

      context.moveTo (0 + 26, 0 - 26);
      context.lineTo (0 - 26, 0 + 26);
      context.stroke ();
    }
    //  context.roundRect (0, 60, 175, 20, 10, this.health);
    context.restore ();
    this.drawName (context);
  }
}
