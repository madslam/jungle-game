import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
} from 'react';
import './App.css';
import styled from 'styled-components';
import io from 'socket.io-client';

import Player from './Player';
import Totem from './Totem';
import Goal from './Goal';
import Deck from './Deck';
import Loader from './Loader';
import {drawGrid} from './Grid';
import {move} from './animation/moveAToB';

const socket = io ('https://boiling-spire-48650.herokuapp.com/');

const App = () => {
  const [game, setGame] = useState (false);

  const canvas = useRef (null);
  const canvasBackground = useRef (null);
  const canvasMessage = useRef (null);
  const canvasPlayers = useRef (null);
  const canvasTotem = useRef (null);
  const canvasTimer = useRef (null);

  const [totem, _setTotem] = useState ();
  const [click, _setClick] = useState (false);

  const [player, _setPlayer] = useState (null);
  const [state, setState] = useState ({
    screen: {
      width: 1100,
      height: 700,
      ratio: window.devicePixelRatio || 1,
    },
    player: null,
    context: null,
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
      let positionPlayer = p.position;
      let positionDrawCard = p.drawCard.position;
      if (
        (p.type === 2 && p.id === currentPlayer.id) ||
        (p.type === 1 && currentPlayer.type === 2)
      ) {
        positionPlayer = {
          x: state.screen.width - p.position.x,
          y: state.screen.height - p.position.y,
        };
        if (positionDrawCard) {
          positionDrawCard = {
            x: state.screen.width - p.drawCard.position.x,
            y: state.screen.height - p.drawCard.position.y,
          };
        }
      }
      if (p.drawCard.position) {
      }
      const np = new Player ({
        ...p,
        position: positionPlayer,
      });
      np.drawCard.position = positionDrawCard;

      np.drawCard.rotation = p.drawCard.rotation;

      np.render (state, context);
    });
  };

  const updateTotem = (context, totem) => {
    const currentPlayer = playerRef.current;
    context.clearRect (0, 0, state.screen.width, state.screen.height);
    let totemPosition = totem.position;
    if (currentPlayer.type === 2) {
      totemPosition = {
        x: state.screen.width - totem.position.x,
        y: state.screen.height - totem.position.y,
      };
    }
    const newTotem = new Totem ({
      position: totemPosition,
      playerMove: totem.playerMove,
      radius: totem.radius,
    });
    newTotem.render (state, context);
  };
  const updateObjects = (context, players) => {
    const currentPlayer = playerRef.current;
    context.clearRect (0, 0, state.screen.width, state.screen.height);

    players.forEach (p => {
      let positionGoal = p.goal.position;
      let positionBunch = p.deck.positionBunch;
      let bunchCards = p.deck.bunchCards;
      if (currentPlayer.type === 2) {
        positionGoal = {
          x: state.screen.width - p.goal.position.x,
          y: state.screen.height - p.goal.position.y,
        };
        positionBunch = {
          x: state.screen.width - p.deck.positionBunch.x,
          y: state.screen.height - p.deck.positionBunch.y,
        };
        bunchCards = p.deck.bunchCards.map (card => {
          console.log (card);
          const position = {
            x: state.screen.width - card.position.x,
            y: state.screen.height - card.position.y,
          };
          return {...card, position};
        });
      }
      const {goal, deck, timer, isPlaying} = p;
      const newGoal = new Goal ({
        ...goal,
        position: positionGoal,
        timer,
        isPlaying,
      });
      const newDeck = new Deck ({
        ...deck,
        positionBunch,
        bunchCards,
      });
      newGoal.render (state, context);
      newDeck.render (state, context);
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
      socket.emit ('mouse', position);
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
      socket.emit ('mouseDown', position);
    }
  });
  const handleMouseUp = useCallback (() => {
    setClick (false);
    socket.emit ('mouseUp');
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
    socket.emit ('mouseClick', position);
  }, []); //eslint-disable-line

  const handleResize = (value, e) => {
    /* setState ({
      screen: {
        ratio: window.devicePixelRatio || 1,
      },
    });*/
  };

  useLayoutEffect (() => {
    socket.on ('connect', function (data) {});
    socket.on ('gameFull', function (data) {
      alert ('la partie est pleine');
      setGame ({full: true});
    });

    socket.on ('gameInit', ({player, game}) => {
      setPlayer (player);
      setGame (game);
    });
    socket.on ('gameWillStart', game => {
      console.log ('ca va commencer');
      setGame (game);
    });

    socket.on ('gameStart', game => {
      setGame (game);
      const {totem, players} = game;
      setTotem (totem);
      initGame ();
      // setPlayers (players);
      socket.on ('message', ({message, time}) => {
        console.log ('j ai un message', message);
        drawMessage (message, time);
      });
      socket.on ('update', game => {
        const {players, totem, goal, deck} = game;

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

      socket.on ('nextRound', player => {
        console.log ('nextRound');
      });
      socket.on ('gameStop', function () {
        console.log ('on stop la game');
        setGame ({full: false});
        setPlayer (null);
        window.removeEventListener ('resize', handleResize);
        window.removeEventListener ('mousemove', handleMouseMove);
        window.removeEventListener ('mousedown', handleMouseDown);
        window.removeEventListener ('mouseup', handleMouseUp);
        window.removeEventListener ('click', handleMouseClick);
      });
      window.addEventListener ('resize', handleResize);
      window.addEventListener ('mousemove', handleMouseMove);
      window.addEventListener ('mousedown', handleMouseDown);
      window.addEventListener ('mouseup', handleMouseUp);
      window.addEventListener ('click', handleMouseClick);
    });
  }, []); //eslint-disable-line
  useEffect (() => () => socket.emit ('disconnect'));
  if (!game) {
    return <Loader message={'connexion à une partie en cours'} />;
  }
  if (game.full) {
    return <p>la partie est pleine désolé</p>;
  }

  return !game.start
    ? <Loader message={game.message} />
    : <div>
        <canvas
          id="background-layer"
          width={state.screen.width * state.screen.ratio}
          height={state.screen.height * state.screen.ratio}
          ref={canvasBackground}
        />

        <canvas
          id="ui-layer"
          width={state.screen.width * state.screen.ratio}
          height={state.screen.height * state.screen.ratio}
          ref={canvas}
        />
        <canvas
          id="ui-timer"
          width={state.screen.width * state.screen.ratio}
          height={state.screen.height * state.screen.ratio}
          ref={canvasTimer}
        />
        <canvas
          id="ui-totem"
          width={state.screen.width * state.screen.ratio}
          height={state.screen.height * state.screen.ratio}
          ref={canvasTotem}
        />
        <canvas
          id="ui-players"
          width={state.screen.width * state.screen.ratio}
          height={state.screen.height * state.screen.ratio}
          ref={canvasPlayers}
        />
        <canvas
          id="ui-message"
          width={state.screen.width * state.screen.ratio}
          height={state.screen.height * state.screen.ratio}
          ref={canvasMessage}
        />
      </div>;
};

export default App;

const Rec = styled.div`
  width: 100px;
  height: 100px;
  background: red;
`;
