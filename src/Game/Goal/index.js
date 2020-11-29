import {GAME_HEIGHT, GAME_WIDTH} from '../utils';

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
    context.save ();
    context.translate (this.position.x, this.position.y);

    if (this.totemIn) {
      // context.fillStyle = 'yellow';
    } else {
      //  context.fillStyle = '#4ef5d2';
    }
    // angle in degrees
    var angleDeg =
      Math.atan2 (
        GAME_HEIGHT / 2 - this.position.y,
        GAME_WIDTH / 2 - this.position.x
      ) *
      180 /
      Math.PI;
    context.rotate ((angleDeg + 90) * Math.PI / 180);
    context.lineWidth = 3;

    context.strokeStyle = 'white';
    context.setLineDash ([13, 13]);
    context.strokeRect (-40, -40, 80, 80);

    context.restore ();
  }
}
