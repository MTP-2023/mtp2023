import random
from fastapi import WebSocket
import json


class Lobby:
    player1_name = ""
    player2_name = ""
    player1_wins = 0
    player2_wins = 0
    currentPlayer = 1
    lobby_code = 0
    currentBoard = []
    goalBoard = []
    width = 3
    height = 2
    minMarbles = 2
    maxMarbles = 2
    turnLimit = 10
    availableMarbles = 100
    isFull = False
    recentMove = 0

    def __init__(self, creatorName, startBoard, goalBoard, code, socket):
        self.player1_name = creatorName
        self.lobby_code = random.randint(10000, 99999)
        self.currentBoard = startBoard
        self.goalBoard = goalBoard
        self.socket = socket
        self.lobby_code = code

    def toJson(self):
        return json.dumps(self)
