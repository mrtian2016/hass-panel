import sys

sys.path.append('.')
sys.path.append('./base_fastapi')
from base_fastapi.DAO.DAO import *

def init_admin():
    admin_username = "admin"
    admin_password = "qingtong"
    
    RoleDAO.registry('admin')
    UserDAO.register_urn(admin_username, admin_password, 'admin', ['admin'])
    print('create admin user success')
    
    
if __name__ == '__main__':
    init_admin()