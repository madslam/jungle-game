export default class Deck {
  constructor({type, bunchCards, positionBunch, cards, cardPlayed}) {
    this.type = type;
    this.cards = cards;
    this.cardPlayed = cardPlayed;
    this.bunchCards = bunchCards;
    this.positionBunch = positionBunch;
    this.radius = 90;
  }
  setBunchCards (bunchCards) {
    this.bunchCards = bunchCards;
  }
  setpositionBunch (positionBunch) {
    this.positionBunch = positionBunch;
  }
  setCardPlayed (cardPlayed) {
    this.cardPlayed = cardPlayed;
  }
  render (state, context) {
    // Screen edges
    // Delete if it goes out of bounds

    context.save ();

    // context.strokeStyle = 'black';

    //context.lineWidth = 1;
    context.beginPath ();

    context.font = '20px Comic Sans MS';
    context.textAlign = 'center';
    context.fillStyle = 'steelblue';

    if ((this.bunchCards.length = 0)) {
      context.save ();
      context.translate (this.positionBunch.x, this.positionBunch.y);
      context.fillText (`no card`, 0, 0);
      context.restore ();
    }
  }
}
