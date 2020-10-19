import React, {useState, useEffect} from 'react';
import {Button, message, Layout, Row, Col} from 'antd';
import {useHistory} from 'react-router-dom';

import {db} from '../database/firebase';
import CreateRoomModal from './CreateRoomModal';
import {signInWithGoogle} from '../database/firebase';
import SkinSelection from '../Lobby/SkinSelection';
const Room = () => {
  const [rooms, setRooms] = useState ([]);
  const [loading, setLoading] = useState (false);
  const history = useHistory ();
  useEffect (() => {
    getRooms ();
  }, []);
  const getRooms = async () => {
    setLoading (true);
    const roomsDB = await db.collection ('rooms').get ();
    const newRooms = [];
    roomsDB.forEach (doc => newRooms.push ({...doc.data (), id: doc.id}));
    console.log ('rooo', newRooms);
    setRooms (newRooms);
    setLoading (false);
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
      console.log (doc.id, '=>', doc.data ());
      history.push (`/game/${doc.id}`);
    });
  };

  return (
    <Layout className="center">
      <Row gutter={[16, 16]} justify="center">
        <Col>
          <Button type="primary" onClick={getRooms}>Refresh room</Button>
        </Col>
        <Col>
          <CreateRoomModal />
        </Col>
        <Col>
          <Button type="primary" onClick={joinRandomRoom}>
            join random room
          </Button>
        </Col>
        <Col />
      </Row>

      <Row className="login-buttons" gutter={24} justify="center">
        <button className="login-provider-button" onClick={signInWithGoogle}>
          <img
            src="https://img.icons8.com/ios-filled/50/000000/google-logo.png"
            alt="google icon"
          />
          <span> Continue with Google</span>
        </button>
      </Row>

    </Layout>
  );
};

export default Room;
