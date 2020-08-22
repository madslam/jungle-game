import React, {useState, useEffect} from 'react';
import {Table, Button, Space, message} from 'antd';
import {useHistory} from 'react-router-dom';

import {db} from '../database/firebase';
import CreateRoomModal from './CreateRoomModal';

const MAX_PLAYERS = 4;
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'players',
    dataIndex: 'playersConnected',
    render: (_, record) => `${record.playersConnected}/${record.numberPlayer}`,
  },
];
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
    <div>
      <Space>
        <Button type="primary" onClick={getRooms}>Refresh room</Button>
        <CreateRoomModal />
        <Button type="primary" onClick={joinRandomRoom}>
          join random room
        </Button>
      </Space>

      <Table
        dataSource={rooms}
        columns={columns}
        loading={loading}
        onRow={record => {
          return {
            onClick: () => {
              const {playersConnected, numberPlayer, id} = record;
              if (playersConnected < numberPlayer) {
                history.push (`/game/${id}`);
              }
            }, // click row
          };
        }}
      />
    </div>
  );
};

export default Room;
