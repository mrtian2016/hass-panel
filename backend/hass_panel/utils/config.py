import toml
from omegaconf import OmegaConf
import socket

hostname = socket.gethostname()

cfg_type = 'dev' if hostname == 'tianjy-Super-Server' else 'prod'

DEFAULT_CONFIG_PATH = f'config/{cfg_type}.toml'

def read_config(config_path):
    with open(config_path, "r") as cfg_fp:
        cfg = toml.load(cfg_fp)
    return OmegaConf.create(cfg)