export default class Totem {
  constructor({position, playerMove, radius}) {
    this.position = position;
    this.radius = radius;
    this.playerMove = playerMove;
  }

  render (state, context) {
    // Screen edges

    context.save ();
    context.translate (this.position.x, this.position.y);
    context.strokeStyle = 'black';
    context.fillStyle = '#4ab7dd';
    context.lineWidth = 2;
    context.beginPath ();
    context.arc (0, 0, this.radius, 0, 2 * Math.PI);

    context.fill ();
    context.stroke ();

    context.restore ();
  }
}
