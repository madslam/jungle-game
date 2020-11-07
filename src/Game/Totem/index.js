import moon from './moon.png';

export default class Totem {
  constructor({position, playerMove, radius}) {
    this.position = position;
    this.radius = radius;
    this.playerMove = playerMove;
    this.circ = 4 * (Math.sqrt (2) - 1) / 3;
    this.c = this.circ;
    this.count = Math.PI;
  }

  render (state, context) {
    // Screen edges
    context.strokeStyle = 'white';
    context.save ();
    context.translate (this.position.x, this.position.y);
    context.fillStyle = 'white';
    context.lineWidth = 4;
    context.beginPath ();
    context.arc (0, 0, this.radius, 0, 2 * Math.PI);

    // context.fill ();
    context.stroke ();

    /* const test = new Image ();
    test.src = moon;
    context.drawImage (test, -40, -40, 80, 80);*/

    context.restore ();
  }
}
