export default class Deck {
  constructor({type, bunchCards, positionBunch, cards, cardPlayed, current}) {
    this.type = type;
    this.cards = cards;
    this.cardPlayed = cardPlayed;
    this.bunchCards = bunchCards;
    this.positionBunch = positionBunch;
    this.radius = 90;
    this.current = current;
  }

  render (state, context) {
    // Screen edges
    // Delete if it goes out of bounds

    context.save ();

    context.font = '15px Balsamiq Sans';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    context.translate (this.positionBunch.x, this.positionBunch.y);

    if (this.current) {
      context.rotate (-15 * Math.PI / 180);

      context.fillText ('Drop a card', 0, 0);

      context.fillText ('here', 0, 15);
    }

    context.restore ();
  }
}
