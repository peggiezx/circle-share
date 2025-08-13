from fastapi import HTTPException

class UserNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="User not found")


class CircleNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="Circle not found")


class PostNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="Post not found")


class InvalidCredentials(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Invalid password")


class AccessDenied(HTTPException):
    def __init__(self):
        super().__init__(status_code=403, detail="You don't have access to this operation")
  
        
class EmailAlreadyExists(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail="Email already registered")


class UserAlreadyJoined(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail="User already joined")

class TokenExpired(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Token expired")


class InvalidToken(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Invalid token")


class AccountDeactivated(HTTPException):
    def __init__(self):
        super().__init__(status_code=403, detail="Account has been deactivated")
        
class UserNotInCircle(HTTPException):
    def __init__(self):
        super().__init__(status_code=400, detail="User is not a member of this circle")
        