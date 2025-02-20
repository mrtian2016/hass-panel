import os
import json
import time
from pathlib import Path
from typing import Any, Optional
from hass_panel.utils.config import cfg
from hass_panel.utils.singleton import singleton
@singleton
class FileCache:
    def __init__(self):
        self.cache_dir = Path(cfg.base.cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_cache_path(self, key: str) -> Path:
        return self.cache_dir / f"{key}.json"
    
    def get(self, key: str) -> Optional[Any]:
        cache_path = self._get_cache_path(key)
        if not cache_path.exists():
            return None
            
        try:
            with open(cache_path, 'r') as f:
                data = json.load(f)
                
            # 检查是否过期
            if time.time() > data['expires_at']:
                self.delete(key)
                return None
                
            return data['value']
        except Exception:
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        cache_path = self._get_cache_path(key)
        data = {
            'value': value,
            'expires_at': time.time() + ttl
        }
        
        with open(cache_path, 'w') as f:
            json.dump(data, f)
    
    def delete(self, key: str):
        cache_path = self._get_cache_path(key)
        if cache_path.exists():
            os.remove(cache_path) 