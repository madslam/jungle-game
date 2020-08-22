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
  this.lineWidth = 2;
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
    this.fillStyle = '#22CB71';
    this.fill ('nonzero');
    this.closePath ();
  }

  return this;
};

export default class HealthBar {
  constructor({position, healthBarValue}) {
    this.healthBarValue = healthBarValue;
    this.position = position;
  }
  render (state, context) {
    context.roundRect (
      this.position.x,
      this.position.y,
      250,
      20,
      10,
      this.healthBarValue
    );
  }
}
