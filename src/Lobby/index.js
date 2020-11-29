import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';
import React, {useContext} from 'react';
import {Avatar} from 'antd';
import {UserOutlined, CheckCircleFilled} from '@ant-design/icons';
import SkinSelection from '../Lobby/SkinSelection';
import SkinCardSelection from '../Lobby/SkinCardSelection';
import GameOptions from './GameOptions';
import GameContext from '../Game/GameContext';
import GameInfos from './GameInfos';

const Lobby = () => {
  const {game, socket} = useContext (GameContext);
  console.log (game, socket);

  return (
    <div class="container mx-auto mt-5">
      <div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 place-items-center">
          <div class="md:col-span-2 col-span-1">
            <div class="flex justify-center mb-4">
              <Loader type="Puff" color="#00BFFF" height={100} width={100} />
            </div>
            <div class="flex justify-center mb-8">
              <h2>{game.message}</h2>
            </div>
            <div class="flex justify-center mb-4">

              <div class="grid mx-9 my-6 grid-cols-5 gap-6">

                {Object.values (
                  game.initPlayerList
                ).map (({name, id, ready, img}) => (
                  <div class="col-span-1 text-center">
                    <div>
                      <Avatar size={64} icon={<UserOutlined />} src={img} />
                    </div>
                    <p class="mt-4">
                      {ready &&
                        <span class="text-green-500 mr-2">
                          <CheckCircleFilled />
                        </span>}
                      {name + ' '}
                    </p>
                    {socket.current.id === id &&
                      <span class="text-green-500"> You </span>}

                  </div>
                ))}
              </div>
            </div>

            <SkinSelection socket={socket} />
            <SkinCardSelection socket={socket} />
          </div>
          <div class="col-span-1 md:justify-self-start border-2 rounded-xl w-full">
            <div>
              {game.ready ? <GameInfos /> : <GameOptions />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Lobby;
