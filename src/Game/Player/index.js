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
    this.drawCard = drawCard;
  }

  setPosition (position) {
    this.position = position;
  }
  setDeck (deck) {
    this.deck = deck;
  }
  animateParticle (context) {
    context.clearRect (0, 0, 900, 900);
    this.particleArray.forEach (particle => {
      particle.update (this.position);

      particle.render (context);
    });
    console.log ('hihihihihihihihihihihi');
    requestAnimationFrame (() => this.animateParticle (context));
  }
  render (state, context) {
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
    if (this.type) {
      context.fillText (this.type, 0, 50);
    }
    context.fill ();

    context.restore ();
  }
}
