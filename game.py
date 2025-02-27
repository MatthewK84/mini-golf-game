from browser import document, window, html
import math

# Vector utility functions
def vector_add(v1, v2):
    return (v1[0] + v2[0], v1[1] + v2[1])

def vector_sub(v1, v2):
    return (v1[0] - v2[0], v1[1] - v2[1])

def vector_scale(v, s):
    return (v[0] * s, v[1] * s)

def vector_length(v):
    return math.sqrt(v[0] * v[0] + v[1] * v[1])

def vector_normalize(v):
    length = vector_length(v)
    if length == 0:
        return (0, 0)
    return (v[0] / length, v[1] / length)

def dot_product(v1, v2):
    return v1[0] * v2[0] + v1[1] * v2[1]

def reflect(velocity, normal):
    d = 2 * dot_product(velocity, normal)
    return (velocity[0] - d * normal[0], velocity[1] - d * normal[1])

# Game classes
class Ball:
    def __init__(self, position, radius):
        self.position = position
        self.velocity = (0, 0)
        self.radius = radius

class Wall:
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        direction = vector_sub(p2, p1)
        self.normal = vector_normalize((-direction[1], direction[0]))  # Perpendicular, pointing right

class Hole:
    def __init__(self, position, radius):
        self.position = position
        self.radius = radius
        self.walls = [
            Wall((50, 50), (750, 50)),    # Top
            Wall((750, 50), (750, 550)),  # Right
            Wall((750, 550), (50, 550)),  # Bottom
            Wall((50, 550), (50, 50))     # Left
        ]
        self.start_position = (100, 500)

    def add_obstacle(self, p1, p2):
        self.walls.append(Wall(p1, p2))

# Define simplified 18-hole layouts (expand as needed)
holes = []

for i in range(18):
    h = Hole((600 - i * 20, 200 + i * 10), 20)
    # Add unique obstacles per hole (simplified variation)
    h.add_obstacle((300 + i * 10, 150 + i * 10), (400 + i * 10, 250 + i * 10))
    h.add_obstacle((200 + i * 5, 300 - i * 5), (500 - i * 5, 350 - i * 5))
    holes.append(h)

class Game:
    def __init__(self):
        self.canvas = document['gameCanvas']
        self.ctx = self.canvas.getContext('2d')
        self.holes = holes
        self.current_hole = 0
        self.ball = Ball(self.holes[0].start_position, 10)
        self.walls = self.holes[0].walls
        self.hole = self.holes[0]
        self.stroke_count = 0
        self.total_score = 0
        self.aiming = False
        self.aim_start = None
        self.aim_end = None
        self.last_time = window.performance.now()
        
        # Bind mouse events
        self.canvas.addEventListener('mousedown', self.on_mouse_down)
        self.canvas.addEventListener('mousemove', self.on_mouse_move)
        self.canvas.addEventListener('mouseup', self.on_mouse_up)
        
        # Start game loop
        window.requestAnimationFrame(self.update)

    def on_mouse_down(self, event):
        if vector_length(self.ball.velocity) == 0:
            self.aiming = True
            rect = self.canvas.getBoundingClientRect()
            self.aim_start = (event.clientX - rect.left, event.clientY - rect.top)

    def on_mouse_move(self, event):
        if self.aiming:
            rect = self.canvas.getBoundingClientRect()
            self.aim_end = (event.clientX - rect.left, event.clientY - rect.top)

    def on_mouse_up(self, event):
        if self.aiming:
            self.aiming = False
            rect = self.canvas.getBoundingClientRect()
            self.aim_end = (event.clientX - rect.left, event.clientY - rect.top)
            direction = vector_sub(self.aim_end, self.aim_start)
            power = min(vector_length(direction) * 0.5, 300)  # Cap power
            self.ball.velocity = vector_scale(vector_normalize(direction), power)
            self.stroke_count += 1
            self.update_ui()

    def update_ui(self):
        document['strokes'].text = f"Strokes: {self.stroke_count}"
        document['hole'].text = f"Hole: {self.current_hole + 1}"
        document['score'].text = f"Total Score: {self.total_score}"

    def check_hole(self):
        distance_to_hole = vector_length(vector_sub(self.ball.position, self.hole.position))
        if distance_to_hole < self.hole.radius and vector_length(self.ball.velocity) < 5:
            self.total_score += self.stroke_count
            self.current_hole += 1
            if self.current_hole < 18:
                self.load_hole(self.current_hole)
            else:
                self.game_over()
            self.update_ui()

    def load_hole(self, index):
        self.hole = self.holes[index]
        self.walls = self.hole.walls
        self.ball.position = self.hole.start_position
        self.ball.velocity = (0, 0)
        self.stroke_count = 0

    def game_over(self):
        self.ctx.fillStyle = 'black'
        self.ctx.font = '40px Arial'
        self.ctx.fillText('Game Over!', 300, 300)
        # Stop the game loop by not calling requestAnimationFrame again

    def update_physics(self, delta_time):
        if vector_length(self.ball.velocity) > 0:
            new_position = vector_add(self.ball.position, vector_scale(self.ball.velocity, delta_time))
            for wall in self.walls:
                closest = self.closest_point_on_wall(wall, new_position)
                distance = vector_length(vector_sub(new_position, closest))
                if distance < self.ball.radius:
                    penetration = self.ball.radius - distance
                    direction = vector_normalize(vector_sub(new_position, closest))
                    self.ball.position = vector_add(new_position, vector_scale(direction, penetration))
                    self.ball.velocity = reflect(self.ball.velocity, wall.normal)
            self.ball.position = new_position
            # Apply friction
            self.ball.velocity = vector_scale(self.ball.velocity, 0.98)
            if vector_length(self.ball.velocity) < 5:
                self.ball.velocity = (0, 0)

    def closest_point_on_wall(self, wall, point):
        v = vector_sub(wall.p2, wall.p1)
        w = vector_sub(point, wall.p1)
        t = max(0, min(1, dot_product(w, v) / dot_product(v, v)))
        return vector_add(wall.p1, vector_scale(v, t))

    def render(self):
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
        
        # Draw walls
        self.ctx.strokeStyle = 'black'
        for wall in self.walls:
            self.ctx.beginPath()
            self.ctx.moveTo(wall.p1[0], wall.p1[1])
            self.ctx.lineTo(wall.p2[0], wall.p2[1])
            self.ctx.stroke()
        
        # Draw hole
        self.ctx.fillStyle = 'black'
        self.ctx.beginPath()
        self.ctx.arc(self.hole.position[0], self.hole.position[1], self.hole.radius, 0, 2 * math.pi)
        self.ctx.fill()
        
        # Draw ball
        self.ctx.fillStyle = 'red'
        self.ctx.beginPath()
        self.ctx.arc(self.ball.position[0], self.ball.position[1], self.ball.radius, 0, 2 * math.pi)
        self.ctx.fill()
        
        # Draw aiming line
        if self.aiming and self.aim_start and self.aim_end:
            self.ctx.strokeStyle = 'blue'
            self.ctx.beginPath()
            self.ctx.moveTo(self.aim_start[0], self.aim_start[1])
            self.ctx.lineTo(self.aim_end[0], self.aim_end[1])
            self.ctx.stroke()

    def update(self, timestamp):
        delta_time = (timestamp - self.last_time) / 1000  # Convert to seconds
        self.last_time = timestamp
        self.update_physics(delta_time)
        self.check_hole()
        self.render()
        if self.current_hole < 18:
            window.requestAnimationFrame(self.update)

# Start the game when the page loads
def start_game():
    game = Game()

window.onload = start_game
