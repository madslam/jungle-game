import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';
import React from 'react';
import {Layout, Avatar, Space, Row, Col} from 'antd';
import {UserOutlined} from '@ant-design/icons';
import SkinSelection from '../Lobby/SkinSelection';

const Lobby = ({game, socket}) => {
  return (
    <Layout className="center">
      <Row gutter={[16, 16]} justify="center">
        <Col>
          <Loader type="Puff" color="#00BFFF" height={100} width={100} />
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">
        <Col>
          <h2>{game.message}</h2>
        </Col>
      </Row>
      <Row gutter={[16, 16]} justify="center">

        {game.players.map (element => (
          <Col>   <Avatar size={64} icon={<UserOutlined />} /></Col>
        ))}
      </Row>

      <SkinSelection socket={socket} />
    </Layout>
  );
};

export default Lobby;
