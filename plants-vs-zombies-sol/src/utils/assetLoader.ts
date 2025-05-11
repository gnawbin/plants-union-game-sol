// 植物图片资源
export const plantImages = {
  sunflower: '/assets/images/Plants/sunflower.png',
  peashooter: '/assets/images/Plants/peashooter.png',
  wallnut: '/assets/images/Plants/wallnut.png',
  snowpeashooter: '/assets/images/Plants/snowpeashooter.png',
  cherrybomb: '/assets/images/Plants/cherrybomb.png',
  threepeashooter: '/assets/images/Plants/threepeashooter.png',
  chomper: '/assets/images/Plants/chomper.png',
  potatomine: '/assets/images/Plants/potatomine.png',
};

// 僵尸图片资源
export const zombieImages = {
  // 暂时移除，因为动画帧在 GameCanvas.tsx 中单独加载
  // zombie: '/assets/images/Zombies/zombie.png',
  // flagzombie: '/assets/images/Zombies/flagzombie.png',
  // coneheadzombie: '/assets/images/Zombies/coneheadzombie.png',
  // bucketheadzombie: '/assets/images/Zombies/bucketheadzombie.png',
  // newspaperzombie: '/assets/images/Zombies/newspaperzombie.png',
};

// 子弹图片资源
export const bulletImages = {
  pea: '/assets/images/Bullets/PeaNormal/PeaNormal_0.png',
  snowpea: '/assets/images/Bullets/PeaIce/PeaIce_0.png',
  mushroom: '/assets/images/Bullets/BulletMushRoom/BulletMushRoom_0.png',
};

// 卡片图片资源
export const cardImages = {
  sunflower: '/assets/images/Cards/card_sunflower.png',
  peashooter: '/assets/images/Cards/card_peashooter.png',
  wallnut: '/assets/images/Cards/card_wallnut.png',
  snowpeashooter: '/assets/images/Cards/card_snowpea.png',
  cherrybomb: '/assets/images/Cards/card_cherrybomb.png',
  threepeashooter: '/assets/images/Cards/card_threepeashooter.png',
  chomper: '/assets/images/Cards/card_chomper.png',
  potatomine: '/assets/images/Cards/card_potatomine.png',
};

// 背景图片资源
export const backgroundImages = {
  mainMenu: '/assets/images/Screen/MainMenu.png',
  background: '/assets/images/Items/Background/Background_0.jpg',
  gameOver: '/assets/images/Screen/GameLoose.png',
  victory: '/assets/images/Screen/GameVictory.png',
};

// 其他物品图片资源
export const itemImages = {
  sun: '/assets/images/Plants/Sun/Sun_0.png',
  // shovel: '/assets/images/Items/shovel.png', // 暂时注释掉铲子
};

// 预加载所有图片
export const preloadImages = async () => {
  const allImages = {
    ...plantImages,
    ...zombieImages,
    ...bulletImages,
    ...cardImages,
    ...backgroundImages,
    ...itemImages,
  };

  const promises = Object.values(allImages).map((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  });

  try {
    await Promise.all(promises);
    console.log('All images loaded successfully');
  } catch (error) {
    console.error('Error loading images:', error);
  }
}; 