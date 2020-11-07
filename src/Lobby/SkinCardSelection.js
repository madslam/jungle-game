import React, {useState, useEffect, useRef, Fragment} from 'react';
import {Divider, Row, Col} from 'antd';

import Card from '../Game/Card';

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
    const basicCard = new Card ({
      position: {x: 50, y: 50},
    });
    const pepeCard = new Card ({
      position: {x: 50, y: 50},
      skinCard: 'pepe',
      show: false,
    });
    const pokemonCard = new Card ({
      position: {x: 50, y: 50},
      skinCard: 'pokemon',
    });
    const troubadourCard = new Card ({
      position: {x: 50, y: 50},
      skinCard: 'troubadour',
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

    socket.current.emit ('setSkinCard', value);
  };
  return (
    <Fragment>
      <Divider orientation="left"><h3>Choose your skin Card</h3></Divider>

      <Row gutter={[32, 32]} justify="center">
        <Col>
          <canvas
            className={skinCardClassname ('')}
            width={100}
            height={100}
            onClick={() => changeSkinCard ('')}
            ref={canvasBase}
          />
          <p>Base</p>
        </Col>
        <Col>
          <canvas
            className={skinCardClassname ('pepe')}
            onClick={() => changeSkinCard ('pepe')}
            width={100}
            height={100}
            ref={canvasPepe}
          />
          <p>Pepe</p>

        </Col>
        <Col>
          <canvas
            className={skinCardClassname ('pokemon')}
            width={100}
            height={100}
            onClick={() => changeSkinCard ('pokemon')}
            ref={canvasPokemon}
          />
          <p>Pokemon</p>

        </Col>
        <Col>
          <canvas
            className={skinCardClassname ('troubadour')}
            width={100}
            height={100}
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
