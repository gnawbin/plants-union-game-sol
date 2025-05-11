const fs = require('fs-extra');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'resources', 'graphics');
const targetDir = path.join(__dirname, 'public', 'assets', 'images');

// 确保目标目录存在
fs.ensureDirSync(targetDir);

// 复制所有资源文件
async function copyAssets() {
  try {
    // 复制植物图片
    await fs.copy(
      path.join(sourceDir, 'Plants'),
      path.join(targetDir, 'Plants')
    );

    // 复制僵尸图片
    await fs.copy(
      path.join(sourceDir, 'Zombies'),
      path.join(targetDir, 'Zombies')
    );

    // 复制子弹图片
    await fs.copy(
      path.join(sourceDir, 'Bullets'),
      path.join(targetDir, 'Bullets')
    );

    // 复制卡片图片
    await fs.copy(
      path.join(sourceDir, 'Cards'),
      path.join(targetDir, 'Cards')
    );

    // 复制屏幕图片
    await fs.copy(
      path.join(sourceDir, 'Screen'),
      path.join(targetDir, 'Screen')
    );

    // 复制物品图片
    await fs.copy(
      path.join(sourceDir, 'Items'),
      path.join(targetDir, 'Items')
    );

    console.log('Assets copied successfully!');
  } catch (err) {
    console.error('Error copying assets:', err);
  }
}

copyAssets(); 