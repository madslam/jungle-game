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
      <div className="centerContent">
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

        <Row gutter={24} justify="center">
          <Button
            className="buttonGoogle"
            type="primary"
            onClick={signInWithGoogle}
          >
            <img
              src={process.env.PUBLIC_URL + `/img/GoogleLOGO.png`}
              alt="google icon"
            />
            <span> Continue with Google</span>
          </Button>
        </Row>
      </div>

    </Layout>
  );
};

export default Room;
