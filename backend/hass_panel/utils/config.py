import toml
from omegaconf import OmegaConf
import os

def is_running_in_docker():
    return os.path.exists('/.dockerenv') or os.path.exists('/.containerenv')

cfg_type = 'prod' if is_running_in_docker() else 'dev'

config_path = f'config/{cfg_type}.toml'

def read_config(config_path):
    with open(config_path, "r") as cfg_fp:
        cfg = toml.load(cfg_fp)
    return OmegaConf.create(cfg)

cfg = read_config(config_path)