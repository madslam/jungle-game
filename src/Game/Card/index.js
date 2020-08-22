import {kaleidoscope} from './kaleidoscope';
import {spooked} from './spooked';

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
    context.beginPath ();

    context.font = '20px Comic Sans MS';
    context.textAlign = 'center';
    context.fillStyle = 'steelblue';

    context.save ();
    context.beginPath ();
    context.strokeStyle = 'black';

    context.fillStyle = 'white';
    context.translate (this.position.x, this.position.y);
    context.rotate (this.rotation * Math.PI / 180);
    //spooked (context, 80, 80);
    context.rect (-40, -40, 80, 80);
    context.fill ();
    context.stroke ();

    context.fillStyle = 'steelblue';
    if (this.show) {
      context.fillText (`${this.value}`, 0, 0);
    }
    context.restore ();
  }
}
