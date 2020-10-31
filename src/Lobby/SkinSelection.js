import React, {useState, useEffect, useRef, Fragment} from 'react';
import {Divider, Row, Col} from 'antd';

import Player from '../Game/Player';

const SkinSelection = ({socket}) => {
  const canvasParticle = useRef (null);
  const canvasConnect = useRef (null);
  const canvasBase = useRef (null);
  const canvasCircle = useRef (null);

  const [skin, setSkin] = useState ('base');
  useEffect (() => {
    const contextParticle = canvasParticle.current.getContext ('2d');
    const contextConnect = canvasConnect.current.getContext ('2d');
    const contextBase = canvasBase.current.getContext ('2d');
    const contextCircle = canvasCircle.current.getContext ('2d');
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

    basicAnim.render (null, contextBase);
    particleAnim.render (null, contextParticle);
    connectAnim.render (null, contextConnect);
    circleAnim.render (null, contextCircle);
  }, []);

  const isSkinSelect = name => name === skin;
  const skinClassname = name => (isSkinSelect (name) ? 'skin-select' : 'skin');

  const changeSkin = value => {
    setSkin (value);
    socket.current.emit ('setSkin', value);
  };
  return (
    <Fragment>
      <Divider orientation="left">Choose your skin</Divider>

      <Row gutter={[32, 32]} justify="center">
        <Col>
          <canvas
            className={skinClassname ('base')}
            width={100}
            height={100}
            onClick={() => changeSkin ('base')}
            ref={canvasBase}
          />
        </Col>
        <Col>
          <canvas
            className={skinClassname ('particle')}
            onClick={() => changeSkin ('particle')}
            width={100}
            height={100}
            ref={canvasParticle}
          />
        </Col>
        <Col>
          <canvas
            className={skinClassname ('connect')}
            width={100}
            height={100}
            onClick={() => changeSkin ('connect')}
            ref={canvasConnect}
          />
        </Col>
        <Col>
          <canvas
            className={skinClassname ('circle')}
            width={100}
            height={100}
            onClick={() => changeSkin ('circle')}
            ref={canvasCircle}
          />
        </Col>
      </Row>
    </Fragment>
  );
};

export default SkinSelection;
