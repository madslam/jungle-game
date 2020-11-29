import {Modal, Button, Input, Tag, Divider, Row, Col, message} from 'antd';
import React, {useState, useContext} from 'react';
import {AwesomeButton} from 'react-awesome-button';
import PlayersForm from './PlayersForm';
import GameContext from '../Game/GameContext';

const GameOptions = () => {
  const {socket} = useContext (GameContext);

  const [state, setState] = useState ({
    timePerRound: 5,
    numberPlayer: 2,
  });

  const setTimePerRound = value => {
    setState ({...state, timePerRound: value});
    socket.current.emit ('setTimePerRound', value);
  };
  const setNumberPlayer = value => {
    setState ({...state, numberPlayer: value});
    socket.current.emit ('setNumberPlayer', value);
  };
  const gameReady = () => {
    socket.current.emit ('gameReady');
  };

  return (
    <div>
      <h1 class="text-center text-3xl">Game Settings</h1>
      <Divider orientation="left"><h3>Number of player </h3></Divider>
      <PlayersForm setValue={setNumberPlayer} value={state.numberPlayer} />
      <Divider orientation="left"><h3>Time round per player</h3></Divider>
      <PlayersForm setValue={setTimePerRound} value={state.timePerRound} />

      <div class="flex justify-center mb-6">
        <AwesomeButton type="primary" onPress={gameReady}>
          Game ready
        </AwesomeButton>
      </div>

    </div>
  );
};

export default GameOptions;
