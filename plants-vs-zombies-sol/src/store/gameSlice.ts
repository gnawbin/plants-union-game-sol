import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, Plant, Zombie, PlantType, FallingSun, ZombieType, ZombieAnimationName, Projectile, ProjectileType } from '../types/game';
import { PLANT_STATS } from '../data/plantData'; // 确保导入
import { ZOMBIE_STATS } from '../data/zombieData'; // Import ZOMBIE_STATS

// 更新常量以匹配 GameCanvas.tsx
const LAWN_X_OFFSET = 139; // 与 GameCanvas.tsx 中的值保持一致 (原为 189)
const LAWN_Y_OFFSET = 80;  // 从 GameCanvas.tsx 引入，用于行计算
const GRID_CELL_HEIGHT = 100; // 从 GameCanvas.tsx 引入，用于行计算
const GAME_CANVAS_WIDTH = 1000; // 与 GameCanvas.tsx 的 NEW_BACKGROUND_IMAGE_WIDTH 一致
const ZOMBIE_REACHED_HOUSE_X = LAWN_X_OFFSET - 40; // 计算结果为 99 (原为 149)

const initialState: GameState = {
  plants: [],
  zombies: [],
  projectiles: [],
  sun: 50,
  score: 0,
  isGameOver: false,
  isVictory: false,
  selectedPlant: null,
  fallingSuns: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addPlant: (state, action: PayloadAction<Omit<Plant, 'currentFrame' | 'frameTimer'>>) => {
      // 从 Omit 移除 cost 和 cooldown，因为它们在 newPlant 对象中已提供
      const plantData = PLANT_STATS[action.payload.type];
      state.plants.push({
        ...action.payload,
        // cost: plantData.cost, // 已在 GameCanvas 中设置
        // cooldown: plantData.cooldown, // 这是卡片冷却，植物自身的攻击冷却可能不同
        currentFrame: 0,
        frameTimer: 0,
      });
      state.sun -= action.payload.cost; // 种植时扣除阳光
    },
    removePlant: (state, action: PayloadAction<string>) => {
      state.plants = state.plants.filter(plant => plant.id !== action.payload);
    },
    addZombie: (state, action: PayloadAction<Omit<Zombie, 'currentAnimationState' | 'currentFrame' | 'frameTimer'>>) => {
      // 当添加僵尸时，初始化动画状态
      state.zombies.push({
        ...action.payload,
        currentAnimationState: 'walk', // 默认动画状态为行走
        currentFrame: 0,
        frameTimer: 0,
      });
    },
    removeZombie: (state, action: PayloadAction<string>) => {
      state.zombies = state.zombies.filter(zombie => zombie.id !== action.payload);
    },
    moveZombies: (state) => {
      if (state.isGameOver) return; 

      state.zombies.forEach(zombie => {
        let isCurrentlyAttacking = false;
        let targetPlantForThisZombie: Plant | undefined = undefined;

        // 1. 寻找当前僵尸的攻击目标
        const zombieRow = Math.floor((zombie.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
        const zombieStats = ZOMBIE_STATS[zombie.type];

        for (const plant of state.plants) {
          const plantRow = Math.floor((plant.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
          const plantStats = PLANT_STATS[plant.type];

          // 检查 plantStats 是否存在，以及植物的 width 是否已定义, 并且是否在同一行
          if (!plantStats || typeof plantStats.width !== 'number' || plantRow !== zombieRow) { 
            continue;
          }
          
          const currentPlantWidth = plantStats.width; // 到这里, currentPlantWidth 必然是 number

          if (zombie.position.x - zombieStats.width / 2 < plant.position.x + currentPlantWidth / 2 && 
              zombie.position.x + zombieStats.width / 2 > plant.position.x - currentPlantWidth / 2 && 
              zombie.position.x < plant.position.x + currentPlantWidth / 2) { 
              
            targetPlantForThisZombie = plant;
            isCurrentlyAttacking = true;
            break; 
          }
        }

        // 2. 更新僵尸状态和移动
        if (isCurrentlyAttacking && targetPlantForThisZombie) {
          if (zombie.currentAnimationState !== 'attack' && zombieStats.animations.attack) {
            zombie.currentAnimationState = 'attack';
            zombie.currentFrame = 0;
            zombie.frameTimer = 0;
          }
          // 攻击时僵尸不移动，所以这里没有 position.x 的更新
        } else {
          // 如果之前在攻击，现在没有目标了，或者该僵尸类型没有攻击动画，则切换回行走
          if (zombie.currentAnimationState === 'attack' || !zombieStats.animations.attack) {
            zombie.currentAnimationState = 'walk'; // 默认回到行走状态
            // currentFrame 和 frameTimer 会在 animateZombies 中根据 walk 动画重置或继续
            // 这里也可以选择重置，但 animateZombies 也会处理
          }
          // 只有非攻击状态才移动
          zombie.position.x -= zombie.speed * (30 / 1000); // 30ms per game logic tick (0.03s)
        }

        // 检查僵尸是否到达房子 (这部分逻辑不变)
        if (zombie.position.x <= ZOMBIE_REACHED_HOUSE_X) {
          state.isGameOver = true;
          console.log("Game Over! A zombie reached your house.");
        }
      });
    },
    addSun: (state, action: PayloadAction<number>) => {
      state.sun += action.payload;
    },
    setSelectedPlant: (state, action: PayloadAction<PlantType | null>) => {
      state.selectedPlant = action.payload;
    },
    setGameOver: (state, action: PayloadAction<boolean>) => {
      state.isGameOver = action.payload;
    },
    setVictory: (state, action: PayloadAction<boolean>) => {
      state.isVictory = action.payload;
    },
    addFallingSun: (state, action: PayloadAction<FallingSun>) => {
      state.fallingSuns.push(action.payload);
    },
    resetGame: (state) => {
      state.plants = initialState.plants;
      state.zombies = initialState.zombies;
      state.projectiles = initialState.projectiles;
      state.sun = initialState.sun;
      state.score = initialState.score;
      state.isGameOver = initialState.isGameOver; // 通常是 false
      state.isVictory = initialState.isVictory; // 通常是 false
      state.selectedPlant = initialState.selectedPlant; // 通常是 null
      state.fallingSuns = initialState.fallingSuns;
    },
    collectFallingSun: (state, action: PayloadAction<string>) => {
      const sun = state.fallingSuns.find(s => s.id === action.payload);
      if (sun && !sun.collected) {
        sun.collected = true;
        state.sun += 25;
      }
    },
    removeFallingSun: (state, action: PayloadAction<string>) => {
      state.fallingSuns = state.fallingSuns.filter(s => s.id !== action.payload);
    },
    moveFallingSuns: (state) => {
      state.fallingSuns.forEach(sun => {
        if (!sun.collected && sun.y < 560) {
          sun.y += sun.speed;
        }
      });
    },
    animateZombies: (state) => {
      if (state.isGameOver) return; 

      state.zombies.forEach(zombie => {
        const zombieStats = ZOMBIE_STATS[zombie.type];
        if (!zombieStats) return; // 如果找不到僵尸数据，跳过

        const animState = zombieStats.animations[zombie.currentAnimationState];

        if (animState && animState.frameCount > 0) {
          zombie.frameTimer += 30; // 改为 30，与游戏逻辑循环一致 (约33FPS)
          if (zombie.frameTimer >= animState.animationSpeed) {
            zombie.frameTimer = 0;
            const nextFrame = zombie.currentFrame + 1;

            if (nextFrame >= animState.frameCount) {
              if (animState.loop) {
                zombie.currentFrame = 0;
                // 如果是攻击动画循环结束，则造成伤害
                if (zombie.currentAnimationState === 'attack') {
                  const zombieRow = Math.floor((zombie.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
                  let plantToAttack: Plant | undefined = undefined;
                  
                  for (const p of state.plants) {
                    const plantStats = PLANT_STATS[p.type];
                    // 检查 plantStats 是否存在，以及植物的 width 是否已定义
                    if (!plantStats || typeof plantStats.width !== 'number') {
                        continue;
                    }
                    const currentPlantWidth = plantStats.width; // 到这里, currentPlantWidth 必然是 number

                    const plantRow = Math.floor((p.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
                    // 再次进行攻击范围检查，确保目标仍然有效
                    if (plantRow === zombieRow && 
                        zombie.position.x - zombieStats.width / 2 < p.position.x + currentPlantWidth / 2 &&
                        zombie.position.x + zombieStats.width / 2 > p.position.x - currentPlantWidth / 2 &&
                        zombie.position.x < p.position.x + currentPlantWidth / 2) {
                      plantToAttack = p;
                      break;
                    }
                  }

                  if (plantToAttack) {
                    plantToAttack.health -= zombie.damage;
                    if (plantToAttack.health <= 0) {
                      state.plants = state.plants.filter(p => p.id !== plantToAttack!.id);
                      // 植物死了，僵尸应该变回走路
                      zombie.currentAnimationState = 'walk';
                      zombie.currentFrame = 0; 
                    }
                  } else {
                    // 如果攻击动画循环结束，但没有找到可攻击的植物
                    zombie.currentAnimationState = 'walk';
                    zombie.currentFrame = 0;
                  }
                }
              } else {
                // 非循环动画（如死亡）停在最后一帧
                zombie.currentFrame = animState.frameCount - 1;
                // 未来可以在这里处理死亡动画播放完毕后移除僵尸的逻辑
              }
            } else {
              zombie.currentFrame = nextFrame;
            }
          }
        }
      });
    },
    animatePlants: (state) => {
      const currentTime = Date.now(); // 用于攻击速度计算

      state.plants.forEach(plant => {
        const plantStats = PLANT_STATS[plant.type];
        if (!plantStats) return;

        // 1. 处理植物自身帧动画
        plant.frameTimer += 30; 
        if (plant.frameTimer >= plantStats.animationSpeed) {
          plant.frameTimer = 0;
          plant.currentFrame = (plant.currentFrame + 1) % plantStats.frameCount;
        }

        // 2. 处理植物攻击逻辑
        if (plantStats.attackDamage && typeof plantStats.attackSpeed === 'number' && plantStats.attackSpeed > 0) {
          const attackInterval = 1000 / plantStats.attackSpeed; // 攻击间隔 (ms)

          if (currentTime - plant.lastAttackTime >= attackInterval) {
            const plantRow = Math.floor((plant.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
            let targetZombie: Zombie | undefined = undefined;
            let closestZombieDistance = Infinity;

            // 查找攻击目标：同一行，植物前方的第一个僵尸
            for (const zombie of state.zombies) {
              const zombieRow = Math.floor((zombie.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
              if (zombieRow === plantRow && zombie.position.x > plant.position.x) { 
                const distance = zombie.position.x - plant.position.x;
                if (distance < closestZombieDistance) {
                  closestZombieDistance = distance;
                  targetZombie = zombie;
                }
              }
            }

            if (targetZombie) {
              plant.lastAttackTime = currentTime;
              
              let projectileType: ProjectileType = 'pea'; 
              let projectileDamage = plantStats.attackDamage;
              let projectileSpeed = 7; 
              let projectileWidth = 22; // 调整子弹宽度 (尝试比高度略大一点)
              let projectileHeight = 20; // 保持子弹高度

              if (plant.type === 'peashooter') {
                projectileType = 'pea';
              } else if (plant.type === 'snowpeashooter') {
                projectileType = 'snowpea';
              }

              if ((plant.type === 'peashooter' || plant.type === 'snowpeashooter') && plantStats.width && plantStats.height) {
                const newProjectile: Projectile = {
                  id: `proj-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  type: projectileType,
                  plantId: plant.id,
                  position: { 
                    x: plant.position.x + 10, 
                    // y: 从植物的垂直中心再向上移动一些 (再增加5像素，总共向上15像素)
                    y: plant.position.y - (projectileHeight / 2) - 35 
                  },
                  speed: projectileSpeed,
                  damage: projectileDamage,
                  width: projectileWidth,
                  height: projectileHeight,
                };
                state.projectiles.push(newProjectile);
              }
            }
          }
        }
      });
    },
    addProjectile: (state, action: PayloadAction<Projectile>) => {
      state.projectiles.push(action.payload);
    },
    moveProjectiles: (state) => {
      const projectilesToRemove: string[] = [];
      const zombiesToRemove: string[] = []; // 用于记录被消灭的僵尸

      state.projectiles.forEach(projectile => {
        if (projectilesToRemove.includes(projectile.id)) return; // 如果子弹已标记移除，则跳过

        projectile.position.x += projectile.speed; 

        let hitZombie = false;
        for (const zombie of state.zombies) {
          if (zombiesToRemove.includes(zombie.id)) continue; // 如果僵尸已标记移除，则跳过

          const zombieStats = ZOMBIE_STATS[zombie.type];
          if (!zombieStats) continue;

          // 碰撞检测 (矩形A: projectile, 矩形B: zombie)
          const projLeft = projectile.position.x;
          const projRight = projectile.position.x + projectile.width;
          const projTop = projectile.position.y;
          const projBottom = projectile.position.y + projectile.height;

          // 简化：假设僵尸的 position.y 是其垂直中心
          const zombieLeft = zombie.position.x - zombieStats.width / 2;
          const zombieRight = zombie.position.x + zombieStats.width / 2;
          const zombieTop = zombie.position.y - zombieStats.height / 2; 
          const zombieBottom = zombie.position.y + zombieStats.height / 2;

          // Log 碰撞检测的值
          // console.log(`Proj R: ${projRight.toFixed(1)}, Zombie L: ${zombieLeft.toFixed(1)} | Proj T: ${projTop.toFixed(1)}, Zombie B: ${zombieBottom.toFixed(1)}, Proj B: ${projBottom.toFixed(1)}, Zombie T: ${zombieTop.toFixed(1)}`);

          if (projRight > zombieLeft && projLeft < zombieRight &&
              projBottom > zombieTop && projTop < zombieBottom) {
            console.log(`Collision! Proj ID: ${projectile.id}, Zombie ID: ${zombie.id}, Zombie Health: ${zombie.health - projectile.damage}`);
            zombie.health -= projectile.damage;
            projectilesToRemove.push(projectile.id);
            hitZombie = true; // 标记子弹已击中

            if (zombie.health <= 0) {
              if (!zombiesToRemove.includes(zombie.id)) { // 避免重复添加
                zombiesToRemove.push(zombie.id);
              }
            }
            break; // 一颗子弹只击中一个僵尸
          }
        }

        // 移除飞出屏幕的子弹 (如果它还没击中任何目标)
        if (!hitZombie && projectile.position.x > GAME_CANVAS_WIDTH + projectile.width) { 
          console.log(`Projectile ${projectile.id} removed (off-screen at x=${projectile.position.x.toFixed(1)})`);
          projectilesToRemove.push(projectile.id);
        }
      });

      state.projectiles = state.projectiles.filter(p => !projectilesToRemove.includes(p.id));
      state.zombies = state.zombies.filter(z => !zombiesToRemove.includes(z.id));
    },
    removeProjectile: (state, action: PayloadAction<string>) => {
      state.projectiles = state.projectiles.filter(p => p.id !== action.payload);
    },
  },
});

export const {
  addPlant,
  removePlant,
  addZombie,
  removeZombie,
  moveZombies,
  animateZombies,
  addSun,
  setSelectedPlant,
  setGameOver,
  setVictory,
  addFallingSun,
  resetGame,
  collectFallingSun,
  removeFallingSun,
  moveFallingSuns,
  addProjectile,
  moveProjectiles,
  removeProjectile,
  animatePlants,
} = gameSlice.actions;

export default gameSlice.reducer; 