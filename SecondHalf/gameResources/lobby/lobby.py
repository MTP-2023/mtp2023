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
    messageType = ""

    def __init__(self, creatorName, startBoard, goalBoard, code, socket, type):
        self.player1_name = creatorName
        self.lobby_code = random.randint(10000, 99999)
        self.currentBoard = startBoard
        self.goalBoard = goalBoard
        self.lobby_code = code
        self.messageType = type

    def toDict(self):
        return {
            "player1_name" : self.player1_name,
            "player2_name" : self.player2_name,
            "player1_wins" : self.player1_wins,
            "player2_wins" : self.player2_wins,
            "currentPlayer" : self.currentPlayer,
            "lobby_code" : self.lobby_code,
            "currentBoard" : self.currentBoard,
            "goalBoard" : self.goalBoard,
            "width" : self.width,
            "height" : self.height,
            "minMarbles" : self.minMarbles,
            "maxMarbles" : self.maxMarbles,
            "turnLimit" : self.turnLimit,
            "availableMarbles" : self.availableMarbles,
            "isFull" : self.isFull,
            "recentMove" : self.recentMove,
            "messageType": self.messageType
        }
