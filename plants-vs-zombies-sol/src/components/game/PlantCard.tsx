import React from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PlantType } from '../../types/game';
import { setSelectedPlant } from '../../store/gameSlice';
import { cardImages } from '../../utils/assetLoader';

const Card = styled.div<{ selected: boolean; disabled: boolean }>`
  width: 70px;
  height: 90px;
  background: ${props => props.disabled ? 'rgba(0, 0, 0, 0.5)' : props.selected ? 'rgba(76, 175, 80, 0.5)' : 'transparent'};
  border: 2px solid #000;
  border-radius: 5px;
  margin: 5px;
  position: relative;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'scale(1.05)'};
  }
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Cost = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #FFD700;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  z-index: 1;
`;

const CooldownOverlay = styled.div<{ cooldown: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${props => props.cooldown}%;
  background: rgba(0, 0, 0, 0.5);
  transition: height 0.3s linear;
`;

interface PlantCardProps {
  type: PlantType;
  cost: number;
  cooldown: number;
}

const PlantCard: React.FC<PlantCardProps> = ({ type, cost, cooldown }) => {
  const dispatch = useDispatch();
  const selectedPlant = useSelector((state: RootState) => state.game.selectedPlant);
  const sun = useSelector((state: RootState) => state.game.sun);
  const [currentCooldown, setCurrentCooldown] = React.useState(0);

  const handleClick = () => {
    if (sun >= cost && currentCooldown === 0) {
      dispatch(setSelectedPlant(selectedPlant === type ? null : type));
      setCurrentCooldown(100);
      const timer = setInterval(() => {
        setCurrentCooldown(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - (100 / (cooldown * 10));
        });
      }, 100);
    }
  };

  return (
    <Card 
      selected={selectedPlant === type}
      disabled={sun < cost || currentCooldown > 0}
      onClick={handleClick}
    >
      <CardImage src={cardImages[type]} alt={type} />
      <Cost>{cost}</Cost>
      {currentCooldown > 0 && <CooldownOverlay cooldown={currentCooldown} />}
    </Card>
  );
};

export default PlantCard; 