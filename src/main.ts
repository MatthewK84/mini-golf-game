// src/main.ts
import Phaser from 'phaser';
import GolfScene from './scenes/GolfScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,  // or full window, e.g. window.innerWidth
  height: 600,
  parent: 'gameContainer',
  scene: [GolfScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  }
};

new Phaser.Game(config);
