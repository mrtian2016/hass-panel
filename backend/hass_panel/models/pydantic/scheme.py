from typing import List, Optional

from pydantic import BaseModel

from models.orm.models import User, Role, Permission, UserRoleLink, RolePermissionLink
from utils.pydantic_sqlalchemy import sqlalchemy_to_pydantic

PydanticUser = sqlalchemy_to_pydantic(User)
PydanticRole = sqlalchemy_to_pydantic(Role)
PydanticPermission = sqlalchemy_to_pydantic(Permission)
PydanticUserRoleLink = sqlalchemy_to_pydantic(UserRoleLink)
PydanticRolePermissionLink = sqlalchemy_to_pydantic(RolePermissionLink)

class PydanticUserWithRoles(PydanticUser):
    roles: List[str] = []

class Token(BaseModel):
    access_token: str
    token_type: str
    
class UserRegitryModel(BaseModel):
    username: str
    password: str
    nickname: str
    
class UserRegitryInvCodeModel(BaseModel):
    username: str
    password: str
    nickname: str
    invitation_code: str
    
class PydanticURLink(BaseModel):
    username: str
    role_name: str
    
class PydanticRPLink(BaseModel):
    role_name: str
    permission_name: str
    
    
class PydanticUserUpdate(BaseModel):
    password: Optional[str] = None
    nickname: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    
    
class PydanticUserUpdatePwd(BaseModel):
    user_id: Optional[int] = None
    old_password: Optional[str] = None
    new_password: Optional[str] = None
    
    
class PydanticUserIds(BaseModel):
    userids: List[int]
    
    
class PydanticInvitationCode(BaseModel):
    code: str