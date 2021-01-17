import React, {useState, useEffect} from 'react';
import {message} from 'antd';
import {useHistory} from 'react-router-dom';
import {AwesomeButton, AwesomeButtonSocial} from 'react-awesome-button';
import {Avatar} from 'antd';
import {UserOutlined} from '@ant-design/icons';

import {db} from '../database/firebase';
import {signInWithGoogle} from '../database/firebase';
import Game from '../Game';
import GameUws from '../Game/GameUws';

const Room = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams (queryString);
  const idGame = urlParams.get ('idGame');

  const [user, setUser] = useState ({});

  const [loading, setLoading] = useState (false);
  const [gameId, setGameId] = useState ();
  const [namePlayer, setNamePlayer] = useState ();

  const history = useHistory ();
  useEffect (() => {
    changePlayerName (localStorage.getItem ('NAME_PLAYER'));
    draw ();
  }, []);

  const signIn = async () => {
    const newUser = await signInWithGoogle ();
    changePlayerName (newUser.displayName);
    setUser (newUser);
  };
  const changePlayerName = value => {
    if (value && value.length < 10) {
      setNamePlayer (value);
      localStorage.setItem ('NAME_PLAYER', value);
    }
  };
  const createNewGame = async () => {
    if (idGame) {
      setGameId (idGame);
      return;
    }
    setLoading (true);
    const room = await db.collection ('rooms').add ({
      numberPlayer: 2,
      timePerRound: 5,
      full: false,
    });
    setLoading (false);
    setGameId (room.id);
  };
  const joinRandomRoom = async () => {
    setLoading (true);
    const roomsRef = await db.collection ('rooms');
    const roomsAvalaible = await roomsRef
      .where ('full', '==', false)
      .limit (1)
      .get ();

    setLoading (false);

    if (roomsAvalaible.empty) {
      message.warn ('no game found');
      return;
    }
    roomsAvalaible.forEach (doc => {
      history.push (`/game/${doc.id}`);
    });
  };

  function draw () {
    var context = document.getElementById ('canvas').getContext ('2d');
    context.font = '48px Balsamiq Sans';
    context.fillStyle = 'white';
    context.textAlign = 'center';

    var width = document.getElementById ('canvas').width;
    var height = document.getElementById ('canvas').height;
    context.translate (width / 2, height / 2);

    context.fillText ('DragMe.io', 0, 0);
  }
  if (gameId) {
    return (
      <GameUws
        gameId={gameId}
        setGameId={setGameId}
        userPhotoURL={user.photoURL}
        namePlayer={namePlayer}
      />
    );
  }

  return (
    <div class="flex items-center justify-center h-screen">
      <div>
        <canvas id="canvas" width="350" height="120" />

        <div class="flex items-center justify-center m-5">

          <div class="mr-5">
            <Avatar
              size={64}
              icon={<UserOutlined />}
              src={user && user.photoURL}
            />
          </div>

          <input
            type="text"
            class="bg-purple-white shadow rounded border-0 p-3"
            value={namePlayer}
            onChange={event => changePlayerName (event.target.value)}
            placeholder="Enter your name bg"
          />

        </div>
        <div class="grid grid-cols-4 gap-4">

          <div class="col-span-2">
            <AwesomeButton
              disabled={loading}
              type="primary"
              onPress={createNewGame}
            >
              {idGame ? 'Join the game' : 'Create a game'}
            </AwesomeButton>
          </div>
          <div class="col-span-2">
            <AwesomeButton type="primary" onPress={joinRandomRoom}>
              Join random game
            </AwesomeButton>
          </div>
          <div />
        </div>
        <div class="flex justify-center">
          <AwesomeButtonSocial type="gplus" onPress={signIn}>
            Continue with Google
          </AwesomeButtonSocial>
        </div>
      </div>

    </div>
  );
};

export default Room;
