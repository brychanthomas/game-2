from PIL import Image
import random

class Cell:
    def __init__(self, state):
        self.state = state

    def getNewState(self, upState, leftState, rightState, downState):
        self.newState = self.state
        if self.state == 0:
            if (upState == 2 or leftState == 2 or rightState == 2 or downState == 2):
                if (upState == 0 or leftState == 0 or rightState == 0 or downState == 0):
                    self.newState = 1
                else:
                    self.newState = 2
        elif self.state  == 1 and random.random() < CONSUME_PROB:
            if (upState == 2 or leftState == 2 or rightState == 2 or downState == 2):
                self.newState = 2

    def setNewState(self):
        self.state = self.newState

    def convertToRGB(self):
        if self.state == 0: #Initial - dark areas
            return INITIAL_COL
        elif self.state == 1: #Gradient
            return GRAD_COL
        elif self.state == 2: #Consumer - light areas
            return SPREAD_COL

def writeGridToFile(img, grid):
    newData = []
    for y in range(img.size[1]):
        for x in range(img.size[0]):
            newData.append(grid[y][x].convertToRGB())
    img.putdata(newData)
    img.save("test.png", "PNG")

def initialiseGrid(size):
    grid = []
    for y in range(size[1]):
        grid.append([])
        for x in range(size[0]):
            if random.random() < 0.0015: grid[y].append(Cell(2))
            else: grid[y].append(Cell(0))
    return grid

INITIAL_COL = (240, 240, 240)
GRAD_COL    = (220, 220, 220)
SPREAD_COL  = (100, 100, 100)
CONSUME_PROB = 0.3

WIDTH = 150
HEIGHT = 100
GENERATIONS = 20

img = Image.new('RGB', [WIDTH,HEIGHT], 255)

grid = initialiseGrid([WIDTH,HEIGHT])

for i in range(GENERATIONS):
    for x in range(WIDTH):
        for y in range(HEIGHT):
            upState = grid[y-1][x].state
            leftState = grid[y][x-1].state
            rightState = grid[y][(x+1)%WIDTH].state
            downState = grid[(y+1)%HEIGHT][x].state
            grid[y][x].getNewState(upState, leftState, rightState, downState)
    for x in range(WIDTH):
        for y in range(HEIGHT):
            grid[y][x].setNewState()
    

writeGridToFile(img, grid)

