import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';
import React from 'react';
import styled from 'styled-components';
import {message, Avatar, Space} from 'antd';
import {UserOutlined} from '@ant-design/icons';
const center = styled.div`
text-align: center
`;
const Load = ({game, message}) => {
  console.log (game);
  if (game) {
    return (
      <center>
        <Loader type="Puff" color="#00BFFF" height={300} width={300} />
        <h2>{game.message}</h2>
        <Space>
          {game.players.map (element => (
            <Avatar size={64} icon={<UserOutlined />} />
          ))}

        </Space>

      </center>
    );
  } else {
    return (
      <center>
        <Loader type="Puff" color="#00BFFF" height={300} width={300} />
        <h2>{message}</h2>
      </center>
    );
  }
};

export default Load;
