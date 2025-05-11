import { PlantType } from '../types/game';
// import { plantImages } from '../utils/assetLoader'; // plantImages 似乎未使用，可以注释掉或移除

export interface PlantStats {
  cost: number;
  health: number;
  cooldown: number; // 卡片冷却时间 (秒)
  imageDir: string;    // 动画帧所在目录路径, e.g., '/assets/images/Plants/Sunflower/'
  frameCount: number;  // 动画总帧数
  animationSpeed: number; // 每帧持续的毫秒数
  staticImage?: string; // 可选的静态图片，用于卡片或无法播放动画时的备用
  attackDamage?: number;
  attackSpeed?: number; // 每秒攻击次数
  width?: number;      // 新增：植物渲染宽度 (px)
  height?: number;     // 新增：植物渲染高度 (px)
  // 根据需要可以添加其他属性，如阳光产量、范围等
}

// 假设的默认渲染尺寸，如果植物自身没有定义
const DEFAULT_PLANT_WIDTH = 80 * 0.9;
const DEFAULT_PLANT_HEIGHT = 100 * 0.9;

export const PLANT_STATS: Record<PlantType, PlantStats> = {
  sunflower: { 
    cost: 50, 
    health: 300, 
    cooldown: 7.5, 
    imageDir: '/assets/images/Plants/SunFlower/', // 注意原始素材目录可能是SunFlower
    frameCount: 18, // 示例帧数
    animationSpeed: 100, // 100ms per frame
    staticImage: '/assets/images/Plants/SunFlower/SunFlower_0.png', // 假设第一帧或特定静态图
    width: 70,
    height: 70, 
  },
  peashooter: { 
    cost: 100, 
    health: 300, 
    cooldown: 7.5, 
    imageDir: '/assets/images/Plants/Peashooter/',
    frameCount: 13, // 示例帧数
    animationSpeed: 120,
    staticImage: '/assets/images/Plants/Peashooter/Peashooter_0.png',
    attackDamage: 20, 
    attackSpeed: 1 / 1.4, // 大约1.4秒一次
    width: 65,
    height: 70,
  },
  wallnut: { 
    cost: 50, 
    health: 4000, 
    cooldown: 30, 
    imageDir: '/assets/images/Plants/WallNut/WallNut/', // 注意原始素材目录可能是WallNut
    frameCount: 16, // 示例帧数 (包含不同受损状态)
    animationSpeed: 150,
    staticImage: '/assets/images/Plants/WallNut/WallNut/WallNut_0.png',
    width: 65,
    height: 75,
  },
  snowpeashooter: { 
    cost: 175, 
    health: 300, 
    cooldown: 7.5, 
    imageDir: '/assets/images/Plants/SnowPea/', // 注意原始素材目录可能是SnowPea
    frameCount: 15, // 示例帧数
    animationSpeed: 120,
    staticImage: '/assets/images/Plants/SnowPea/SnowPea_0.png',
    attackDamage: 20, 
    attackSpeed: 1 / 1.4,
    width: 65,
    height: 70,
  },
  cherrybomb: { // 樱桃炸弹通常是瞬时生效，种下即爆炸
    cost: 150, 
    health: Infinity, // 或者一个足够高的值，表示一次性
    cooldown: 50, 
    imageDir: '/assets/images/Plants/CherryBomb/',
    frameCount: 7, // 爆炸序列
    animationSpeed: 100,
    staticImage: '/assets/images/Plants/CherryBomb/CherryBomb_0.png',
    width: 110, // 樱桃炸弹爆炸范围较大
    height: 100,
  },
  threepeashooter: {
    cost: 325,
    health: 300,
    cooldown: 7.5,
    imageDir: '/assets/images/Plants/Threepeater/', // 注意原始素材目录可能是Threepeater
    frameCount: 16, // 修正：实际帧数是 0-15，共16帧
    animationSpeed: 120,
    staticImage: '/assets/images/Plants/Threepeater/Threepeater_0.png',
    attackDamage: 20,
    attackSpeed: 1 / 1.4,
    width: 70,
    height: 70,
  },
  chomper: {
    cost: 150,
    health: 300,
    cooldown: 7.5, // 咀嚼时有较长冷却
    imageDir: '/assets/images/Plants/Chomper/Chomper/',
    frameCount: 13, // 示例帧数 (攻击和咀嚼)
    animationSpeed: 150,
    staticImage: '/assets/images/Plants/Chomper/Chomper/Chomper_0.png',
    attackDamage: Infinity, // 一口一个普通僵尸
    width: 80, // 食人花可能更宽
    height: 90,
  },
  potatomine: { // 土豆雷需要激活时间
    cost: 25,
    health: 300, // 未激活时血量，激活后一次性
    cooldown: 30,
    imageDir: '/assets/images/Plants/PotatoMine/PotatoMine/',
    frameCount: 8, // 从地下出来到爆炸的序列 (可能需要分阶段动画)
    animationSpeed: 200,
    staticImage: '/assets/images/Plants/PotatoMine/PotatoMine/PotatoMine_0.png',
    width: 60,
    height: 45, // 土豆雷比较矮
  },
  // puffshroom 已移除
}; 