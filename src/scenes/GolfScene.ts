// src/scenes/GolfScene.ts
import Phaser from 'phaser';

export default class GolfScene extends Phaser.Scene {
  private ball!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private hole!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private aimLine!: Phaser.GameObjects.Graphics;
  private power: number = 0;
  private maxPower: number = 300;
  private strokes: number = 0;
  private strokesText!: Phaser.GameObjects.Text;
  private ballMoving: boolean = false;
  private successText!: Phaser.GameObjects.Text;

  constructor() {
    super('GolfScene');
  }

  preload() {
    // Load proper mini golf assets
    this.load.image('grass', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH5oAAAAAElFTkSuQmCC');
    this.load.image('ball', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHsSURBVFiF7Ze9ThtBFIU/EKW1DEZChPKDQinSpEiXMg/gPAMSBeIRkkaUtHkASsrcRqRLkyJdCiMZZMRaIsqCkc6lyN314F17TRqfZqR7z7nf3Lm7s7OQ08IFsO3rsIpPbh04SRXcatg7BJoJPnXgc6rgXsPeNtBN8OkAB6mCvYa9ZWCd+GvQAu5SshxMy+8V8Gso24rSBT4kJzCsWvD9CZiElaBnMy2BWa3QEz31Cj1ZMa1aGKVVUP8scZcCWA5ZM60a0I/QN8t5ypTxsGXaYtCVkQG0gK+JCcxTX6ZVCpo6RreSkhfYlCFdyQDaMu7+FwVm44Lz1JOVMKRi2lyi363gPw3sJwWepx7wHVgAPgEV4DHSbQKfTVuQT9Qn9ghtIRnCU1ZeBj6Ythn87ySKhfO2GcWk9IBrn9QF4NcoQS9yJ6TpTmEzKnRlKl9Ni8xXptVCbD2K62u2KGU0/fz2ImfiKPqWuOu9oG8Ct2MEx/Yd0/qR/ib4nk0SLJQ+hv6xaeXQdScJTvo7jnwgdT2xSSo3mBGpAgeBtwnAQeh7Cb5Dw2F001m87KwOweL0A3gY4fcA/DCtMmn1owZ0Cf9sTYvCaAC3ZcjVLMVRLeBqmB7wDfgI3AG/ge/A4SySU/oPegHDHxI12ZS9TwAAAABJRU5ErkJggg==');
    this.load.image('hole', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHpSURBVFiF7ZexS1tRFMZ/J3kqpQ9exKGDCCVDl+oiIji7OPgPOHUSHEQcXFwEB/+CLg5OgpuLQ5dOFaxLKA51aBFcJOTdm+MQY/Lue7HvJdTBDw4c7nfP+b7ce+69T9rgJMU1IAPcAb+Bb8AvF9+n2Pk+YA04A4qO54kzGgX2gCLwZxjHc8DvhO6XBtcecO6zqXvOo34BZJ1Bt8E+75Vx7NLfXWfQbdAu8bwzzLtKdZ3JsCkAn4D3wFvgDNgGRoE3wDrQcD6e/ShwQvnxKjqhP4GSkl8K6kDFyT9Qnvx9CvK7Sv9I6fdKf0rp70u2Bfyi/+L0QnES9pX+u9Kvj3iGdBHuNz3+LeBDn11W2CyjTwngq7D5PKxxpbA5FzYfhzzDk32+V9lcOvkS8JDQtY3PoSPwMVGiDkwBt8AesOJ4XgCTwEXaxIf1XCXtAXgF3DjjEnDtOHeiOJ5rWM85/QZ2uWWVpORvbXz+KfGiyG3tUbwGnlJmNEm8KHpbexQX6JwHw+AY+AB8cTl8qlf8G2DVZxS7iN6Fa/QWlVtgI4I3WPFQVBzOcH9Yt+jvDZ67qHVR+w8WlUoKYtMB1VziL5j7FHU5Km5R8/TKCf6QqDOkUmAe2KJzdANcAVtApZKS73/FE/L/9mQvBu+2AAAAAElFTkSuQmCC');
    this.load.image('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALklEQVR42mP8z8DwnwEJMI6aQB0TsAF0OayhMRgM+A/COMMABqOhMWjSA2z5AAAvXy6/dbnOGwAAAABJRU5ErkJggg==');
    this.load.image('flag', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAkCAYAAACJ8xqgAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAEBSURBVEiJ7ZWxSgNBFEXPRFJYWGwpaJFCEJIUdmJnZeEHWFlYWPoBNvkICwsRP8DGzk5BIWCRQgQRJIXgWcwGwrK7k5nZLMK+U82dO/PezJsBx1x1gSGwAdJInwE9YK+uANeRVD56VUkWIgcN1oIBcFhSdBA1DLhJCN5GAdtkxfPE4CIKeEmQaHVy8iQxOHFHG9YZNqpmsJEYbLsjDZeJwQyPLn9nLLCvCpLK0l3/Cxd4a5eA6oH+JQzJavcKHEQ2J8ALcEa2aL+XxS5V79L3ZNvlHhi7vC/QKfA+BcbAaFfDusPT2mAAHACnwFdCsOOOmjYUb+4+cJXoe1zV3jb/ATwiYF4Tt+liAAAAAElFTkSuQmCC');
  }

  create() {
    // Create a tiled grass background
    for (let x = 0; x < this.game.canvas.width; x += 10) {
      for (let y = 0; y < this.game.canvas.height; y += 10) {
        this.add.image(x, y, 'grass').setOrigin(0, 0);
      }
    }

    // Set up physics
    this.physics.world.setBounds(0, 0, this.game.canvas.width, this.game.canvas.height);
    
    // Create walls for the course
    this.createMinigolfCourse();
    
    // Add hole with flag
    this.hole = this.physics.add.image(this.game.canvas.width * 0.8, this.game.canvas.height * 0.3, 'hole');
    this.hole.setImmovable(true);
    this.hole.setCircle(12);
    this.hole.setOrigin(0.5, 0.5);
    
    // Add flag near the hole
    this.add.image(this.hole.x, this.hole.y - 25, 'flag').setOrigin(0.5, 1);
    
    // Add ball
    this.ball = this.physics.add.image(150, 450, 'ball');
    this.ball.setCircle(12);
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(0.6);
    this.ball.setDamping(true);
    this.ball.setDrag(0.99, 0.99);
    
    // Set up physics collisions
    this.physics.add.collider(this.ball, this.walls);
    this.physics.add.overlap(this.ball, this.hole, this.handleBallInHole, undefined, this);
    
    // Create aiming line
    this.aimLine = this.add.graphics();
    
    // Add stroke counter
    this.strokes = 0;
    this.strokesText = this.add.text(16, 16, 'Strokes: 0', { 
      fontSize: '24px', 
      color: '#000',
      stroke: '#fff',
      strokeThickness: 2 
    });
    
    // Add success text (hidden initially)
    this.successText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'HOLE IN ONE!', {
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ff0',
      stroke: '#000',
      strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
    
    // Input events
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.ballMoving) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
      }
    });
    
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && !this.ballMoving) {
        const dx = this.dragStartX - pointer.x;
        const dy = this.dragStartY - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate power based on drag distance, capped at maxPower
        this.power = Math.min(distance * 0.5, this.maxPower);
        
        // Draw aim line
        this.aimLine.clear();
        this.aimLine.lineStyle(2, 0xff0000);
        this.aimLine.beginPath();
        this.aimLine.moveTo(this.ball.x, this.ball.y);
        
        // Calculate normalized direction vector
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        // Draw aiming line length based on power
        const lineLength = this.power * 0.5;
        this.aimLine.lineTo(
          this.ball.x + dirX * lineLength, 
          this.ball.y + dirY * lineLength
        );
        this.aimLine.strokePath();
      }
    });
    
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && !this.ballMoving) {
        this.isDragging = false;
        
        // Calculate velocity based on drag
        const dx = this.dragStartX - pointer.x;
        const dy = this.dragStartY - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 10) { // minimum distance to consider a shot
          this.strokes++;
          this.strokesText.setText(`Strokes: ${this.strokes}`);
          
          // Calculate velocity based on power
          const power = Math.min(distance * 0.5, this.maxPower);
          const dirX = dx / distance;
          const dirY = dy / distance;
          
          this.ball.setVelocity(dirX * power, dirY * power);
          this.ballMoving = true;
        }
        
        // Clear aim line
        this.aimLine.clear();
      }
    });
  }
  
  update() {
    // Check if ball has stopped moving
    if (this.ballMoving && 
        Math.abs(this.ball.body.velocity.x) < 5 && 
        Math.abs(this.ball.body.velocity.y) < 5) {
      this.ball.setVelocity(0, 0);
      this.ballMoving = false;
    }
  }
  
  createMinigolfCourse() {
    this.walls = this.physics.add.staticGroup();
    
    // Create course walls
    // Top and bottom borders
    for (let x = 0; x < this.game.canvas.width; x += 16) {
      this.walls.create(x, 0, 'wall').setOrigin(0, 0).refreshBody();
      this.walls.create(x, this.game.canvas.height - 16, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // Left and right borders
    for (let y = 0; y < this.game.canvas.height; y += 16) {
      this.walls.create(0, y, 'wall').setOrigin(0, 0).refreshBody();
      this.walls.create(this.game.canvas.width - 16, y, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // Create some obstacles
    // Central obstacle
    for (let y = 200; y < 400; y += 16) {
      this.walls.create(400, y, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // L-shaped obstacle
    for (let x = 200; x < 300; x += 16) {
      this.walls.create(x, 200, 'wall').setOrigin(0, 0).refreshBody();
    }
    for (let y = 200; y < 300; y += 16) {
      this.walls.create(200, y, 'wall').setOrigin(0, 0).refreshBody();
    }
    
    // U-shaped obstacle near the hole
    for (let y = 100; y < 200; y += 16) {
      this.walls.create(600, y, 'wall').setOrigin(0, 0).refreshBody();
      this.walls.create(680, y, 'wall').setOrigin(0, 0).refreshBody();
    }
    for (let x = 600; x < 696; x += 16) {
      this.walls.create(x, 100, 'wall').setOrigin(0, 0).refreshBody();
    }
  }
  
  private handleBallInHole(ball: Phaser.Types.Physics.Arcade.ImageWithDynamicBody, hole: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    // Calculate the distance between centers
    const distance = Phaser.Math.Distance.Between(ball.x, ball.y, hole.x, hole.y);
    
    // If the ball is close enough to be considered "in the hole"
    if (distance < 15) {
      // Stop the ball
      ball.setVelocity(0, 0);
      this.ballMoving = false;
      
      // Display success message based on strokes
      let message = '';
      if (this.strokes === 1) {
        message = 'HOLE IN ONE!';
      } else if (this.strokes === 2) {
        message = 'EAGLE!';
      } else if (this.strokes === 3) {
        message = 'BIRDIE!';
      } else if (this.strokes === 4) {
        message = 'PAR!';
      } else {
        message = 'HOLE COMPLETE!';
      }
      
      this.successText.setText(message);
      this.successText.setVisible(true);
      
      // Reset the game after a delay
      this.time.delayedCall(2000, () => {
        this.scene.restart();
      });
    }
  }
}
