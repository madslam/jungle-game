import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';
import React from 'react';
import styled from 'styled-components';

const center = styled.div`
text-align: center
`;
const Load = ({message}) => {
  //other logic
  return (
    <center>
      <Loader type="Puff" color="#00BFFF" height={300} width={300} />
      <h2>{message}</h2>
    </center>
  );
};

export default Load;
