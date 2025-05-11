import { ZombieStats } from '../data/zombieData'; // 导入 ZombieStats 以获取动画键名

export type Position = {
  x: number;
  y: number;
};

export type PlantType = 
  | 'sunflower'
  | 'peashooter'
  | 'wallnut'
  | 'snowpeashooter'
  | 'cherrybomb'
  | 'threepeashooter'
  | 'chomper'
  | 'potatomine';

export type ZombieType = 
  | 'zombie'
  | 'flagzombie'
  | 'coneheadzombie'
  | 'bucketheadzombie'
  | 'newspaperzombie';

// 定义僵尸动画状态的名称类型, 基于 ZombieStats 中的 animations 的键
export type ZombieAnimationName = keyof ZombieStats['animations'];

export type Plant = {
  id: string;
  type: PlantType;
  position: Position;
  health: number;
  cost: number;
  cooldown: number;
  lastAttackTime: number;
  currentFrame: number;
  frameTimer: number;
};

export type Zombie = {
  id: string;
  type: ZombieType;
  position: Position;
  health: number;
  speed: number;
  damage: number;
  currentAnimationState: ZombieAnimationName; // 新增：当前动画状态
  currentFrame: number;                     // 新增：当前动画帧
  frameTimer: number;                       // 新增：动画帧计时器
};

export type ProjectileType = 'pea' | 'snowpea' | 'mushroom'; // 添加 mushroom 类型

export type Projectile = {
  id: string;
  type: ProjectileType;
  plantId?: string; // 发射该子弹的植物ID (可选)
  position: Position;
  speed: number; // 子弹飞行速度 (像素/游戏逻辑帧)
  damage: number;
  // 可以添加视觉相关的属性，如宽度、高度，如果需要更精确的碰撞
  width: number;
  height: number;
};

export type FallingSun = {
  id: string;
  x: number;
  y: number;
  speed: number;
  collected: boolean;
};

export type GameState = {
  plants: Plant[];
  zombies: Zombie[];
  projectiles: Projectile[]; // 新增：子弹数组
  sun: number;
  score: number;
  isGameOver: boolean;
  isVictory: boolean;
  selectedPlant: PlantType | null;
  fallingSuns: FallingSun[];
}; 