import { ZombieType } from '../types/game';

// 僵尸动画状态的接口定义
export interface ZombieAnimationState {
  animationDir: string; // 动画所在的子目录名, e.g., 'Zombie', 'ZombieAttack'
  baseName: string;     // 动画帧的基础文件名, e.g., 'Zombie' for Zombie_0.png
  frameCount: number;   // 总帧数
  animationSpeed: number; // 每帧之间的毫秒数 (用于游戏逻辑计时器)
  loop: boolean;        // 动画是否循环
}

// 单个僵尸类型的统计数据和动画信息接口定义
export interface ZombieStats {
  folderName: string;   // 该僵尸类型在 assets/images/Zombies/ 下的主文件夹名
  health: number;
  speed: number;        // 像素/秒 (游戏逻辑速度)
  damage: number;
  width: number;        // 渲染宽度 (px)
  height: number;       // 渲染高度 (px)
  animations: {
    walk: ZombieAnimationState;
    attack?: ZombieAnimationState; // 攻击动画 (可选，后续实现)
    die?: ZombieAnimationState;    // 死亡动画 (可选，后续实现)
    // 可以为特殊状态定义更多动画，例如 lostHeadWalk, noPaperWalk 等
    boomDie?: ZombieAnimationState; // 特殊死亡动画，如被炸死
    lostHead?: ZombieAnimationState;
    lostHeadAttack?: ZombieAnimationState;
    noPaperWalk?: ZombieAnimationState; // 报纸僵尸没报纸后的行走
    noPaperAttack?: ZombieAnimationState; // 报纸僵尸没报纸后的攻击
    // 未来可以扩展更多特定状态的动画
    // 例如: lostHeadWalk, lostHeadAttack, newspaperLostWalk, etc.
  };
  // 可能还有其他特定于僵尸类型的属性，例如报纸僵尸的报纸生命值等
}

// 基础图片路径 (假设所有僵尸图片都在这个路径下按类型分子目录)
export const ZOMBIE_IMAGE_BASE_PATH = 'assets/images/Zombies/';

