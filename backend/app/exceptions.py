from fastapi import HTTPException

class UserNotFound(HTTPException):
    def __init__(self):
        super().__init__(status_code=404, detail="User not found")


class InvalidCredentials(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Invalid password")
  
        
class EmailAlreadyExists(HTTPException):
    def __init__(self):
        super().__init__(status_code=409, detail="Email already registered")


class TokenExpired(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Token expired")


class InvalidToken(HTTPException):
    def __init__(self):
        super().__init__(status_code=401, detail="Invalid token")


class AccountDeactivated(HTTPException):
    def __init__(self):
        super().__init__(status_code=403, detail="Account has been deactivated")