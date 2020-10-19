export default class Goal {
  constructor({type, position, totemIn, isPlaying, timer}) {
    this.type = type;
    this.position = position;
    this.radius = 50;
    this.totemIn = totemIn;
    this.isPlaying = isPlaying;
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

    if (this.isPlaying) {
      context.beginPath ();

      context.lineWidth = 5;

      context.strokeStyle = '#f986c8';
      context.arc (0, 0, 90, this.timer, 2 * Math.PI);
      context.stroke ();
    }

    context.restore ();
  }
}