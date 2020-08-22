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
import {message} from 'antd';

import Player from './Player';
import Card from './Card';
import Totem from './Totem';
import Goal from './Goal';
import Deck from './Deck';
import HealthBar from './HealthBar';
import Loader from './Loader';
import {drawGrid} from './Grid';
import {objectReturn} from './animation/moveAToB';

const updatePosition = (width, height, player, position) => {
  if (player.type === 2) {
    return {
      x: width - position.x,
      y: height - position.y,
    };
  }
  if (player.type === 3) {
    return {
      x: height - position.y,
      y: width - position.x,
    };
  }
  if (player.type === 4) {
    return {
      x: position.y,
      y: position.x,
    };
  }
  return position;
};
const Game = () => {
  const {id} = useParams ();
  const history = useHistory ();

  const socket = useRef (null);

  const [game, setGame] = useState (false);

  const canvas = useRef (null);
  const canvasBackground = useRef (null);
  const canvasMessage = useRef (null);
  const canvasPlayers = useRef (null);
  const canvasAnimation = useRef (null);

  const canvasTotem = useRef (null);
  const canvasBunchCards = useRef (null);
  const canvasCard = useRef (null);

  const [totem, _setTotem] = useState ();
  const [click, _setClick] = useState (false);

  const [player, _setPlayer] = useState (null);
  const playersAnimation = [];

  const [state] = useState ({
    screen: {
      width: 900,
      height: 900,
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
      const positionPlayer = updatePosition (
        state.screen.width,
        state.screen.height,
        currentPlayer,
        p.position
      );

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
          state.screen.width,
          state.screen.height,
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
    const totemPosition = updatePosition (
      state.screen.width,
      state.screen.height,
      currentPlayer,
      totem.position
    );
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
        const position = updatePosition (
          state.screen.width,
          state.screen.height,
          currentPlayer,
          card.position
        );
        const newCard = new Card ({
          ...card,
          position,
        });
        newCard.render (state, context);
      });
    });
  };
  const updateObjects = (context, players) => {
    const currentPlayer = playerRef.current;
    context.clearRect (0, 0, state.screen.width, state.screen.height);

    players.forEach (p => {
      const positionGoal = updatePosition (
        state.screen.width,
        state.screen.height,
        currentPlayer,
        p.goal.position
      );
      const positionBunch = updatePosition (
        state.screen.width,
        state.screen.height,
        currentPlayer,
        p.deck.positionBunch
      );
      const positionHealth = updatePosition (
        state.screen.width,
        state.screen.height,
        currentPlayer,
        p.deck.healthBarPosition
      );
      const {goal, deck, timer, isPlaying} = p;
      const newGoal = new Goal ({
        ...goal,
        position: positionGoal,
        timer,
        isPlaying,
      });
      const newHealthBar = new HealthBar ({
        healthBarValue: deck.healthBarValue,
        position: positionHealth,
      });
      const newDeck = new Deck ({
        ...deck,
        positionBunch,
      });
      newGoal.render (state, context);
      newDeck.render (state, context);

      newHealthBar.render (state, context);

      p.deck.cards.forEach (c => {
        let positionCard = updatePosition (
          state.screen.width,
          state.screen.height,
          currentPlayer,
          c.position
        );
        const card = new Card ({...c, position: positionCard});

        card.render (state, context);
      });
    });
  };

  const initGame = () => {
    const context = canvasBackground.current.getContext ('2d');
    context.fillStyle = 'white';
    drawGrid (context, state.screen.width, state.screen.height);
    drawMessage ('ca commence ', 3000);
  };
  const drawMessage = (message, time) => {
    const context = canvasMessage.current.getContext ('2d');
    context.font = '60px Comic Sans MS';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText (message, state.screen.width / 2, state.screen.height / 2);
    setTimeout (() => {
      context.clearRect (0, 0, state.screen.width, state.screen.height);
    }, time);
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

  async function doAnimation (time, card, basePosition, players) {
    const context = canvasBunchCards.current.getContext ('2d');

    const newTime = objectReturn (time, card, basePosition);
    await updateBunchCards (context, players);
    if (newTime > 0) {
      requestAnimationFrame (time =>
        doAnimation (newTime, card, basePosition, players)
      );
    } else {
      context.clearRect (0, 0, state.screen.width, state.screen.height);
    }
  }
  async function doAnimation2 (time, card, basePosition, players, player) {
    const context = canvasAnimation.current.getContext ('2d');
    const newTime = objectReturn (time, card, basePosition);
    updateDrawCard (context, playersAnimation);
    console.log ('wessssj', playersAnimation);
    if (newTime > 0) {
      requestAnimationFrame (() =>
        doAnimation2 (newTime, card, basePosition, playersAnimation, player)
      );
    } else {
      context.clearRect (0, 0, state.screen.width, state.screen.height);
      socket.current.emit ('animationDone', player);
      const indexAnimation = playersAnimation.reduce ((_, p, index) => {
        if (p.type === player.type) {
          return index;
        }
      }, null);
      playersAnimation.splice (indexAnimation, 1);
      console.log ("c'est fini", indexAnimation);

      setTimeout (
        () => context.clearRect (0, 0, state.screen.width, state.screen.height),
        10
      );
    }
  }

  useLayoutEffect (() => {
    console.log ('loooooooool', id);
    socket.current = id
      ? io (`localhost:3001?id=${id}`)
      : io (`localhost:3001`);
    socket.current.on ('connect', function (data) {});
    socket.current.on ('gameNotExist', () => {
      message.error (
        ' You cant access to the game, game do not exist. You will be redirect to the Room Page'
      );
      setTimeout (() => history.push (`/rooms`), 3000);
    });
    socket.current.on ('gameFull', function () {
      message.error (
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
    socket.current.on ('animation', ({players, position}) => {
      let bunchCards = players.reduce ((cards, p) => {
        if (p.deck.bunchCards.length > 4) {
          const reversed = p.deck.bunchCards.reverse ();
          const newBunchCard = reversed.slice (0, 4);
          p.deck.bunchCards = newBunchCard.reverse ();
        }
        return [...cards, ...p.deck.bunchCards];
      }, []);

      bunchCards.forEach (card =>
        setTimeout (() => {
          requestAnimationFrame (() =>
            doAnimation (0, card, position, players)
          );
        }, 100)
      );
    });
    socket.current.on ('animation2', ({player, position, players}) => {
      const pl = players.find (p => p.id === player.id);
      console.log ('on ajoute un jouer', pl);
      playersAnimation.push (pl);
      console.log ('elfamoso liste', playersAnimation);

      requestAnimationFrame (() =>
        doAnimation2 (0, pl.drawCard, position, players, pl)
      );
    });

    socket.current.on ('gameStart', game => {
      setGame (game);
      const {totem} = game;
      setTotem (totem);
      initGame ();
      socket.current.on ('message', ({message, time}) => {
        console.log ('j ai un message', message);
        drawMessage (message, time);
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
          const contextPlayers = canvasPlayers.current.getContext ('2d');
          requestAnimationFrame (() => updatePlayers (contextPlayers, players));
        }
        if (totem) {
          const context = canvasTotem.current.getContext ('2d');
          requestAnimationFrame (() => updateTotem (context, totem));
        }
      });

      socket.current.on ('gameFinish', ({playersWin}) => {
        window.removeEventListener ('resize', handleResize);
        window.removeEventListener ('mousemove', handleMouseMove);
        window.removeEventListener ('mousedown', handleMouseDown);
        window.removeEventListener ('mouseup', handleMouseUp);
        window.removeEventListener ('click', handleMouseClick);
        const winners = playersWin.reduce (
          (acc, p) => (acc = acc + ' player ' + p.type),
          ''
        );
        drawMessage (winners + ' Win the Game !', 10000);
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
      console.log ('on est laaa', socket.current);
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
    ? <Loader game={game} />
    : <div>
        <canvas
          id="background-layer"
          width={state.screen.width}
          height={state.screen.height}
          ref={canvasBackground}
        />

        <canvas
          id="ui-layer"
          width={state.screen.width}
          height={state.screen.height}
          ref={canvas}
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
          id="ui-message"
          width={state.screen.width}
          height={state.screen.height}
          ref={canvasMessage}
        />
      </div>;
};

export default Game;

const Rec = styled.div`
    width: 100px;
    height: 100px;
    background: red;
  `;
