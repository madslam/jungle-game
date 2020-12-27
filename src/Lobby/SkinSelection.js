import React, {useState, useEffect, useRef, Fragment} from 'react';
import {Divider, Row, Col} from 'antd';
import Carousel from 'react-elastic-carousel';

import Player from '../Game/Player';
import {FRAME_MIN_TIME} from '../Game/utils';

let lastFrameTime = 0; // the last frame time

const SkinSelection = ({socket}) => {
  const canvasParticle = useRef (null);
  const canvasConnect = useRef (null);
  const canvasBase = useRef (null);
  const canvasCircle = useRef (null);
  const canvasPq = useRef ();
  const [skin, setSkin] = useState ('base');
  useEffect (() => {
    const contextParticle = canvasParticle.current.getContext ('2d');
    const contextConnect = canvasConnect.current.getContext ('2d');
    const contextBase = canvasBase.current.getContext ('2d');
    const contextCircle = canvasCircle.current.getContext ('2d');
    const contextPq = canvasPq.current.getContext ('2d');

    const basicAnim = new Player ({
      position: {x: 50, y: 50},
    });
    const particleAnim = new Player ({
      position: {x: 50, y: 50},
      skin: 'particle',
    });
    const connectAnim = new Player ({
      position: {x: 50, y: 50},
      skin: 'connect',
    });
    const circleAnim = new Player ({
      position: {x: 50, y: 50},
      skin: 'circle',
    });
    const pqSkin = new Player ({
      position: {x: 50, y: 50},
      skin: 'pq',
    });
    const gameLoop = time => {
      // Update game objects in the loop
      if (time - lastFrameTime < FRAME_MIN_TIME) {
        //skip the frame if the call is too early
        window.requestAnimationFrame (gameLoop);

        return;
      }
      lastFrameTime = time; // remember the time of the rendered frame

      contextBase.clearRect (0, 0, 100, 100);
      contextParticle.clearRect (0, 0, 100, 100);
      contextConnect.clearRect (0, 0, 100, 100);
      contextCircle.clearRect (0, 0, 100, 100);
      contextPq.clearRect (0, 0, 100, 100);
      basicAnim.render (null, contextBase);
      particleAnim.render (null, contextParticle);
      connectAnim.render (null, contextConnect);
      circleAnim.render (null, contextCircle);
      pqSkin.render (null, contextPq);
      window.requestAnimationFrame (gameLoop);
    };
    gameLoop ();
  }, []);

  const isSkinSelect = name => name === skin;
  const skinClassname = name => (isSkinSelect (name) ? 'skin-select' : 'skin');

  const changeSkin = value => {
    setSkin (value);
    socket.current.emit ('setSkin', value);
  };
  return (
    <Fragment>
      <Divider orientation="left"><h3>Choose your skin</h3></Divider>
      <Carousel itemsToShow={4} itemPadding={[10, 20]}>
        <div>
          <canvas
            className={skinClassname ('base')}
            width={100}
            height={100}
            onClick={() => changeSkin ('base')}
            ref={canvasBase}
          />
        </div>
        <div>
          <canvas
            className={skinClassname ('particle')}
            onClick={() => changeSkin ('particle')}
            width={100}
            height={100}
            ref={canvasParticle}
          />
        </div>
        <div>
          <canvas
            className={skinClassname ('connect')}
            width={100}
            height={100}
            onClick={() => changeSkin ('connect')}
            ref={canvasConnect}
          />
        </div>
        <div>
          <canvas
            className={skinClassname ('circle')}
            width={100}
            height={100}
            onClick={() => changeSkin ('circle')}
            ref={canvasCircle}
          />
        </div>
        <div>
          <canvas
            className={skinClassname ('pq')}
            width={100}
            height={100}
            onClick={() => changeSkin ('pq')}
            ref={canvasPq}
          />
        </div>
      </Carousel>
    </Fragment>
  );
};

export default SkinSelection;
