from enum import Enum


class MessageTypes(Enum):
    CREATE = 1
    JOIN = 2
    MOVE = 3
    NEWCHALLENGE = 4
    CHANGESETTINGS = 5


class Message:
    def __init__(self, MessageTypes, data):
        self.type = MessageTypes
        self.data = data


class JoinMessage(Message):
    def __int__(self, data):
        super(MessageTypes.JOIN, data)


class CreateMessage(Message):
    def __int__(self, data):
        super(MessageTypes.CREATE, data)


class MoveMessage(Message):
    def __int__(self, data):
        super(MessageTypes.MOVE, data)


class SettingsMessage(Message):
    def __int__(self, data):
        super(MessageTypes.CHANGESETTINGS, data)


class ChallengeMessage(Message):
    def __int__(self, data):
        super(MessageTypes.NEWCHALLENGE, data)
