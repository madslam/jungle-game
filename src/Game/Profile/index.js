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
  constructor({position, name, radius, health, isAlive}) {
    this.position = position;
    this.radius = radius;
    this.name = name;
    this.health = health;
    this.isAlive = isAlive;
  }

  render (state, context) {
    // Screen edges
    // Delete if it goes out of bounds

    context.save ();
    context.translate (this.position.x, this.position.y);

    context.font = '20px Comic Sans MS';
    context.textAlign = 'center';
    context.fillStyle = 'steelblue';
    context.fillText (this.name, 0, -40);

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
    context.roundRect (0, 60, 175, 20, 10, this.health);
    context.restore ();
  }
}