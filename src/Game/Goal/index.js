export default class Goal {
  constructor({type, position, totemIn, isPlaying, timer}) {
    this.type = type;
    this.position = position;
    this.radius = 50;
    this.totemIn = totemIn;
    this.timer = timer;
  }
  setTotemIn (totemIn) {
    this.totemIn = totemIn;
  }
  setPosition (position) {
    this.position = position;
  }

  render (state, context) {
    // Screen edges
    // Delete if it goes out of bounds

    context.save ();
    context.translate (this.position.x, this.position.y);

    if (this.totemIn) {
      context.fillStyle = 'yellow';
    } else {
      context.fillStyle = '#4ef5d2';
    }

    context.beginPath ();

    context.lineWidth = 3;

    context.strokeStyle = 'white';
    context.setLineDash ([13, 13]);

    context.arc (0, 0, 60, 0, 2 * Math.PI);
    context.stroke ();

    context.restore ();
  }
}
