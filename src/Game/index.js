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
import {drawCircularAnimation} from './animation/circular';
import modal from './Modal';
import Lobby from '../Lobby';
import {GAME_WIDTH, GAME_HEIGHT, updatePosition} from './utils';
import {initializeParticles} from './animation/light-particle';
const Game = () => {
  const {id} = useParams ();
  const history = useHistory ();
  const images = loadImages ();

  const socket = useRef (null);

  const [game, setGame] = useState (false);
  const [playerPlay, setPlayerPlay] = useState (false);

  const gamu = {animation: {health: false, drawCard: false}, players: []};

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




  const updateBunchCards = (context, players) => {
    context.clearRect (0, 0, state.screen.width, state.screen.height);
    const currentPlayer = playerRef.current;
    players.forEach (p => {
      let bunchCards = p.deck.bunchCards;
      console.log("le bunch", bunchCards)
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
          image:images['card-'+card.value],
          skinCard: p.skinCard,
        });
        newCard.render (state, context);
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

  const scaleMouse = ({clientX, clientY}) => {
    const context = canvas.current.getContext ('2d');

    const mouseX = clientX - context.canvas.offsetLeft;
    const mouseY = clientY - context.canvas.offsetTop;
    const x = mouseX * context.canvas.width / context.canvas.clientWidth;
    const y = mouseY * context.canvas.height / context.canvas.clientHeight;

    return {x, y};
  };

  const handleMouseMove = throttle (({clientX, clientY}) => {
    if (canvas.current) {
      const {x, y} = scaleMouse ({clientX, clientY});
      let position = {
        x,
        y,
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
  }, 30); //eslint-disable-line

  const handleMouseDown = useCallback (({clientX, clientY}) => {
    if (canvas.current) {
      const {x, y} = scaleMouse ({clientX, clientY});
      let position = {
        x,
        y,
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
    socket.current.emit ('mouseUp');
  });
  const handleResize = (value, e) => {
    const context = canvasBackground.current.getContext ('2d');
    initializeParticles (
      context,
      state.screen.widthUser,
      state.screen.heightUser
    );
  };

  async function doAnimationLooser (players, cardsLooser, distance) {
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
  function doAnimationDrawCard () {
    if (!canvasAnimation.current) {
      return;
    }
    let isFinish = true
    console.log ('on commence l animation');

     gamu.players.forEach (p => {
       if (p.drawCard?.animation) {
         isFinish= false;
         const newTime = objectReturn(
           p.drawCard.time,
           p.drawCard,
           p.drawCard.nextPosition
         );

         if (newTime <= 0) {
          console.log ('une anim de fini');
           p.drawCard.animation = false;
           socket.current.emit('animationDrawCardDone', p.player);

         }
         p.drawCard.time = newTime;
         if (p.drawCard.flip) {
          p.drawCard.flipAnimation()
         }
       }
    });
    if (isFinish) {
      console.log ('on fini lanimation');
      gamu.animation.drawCard = false;
    }
   
  }

  useLayoutEffect (() => {
    socket.current = id
      ? io (`159.65.115.34/?id=${id}`)
      : io (`159.65.115.34/`);
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

    function gameLoop () {
      // Update game objects in the loop
      /* update();
      draw();*/

      if (gamu.animation.health) {
        doAnimationHealth ();
      }
      if (gamu.animation.drawCard) {
        doAnimationDrawCard ();
      }
      drawPlayers ();
      window.requestAnimationFrame (gameLoop);
    }

    socket.current.on ('animationDrawCard', ({player, position}) => {
      const currentPlayer = playerRef.current;
      const playerGame = gamu.players.find (p => p.player.id === player.id);
      const positionNextDrawCard=    updatePosition (
        currentPlayer,
        position
      );
      playerGame.drawCard.nextPosition = positionNextDrawCard;
      playerGame.drawCard.animation = true;

      if (player.drawCard.moveTo === "bunch") {
        playerGame.drawCard.flip=true
      }
      gamu.animation.drawCard = true;

      /*requestAnimationFrame (() =>
        doAnimationDrawCard (0, pl.drawCard, position, players, pl)
      );*/
    });

    socket.current.on ('animationHealth', ({players}) => {
      updateProfile (players);
      gamu.animation.health = true;
    });


    const updateTotem = ( totem) => {
      const currentPlayer = playerRef.current;
      const totemPosition = updatePosition (currentPlayer, totem.position);
      gamu.totem.position=totemPosition
    };

    
    const updateDrawCard = playerDrawCard => {
      const currentPlayer = playerRef.current;

      const playerGame = gamu.players.find (p => p.player.id === playerDrawCard.id);
      const positionDrawCard = playerDrawCard.drawCard.position;
 
        if (positionDrawCard) {
          const positionDrawCard = updatePosition (
            currentPlayer,
            playerDrawCard.drawCard.position
          );
          const drawCard = new Card ({
            ...playerDrawCard.drawCard,
            skinCard: playerDrawCard.skinCard,
            image:images['card-'+playerDrawCard.drawCard.value],
            position:positionDrawCard
          });

          playerGame.drawCard = drawCard;

        } else {
          playerGame.drawCard = null;
      }
          
    };
    
    const updateProfile = players => {
      const currentPlayer = playerRef.current;

      players.forEach ((p, index) => {
        const positionProfile = updatePosition (
          currentPlayer,
          p.profile.position
        );

        const {profile, isPlaying} = p;

        const newProfile = new Profile ({
          ...profile,
          position: positionProfile,
          isPlaying,
        });
        gamu.players[index].profile = newProfile;
      });
    };
    const updateRound = players => {
      players.forEach ((p, index) => {
        const { isPlaying} = p;
        gamu.players[index].profile.isPlaying = isPlaying;
      });
    };

    const updateCards = players => {
      const currentPlayer = playerRef.current;

      players.forEach ((p, index) => {
        const cards = p.deck.cards.map (c => {
          let positionCard = updatePosition (currentPlayer, c.position);
          return new Card ({
            ...c,
            image:images['card-'+c.value],
            position: positionCard,
            skinCard: p.skinCard,
          });
        });
        gamu.players[index].cards = cards;
      });
    };
    const updatePlayers = players => {
      const currentPlayer = playerRef.current;

      players.forEach ((p, index) => {
        const positionPlayer = updatePosition (currentPlayer, p.position);

        gamu.players[index].player.position = positionPlayer;
      });
    };

    const initPlayers = ({players,totem}) => {
      const currentPlayer = playerRef.current;

      delete gamu.players;

      const newTotem = new Totem ({
        ...totem,
      });
      gamu.totem=newTotem
      gamu.players = [];
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
        const positionPlayer = updatePosition (currentPlayer, p.position);

        const {goal, deck, profile, timer, isPlaying} = p;
        const newGoal = new Goal ({
          ...goal,
          position: positionGoal,
          timer,
        });

        const newDeck = new Deck ({
          ...deck,
          positionBunch,
        });

        const newProfile = new Profile ({
          ...profile,
          position: positionProfile,
          isPlaying,
        });

        const newPlayer = new Player ({...p, position: positionPlayer});
        const cards = p.deck.cards.map (c => {
          let positionCard = updatePosition (currentPlayer, c.position);
          return new Card ({
            ...c,
            image:images['card-'+c.value],
            position: positionCard,
            skinCard: p.skinCard,
          });
        });
        const player = {
          goal: newGoal,
          deck: newDeck,
          profile: newProfile,
          player: newPlayer,
          cards,
        };

        gamu.players.push (player);
      });
    };

    const drawPlayers = () => {
      if (!canvas.current) {
        return;
      }
      const context = canvas.current.getContext ('2d');
      context.clearRect (0, 0, state.screen.width, state.screen.height);

      gamu.totem.render (state, context);
      gamu.players.forEach (p => {
        const {goal, profile, cards, player, drawCard} = p;

        goal.render (state, context);
        profile.render (state, context);
        cards.forEach (c => c.render (state, context));
        if (drawCard) {
          drawCard.render (state, context);
        }
        player.render (state, context);
      });
    };
    const doAnimationHealth = () => {
      const finish = gamu.players.every (p => {
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
        gamu.animation.health = false;
      }
    };
    socket.current.on ('gameStart', game => {
      setGame (game);
      const {totem, players, playerPlay} = game;

      setPlayerPlay (playerPlay);
      setTotem (totem);
      initGame ();

      initPlayers (game);

      socket.current.on ('message', ({message}) => {
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
          const context = canvasBunchCards.current.getContext ('2d');
          requestAnimationFrame (() => updateBunchCards (context, players));
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
          updatePlayers (players);
        }
        if (totem) {
           updateTotem ( totem)
        }
      });
      socket.current.on ('gameEgality', () => {
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
        setGame (game);
        setPlayer (null);
      });
      socket.current.on ('redirect', () => {
        history.push (`/rooms`);
      });
      window.addEventListener ('resize', handleResize);
      window.addEventListener ('mousemove', handleMouseMove);
      window.addEventListener ('mousedown', handleMouseDown);
      window.addEventListener ('mouseup', handleMouseUp);
      gameLoop ();
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
        <span className="score current-score">
          Round : {playerPlay && 'Player ' + playerPlay.type}
        </span>
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
