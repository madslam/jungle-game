import {Modal, Button, Input, Tag, Divider, Row, Col, message} from 'antd';
import React, {useState, Fragment} from 'react';
import {Formik} from 'formik';
import {useHistory} from 'react-router-dom';
import {CopyOutlined} from '@ant-design/icons';
import {db} from '../../database/firebase';

const CreateRoomModal = () => {
  const history = useHistory ();

  const [state, setState] = useState ({
    ModalText: 'Content of the modal',
    visible: false,
    confirmLoading: false,
    isGameCreate: false,
    gameId: '',
  });

  const showModal = () => {
    setState ({
      visible: true,
    });
  };

  const handleCancel = () => {
    setState ({
      visible: false,
    });
  };

  const copyGameUrl = url => {
    navigator.clipboard.writeText (url);
    message.success ('game url copied !');
  };

  const {visible} = state;
  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Create game
      </Button>
      <Modal
        title="Create game"
        visible={visible}
        onCancel={handleCancel}
        footer={null}
      >
        {' '} <Divider orientation="left">Create your game</Divider>

        {state.isGameCreate
          ? <Fragment>
              <Col>
                <Button
                  type="primary"
                  onClick={() => history.push (`/game/${state.gameId}`)}
                >
                  join the game
                </Button>
              </Col>
              <Tag
                onClick={() =>
                  copyGameUrl (
                    `${window.location.origin}/game/${state.gameId}`
                  )}
                icon={<CopyOutlined />}
              >
                {`${window.location.origin}/game/${state.gameId}`}
              </Tag>
            </Fragment>
          : <Formik
              initialValues={{name: '', numberPlayer: '2'}}
              validate={values => {
                const errors = {};
                if (!values.name) {
                  errors.name = 'Required';
                } else if (values.name.length > 10 || values.name.length < 3) {
                  errors.name = 'name must be between 3 and 10 char';
                }

                if (values.numberPlayer > 4 || values.numberPlayer < 2) {
                  errors.numberPlayer = 'name must be between 2 and 4 players';
                }
                return errors;
              }}
              onSubmit={async (values, {setSubmitting}) => {
                console.log ('on est laaa');
                const {name, numberPlayer} = values;
                const room = await db.collection ('rooms').add ({
                  name,
                  numberPlayer: parseInt (numberPlayer),
                  playersConnected: 0,
                  full: false,
                });
                setState ({...state, isGameCreate: true, gameId: room.id});
                setSubmitting (false);
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
                /* and other goodies */
              }) => (
                <form onSubmit={handleSubmit}>
                  <Input
                    name="name"
                    placeholder="name of the game"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                  />
                  {errors.name && touched.name && errors.name}
                  <Input
                    name="numberPlayer"
                    type="number"
                    placeholder="number of players"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.numberPlayer}
                  />
                  {errors.numberPlayer &&
                    touched.numberPlayer &&
                    errors.numberPlayer}
                  <Button htmlType="submit" disabled={isSubmitting}>
                    Submit
                  </Button>
                </form>
              )}
            </Formik>}
      </Modal>
    </div>
  );
};

export default CreateRoomModal;
