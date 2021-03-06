const colors = [
  {r: 45, g: 220, b: 127},
  {r: 300, g: 206, b: 237},
  {r: 255, g: 255, b: 255},
  {r: 37, g: 180, b: 238},
  {r: 238, g: 37, b: 141},
];

export default class Particle {
  constructor({x, y, color, size, weigth}) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.weigth = weigth;
    this.opacity = 1;

    this.randomColor = Math.floor (Math.random () * colors.length);
  }

  render (context) {
    context.beginPath ();

    context.arc (this.x, this.y, this.size, 0, 2 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill ();
  }
  renderCircle (context) {
    context.beginPath ();

    context.arc (this.x, this.y, this.size + 1, 0, 2 * Math.PI, false);
    context.strokeStyle =
      'rgba(' +
      colors[this.randomColor].r +
      ',' +
      colors[this.randomColor].g +
      ',' +
      colors[this.randomColor].b +
      ',' +
      this.opacity +
      ')';

    context.stroke ();
  }
  update (mousePosition) {
    this.size -= 0.6;
    if (this.size < 0) {
      this.x = mousePosition.x + (Math.random () * 20 - 10);
      this.y = mousePosition.y + (Math.random () * 20 - 10);
      this.size = Math.random () * 10 + 2;
      this.weigth = Math.random () * 2 - 0.5;
    }
    this.y += this.weigth;
    this.weigth += 0.1;
    if (this.y > 900 - this.size) {
      this.weigth *= -0.1;
    }
  }
}
