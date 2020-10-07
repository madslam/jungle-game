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
    context.strokeStyle = '#f986c8';

    context.beginPath ();
    context.setLineDash ([13, 13]);
    context.arc (
      this.positionBunch.x,
      this.positionBunch.y,
      50,
      0,
      Math.PI * 2
    );
    context.stroke ();

    context.restore ();
  }
}
