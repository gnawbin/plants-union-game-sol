import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import PlantCard from './PlantCard';

const EXPANDED_HEIGHT = '120px';
const COLLAPSED_HEIGHT = '30px';

const Container = styled.div<{ $isExpanded: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${props => props.$isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT};
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: height 0.3s ease-in-out;
  overflow: hidden;
`;

const ToggleButton = styled.button`
  background: #555;
  color: white;
  border: none;
  padding: 4px 10px;
  cursor: pointer;
  border-radius: 0 0 5px 5px;
  font-size: 12px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 101;

  &:hover {
    background: #777;
  }
`;

const CardsContainer = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 20px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 5px;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;

  ${props => props.$isExpanded
    ? css`
        visibility: visible;
        opacity: 1;
      `
    : css`
        visibility: hidden;
        opacity: 0;
      `};

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  &::-webkit-scrollbar {
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }
`;

const PlantBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const plants = [
    { type: 'sunflower', cost: 50, cooldown: 5 },
    { type: 'peashooter', cost: 100, cooldown: 7.5 },
    { type: 'wallnut', cost: 50, cooldown: 30 },
    { type: 'snowpeashooter', cost: 175, cooldown: 7.5 },
    { type: 'cherrybomb', cost: 150, cooldown: 50 },
    { type: 'threepeashooter', cost: 325, cooldown: 7.5 },
    { type: 'chomper', cost: 150, cooldown: 7.5 },
    { type: 'potatomine', cost: 25, cooldown: 30 },
  ];

  return (
    <Container $isExpanded={isExpanded}>
      <CardsContainer $isExpanded={isExpanded}>
        {plants.map((plant) => (
          <PlantCard
            key={plant.type}
            type={plant.type as any}
            cost={plant.cost}
            cooldown={plant.cooldown}
          />
        ))}
      </CardsContainer>
      <ToggleButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? '收起' : '展开'}
      </ToggleButton>
    </Container>
  );
};

export default PlantBar; 