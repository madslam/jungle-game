const gameCards = [1, 1, 1, 1, 2, 2];

export default class Game {
  constructor({id}) {
    this.id = id;
    this.players = [];
    this.width = 900;
    this.height = 900;
    this.gameCards = [...gameCards];
    this.isAlive = false;
    this.round = 0;
    this.start = false;
    this.stop = false;
    this.message = '';
    this.totem = new Totem ({
      position: {x: this.width / 2, y: this.height / 2},
    });
  }
  findPlayer (type) {
    return this.players.find (p => p.type === type);
  }
  addPlayer({id, skin}) {
    this.isAlive = true;
    const type = this.players.length + 1;
    const goal = new Goal ({type, isPlaying: false});
    const deck = new Deck ();
    const profile = new Profile ({name: 'player ' + type});
    if (type === 1) {
      goal.position = {
        x: this.width / 2,
        y: this.height - this.height / 8,
      };
      profile.position = {
        x: this.width / 3,
        y: this.height - this.height / 8,
      };
      deck.positionBunch = {
        x: this.width / 2,
        y: this.height - this.height / 4,
      };
    }
    if (type === 2) {
      goal.position = {
        x: this.width / 2,
        y: this.height / 8,
      };
      profile.position = {
        x: this.width - this.width / 3,
        y: this.height / 8,
      };
      deck.positionBunch = {
        x: this.width / 2,
        y: this.height / 4,
      };
    }
    if (type === 3) {
      goal.position = {
        x: this.width / 8,
        y: this.height / 2,
      };
      profile.position = {
        x: this.width / 8,
        y: this.height / 3,
      };
      deck.positionBunch = {
        x: this.width / 4,
        y: this.height / 2,
      };
    }
    if (type === 4) {
      goal.position = {
        x: this.width - this.width / 8,
        y: this.height / 2,
      };
      profile.position = {
        x: this.width - this.width / 8,
        y: this.height - this.height / 3,
      };
      deck.positionBunch = {
        x: this.width - this.width / 4,
        y: this.height / 2,
      };
    }
    const player = new Player ({
      id,
      type,
      goal,
      deck,
      profile,
      skin,
    });
    this.players.push (player);
    return player;
  }

  nextRound () {
    const newRound = this.round + 1 > this.players.length ? 1 : this.round + 1;

    const nextPlayer = this.players[newRound - 1];

    if (nextPlayer.deck.cards.length > 0 && nextPlayer.profile.isAlive) {
      const currentPlayer = this.players[this.round - 1];
      currentPlayer.isPlaying = false;
      this.round = newRound;

      nextPlayer.isPlaying = true;
      return nextPlayer;
    } else {
      this.round = newRound;
      this.nextRound ();
    }
  }
}
class Card {
  constructor({position, move, value, rotation, show}) {
    this.id = Math.floor (Math.random () * 1000);
    this.position = position;
    this.move = move;
    this.radius = 80;
    this.show = show;
    this.value = value;
    this.rotation = rotation;
  }
}
class Profile {
  constructor({position, name}) {
    this.position = position;
    this.name = name;
    this.radius = 30;
    this.nextHealth = null;
    this.healt = 0;
    this.isAlive = true;
  }
}
class Player {
  constructor({id, type, deck, goal, profile, skin}) {
    this.position = {
      x: Math.floor (Math.random () * 1000),
      y: Math.floor (Math.random () * 1000),
    };
    this.deck = deck;
    this.type = type;
    this.radius = 5;
    this.id = id;
    this.click = false;
    this.isPlaying = false;
    this.goal = goal;
    this.profile = profile;
    this.skin = skin;
    this.timer = 0;
    this.drawCard = new Card ({
      position: null,
      show: false,
      move: false,
      value: null,
    });
  }
  setPosition (position) {
    this.position = position;
  }
  setClick (click) {
    this.click = click;
  }

  getDrawCard () {
    if (!this.drawCard.position) {
      this.drawCard = this.deck.getFirstCard ();
    }
    this.drawCard.move = true;
  }
  drawCardReturn () {
    this.drawCard.position = this.goal.position;
    this.deck.cards.push (this.drawCard);
    this.drawCard = new Card ({
      position: null,
      show: false,
      move: false,
      value: null,
    });
  }
  popDrawCard () {
    this.drawCard.show = true;
    this.addBunchCard (this.drawCard);
    this.drawCard = new Card ({
      position: null,
      move: false,
      show: false,
      value: null,
    });
  }

  addCards (newCards) {
    newCards.forEach (c => {
      c.position = this.goal.position;
      c.show = false;
    });

    this.deck.cards = [...newCards, ...this.deck.cards];
    this.profile.nextHealth = Math.round (
      this.deck.cards.length / gameCards.length * 100
    );
  }

  addBunchCard (card) {
    card.position = this.deck.positionBunch;
    this.deck.bunchCards.push (card);
    this.deck.cardPlayed = card;
    this.profile.nextHealth = Math.round (
      this.deck.cards.length / gameCards.length * 100
    );
  }

  changeHealth () {
    this.profile.health = this.profile.nextHealth;
    this.profile.nextHealth = null;
  }
}
class Deck {
  constructor () {
    this.radius = 80;
    this.positionBunch = null;
    this.cards = [];
    this.bunchCards = [];
    this.cardPlayed = new Card ({value: null, show: true});
  }
  getFirstCard () {
    return this.cards.pop ();
  }

  cleanBunch () {
    const cards = this.bunchCards;
    this.bunchCards = [];
    this.cardPlayed = new Card ({value: null});
    return cards;
  }
}
class Goal {
  constructor({type, isPlaying, position}) {
    this.position = position;
    this.type = type;
    this.radius = 50;
    this.isPlaying = isPlaying;
    this.totemIn = false;
    this.timer = 0;
  }
  setTotemIn (totemIn) {
    this.totemIn = totemIn;
  }
}
class Totem {
  constructor({position, playerMove}) {
    this.position = position;
    this.radius = 40;
    this.playerMove = playerMove;
  }
  setPosition (position) {
    this.position = position;
  }
  setPlayerMove (playerMove) {
    this.playerMove = playerMove;
  }
}
