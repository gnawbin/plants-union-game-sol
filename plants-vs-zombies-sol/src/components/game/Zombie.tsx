import React from 'react';
import styled from 'styled-components';
import { ZombieType, ZombieAnimationName } from '../../types/game'; // 导入类型
import { ZOMBIE_STATS, ZOMBIE_IMAGE_BASE_PATH } from '../../data/zombieData'; // 导入数据

// 更新 ZombieProps 以包含动画状态和当前帧
// x, y 仍然用于定位。type 用于获取 stats。
// health 和 speed 暂时保留，但不由该组件直接用于渲染逻辑。
export interface ZombieProps {
  id: string;
  type: ZombieType;
  x: number;
  y: number;
  health: number; // 仅作数据传递，不直接影响此组件渲染
  speed: number;  // 仅作数据传递
  currentAnimationState: ZombieAnimationName;
  currentFrame: number;
}

// 使用瞬态 props: $imageUrl, $width, $height
const ZombieContainer = styled.div.attrs<{
  x: number;         // x 和 y 用于 style.left 和 style.top，通常不会直接作为DOM属性导致警告
  y: number;         // 但如果也想避免任何可能的透传，也可以改为 $x, $y
  $imageUrl: string;
  $width: number;
  $height: number;
}>(props => ({
  style: {
    left: `${props.x}px`,
    top: `${props.y}px`,
    width: `${props.$width}px`,
    height: `${props.$height}px`,
    backgroundImage: `url(${props.$imageUrl})`,
  },
// 类型定义也需要更新以匹配瞬态 props
}))<{ x: number; y: number; $imageUrl: string; $width: number; $height: number }>`
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const Zombie: React.FC<ZombieProps> = ({ 
  type, 
  x, 
  y, 
  currentAnimationState, 
  currentFrame 
}) => {
  const stats = ZOMBIE_STATS[type];
  if (!stats) return null; // 如果找不到僵尸数据，不渲染

  const currentStatsWidth = Number(stats.width);
  const currentStatsHeight = Number(stats.height);

  const animationInfo = stats.animations[currentAnimationState];
  
  let imageUrlToRender: string;
  let frameSpecificOffsetX: number;
  let frameSpecificOffsetY: number = currentStatsHeight / 1.2; // Default Y offset

  if (!animationInfo || currentFrame < 0 || currentFrame >= animationInfo.frameCount) {
    const fallbackAnim = stats.animations.walk;
    if (!fallbackAnim) return null; // Should not happen if stats are well-defined
    imageUrlToRender = `${ZOMBIE_IMAGE_BASE_PATH}${stats.folderName}/${fallbackAnim.animationDir}/${fallbackAnim.baseName}_0.png`;
    frameSpecificOffsetX = fallbackAnim.baseName.includes('Attack') ? currentStatsWidth * 0.6 : currentStatsWidth / 2;
  } else {
    const imageName = `${animationInfo.baseName}_${currentFrame}.png`;
    imageUrlToRender = `${ZOMBIE_IMAGE_BASE_PATH}${stats.folderName}/${animationInfo.animationDir}/${imageName}`;
    frameSpecificOffsetX = animationInfo.baseName.includes('Attack') ? currentStatsWidth * 0.6 : currentStatsWidth / 2;
  }

  return (
    <ZombieContainer 
      x={x - frameSpecificOffsetX} 
      y={y - frameSpecificOffsetY} 
      // 传递瞬态 props 给 styled component
      $imageUrl={imageUrlToRender} 
      $width={currentStatsWidth} 
      $height={currentStatsHeight} 
    />
  );
};

export default Zombie; 