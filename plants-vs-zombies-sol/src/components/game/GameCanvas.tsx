import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Plant, Zombie, FallingSun, GameState, PlantType, ZombieType, ZombieAnimationName, Projectile, ProjectileType } from '../../types/game';
import PlantBar from './PlantBar';
import SunCounter from './SunCounter';
import ZombieComponent from './Zombie';
import { 
  addFallingSun, 
  collectFallingSun, 
  removeFallingSun, 
  moveFallingSuns,
  addPlant,
  setSelectedPlant,
  animatePlants,
  addZombie,
  moveZombies,
  animateZombies,
  moveProjectiles,
  resetGame
} from '../../store/gameSlice';
import { itemImages, backgroundImages, bulletImages } from '../../utils/assetLoader';
import { PLANT_STATS } from '../../data/plantData';
import { ZOMBIE_STATS, ZOMBIE_IMAGE_BASE_PATH } from '../../data/zombieData';

// 网格和游戏区域定义
const NEW_BACKGROUND_IMAGE_WIDTH = 1000; // 新的游戏区域可见宽度
const PREVIOUS_LOGICAL_WIDTH = 1100; // 修改前的逻辑宽度，用于计算裁切
const CROP_X_OFFSET_LOGICAL = (PREVIOUS_LOGICAL_WIDTH - NEW_BACKGROUND_IMAGE_WIDTH) / 2; // 每边裁切掉的逻辑像素

const BACKGROUND_IMAGE_HEIGHT = 600;

// 假设草坪区域在背景图上的大致位置和大小，用于定义网格
const LAWN_X_OFFSET = 189 - CROP_X_OFFSET_LOGICAL; // 草坪从新的左边缘计算偏移 (189是相对于1100的，现在要减去左边裁掉的50)
const LAWN_Y_OFFSET = 80;  // 示例：草坪从背景图顶部80px开始 (植物选择栏下方)
const NUM_COLS = 7; 
const NUM_ROWS = 5; 
const GRID_CELL_WIDTH = 80; // 这个值也可能需要调整以适应草坪宽度
const GRID_CELL_HEIGHT = 100; // 这个值也可能需要调整以适应草坪高度

// 植物实际种植的Y轴起始点，应在植物选择栏下方，并与草坪顶部对齐
const PLANTING_AREA_Y_START = LAWN_Y_OFFSET; 

const GameContainer = styled.div`
  position: relative;
  width: ${NEW_BACKGROUND_IMAGE_WIDTH}px; 
  height: ${BACKGROUND_IMAGE_HEIGHT}px; 
`;

const Canvas = styled.canvas`
  border: 1px solid #000;
`;

// 用于存储预加载的植物动画帧： { [plantType]: HTMLImageElement[] }
const preloadedPlantFrames = new Map<PlantType, HTMLImageElement[]>();
// 用于存储预加载的僵尸动画帧： { [zombieType]: { [animationName]: HTMLImageElement[] } }
const preloadedZombieFrames = new Map<ZombieType, Map<ZombieAnimationName, HTMLImageElement[]>>();
const preloadedProjectileImages = new Map<ProjectileType, HTMLImageElement>(); // 新增：用于存储预加载的子弹图片
let preloadedBackgroundImage: HTMLImageElement | null = null;

