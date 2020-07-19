import Goal from '../Goal';
import Deck from '../Deck';
import Particle from '../Particle';

export default class Player {
  constructor({
    position,
    click,
    movingTotem,
    id,
    type,
    cards,
    isPlaying,
    timer,
    drawCard,
  }) {
    this.position = position;
    this.radius = 5;
    this.click = click;
    this.movingTotem = movingTotem;
    this.isPlaying = isPlaying;
    this.id = id;
    this.type = type;
    this.goal = new Goal ({type, isPlaying, timer});
    this.deck = new Deck ({type, cards});
    this.drawCard = drawCard;
  }

  setPosition (position) {
    this.position = position;
  }
  setDeck (deck) {
    this.deck = deck;
  }
  render (state, context) {
    // Screen edges
    if (this.position.x > state.screen.width) this.position.x = 0;
    else if (this.position.x < 0) this.position.x = state.screen.width;
    if (this.position.y > state.screen.height) this.position.y = 0;
    else if (this.position.y < 0) this.position.y = state.screen.height;
    if (this.drawCard.position) {
      context.save ();
      context.beginPath ();
      context.fillStyle = 'white';
      context.strokeStyle = 'black';
      //   context.rotate (this.drawCard.rotation * Math.PI / 180);
      context.rect (
        this.drawCard.position.x - 40,
        this.drawCard.position.y - 40,
        80,
        80
      );
      context.stroke ();
      context.fill ();
      context.restore ();
    }
    context.save ();

    context.translate (this.position.x, this.position.y);

    context.fillStyle = '#4ab7dd';
    context.lineWidth = 2;
    context.beginPath ();
    context.arc (0, 0, 10, 0, 2 * Math.PI);
    context.font = '20px Comic Sans MS';
    if (this.click) {
      context.fillStyle = 'red';
    }
    context.textAlign = 'center';
    context.fillText (this.type, 0, 50);
    context.fill ();

    context.restore ();
  }
}
