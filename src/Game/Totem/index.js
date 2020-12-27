export default class Totem {
  constructor({position, playerMove, radius}) {
    this.position = position;
    this.radius = radius;
    this.playerMove = playerMove;
    this.circ = 4 * (Math.sqrt (2) - 1) / 3;
    this.c = this.circ;
    this.count = Math.PI;
    this.time = 0;
  }

  render (mouse, context) {
    // Screen edges
    context.strokeStyle = 'white';
    context.save ();
    context.translate (this.position.x, this.position.y);
    context.fillStyle = 'white';
    context.lineWidth = 4;
    context.beginPath ();
    //context.arc (0, 0, 200, 0, 2 * Math.PI);

    context.stroke ();

    this.drawBezierCircle (0, 0, this.radius * 2, context);
    context.restore ();
    /* this.drawEyes (mouse, context, 'white', 1.2, 10);
    this.drawEyes (mouse, context, 'back', 4, 2);*/
  }
  drawEyes (mouse, context, color, size, rad) {
    context.save ();

    let dx = mouse.x - this.position.x;
    let dy = mouse.y - this.position.y;
    const theta = Math.atan2 (dy, dx);
    const iris_x = this.position.x + Math.cos (theta) * this.radius / rad;
    const iris_y = this.position.y + Math.sin (theta) * this.radius / rad;
    const irisRadius = this.radius / size;
    context.beginPath ();
    context.arc (iris_x, iris_y, irisRadius, 0, Math.PI * 2, true);
    context.fillStyle = color;
    context.fill ();
    context.closePath ();

    context.restore ();
  }
  drawBezierCircle (cx, cy, r, context) {
    var offsetX = 10 * Math.sin (this.count * 2);
    var offsetY = 10 * Math.cos (this.count * 2);
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