const createNewZombie = (rowIndex: number): Omit<Zombie, 'currentAnimationState' | 'currentFrame' | 'frameTimer'> => {
  const yPosition = LAWN_Y_OFFSET + rowIndex * GRID_CELL_HEIGHT + GRID_CELL_HEIGHT / 2;
  return {
    id: Math.random().toString(36).slice(2),
    type: 'zombie', 
    position: { x: NEW_BACKGROUND_IMAGE_WIDTH, y: yPosition }, 
    health: ZOMBIE_STATS.zombie.health, // 从 ZOMBIE_STATS 获取默认值
    speed: ZOMBIE_STATS.zombie.speed,   // 从 ZOMBIE_STATS 获取默认值
    damage: ZOMBIE_STATS.zombie.damage, // 从 ZOMBIE_STATS 获取默认值
  };
};

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rawGameState = useSelector((state: RootState) => state.game) as GameState;
  const dispatch = useDispatch();
  const [isAssetLoading, setIsAssetLoading] = useState(true);

  const gameStateRef = useRef(rawGameState);
  useEffect(() => {
    gameStateRef.current = rawGameState;
  }, [rawGameState]);

  useEffect(() => {
    let mounted = true;
    let plantImagesToLoad = 0;
    let plantImagesLoaded = 0;
    let zombieImagesToLoad = 0;
    let zombieImagesLoaded = 0;
    let projectileImagesToLoad = 0; // 新增
    let projectileImagesLoaded = 0; // 新增
    let backgroundImgLoaded = false;

    const checkAllAssetsLoaded = () => {
      if (mounted && backgroundImgLoaded && 
          plantImagesLoaded === plantImagesToLoad && 
          zombieImagesLoaded === zombieImagesToLoad &&
          projectileImagesLoaded === projectileImagesToLoad) { // 新增条件
        console.log('All assets (background, plants, zombies, projectiles) preloaded.');
        setIsAssetLoading(false);
      }
    };

    // 预加载背景图
    const bgImg = new Image();
    bgImg.src = backgroundImages.background;
    bgImg.onload = () => {
      if (!mounted) return;
      preloadedBackgroundImage = bgImg;
      backgroundImgLoaded = true;
      console.log('Background image preloaded.');
      checkAllAssetsLoaded();
    };
    bgImg.onerror = () => {
      if (!mounted) return;
      backgroundImgLoaded = true; // 即使失败也标记为完成，避免卡住
      console.error(`Failed to load background image: ${bgImg.src}`);
      checkAllAssetsLoaded();
    };

    // 预加载植物图片
    (Object.keys(PLANT_STATS) as PlantType[]).forEach(plantType => {
      const stats = PLANT_STATS[plantType];
      const plantNameMatch = stats.imageDir.match(/([^/]+)\/$/);
      const plantName = plantNameMatch ? plantNameMatch[1] : '';
      if (stats && stats.imageDir && stats.frameCount > 0 && plantName) {
        const frames: HTMLImageElement[] = [];
        preloadedPlantFrames.set(plantType, frames);
        plantImagesToLoad += stats.frameCount;
        for (let i = 0; i < stats.frameCount; i++) {
          const img = new Image();
          img.src = `${stats.imageDir}${plantName}_${i}.png`; 
          img.onload = () => {
            if (!mounted) return;
            plantImagesLoaded++;
            checkAllAssetsLoaded();
          };
          img.onerror = () => {
            if (!mounted) return;
            plantImagesLoaded++; 
            console.error(`Failed to load plant image: ${img.src}`);
            checkAllAssetsLoaded();
          }
          frames.push(img);
        }
      }
    });

    // 预加载僵尸图片
    (Object.keys(ZOMBIE_STATS) as ZombieType[]).forEach(zombieType => {
      const zombieTypeStats = ZOMBIE_STATS[zombieType];
      const animationsMap = new Map<ZombieAnimationName, HTMLImageElement[]>();
      preloadedZombieFrames.set(zombieType, animationsMap);

      (Object.keys(zombieTypeStats.animations) as ZombieAnimationName[]).forEach(animName => {
        const animState = zombieTypeStats.animations[animName];
        if (animState) {
          const frames: HTMLImageElement[] = [];
          animationsMap.set(animName, frames);
          zombieImagesToLoad += animState.frameCount;
          for (let i = 0; i < animState.frameCount; i++) {
            const img = new Image();
            const imageName = `${animState.baseName}_${i}.png`;
            img.src = `${ZOMBIE_IMAGE_BASE_PATH}${zombieTypeStats.folderName}/${animState.animationDir}/${imageName}`;
            img.onload = () => {
              if (!mounted) return;
              zombieImagesLoaded++;
              checkAllAssetsLoaded();
            };
            img.onerror = () => {
              if (!mounted) return;
              zombieImagesLoaded++;
              console.error(`Failed to load zombie image: ${img.src}`);
              checkAllAssetsLoaded();
            };
            frames.push(img);
          }
        }
      });
    });
    
    // 预加载子弹图片 (新增)
    (Object.keys(bulletImages) as ProjectileType[]).forEach(projType => {
      const src = bulletImages[projType as keyof typeof bulletImages]; // 获取路径
      if (src) {
        projectileImagesToLoad++;
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (!mounted) return;
          preloadedProjectileImages.set(projType, img);
          projectileImagesLoaded++;
          checkAllAssetsLoaded();
        };
        img.onerror = () => {
          if (!mounted) return;
          console.error(`Failed to load projectile image: ${src}`);
          projectileImagesLoaded++; // 即使失败也视为完成，避免卡住
          checkAllAssetsLoaded();
        };
      }
    });
    
    // 如果没有任何图片需要加载 (例如所有frameCount都是0)，直接完成加载
    if (plantImagesToLoad === 0 && zombieImagesToLoad === 0 && projectileImagesToLoad === 0 && backgroundImgLoaded) { // 新增条件
        checkAllAssetsLoaded();
    } else if (plantImagesToLoad === 0 && zombieImagesToLoad === 0 && projectileImagesToLoad === 0 && !backgroundImgLoaded) {
        // 等待背景图加载回调
    }

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isAssetLoading) return; // 等待所有资源加载完成
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = NEW_BACKGROUND_IMAGE_WIDTH; // 使用新的宽度
    canvas.height = BACKGROUND_IMAGE_HEIGHT;
    
    const gameContainer = canvas.parentElement as HTMLDivElement;
    if (gameContainer) {
        gameContainer.style.width = `${canvas.width}px`;
        gameContainer.style.height = `${canvas.height}px`;
    }

    const sunInterval = setInterval(() => {
      const id = Math.random().toString(36).slice(2);
      const x = LAWN_X_OFFSET + Math.random() * (NUM_COLS * GRID_CELL_WIDTH - 60) + 30;
      const speed = 1 + Math.random() * 1.5;
      dispatch(addFallingSun({ id, x, y: PLANTING_AREA_Y_START, speed, collected: false }));
    }, 5000);

    const gameLogicInterval = setInterval(() => {
      dispatch(moveFallingSuns());
      dispatch(moveZombies());
      dispatch(animatePlants());
      dispatch(animateZombies());
      dispatch(moveProjectiles());
    }, 30); // 统一的游戏逻辑和动画更新频率 (约33 FPS)

    const zombieSpawnInterval = setInterval(() => {
      if (gameStateRef.current.isGameOver) return; // 游戏结束后停止生成僵尸
      
      const zombieTypeToSpawn: ZombieType = 'zombie'; // 决定要生成的僵尸类型

      const availableRows = [0, 1, 2, 3, 4]; // 假设有5行草坪
      const randomRowIndex = availableRows[Math.floor(Math.random() * availableRows.length)];
      const yPosition = LAWN_Y_OFFSET + randomRowIndex * GRID_CELL_HEIGHT + GRID_CELL_HEIGHT / 2; // Y 轴居中于格子

      const zombieStats = ZOMBIE_STATS[zombieTypeToSpawn];
      if (!zombieStats) {
        console.error(`Stats not found for zombie type: ${zombieTypeToSpawn}`);
        return;
      }
      const zombieWidth = zombieStats.width;

      // addZombie action 期望的 payload 是 Omit<Zombie, 'currentAnimationState' | 'currentFrame' | 'frameTimer'>
      const newZombiePayload: Omit<Zombie, 'currentAnimationState' | 'currentFrame' | 'frameTimer'> = {
        id: `zombie-${Date.now()}-${Math.random()}`,
        type: zombieTypeToSpawn,
        health: zombieStats.health,
        speed: zombieStats.speed,
        damage: zombieStats.damage, // 从 ZOMBIE_STATS 中获取伤害值
        position: { x: NEW_BACKGROUND_IMAGE_WIDTH + (zombieWidth / 2), y: yPosition }, // 调整X坐标，使其从新的右边缘生成
      };
      dispatch(addZombie(newZombiePayload));
      // console.log('Spawned zombie:', newZombiePayload);
    }, 10000);

    const handleClick = (e: MouseEvent) => {
      const currentGameState = gameStateRef.current;
      if (currentGameState.isGameOver) return; // 游戏结束后不处理点击
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (currentGameState.selectedPlant && 
          mouseX >= LAWN_X_OFFSET && mouseX < LAWN_X_OFFSET + NUM_COLS * GRID_CELL_WIDTH &&
          mouseY >= LAWN_Y_OFFSET && mouseY < LAWN_Y_OFFSET + NUM_ROWS * GRID_CELL_HEIGHT) {
            
        const plantType = currentGameState.selectedPlant;
        const stats = PLANT_STATS[plantType];
        if (currentGameState.sun >= stats.cost) {
          const col = Math.floor((mouseX - LAWN_X_OFFSET) / GRID_CELL_WIDTH);
          const row = Math.floor((mouseY - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
          
          const plantX = LAWN_X_OFFSET + col * GRID_CELL_WIDTH + (GRID_CELL_WIDTH / 2); 
          const plantY = LAWN_Y_OFFSET + row * GRID_CELL_HEIGHT + (GRID_CELL_HEIGHT / 2); 

          const isCellOccupied = currentGameState.plants.some(p => {
            const pCol = Math.floor((p.position.x - LAWN_X_OFFSET) / GRID_CELL_WIDTH);
            const pRow = Math.floor((p.position.y - LAWN_Y_OFFSET) / GRID_CELL_HEIGHT);
            return pCol === col && pRow === row;
          });

          if (!isCellOccupied) {
            const newPlant: Omit<Plant, 'currentFrame' | 'frameTimer'> = {
              id: Math.random().toString(36).slice(2),
              type: plantType,
              position: { x: plantX, y: plantY },
              health: stats.health,
              cost: stats.cost,
              cooldown: stats.cooldown, 
              lastAttackTime: 0,
            };
            dispatch(addPlant(newPlant));
            dispatch(setSelectedPlant(null)); 
          } else {
            console.log("Cell is already occupied!");
          }
        } else {
          console.log("Not enough sun!");
        }
      } else {
        currentGameState.fallingSuns.forEach(sun => {
          if (!sun.collected && Math.abs(mouseX - (sun.x)) < 30 && Math.abs(mouseY - (sun.y)) < 30) {
            dispatch(collectFallingSun(sun.id));
            setTimeout(() => dispatch(removeFallingSun(sun.id)), 300);
          }
        });
      }
    };
    canvas.addEventListener('click', handleClick);

    let animationFrameId: number;
    const gameLoop = () => {
      const currentGameState = gameStateRef.current;
      if (!ctx || !canvas || !preloadedBackgroundImage || preloadedBackgroundImage.width === 0) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 计算从原始背景素材中裁切的参数
      const actualAssetWidth = preloadedBackgroundImage.naturalWidth; // 使用 naturalWidth 获取原始尺寸
      const actualAssetHeight = preloadedBackgroundImage.naturalHeight; // 使用 naturalHeight 获取原始尺寸
      
      // 在原始背景图上，对应于从 PREVIOUS_LOGICAL_WIDTH (1100px) 的视图左侧裁切掉 CROP_X_OFFSET_LOGICAL (50px) 的实际像素
      const sourceCropX = CROP_X_OFFSET_LOGICAL * (actualAssetWidth / PREVIOUS_LOGICAL_WIDTH);
      // 需要从原始背景图上取样的宽度，这个宽度在缩放后将正好填充新的 NEW_BACKGROUND_IMAGE_WIDTH (1000px)
      const sourceSampleWidth = NEW_BACKGROUND_IMAGE_WIDTH * (actualAssetWidth / PREVIOUS_LOGICAL_WIDTH);

      ctx.drawImage(
        preloadedBackgroundImage, 
        sourceCropX, // 源图像的X轴裁剪点
        0,           // 源图像的Y轴裁剪点
        sourceSampleWidth, // 从源图像裁剪的宽度
        actualAssetHeight, // 从源图像裁剪的高度 (保持完整高度)
        0,           // 在画布上放置图像的X轴坐标
        0,           // 在画布上放置图像的Y轴坐标
        NEW_BACKGROUND_IMAGE_WIDTH, // 在画布上绘制图像的宽度 (新的画布宽度)
        BACKGROUND_IMAGE_HEIGHT  // 在画布上绘制图像的高度
      );
      
      currentGameState.plants.forEach((plant: Plant) => {
        const frames = preloadedPlantFrames.get(plant.type);
        if (frames && frames[plant.currentFrame] && frames[plant.currentFrame].complete && frames[plant.currentFrame].naturalHeight !== 0) {
          const img = frames[plant.currentFrame];
          const stats = PLANT_STATS[plant.type];
          const drawWidth = stats.width || GRID_CELL_WIDTH * 0.9;
          const drawHeight = stats.height || GRID_CELL_HEIGHT * 0.9;
          ctx.drawImage(img, plant.position.x - drawWidth / 2, plant.position.y - drawHeight * 0.8, drawWidth, drawHeight);
        } else if (frames && frames[plant.currentFrame] && (!frames[plant.currentFrame].complete || frames[plant.currentFrame].naturalHeight === 0)){
          // Image is still loading or failed to load, can draw placeholder or log error
        } else {
          const stats = PLANT_STATS[plant.type];
          if (stats && stats.staticImage) {
            // Fallback to static image, though this part might be redundant if preloading works well
             const staticImg = new Image(); // This could be preloaded too if used often
             staticImg.src = stats.staticImage;
             if (staticImg.complete) {
                  ctx.drawImage(staticImg, plant.position.x - (stats.width || 70)/2, plant.position.y - (stats.height || 70) * 0.8, stats.width || 70, stats.height || 70);
             }
          } else {
            ctx.fillStyle = 'purple'; 
            ctx.fillRect(plant.position.x - 20, plant.position.y - 40, 40, 40);
          }
        }
      });

      currentGameState.fallingSuns.forEach((sun: FallingSun) => {
        if (!sun.collected) {
          ctx.save();
          ctx.globalAlpha = 0.95;
          // Consider preloading sun image as well
          const img = new window.Image(); 
          img.src = itemImages.sun;
          if (img.complete && img.naturalHeight !== 0) {
            ctx.drawImage(img, sun.x - 30, sun.y - 30, 60, 60);
          } // else: sun image not loaded, skip drawing or draw placeholder
          ctx.restore();
        }
      });

      // 绘制子弹 (新增)
      currentGameState.projectiles.forEach((projectile: Projectile) => {
        const img = preloadedProjectileImages.get(projectile.type);
        if (img && img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, projectile.position.x, projectile.position.y, projectile.width, projectile.height);
        } else {
          // 子弹图片未加载或加载失败，可以绘制一个占位符或打印错误
           ctx.fillStyle = 'red'; // 示例占位符
           ctx.fillRect(projectile.position.x, projectile.position.y, 10, 10);
        }
      });

      if (currentGameState.isGameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 60px Arial";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(sunInterval);
      clearInterval(gameLogicInterval); //清理统一的逻辑定时器
      clearInterval(zombieSpawnInterval);
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dispatch, isAssetLoading]);

  if (isAssetLoading) {
    return <div>Loading assets...</div>;
  }

  return (
    <GameContainer>
      <Canvas ref={canvasRef} />
      <PlantBar />
      <SunCounter />
      {rawGameState.zombies.map((zombie) => (
        <ZombieComponent
          key={zombie.id}
          id={zombie.id}
          type={zombie.type}
          x={zombie.position.x}
          y={zombie.position.y}
          health={zombie.health} 
          speed={zombie.speed}
          currentAnimationState={zombie.currentAnimationState}
          currentFrame={zombie.currentFrame}
        />
      ))}
      {rawGameState.isGameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: 'white',
          padding: '30px',
          borderRadius: '10px',
          textAlign: 'center',
          zIndex: 1000, // 确保在最上层
          border: '2px solid #ccc',
          boxShadow: '0 0 15px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '28px' }}>游戏结束!</h2>
          <button
            onClick={() => dispatch(resetGame())}
            style={{
              padding: '12px 25px',
              fontSize: '18px',
              cursor: 'pointer',
              backgroundColor: '#5cb85c', // 绿色按钮
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            再来一次
          </button>
        </div>
      )}
    </GameContainer>
  );
};

export default GameCanvas; 