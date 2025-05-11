import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { itemImages } from '../../utils/assetLoader';

const CounterContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 40px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 6px 18px;
  font-size: 22px;
  font-weight: bold;
  z-index: 200;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SunImg = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 10px;
`;

const SunCounter: React.FC = () => {
  const sun = useSelector((state: RootState) => state.game.sun);
  return (
    <CounterContainer>
      <SunImg src={itemImages.sun} alt="sun" />
      {sun}
    </CounterContainer>
  );
};

export default SunCounter; 