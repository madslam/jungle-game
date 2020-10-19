import card1 from './1.png';
import card2 from './2.png';

CanvasRenderingContext2D.prototype.roundRect2 = function (
  posx,
  posy,
  width,
  height,
  radius
) {
  const x = posx - width / 2;
  const y = posy - height / 2;

  this.moveTo (x + radius, y);
  this.arcTo (x + width, y, x + width, y + height, radius);
  this.arcTo (x + width, y + height, x, y + height, radius);
  this.arcTo (x, y + height, x, y, radius);
  this.arcTo (x, y, x + width, y, radius);
  this.stroke ();

  return this;
};

export default class Card {
  constructor({position, move, value, show, rotation}) {
    this.position = position;
    this.move = move;
    this.show = show;
    this.radius = 80;
    this.intervalId = () => null;
    this.value = value;
    this.rotation = rotation;
  }
  render (state, context) {
    // Screen edges
    // Delete if it goes out of bounds

    context.save ();

    //context.lineWidth = 1;

    context.font = '20px Comic Sans MS';
    context.textAlign = 'center';

    context.beginPath ();
    context.strokeStyle = 'white';

    context.fillStyle = 'black';
    context.translate (this.position.x, this.position.y);
    context.rotate (this.rotation * Math.PI / 180);
    context.roundRect2 (0, 0, 100, 100, 10);

    context.fill ();
    context.stroke ();

    context.fillStyle = 'white';
    if (this.show) {
      //context.fillText(`${this.value}`, 0, 0);
      const img = new Image ();

      if (this.value === 1) {
        img.src = card1;
      }
      if (this.value === 2) {
        img.src = card2;
      }
      context.drawImage (img, -50, -50, 100, 100);
    } else {
      //   context.drawImage (test, -50, -50, 100, 100);
    }
    context.restore ();
  }
}
