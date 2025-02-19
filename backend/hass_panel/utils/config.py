import toml
from omegaconf import OmegaConf
import os

def is_running_in_docker():
    """检查是否在Docker容器内运行"""
    # 方法1：检查cgroup文件
    try:
        with open('/proc/1/cgroup', 'r') as f:
            return 'docker' in f.read()
    except:
        pass
    
    # 方法2：检查.dockerenv文件
    return os.path.exists('/.dockerenv')

cfg_type = 'prod' if is_running_in_docker() else 'dev'

DEFAULT_CONFIG_PATH = f'config/{cfg_type}.toml'

def read_config(config_path):
    with open(config_path, "r") as cfg_fp:
        cfg = toml.load(cfg_fp)
    return OmegaConf.create(cfg)