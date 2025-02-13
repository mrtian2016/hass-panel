from starlette import status
from fastapi import HTTPException


class CustomException(Exception):
    def __init__(self, code, message='', **kwargs):
        self.code = code
        self.message = message
        
        
class CustomRetException(CustomException):
    @property
    def ret(self):
        return {'code': self.code, 'message': self.message}


class ErrorPassword(CustomRetException):
    def __init__(self, code=-10001, message='Error Password'):
        self.code = code
        self.message = message
        
        
class InvalidUser(CustomRetException):
    def __init__(self, code=-10002, message='Invalid User'):
        self.code = code
        self.message = message


class UserExists(CustomRetException):
    def __init__(self, code=-10003, message='User Already Exists'):
        self.code = code
        self.message = message
       
        
class UserNotFound(CustomRetException):
    def __init__(self, code=-10004, message='User Not Found'):
        self.code = code
        self.message = message
        
        
class RoleExists(CustomRetException):
    def __init__(self, code=-10005, message='Role Already Exists'):
        self.code = code
        self.message = message
        
        
class RoleNotFound(CustomRetException):
    def __init__(self, code=-10006, message='Role Not Found'):
        self.code = code
        self.message = message
        
        
class PermissionExists(CustomRetException):
    def __init__(self, code=-10007, message='Permission Already Exists'):
        self.code = code
        self.message = message
        
        
class PermissionNotFound(CustomRetException):
    def __init__(self, code=-10008, message='Permission Not Found'):
        self.code = code
        self.message = message
        
        
class ErrorInvitationCode(CustomRetException):
    def __init__(self, code=-10009, message='Error Invitation Code'):
        self.code = code
        self.message = message
        
        
class MSTimeout(CustomRetException):
    def __init__(self, code=-1, message='MicroService Disconnect', func=None, seconds=None, routing_key=None):
        self.code = code
        self.message = message
        self.func = func
        self.seconds = seconds
        self.routing_key = routing_key
        
    @property
    def ret(self):
        return {'code': self.code, 'message': self.message, 'func': self.func, 
                'seconds': self.seconds, 'routing_key': self.routing_key}


CredentialException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

IncorrectAuthenticate = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Incorrect username or password",
    headers={"WWW-Authenticate": "Bearer"},
)

