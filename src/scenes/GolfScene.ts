// src/scenes/GolfScene.ts
import Phaser from 'phaser';

export default class GolfScene extends Phaser.Scene {
  private ball!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private hole!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  constructor() {
    super('GolfScene');
  }

  preload() {
    // Load images (use any placeholder images you want)
    // You can store them in /public or embed base64 for quick test
    this.load.image('ball', 'https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/sprites/pangball.png');
    this.load.image('hole', 'https://raw.githubusercontent.com/photonstorm/phaser-examples/master/examples/assets/sprites/target.png');
  }

  create() {
    // Set up physics
    this.physics.world.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height);

    // Add hole
    this.hole = this.physics.add.image(this.game.canvas.width * 0.8, this.game.canvas.height * 0.5, 'hole');
    this.hole.setImmovable(true);
    this.hole.setScale(0.5);
    
    // Add ball
    this.ball = this.physics.add.image(this.game.canvas.width * 0.2, this.game.canvas.height * 0.5, 'ball');
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(0.8);
    this.ball.setDrag(20, 20);

    // Check overlap between ball and hole
    this.physics.add.overlap(this.ball, this.hole, this.handleBallInHole, undefined, this);

    // Input events
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        // Calculate velocity based on drag distance
        const dragEndX = pointer.x;
        const dragEndY = pointer.y;
        const force = 0.3; // scale this to adjust power
        const velocityX = (this.dragStartX - dragEndX) * force;
        const velocityY = (this.dragStartY - dragEndY) * force;
        this.ball.setVelocity(velocityX, velocityY);
      }
    });
  }

  update() {
    // If you want some friction, you can manipulate velocity over time here
    // or rely on setDrag in the create function.
  }

  private handleBallInHole(ball: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, hole: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    // Very basic detection: if centers are close enough, "score"
    const distance = Phaser.Math.Distance.Between(ball.x, ball.y, hole.x, hole.y);
    if (distance < 20) {
      // "Sink the putt": For a real game, do more interesting stuff here
      console.log('Ball in hole!');
      this.scene.restart(); // Reset the scene to start again
    }
  }
}
