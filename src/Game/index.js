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
import {useHistory} from 'react-router-dom';
import {message as messageAntd} from 'antd';
import throttle from 'lodash.throttle';

import Player from './Player';
import Card, {loadImages} from './Card';
import Totem from './Totem';
import Goal from './Goal';
import Deck from './Deck';
import Loader from './Loader';
import {drawGrid} from './Grid';
import {objectReturn} from './animation/moveAToB';
import Profile from './Profile';
import modal from './Modal';
import Lobby from '../Lobby';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  FRAME_MIN_TIME,
  updateMousePosition,
  updatePosition,
  checkCollision,
} from './utils';
import {initializeParticles} from './animation/light-particle';
import GameContext from './GameContext';
import GameInfos from '../Lobby/GameInfos';

let lastFrameTime = 0; // the last frame time

const Game = ({gameId, userPhotoURL, setGameId, namePlayer}) => {
  const history = useHistory ();
  const images = useRef ([]);
  const socket = useRef (null);

  const [game, setGame] = useState (false);
  const [gameHistory, setGameHistory] = useState ([]);

  const [playerPlay, setPlayerPlay] = useState (false);

  const gamu = useRef ({
    animation: {health: false, drawCard: false},
    totem: null,
    players: [],
    bunchCards: [],
  });

  const canvas = useRef (null);
  const canvasBackground = useRef (null);
  const canvasScoreLooser = useRef (null);
  const gameDiv = useRef (null);

  const [totem, _setTotem] = useState ();

  const [player, _setPlayer] = useState (null);
  let nextRoundInterval = useRef (null);

  const [state, setState] = useState ({
    widthUser: window.innerWidth,
    heightUser: window.innerHeight,
    screen: {
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      ratio: window.devicePixelRatio || 1,
    },
  });

  const totemRef = useRef (totem);
  const setTotem = data => {
    totemRef.current = data;
    _setTotem (data);
  };

  const playerRef = React.useRef (player);
  const setPlayer = data => {
    playerRef.current = data;
    _setPlayer (data);
  };

  const updateBunchCards = players => {
    const currentPlayer = playerRef.current;
    gamu.current.bunchCards = {};
    players.forEach ((p, index) => {
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
          image: images.current['card-' + card.value],
          skinCard: p.skinCard,
        });
        gamu.current.bunchCards[card.id] = newCard;
      });
    });
  };
  const initGame = () => {
    const context = canvasBackground.current.getContext ('2d');
    // drawGrid (context, state.screen.width, state.screen.height);
    // drawCircularAnimation (contextTotem, 0.01, 0);

    initializeParticles (context, state.widthUser, state.heightUser);

    drawMessage ('It Begin ', 2);
  };
  const drawMessage = (message, time) => {
    messageAntd.success ({
      content: message,
      duration: time,
    });
  };

  const scaleMouse = ({clientX, clientY}) => {
    const context = canvas.current.getContext ('2d');

    const mouseX = clientX - context.canvas.offsetLeft;
    const mouseY = clientY - context.canvas.offsetTop;
    const x = mouseX * context.canvas.width / context.canvas.clientWidth;
    const y = mouseY * context.canvas.height / context.canvas.clientHeight;

    return {x: Math.round (x), y: Math.round (y)};
  };

  const handleMouseMove = throttle (({clientX, clientY}) => {
    if (canvas.current) {
      const {x, y} = scaleMouse ({clientX, clientY});

      let position = {
        x,
        y,
      };
      playerRef.current = {
        ...playerRef.current,
        position,
      };

      position = updateMousePosition (playerRef.current, position);
      const zone = {
        position: {x: GAME_WIDTH / 2, y: GAME_WIDTH / 2},
        radius: 200,
      };
      const p = {position, radius: playerRef.current.radius};
      const checkColisionZone = checkCollision (zone, p);

      if (checkColisionZone && !playerRef.current.timeOut) {
        playerRef.current.timeOut = Date.now ();
      }
      if (!checkColisionZone && playerRef.current.timeOut) {
        socket.current.emit ('shitPlayer', false);

        playerRef.current.timeOut = null;
      }
      socket.current.emit('mouse', position);


    }
  }, 20); //eslint-disable-line

  const handleMouseDown =({clientX, clientY}) => {
    if (canvas.current) {
      const {x, y} = scaleMouse ({clientX, clientY});
      let position = {
        x,
        y,
      };
      if (playerRef.current.timeOut) {
        const timeInZone = Math.floor (
          (Date.now () - playerRef.current.timeOut) / 1000
        );
        if (timeInZone > 3) {
          return;
        }
      }
      position = updateMousePosition (playerRef.current, position);

      socket.current.emit ('mouseDown', position);
    }
  };
  const handleMouseUp = () => {
    socket.current.emit ('mouseUp');
  };
  const handleResize = (value, e) => {
    const context = canvasBackground.current.getContext ('2d');
    setState ({
      ...state,
      widthUser: window.innerWidth,
      heightUser: window.innerHeight,
    });
    initializeParticles (context, window.innerWidth, window.innerWidth);
  };

  async function doAnimationLooser (playersLost, distance) {
    if (!canvasScoreLooser.current) {
      return;
    }
    const context = canvasScoreLooser.current.getContext ('2d');

    if (distance <= 0) {
      setTimeout (() => {
        context.clearRect (0, 0, state.screen.width, state.screen.height);
      }, 200);
      return;
    }
    context.clearRect (0, 0, state.screen.width, state.screen.height);

    const newDistance = distance - 0.5;
    context.fillStyle = 'red';
    context.font = '20px Comic Sans MS';
    const currentPlayer = playerRef.current;
    playersLost.forEach (({player, numberCards}) => {
      const positionGoal = updatePosition (currentPlayer, player.goal.position);

      const positionProfile = positionGoal;
      context.fillText (
        `+ ${numberCards}`,
        positionProfile.x + 70,
        positionProfile.y - newDistance
      );
    });
    requestAnimationFrame (() => doAnimationLooser (playersLost, newDistance));
  }

  const doAnimationBunchCards = () => {
    let isFinish = true;

    Object.values (gamu.current.bunchCards).forEach (card => {
      if (card && card.animation && card.nextPosition) {
        isFinish = false;
        const newTime = objectReturn (card.time, card, card.nextPosition);

        if (newTime <= 0) {
          card.animation = false;
        }
        card.time = newTime;
        if (card.flip) {
          card.flipAnimation ();
        }
      }
    });
    if (isFinish) {
      gamu.current.animation.bunchCards = false;
      socket.current.emit ('animationCardsToDeckDone');
    }
  };
  const doAnimationTotem = () => {
    if (gamu.current.totem) {
      const newTime = objectReturn (
        gamu.current.totem.time,
        gamu.current.totem,
        gamu.current.totem.nextPosition
      );

      if (newTime <= 0) {
        gamu.current.animation.totem = false;
        socket.current.emit ('animationTotemDone');
      }
      gamu.current.totem.time = newTime;
    }
  };
  const doAnimationDrawCard = () => {
    let isFinish = true;

    gamu.current.players.forEach (p => {
      if (p.drawCard && p.drawCard.animation) {
        isFinish = false;
        const newTime = objectReturn (
          p.drawCard.time,
          p.drawCard,
          p.drawCard.nextPosition
        );

        if (p.drawCard.shadowOffsetY > 0) {
          p.drawCard.shadowOffsetX = p.drawCard.shadowOffsetX - 1;
          p.drawCard.shadowOffsetY = p.drawCard.shadowOffsetY - 1;
          p.drawCard.shadowBlur = p.drawCard.shadowBlur - 1;
        }
        if (newTime <= 0) {
          p.drawCard.animation = false;
          p.drawCard.move = false;
          p.drawCard.shadowOffsetX = 20;
          p.drawCard.shadowOffsetY = 20;
          p.drawCard.shadowBlur = 20;
          socket.current.emit ('animationDrawCardDone', p.player);
        }
        p.drawCard.time = newTime;
        if (p.drawCard.flip) {
          p.drawCard.flipAnimation ();
        }
      }
    });
    if (isFinish) {
      gamu.current.animation.drawCard = false;
    }
  };

  useLayoutEffect (() => {
    socket.current = gameId
      ? io (
          `localhost:8080/?id=${gameId}&namePlayer=${namePlayer}&imgPlayer=${userPhotoURL}`
        )
      : io (`localhost:8080/`);
    socket.current.on ('connect', function (data) {});
    socket.current.on ('gameNotExist', () => {
      messageAntd.error (
        ' You cant access to the game, game do not exist. You will be redirect to the Room Page'
      );
      history.push (`/`);
      setTimeout (() => setGameId (null), 3000);
    });
    socket.current.on ('gameFull', function () {
      messageAntd.error (
        ' You cant access to the game, game is full. You will be redirect to the Room Page'
      );
      history.push (`/`);
      setGame ({full: true});
      setTimeout (() => setGameId (null), 3000);
    });

    socket.current.on ('gameInit', ({player, game}) => {
      setPlayer (player);
      setGame (game);
    });

    socket.current.on ('gameUpdate', ({game}) => {
      setGame (game);
    });
    socket.current.on ('gameWillStart', game => {
      setGame (game);
      images.current = loadImages ();
    });

    const searchNextRound = ({profile, player}) => {
      clearInterval (nextRoundInterval.current);
      return setInterval (() => {
        const currentPlayer = playerRef.current;
        if (!profile.isPlaying) {
          return;
        }
        if (profile.isPlaying && currentPlayer.type === player.type) {
          const timePassed =
            profile.timePerRound -
            Math.floor ((Date.now () - profile.isPlaying) / 1000);

          if (timePassed <= 0) {
            profile.isPlaying = null;
            socket.current.emit ('nextRound');
            clearInterval (nextRoundInterval.current);
          }
        }
      }, 100);
    };
    function gameLoop (time) {
      // Update game objects in the loop
      if (time - lastFrameTime < FRAME_MIN_TIME) {
        //skip the frame if the call is too early
        window.requestAnimationFrame (gameLoop);

        return;
      }
      lastFrameTime = time; // remember the time of the rendered frame

      if (gamu.current.animation.health) {
        doAnimationHealth ();
      }

      if (gamu.current.animation.totem) {
        doAnimationTotem ();
      }
      if (gamu.current.animation.drawCard) {
        doAnimationDrawCard ();
      }
      if (gamu.current.animation.bunchCards) {
        doAnimationBunchCards ();
      }
      drawPlayers ();
      window.requestAnimationFrame (gameLoop);
    }

    socket.current.on ('animationBunchCards', ({playersLost, cardsLooser}) => {
      doAnimationLooser (playersLost, 30);
      const currentPlayer = playerRef.current;
      gamu.current.animation.bunchCards = true;

      cardsLooser.forEach (card => {
        if (gamu.current.bunchCards[card.id]) {
          gamu.current.bunchCards[card.id].animation = true;
          gamu.current.bunchCards[card.id].flip = true;

          const nextPosition = updatePosition (
            currentPlayer,
            card.nextPosition
          );
          gamu.current.bunchCards[card.id].nextPosition = nextPosition;
        }
      });
    });

    socket.current.on ('animationTotem', ({totem}) => {
      const currentPlayer = playerRef.current;

      const positionNextTotem = updatePosition (
        currentPlayer,
        totem.nextPosition
      );
      gamu.current.totem.nextPosition = positionNextTotem;
      gamu.current.animation.totem = true;
    });

    socket.current.on ('animationDrawCard', ({player, position}) => {
      const currentPlayer = playerRef.current;
      const playerGame = gamu.current.players.find (
        p => p.player.id === player.id
      );
      const positionNextDrawCard = updatePosition (currentPlayer, position);
      playerGame.drawCard.nextPosition = positionNextDrawCard;
      playerGame.drawCard.animation = true;

      if (player.drawCard.moveTo === 'bunch') {
        playerGame.drawCard.flip = true;
      }
      gamu.current.animation.drawCard = true;
    });

    socket.current.on ('animationHealth', ({players}) => {
      updateProfile (players);
      gamu.current.animation.health = true;
    });

    const updateTotem = totem => {
      const currentPlayer = playerRef.current;
      const totemPosition = updatePosition (currentPlayer, totem.position);
      gamu.current.totem.position = totemPosition;
    };

    const updateDrawCard = playerDrawCard => {
      const currentPlayer = playerRef.current;

      const playerGame = gamu.current.players.find (
        p => p.player.id === playerDrawCard.id
      );
      const positionDrawCard = playerDrawCard.drawCard.position;

      if (positionDrawCard) {
        const positionDrawCard = updatePosition (
          currentPlayer,
          playerDrawCard.drawCard.position
        );
        const drawCard = new Card ({
          ...playerDrawCard.drawCard,
          skinCard: playerDrawCard.skinCard,
          image: images.current['card-' + playerDrawCard.drawCard.value],
          position: positionDrawCard,
        });

        playerGame.drawCard = drawCard;
      } else {
        playerGame.drawCard = null;
      }
    };

    const updateProfile = players => {
      const currentPlayer = playerRef.current;

      players.forEach ((p, index) => {
        const {profile, goal, isPlaying} = p;
        const positionGoal = updatePosition (currentPlayer, goal.position);

        const newProfile = new Profile ({
          ...profile,
          position: {
            x: positionGoal.x - 100,
            y: positionGoal.y,
          },
          isPlaying,
        });
        gamu.current.players[index].profile = newProfile;
      });
    };
    const updateRound = players => {
      gamu.current.players.forEach (p => (p.profile.isPlaying = null));
      players.forEach ((p, index) => {
        const {isPlaying} = p;
        gamu.current.players[index].profile.isPlaying = isPlaying;
        if (isPlaying) {
          nextRoundInterval.current = searchNextRound (
            gamu.current.players[index]
          );
        }
      });
    };

    const updateCards = players => {
      const currentPlayer = playerRef.current;

      players.forEach ((p, index) => {
        const cards = p.deck.cards.map (c => {
          let positionCard = updatePosition (currentPlayer, c.position);
          return new Card ({
            ...c,
            image: images.current['card-' + c.value],
            position: positionCard,
            skinCard: p.skinCard,
          });
        });
        gamu.current.players[index].cards = cards;
      });
    };
    const updatePlayersPosition = players => {
      const currentPlayer = playerRef.current;

      players.forEach ((p, index) => {
        const positionPlayer = updatePosition (currentPlayer, p.position);
        gamu.current.players[index].player.disableClick = p.disableClick;
        gamu.current.players[index].player.position = positionPlayer;

      });
    };

    const initPlayers = ({players, totem}) => {
      const currentPlayer = playerRef.current;

      const newTotem = new Totem ({
        ...totem,
      });
      gamu.current.totem = newTotem;
      gamu.current.players = [];
      players.forEach (p => {
        const positionGoal = updatePosition (currentPlayer, p.goal.position);

        const positionBunch = updatePosition (
          currentPlayer,
          p.deck.positionBunch
        );
        const positionPlayer = updatePosition (currentPlayer, p.position);

        const {goal, deck, profile, timer, isPlaying} = p;
        const newGoal = new Goal ({
          ...goal,
          position: positionGoal,
          timer,
        });

        const current = currentPlayer.type === p.type;
        const newDeck = new Deck ({
          ...deck,
          positionBunch,
          current,
        });

        const newProfile = new Profile ({
          ...profile,
          position: {
            x: positionGoal.x - 100,
            y: positionGoal.y,
          },
          isPlaying,
        });
        if (isPlaying) {
          nextRoundInterval.current = searchNextRound ({
            profile: newProfile,
            player: p,
          });
        }

        const newPlayer = new Player ({...p, position: positionPlayer});
        const cards = p.deck.cards.map (c => {
          let positionCard = updatePosition (currentPlayer, c.position);

          return new Card ({
            ...c,
            image: images.current['card-' + c.value],
            position: positionCard,
            skinCard: p.skinCard,
          });
        });
        const player = {
          goal: newGoal,
          deck: newDeck,
          profile: newProfile,
          player: newPlayer,
          bunchCards: [],
          cards,
        };
        gamu.current.players.push (player);
      });
    };

    const drawPlayers = () => {
      if (!canvas.current) {
        return;
      }
      const context = canvas.current.getContext ('2d');
      const currentPlayer = playerRef.current;

      context.clearRect (0, 0, state.screen.width, state.screen.height);

      gamu.current.totem.render (playerRef.current.position, context);

      gamu.current.players.forEach (p => {
        const {deck, goal} = p;
        deck.render (state, context);
        goal.render (state, context);
      });
      Object.values (gamu.current.bunchCards).forEach (card =>
        card.render (state, context)
      );
      gamu.current.players.forEach (p => {
        const {profile, cards, player, drawCard} = p;

        cards.forEach (c => c.render (state, context));

        profile.render (state, context);

        if (drawCard) {
          drawCard.render (state, context);
        }

        if (
          currentPlayer.type === player.type &&
          !player.disableClick &&
          currentPlayer.timeOut
        ) {
          const timeInZone = Math.floor (
            (Date.now () - currentPlayer.timeOut) / 1000
          );
          if (timeInZone > 3) {
            socket.current.emit ('shitPlayer', true);
          }
        }
        player.render (state, context);
      });
    };

    const doAnimationHealth = () => {
      const finish = gamu.current.players.every (p => {
        if (
          p.profile.health === p.profile.nextHealth ||
          p.profile.nextHealth === null
        ) {
          return true;
        }
        const diff = p.profile.health - p.profile.nextHealth;
        if (diff > 0) {
          p.profile.health = p.profile.health - 0.5;
        } else {
          p.profile.health = p.profile.health + 0.5;
        }
        return false;
      });
      if (finish) {
        gamu.current.animation.health = false;
      }
    };
    socket.current.on ('gameStart', game => {
      setGame (game);
      const {totem, players, playerPlay} = game;

      setPlayerPlay (playerPlay);
      setTotem (totem);
      initGame ();

      initPlayers (game);

      socket.current.on ('message', ({message, history}) => {
        if (history) {
          console.log ('coucou', history);
          setGameHistory (history);
        }
        drawMessage (message, 2);
      });
      socket.current.on ('update', gameUpdate => {
        if (!game) {
          return;
        }
        const {
          players,
          totem,
          profile,
          cards,
          bunchCards,
          playerDrawCard,
          playersMove,
          playerPlay,
          nextRound,
        } = gameUpdate;

        if (playerPlay) {
          setPlayerPlay (playerPlay);
        }
        if (bunchCards) {
          updateBunchCards (players);
        }

        if (playerDrawCard) {
          updateDrawCard (playerDrawCard);
        }
        if (profile) {
          updateProfile (players);
        }
        if (nextRound) {
          updateRound (nextRound);
        }
        if (cards) {
          updateCards (players);
        }
        if (playersMove) {
          updatePlayersPosition (players);
        }
        if (totem) {
          updateTotem (totem);
        }
      });
      socket.current.on ('gameEgality', () => {
        drawMessage ('Egality !', 2);
        history.push (`/rooms`);
        setTimeout (
          () =>
            modal ({
              redirect: () => setGameId (null),
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
        history.push (`/`);
        setTimeout (
          () =>
            modal ({
              redirect: () => setGameId (null),
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
        setGame (game);
        setPlayer (null);
      });
      socket.current.on ('redirect', () => {
        setGameId (null);
        history.push (`/`);
      });
      window.addEventListener ('resize', handleResize);
      window.addEventListener ('mousemove', handleMouseMove);
      window.addEventListener ('mousedown', handleMouseDown);
      window.addEventListener ('mouseup', handleMouseUp);
      window.requestAnimationFrame (gameLoop);
    });
  }, []); //eslint-disable-line
  useEffect (
    () => () => {
      window.removeEventListener ('resize', handleResize);
      window.removeEventListener ('mousemove', handleMouseMove);
      window.removeEventListener ('mousedown', handleMouseDown);
      window.removeEventListener ('mouseup', handleMouseUp);

      socket.current.emit ('disco');
      setGame (false);

      socket.current.disconnect ();
      setGameId (null);
      history.push (`/`);
    },
    [] //eslint-disable-line
  );
  if (!game) {
    return <Loader message={'connexion à une partie en cours'} />;
  }
  if (game.full) {
    return <p>la partie est pleine désolé</p>;
  }

  return (
    <GameContext.Provider value={{game, socket}}>
      {!game.start
        ? <Lobby socket={socket} />
        : <div>

            <canvas
              id="background-layer"
              width={state.widthUser}
              height={state.heightUser}
              ref={canvasBackground}
            />

            <div class="flex flex-col md:flex-row items-center justify-center">

              <div class="order-2 md:order-1 ">
                <span className="score current-score">
                  Round : {playerPlay && 'Player ' + playerPlay.type}
                </span>
                <GameInfos />
              </div>

              <div
                id="game"
                ref={gameDiv}
                class="order-first md:order-2 w-screen md:w-4/6 h-screen"
            >
              
                <canvas
                id="ui-looser"
                class="w-11/12 md:w-3/6 h-5/6"
                  width={state.screen.width}
                  height={state.screen.height}
                  ref={canvasScoreLooser}
                />

                <canvas
                id="ui-layer"
                class="w-11/12 md:w-3/6 h-5/6"

                  width={state.screen.width}
                  height={state.screen.height}
                  ref={canvas}
                />
              </div>
              <div class="order-3">

                <GameInfos />
              </div>
            </div>

          </div>}
    </GameContext.Provider>
  );
};

export default Game;