// 定义不同类型僵尸的具体数据
// 注意: frameCount 和 animationSpeed 目前是占位符，需要根据实际资源调整
export const ZOMBIE_STATS: Record<ZombieType, ZombieStats> = {
  'zombie': { // 对应 NormalZombie 文件夹
    folderName: 'NormalZombie',
    health: 100,
    speed: 15, // 调低移动速度
    damage: 20,
    width: 70, // 示例渲染尺寸
    height: 100,
    animations: {
      walk: { animationDir: 'Zombie', baseName: 'Zombie', frameCount: 22, animationSpeed: 120, loop: true },
      attack: { animationDir: 'ZombieAttack', baseName: 'ZombieAttack', frameCount: 21, animationSpeed: 100, loop: true },
      die: { animationDir: 'ZombieDie', baseName: 'ZombieDie', frameCount: 10, animationSpeed: 150, loop: false }, 
      boomDie: { animationDir: 'BoomDie', baseName: 'BoomDie', frameCount: 20, animationSpeed: 100, loop: false },
      lostHead: { animationDir: 'ZombieLostHead', baseName: 'ZombieLostHead', frameCount: 18, animationSpeed: 120, loop: true },      
      lostHeadAttack: { animationDir: 'ZombieLostHeadAttack', baseName: 'ZombieLostHeadAttack', frameCount: 11, animationSpeed: 100, loop: true },
    }
  },
  'coneheadzombie': {
    folderName: 'ConeheadZombie',
    health: 280, // 普通僵尸 + 路障生命值
    speed: 15, // 调低移动速度
    damage: 20,
    width: 75,
    height: 105,
    animations: {
      walk: { animationDir: 'ConeheadZombie', baseName: 'ConeheadZombie', frameCount: 21, animationSpeed: 120, loop: true },
      attack: { animationDir: 'ConeheadZombieAttack', baseName: 'ConeheadZombieAttack', frameCount: 11, animationSpeed: 100, loop: true },
      // die 动画可以稍后添加，或者复用普通僵尸的（如果适用）
    }
  },
  'bucketheadzombie': {
    folderName: 'BucketheadZombie',
    health: 500, // 普通僵尸 + 铁桶生命值
    speed: 15, // 调低移动速度
    damage: 20,
    width: 75,
    height: 105,
    animations: {
      walk: { animationDir: 'BucketheadZombie', baseName: 'BucketheadZombie', frameCount: 15, animationSpeed: 120, loop: true }, // 截图标号到14，所以是15帧
      attack: { animationDir: 'BucketheadZombieAttack', baseName: 'BucketheadZombieAttack', frameCount: 11, animationSpeed: 100, loop: true }, // 截图标号到10，所以是11帧
    }
  },
  'flagzombie': {
    folderName: 'FlagZombie',
    health: 100, 
    speed: 20, // 旗帜僵尸通常快一点
    damage: 20,
    width: 70,
    height: 100,
    animations: {
      walk: { animationDir: 'FlagZombie', baseName: 'FlagZombie', frameCount: 12, animationSpeed: 100, loop: true }, // 截图标号到11，所以是12帧
      attack: { animationDir: 'FlagZombieAttack', baseName: 'FlagZombieAttack', frameCount: 11, animationSpeed: 100, loop: true },
      lostHead: { animationDir: 'FlagZombieLostHead', baseName: 'FlagZombieLostHead', frameCount: 12, animationSpeed: 100, loop: true},
      lostHeadAttack: { animationDir: 'FlagZombieLostHeadAttack', baseName: 'FlagZombieLostHeadAttack', frameCount: 11, animationSpeed: 100, loop: true},
    }
  },
  'newspaperzombie': {
    folderName: 'NewspaperZombie',
    health: 120, // 假设报纸有少量额外生命值
    speed: 16, // 调低移动速度
    damage: 20, // 没报纸时伤害和速度会增加
    width: 80,
    height: 100,
    animations: {
      walk: { animationDir: 'NewspaperZombie', baseName: 'NewspaperZombie', frameCount: 18, animationSpeed: 120, loop: true }, // 截图标号到17，所以是18帧
      attack: { animationDir: 'NewspaperZombieAttack', baseName: 'NewspaperZombieAttack', frameCount: 8, animationSpeed: 100, loop: true }, // 截图标号到7，所以是8帧
      die: { animationDir: 'NewspaperZombieDie', baseName: 'NewspaperZombieDie', frameCount: 11, animationSpeed: 150, loop: false }, // 截图标号到10，所以是11帧
      lostHead: { animationDir: 'NewspaperZombieLostHead', baseName: 'NewspaperZombieLostHead', frameCount: 16, animationSpeed: 120, loop: true },
      lostHeadAttack: { animationDir: 'NewspaperZombieLostHeadAttack', baseName: 'NewspaperZombieLostHeadAttack', frameCount: 7, animationSpeed: 100, loop: true },
      noPaperWalk: { animationDir: 'NewspaperZombieNoPaper', baseName: 'NewspaperZombieNoPaper', frameCount: 14, animationSpeed: 100, loop: true },
      noPaperAttack: { animationDir: 'NewspaperZombieNoPaperAttack', baseName: 'NewspaperZombieNoPaperAttack', frameCount: 7, animationSpeed: 90, loop: true },
    }
  },
};

// 辅助函数，用于获取特定僵尸特定动画状态的完整图片路径列表
export const getZombieAnimationPaths = (
  type: ZombieType,
  animationStateKey: keyof ZombieStats['animations'] // 参数名修改以更清晰
): string[] => {
  const stats = ZOMBIE_STATS[type];
  if (!stats) return [];
  
  // 类型断言，确保 animationStateKey 是 ZombieStats['animations'] 的有效键
  const anim = stats.animations[animationStateKey as keyof typeof stats.animations];
  if (!anim) return [];

  const paths: string[] = [];
  for (let i = 0; i < anim.frameCount; i++) {
    // 文件名格式通常是 BaseName_FrameNumber.png, e.g., Zombie_0.png
    // 有些可能是 BaseNameFrameNumber.png, e.g. frame0.png 需要根据实际调整
    paths.push(`${ZOMBIE_IMAGE_BASE_PATH}${stats.folderName}/${anim.animationDir}/${anim.baseName}_${i}.png`);
  }
  return paths;
}; 