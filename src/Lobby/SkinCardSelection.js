import React, {useState, useEffect, useRef, Fragment} from 'react';
import {Divider, Row, Col} from 'antd';

import Card from '../Game/Card';

const CANVAS_SIZE = 125;

const randomRotation = () =>
  (Math.floor (Math.random () * 10) + 1) *
  (Math.floor (Math.random () * 2) === 1 ? 1 : -1);

const SkinCardSelection = ({socket}) => {
  const canvasPepe = useRef (null);
  const canvasPokemon = useRef (null);
  const canvasBase = useRef (null);
  const canvasTroubadour = useRef (null);

  const [skin, setSkin] = useState ('');
  useEffect (() => {
    const contextParticle = canvasPepe.current.getContext ('2d');
    const contextConnect = canvasPokemon.current.getContext ('2d');
    const contextBase = canvasBase.current.getContext ('2d');
    const contextCircle = canvasTroubadour.current.getContext ('2d');
    const position = {x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2};
    const basicCard = new Card ({
      position,
      rotationAuto: false,
      rotation: randomRotation (),
    });
    const pepeCard = new Card ({
      position,
      skinCard: 'pepe',
      show: false,
      rotationAuto: false,
      rotation: randomRotation (),
    });
    const pokemonCard = new Card ({
      position,
      skinCard: 'pokemon',
      rotationAuto: false,
      rotation: randomRotation (),
    });
    const troubadourCard = new Card ({
      position,
      skinCard: 'troubadour',
      rotationAuto: false,
      rotation: randomRotation (),
    });
    const gameLoop = () => {
      contextBase.clearRect (0, 0, 100, 100);
      contextParticle.clearRect (0, 0, 100, 100);
      contextConnect.clearRect (0, 0, 100, 100);
      contextCircle.clearRect (0, 0, 100, 100);

      basicCard.render (null, contextBase);
      pepeCard.render (null, contextParticle);
      pokemonCard.render (null, contextConnect);
      troubadourCard.render (null, contextCircle);
      window.requestAnimationFrame (gameLoop);
    };
    gameLoop ();
  }, []);

  const isSkinSelect = name => name === skin;
  const skinCardClassname = name =>
    isSkinSelect (name) ? 'skin-select' : 'skin';

  const changeSkinCard = value => {
    setSkin (value);
    socket.current.send (JSON.stringify ({action: 'setSkinCard', data: value})) 

    
  };
  return (
    <Fragment>
      <Divider orientation="left"><h3>Choose your skin Card</h3></Divider>

      <Row gutter={[32, 32]} justify="center">
        <Col>
          <canvas
            className={skinCardClassname ('')}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={() => changeSkinCard ('')}
            ref={canvasBase}
          />
          <p>Base</p>
        </Col>
        <Col>
          <canvas
            className={skinCardClassname ('pepe')}
            onClick={() => changeSkinCard ('pepe')}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            ref={canvasPepe}
          />
          <p>Pepe</p>

        </Col>
        <Col>
          <canvas
            className={skinCardClassname ('pokemon')}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={() => changeSkinCard ('pokemon')}
            ref={canvasPokemon}
          />
          <p>Pokemon</p>

        </Col>
        <Col>
          <canvas
            className={skinCardClassname ('troubadour')}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onClick={() => changeSkinCard ('troubadour')}
            ref={canvasTroubadour}
          />
          <p>Troubadour</p>

        </Col>
      </Row>
    </Fragment>
  );
};

export default SkinCardSelection;
