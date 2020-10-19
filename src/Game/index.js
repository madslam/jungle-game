import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import '../App.css';
import styled from 'styled-components';
import io from 'socket.io-client';
import {useParams, useHistory} from 'react-router-dom';
import {message as messageAntd} from 'antd';

import Player from './Player';
import Card from './Card';
import Totem from './Totem';
import Goal from './Goal';
import Deck from './Deck';
import Loader from './Loader';
import {drawGrid} from './Grid';
import {objectReturn} from './animation/moveAToB';
import Profile from './Profile';
import {drawCircularAnimation} from './animation/circular';
import modal from './Modal';
import Lobby from '../Lobby';
import {GAME_WIDTH, GAME_HEIGHT, updatePosition} from './utils';
import {initParticle, animateParticle} from './animation/mouse-particle';
import {initializeParticles} from './animation/light-particle';
const Game = () => {
  const mousePlayer = {};

  const {id} = useParams ();
  const history = useHistory ();

  const socket = useRef (null);

  const [game, setGame] = useState (false);

  const canvas = useRef (null);
  const canvasBackground = useRef (null);
  const canvasMouseAnimation = useRef (null);
  const canvasPlayers = useRef (null);
  const canvasAnimation = useRef (null);
  const canvasScoreLooser = useRef (null);
  const canvasTotem = useRef (null);
  const canvasBunchCards = useRef (null);
  const canvasCard = useRef (null);
  const canvasTotemAnimation = useRef (null);

  const [totem, _setTotem] = useState ();
  const [click, _setClick] = useState (false);

  const [player, _setPlayer] = useState (null);
  const playersAnimation = [];
  const cardsLooseAnimation = {size: 0};

  const [state] = useState ({
    screen: {
      width: 900,
      height: 900,
      widthUser: window.innerWidth,
      heightUser: window.innerHeight,
      ratio: window.devicePixelRatio || 1,
    },
  });

  const totemRef = React.useRef (totem);
  const setTotem = data => {
    totemRef.current = data;
    _setTotem (data);
  };
  const clickRef = React.useRef (click);
  const setClick = data => {
    clickRef.current = data;
    _setClick (data);
  };

  const playerRef = React.useRef (player);
  const setPlayer = data => {
    playerRef.current = data;
    _setPlayer (data);
  };
  const updatePlayers = (context, players) => {
    const currentPlayer = playerRef.current;
    context.clearRect (0, 0, state.screen.width, state.screen.height);

    players.forEach (p => {
      const positionPlayer = updatePosition (currentPlayer, p.position);

      const np = new Player ({
        ...p,
        position: positionPlayer,
      });
      np.render (state, context);
    });
  };
  const updateDrawCard = (context, players) => {
    const currentPlayer = playerRef.current;
    context.clearRect (0, 0, state.screen.width, state.screen.height);

    players.forEach (p => {
      const positionDrawCard = p.drawCard.position;
      if (positionDrawCard) {
        const positionDrawCard = updatePosition (
          currentPlayer,
          p.drawCard.position
        );
        const card = new Card ({
          ...p.drawCard,
          position: positionDrawCard,
        });

        card.render (state, context);
      }
    });
  };

  const updateTotem = (context, totem) => {
    const currentPlayer = playerRef.current;
    context.clearRect (0, 0, state.screen.width, state.screen.height);
    const totemPosition = updatePosition (currentPlayer, totem.position);
    const newTotem = new Totem ({
      position: totemPosition,
      playerMove: totem.playerMove,
      radius: totem.radius,
    });
    newTotem.render (state, context);
  };

  const updateBunchCards = (context, players) => {
    context.clearRect (0, 0, state.screen.width, state.screen.height);
    const currentPlayer = playerRef.current;
    players.forEach (p => {
      let bunchCards = p.deck.bunchCards;
      if (bunchCards.length > 4) {
        const reversed = bunchCards.reverse ();
        const newBunchCard = reversed.slice (0, 6);
        bunchCards = newBunchCard.reverse ();
      }
      bunchCards.forEach (card => {
        const position = updatePosition (currentPlayer, card.position);
        const newCard = new Card ({
          ...card,
          position,
        });
        newCard.render (state, context);
      });
    });
  };
  const updateObjects = (context, players) => {
    context.clearRect (0, 0, state.screen.width, state.screen.height);
    const currentPlayer = playerRef.current;

    players.forEach (p => {
      const positionGoal = updatePosition (currentPlayer, p.goal.position);
      const positionProfile = updatePosition (
        currentPlayer,
        p.profile.position
      );
      const positionBunch = updatePosition (
        currentPlayer,
        p.deck.positionBunch
      );

      const {goal, deck, profile, timer, isPlaying} = p;
      const newGoal = new Goal ({
        ...goal,
        position: positionGoal,
        timer,
        isPlaying,
      });

      const newDeck = new Deck ({
        ...deck,
        positionBunch,
      });

      const newProfile = new Profile ({
        ...profile,
        position: positionProfile,
      });
      newDeck.render (state, context);
      newGoal.render (state, context);
      newProfile.render (state, context);

      p.deck.cards.forEach (c => {
        let positionCard = updatePosition (currentPlayer, c.position);
        const card = new Card ({...c, position: positionCard});

        card.render (state, context);
      });
    });
  };

  const initGame = () => {
    const context = canvasBackground.current.getContext ('2d');
    const contextTotem = canvasTotemAnimation.current.getContext ('2d');
    // drawGrid (context, state.screen.width, state.screen.height);
    drawCircularAnimation (contextTotem, 0.01, 0);
    initializeParticles (
      context,
      state.screen.widthUser,
      state.screen.heightUser
    );

    drawMessage ('It Begin ', 2);
  };
  const drawMessage = (message, time) => {
    messageAntd.success ({
      content: message,
      duration: time,
      className: 'custom-class',
      style: {
        marginTop: '40vh',
        fontSize: '40px',
        zIndex: 100,
      },
    });
  };

  const handleMouseMove = useCallback (({clientX, clientY}) => {
    if (canvas.current) {
      var rect = canvas.current.getBoundingClientRect ();

      let position = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };

      if (playerRef.current.type === 2) {
        position = {
          x: state.screen.width - position.x,
          y: state.screen.height - position.y,
        };
      }

      if (playerRef.current.type === 3) {
        position = {
          y: state.screen.width - position.x,
          x: state.screen.height - position.y,
        };
      }
      if (playerRef.current.type === 4) {
        position = {
          y: position.x,
          x: position.y,
        };
      }
      socket.current.emit ('mouse', position);
    }
  }, []); //eslint-disable-line

  const handleMouseDown = useCallback (({clientX, clientY}) => {
    if (canvas.current) {
      var rect = canvas.current.getBoundingClientRect ();

      let position = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      if (playerRef.current.type === 2) {
        position = {
          x: state.screen.width - position.x,
          y: state.screen.height - position.y,
        };
      }
      if (playerRef.current.type === 3) {
        position = {
          x: state.screen.height - position.y,
          y: state.screen.width - position.x,
        };
      }
      if (playerRef.current.type === 4) {
        position = {
          x: position.y,
          y: position.x,
        };
      }
      socket.current.emit ('mouseDown', position);
    }
  });
  const handleMouseUp = useCallback (() => {
    setClick (false);
    socket.current.emit ('mouseUp');
  });
  const handleMouseClick = useCallback (({clientX, clientY}) => {
    var rect = canvas.current.getBoundingClientRect ();

    let position = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    if (playerRef.current.type === 2) {
      position = {
        x: state.screen.width - clientX + rect.left,
        y: state.screen.height - clientY + rect.top,
      };
    }
    if (playerRef.current.type === 3) {
      position = {
        x: state.screen.height - clientY + rect.top,
        y: state.screen.width - clientX + rect.left,
      };
    }
    if (playerRef.current.type === 4) {
      position = {
        x: clientY - rect.top,
        y: clientX - rect.left,
      };
    }
    socket.current.emit ('mouseClick', position);
  }, []); //eslint-disable-line

  const handleResize = (value, e) => {
    /* setState ({
        screen: {
          ratio: window.devicePixelRatio || 1,
        },
      });*/
  };
  async function doAnimationLooser (players, cardsLooser, distance) {
    if (!canvasScoreLooser.current) {
      return;
    }
    const context = canvasScoreLooser.current.getContext ('2d');

    if (distance <= 0) {
      setTimeout (() => {
        context.clearRect (0, 0, state.screen.width, state.screen.height);
      }, 3000);
      return;
    }
    context.clearRect (0, 0, state.screen.width, state.screen.height);

    const newDistance = distance - 0.5;
    context.fillStyle = 'red';
    context.font = '20px Comic Sans MS';
    const currentPlayer = playerRef.current;
    players.forEach ((p, index) => {
      const numberCards = cardsLooser[index].length;
      const positionProfile = updatePosition (
        currentPlayer,
        p.profile.position
      );
      context.fillText (
        `+ ${numberCards}`,
        positionProfile.x + 50,
        positionProfile.y - newDistance
      );
    });
    requestAnimationFrame (() =>
      doAnimationLooser (players, cardsLooser, newDistance)
    );
  }
  async function doAnimation (time, card, basePosition, players) {
    if (!canvasBunchCards.current) {
      return;
    }
    const context = canvasBunchCards.current.getContext ('2d');

    const newTime = objectReturn (time, card, basePosition);
    await updateBunchCards (context, players);
    if (newTime > 0) {
      requestAnimationFrame (time =>
        doAnimation (newTime, card, basePosition, players)
      );
    } else {
      cardsLooseAnimation.size -= 1;
      if (cardsLooseAnimation.size === 0) {
        context.clearRect (0, 0, state.screen.width, state.screen.height);
        socket.current.emit ('animationCardsToDeckDone');
      }
    }
  }
  function doAnimation2 (time, card, basePosition, players, player) {
    if (!canvasAnimation.current) {
      return;
    }
    const context = canvasAnimation.current.getContext ('2d');
    const newTime = objectReturn (time, card, basePosition);
    updateDrawCard (context, playersAnimation);
    if (newTime > 0) {
      requestAnimationFrame (() =>
        doAnimation2 (newTime, card, basePosition, playersAnimation, player)
      );
    } else {
      setTimeout (() => {
        context.clearRect (0, 0, state.screen.width, state.screen.height);
      }, 200);
      socket.current.emit ('animationDone', player);
      const indexAnimation = playersAnimation.reduce ((_, p, index) => {
        if (p.type === player.type) {
          return index;
        }
      }, null);
      playersAnimation.splice (indexAnimation, 1);

      /* setTimeout (
        () => context.clearRect (0, 0, state.screen.width, state.screen.height),
        1000
      );*/
    }
  }

  useLayoutEffect (() => {
    socket.current = id
      ? io (`localhost:8080/?id=${id}`)
      : io (`localhost:8080/`);
    socket.current.on ('connect', function (data) {});
    socket.current.on ('gameNotExist', () => {
      messageAntd.error (
        ' You cant access to the game, game do not exist. You will be redirect to the Room Page'
      );
      setTimeout (() => history.push (`/rooms`), 3000);
    });
    socket.current.on ('gameFull', function () {
      messageAntd.error (
        ' You cant access to the game, game is full. You will be redirect to the Room Page'
      );
      setGame ({full: true});
      setTimeout (() => history.push (`/rooms`), 3000);
    });

    socket.current.on ('gameInit', ({player, game}) => {
      setPlayer (player);
      setGame (game);
    });
    socket.current.on ('gameAddPlayer', ({game}) => {
      setGame (game);
    });
    socket.current.on ('gameWillStart', game => {
      setGame (game);
    });
    socket.current.on ('animation', ({playersLost, cardsLooser}) => {
      doAnimationLooser (playersLost, cardsLooser, 30);

      playersLost.forEach ((p, index) => {
        const cards = cardsLooser[index];
        const position = p.goal.position;
        const cardsDeck = [...cards, ...p.deck.bunchCards];

        p.deck.bunchCards = cardsDeck;
        cardsLooseAnimation.size += cardsDeck.length;
        p.deck.bunchCards.forEach (card =>
          setTimeout (() => {
            requestAnimationFrame (() =>
              doAnimation (0, card, position, playersLost)
            );
          }, 100)
        );
      });
    });
    socket.current.on ('animation2', ({player, position, players}) => {
      const pl = players.find (p => p.id === player.id);
      playersAnimation.push (pl);

      requestAnimationFrame (() =>
        doAnimation2 (0, pl.drawCard, position, players, pl)
      );
    });

    socket.current.on ('gameStart', game => {
      setGame (game);
      const {totem, players} = game;
      players.forEach (p => {
        const particles = initParticle ();
        mousePlayer[p.type] = {position: p.position, particles, skin: p.skin};
      });
      const context = canvasMouseAnimation.current.getContext ('2d');

      animateParticle (context, mousePlayer, playerRef);
      setTotem (totem);
      initGame ();
      socket.current.on ('message', ({message}) => {
        drawMessage (message, 2);
      });
      socket.current.on ('update', gameUpdate => {
        if (!game) {
          return;
        }
        const {players, totem, goal, deck, bunchCards, card} = gameUpdate;
        if (card) {
          const context = canvasCard.current.getContext ('2d');
          requestAnimationFrame (() => updateDrawCard (context, players));
        }
        if (bunchCards) {
          const context = canvasBunchCards.current.getContext ('2d');
          requestAnimationFrame (() => updateBunchCards (context, players));
        }

        if (goal || deck) {
          const context = canvas.current.getContext ('2d');
          requestAnimationFrame (() => updateObjects (context, players));
        }
        if (players) {
          players.forEach (p => {
            mousePlayer[p.type].position = p.position;
          });
          const contextPlayers = canvasPlayers.current.getContext ('2d');
          requestAnimationFrame (() => updatePlayers (contextPlayers, players));
        }
        if (totem) {
          const context = canvasTotem.current.getContext ('2d');
          requestAnimationFrame (() => updateTotem (context, totem));
        }
      });
      socket.current.on ('gameEgality', () => {
        console.log ('il y a égalité');
        drawMessage ('Egality !', 2);
        setTimeout (
          () =>
            modal ({
              redirect: () => history.push (`/rooms`),
              title: 'Egality, no one with the game',
            }),
          2000
        );
      });
      socket.current.on ('gameFinish', ({playersWin}) => {
        const winners = playersWin.reduce (
          (acc, p) => (acc = acc + ' player ' + p.type),
          ''
        );
        drawMessage (winners + ' Win the Game !', 2);
        setTimeout (
          () =>
            modal ({
              redirect: () => history.push (`/rooms`),
              title: winners + ' won the game',
            }),
          2000
        );
      });
      socket.current.on ('gameStop', ({game}) => {
        window.removeEventListener ('resize', handleResize);
        window.removeEventListener ('mousemove', handleMouseMove);
        window.removeEventListener ('mousedown', handleMouseDown);
        window.removeEventListener ('mouseup', handleMouseUp);
        window.removeEventListener ('click', handleMouseClick);
        console.log ('on deleteee', game);
        setGame (game);
        setPlayer (null);
      });
      socket.current.on ('redirect', () => {
        socket.current.disconnect ();
        history.push (`/rooms`);
      });
      window.addEventListener ('resize', handleResize);
      window.addEventListener ('mousemove', handleMouseMove);
      window.addEventListener ('mousedown', handleMouseDown);
      window.addEventListener ('mouseup', handleMouseUp);
      window.addEventListener ('click', handleMouseClick);
    });
  }, []); //eslint-disable-line
  useEffect (
    () => () => {
      window.removeEventListener ('resize', handleResize);
      window.removeEventListener ('mousemove', handleMouseMove);
      window.removeEventListener ('mousedown', handleMouseDown);
      window.removeEventListener ('mouseup', handleMouseUp);
      window.removeEventListener ('click', handleMouseClick);
      socket.current.emit ('disco');
      socket.current.disconnect ();

      setGame (false);

      socket.current.disconnect ();
      history.push (`/rooms`);
    },
    [] //eslint-disable-line
  );
  if (!game) {
    return <Loader message={'connexion à une partie en cours'} />;
  }
  if (game.full) {
    return <p>la partie est pleine désolé</p>;
  }

  return !game.start
    ? <Lobby game={game} socket={socket} />
    : <div>
        <canvas
          id="background-layer"
          width={state.screen.widthUser}
          height={state.screen.heightUser}
          ref={canvasBackground}
        />
        <div id="game">
          <canvas
            id="ui-looser"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasScoreLooser}
          />

          <canvas
            id="ui-layer"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvas}
          />
          <canvas
            id="ui-totem-animation"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasTotemAnimation}
          />

          <canvas
            id="ui-totem"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasTotem}
          />
          <canvas
            id="ui-bunch-cards"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasBunchCards}
          />
          <canvas
            id="ui-cards-player"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasCard}
          />
          <canvas
            id="ui-players"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasPlayers}
          />
          <canvas
            id="ui-cards-player"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasAnimation}
          />
          <canvas
            id="ui-mouse-animation"
            width={state.screen.width}
            height={state.screen.height}
            ref={canvasMouseAnimation}
          />
        </div>
      </div>;
};

export default Game;

const Rec = styled.div`
    width: 100px;
    height: 100px;
    background: red;
  `;
