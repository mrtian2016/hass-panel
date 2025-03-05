from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import requests
import logging
import time
from onvif import ONVIFCamera
import zeep
import asyncio
from loguru import logger

# 创建路由器
router = APIRouter(prefix="/api/onvif", tags=["onvif"])


# 活动的PTZ会话跟踪
active_ptz_sessions = {}
DEFAULT_TIMEOUT = 30  # 默认30秒超时

# 用于处理zeep数据类型的辅助函数
def zeep_pythonvalue(self, xmlvalue):
    return xmlvalue

# 替换zeep默认的数据类型处理方法
zeep.xsd.simple.AnySimpleType.pythonvalue = zeep_pythonvalue

# PTZ控制请求模型
class PTZRequest(BaseModel):
    entity_id: str
    stream_url: Optional[str] = None  # ONVIF URL格式：onvif://user:pass@ip:port/onvif/device_service
    move_mode: str  # 'ContinuousMove', 'RelativeMove', 'AbsoluteMove', 'Stop'
    pan: Optional[str] = None  # 'LEFT', 'RIGHT'
    tilt: Optional[str] = None  # 'UP', 'DOWN'
    zoom: Optional[str] = None  # 'ZOOM_IN', 'ZOOM_OUT'
    speed: Optional[float] = 0.5
    distance: Optional[float] = 0.5
    preset: Optional[int] = None
    timeout: Optional[float] = None

# 摄像头连接缓存
camera_cache = {}

# 获取ONVIF摄像头实例
def get_onvif_camera(ip, port, username, password):
    """获取ONVIF摄像头实例，使用缓存避免重复创建连接"""
    cache_key = f"{ip}:{port}:{username}:{password}"
    
    if cache_key in camera_cache:
        # 检查缓存是否过期（1小时）
        if time.time() - camera_cache[cache_key]['timestamp'] < 3600:
            return camera_cache[cache_key]['camera']
    
    try:
        # 创建ONVIF摄像头实例
        camera = ONVIFCamera(ip, port, username, password)
        
        # 缓存摄像头实例
        camera_cache[cache_key] = {
            'camera': camera,
            'timestamp': time.time()
        }
        
        return camera
    except Exception as e:
        logger.error(f"Failed to connect to ONVIF camera: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to ONVIF camera: {str(e)}")

# 解析摄像头URL
def parse_camera_url(entity_id, stream_url=None):
    """从stream_url解析摄像头URL，获取IP、端口、用户名和密码"""
    try:
        # 如果提供了stream_url，则解析它
        if stream_url and stream_url.startswith('onvif://'):
            # 移除协议前缀
            url_without_protocol = stream_url[8:]
            
            # 解析用户名和密码
            username = None
            password = None
            if '@' in url_without_protocol:
                auth_part, url_without_protocol = url_without_protocol.split('@', 1)
                if ':' in auth_part:
                    username, password = auth_part.split(':', 1)
                else:
                    username = auth_part
            
            # 解析IP和端口
            ip = url_without_protocol
            port = 80  # 默认端口
            
            if '/' in ip:
                ip = ip.split('/', 1)[0]
                
            if ':' in ip:
                ip, port_str = ip.split(':', 1)
                try:
                    port = int(port_str)
                except ValueError:
                    port = 80
            
            camera_info = {
                "ip": ip,
                "port": port,
                "username": username or "admin",
                "password": password or "admin"
            }
            
            logger.info(f"Parsed camera URL: {camera_info}")
            return camera_info
        
        # 如果没有提供stream_url，则使用默认值或从配置中获取
        # 这里应该根据实际情况从配置或数据库中获取摄像头信息
        camera_info = {
            "ip": "192.168.1.100",  # 示例IP
            "port": 80,             # 示例端口
            "username": "admin",    # 示例用户名
            "password": "admin"     # 示例密码
        }
        
        return camera_info
    except Exception as e:
        logger.error(f"Failed to parse camera URL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid camera URL: {stream_url or entity_id}")

@router.post("/ptz")
async def ptz_control(request: PTZRequest):
    """PTZ摄像头控制接口"""
    global active_ptz_sessions
    
    # 生成会话ID
    session_id = f"{request.entity_id}_{request.stream_url}"
    
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(request.entity_id, request.stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 创建PTZ服务
        ptz = camera.create_ptz_service()
        
        # 获取配置文件
        media = camera.create_media_service()
        profiles = media.GetProfiles()
        profile_token = profiles[0].token
        
        # 处理不同的移动模式
        if request.move_mode == "Stop":
            # 停止所有移动
            ptz.Stop({'ProfileToken': profile_token})
            
            # 如果存在活动会话，取消它
            if session_id in active_ptz_sessions:
                task = active_ptz_sessions.pop(session_id)
                if not task.done():
                    task.cancel()
                    
            return {"status": "success", "message": "PTZ movement stopped"}
            
        elif request.move_mode == "ContinuousMove":
            # 连续移动
            request_obj = {
                'ProfileToken': profile_token,
                'Velocity': {
                    'PanTilt': {'x': 0, 'y': 0},
                    'Zoom': {'x': 0}
                }
            }
            
            # 设置平移速度
            if request.pan == "LEFT":
                request_obj['Velocity']['PanTilt']['x'] = -request.speed
            elif request.pan == "RIGHT":
                request_obj['Velocity']['PanTilt']['x'] = request.speed
                
            # 设置倾斜速度
            if request.tilt == "UP":
                request_obj['Velocity']['PanTilt']['y'] = request.speed
            elif request.tilt == "DOWN":
                request_obj['Velocity']['PanTilt']['y'] = -request.speed
                
            # 设置缩放速度
            if request.zoom == "ZOOM_IN":
                request_obj['Velocity']['Zoom']['x'] = request.speed
            elif request.zoom == "ZOOM_OUT":
                request_obj['Velocity']['Zoom']['x'] = -request.speed
                
            # 执行连续移动
            ptz.ContinuousMove(request_obj)
            
            # 如果存在之前的活动会话，取消它
            if session_id in active_ptz_sessions:
                task = active_ptz_sessions[session_id]
                if not task.done():
                    task.cancel()
            
            # 创建一个后台任务来处理自动停止
            timeout = request.timeout if request.timeout is not None else DEFAULT_TIMEOUT
            
            async def auto_stop():
                try:
                    await asyncio.sleep(timeout)
                    # 重新获取摄像头实例，因为原来的可能已经关闭
                    camera = get_onvif_camera(
                        camera_info["ip"], 
                        camera_info["port"], 
                        camera_info["username"], 
                        camera_info["password"]
                    )
                    ptz = camera.create_ptz_service()
                    ptz.Stop({'ProfileToken': profile_token})
                    logger.info(f"Auto-stopped PTZ movement for {session_id} after {timeout} seconds")
                    
                    # 从活动会话中移除
                    if session_id in active_ptz_sessions:
                        active_ptz_sessions.pop(session_id)
                except asyncio.CancelledError:
                    # 任务被取消，不需要做任何事情
                    pass
                except Exception as e:
                    logger.error(f"Failed to auto-stop PTZ movement for {session_id}: {str(e)}")
                    # 从活动会话中移除
                    if session_id in active_ptz_sessions:
                        active_ptz_sessions.pop(session_id)
            
            # 启动后台任务并保存引用
            task = asyncio.create_task(auto_stop())
            active_ptz_sessions[session_id] = task
                
            return {"status": "success", "message": f"Continuous move executed with auto-stop after {timeout} seconds"}
            
        elif request.move_mode == "RelativeMove":
            # 相对移动
            request_obj = {
                'ProfileToken': profile_token,
                'Translation': {
                    'PanTilt': {'x': 0, 'y': 0},
                    'Zoom': {'x': 0}
                },
                'Speed': {
                    'PanTilt': {'x': request.speed, 'y': request.speed},
                    'Zoom': {'x': request.speed}
                }
            }
            
            # 设置平移距离
            if request.pan == "LEFT":
                request_obj['Translation']['PanTilt']['x'] = -request.distance
            elif request.pan == "RIGHT":
                request_obj['Translation']['PanTilt']['x'] = request.distance
                
            # 设置倾斜距离
            if request.tilt == "UP":
                request_obj['Translation']['PanTilt']['y'] = request.distance
            elif request.tilt == "DOWN":
                request_obj['Translation']['PanTilt']['y'] = -request.distance
                
            # 设置缩放距离
            if request.zoom == "ZOOM_IN":
                request_obj['Translation']['Zoom']['x'] = request.distance
            elif request.zoom == "ZOOM_OUT":
                request_obj['Translation']['Zoom']['x'] = -request.distance
                
            # 执行相对移动
            ptz.RelativeMove(request_obj)
            return {"status": "success", "message": "Relative move executed"}
            
        elif request.move_mode == "AbsoluteMove":
            # 绝对移动（通常用于预设位置）
            # 获取当前位置
            status = ptz.GetStatus({'ProfileToken': profile_token})
            
            request_obj = {
                'ProfileToken': profile_token,
                'Position': status.Position,
                'Speed': {
                    'PanTilt': {'x': request.speed, 'y': request.speed},
                    'Zoom': {'x': request.speed}
                }
            }
            
            # 设置平移位置
            if request.pan == "LEFT":
                request_obj['Position']['PanTilt']['x'] = -1.0
            elif request.pan == "RIGHT":
                request_obj['Position']['PanTilt']['x'] = 1.0
                
            # 设置倾斜位置
            if request.tilt == "UP":
                request_obj['Position']['PanTilt']['y'] = 1.0
            elif request.tilt == "DOWN":
                request_obj['Position']['PanTilt']['y'] = -1.0
                
            # 设置缩放位置
            if request.zoom == "ZOOM_IN":
                request_obj['Position']['Zoom']['x'] = 1.0
            elif request.zoom == "ZOOM_OUT":
                request_obj['Position']['Zoom']['x'] = 0.0
                
            # 执行绝对移动
            ptz.AbsoluteMove(request_obj)
            return {"status": "success", "message": "Absolute move executed"}
            
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported move mode: {request.move_mode}")
            
    except Exception as e:
        logger.error(f"PTZ control error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PTZ control error: {str(e)}")

# 预设位置相关API
@router.get("/presets/{entity_id}")
async def get_presets(entity_id: str, stream_url: Optional[str] = None):
    """获取摄像头预设位置列表"""
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(entity_id, stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 创建PTZ服务
        ptz = camera.create_ptz_service()
        
        # 获取配置文件
        media = camera.create_media_service()
        profiles = media.GetProfiles()
        profile_token = profiles[0].token
        
        # 获取预设位置
        presets = ptz.GetPresets({'ProfileToken': profile_token})
        
        # 格式化预设位置列表
        preset_list = []
        for preset in presets:
            preset_list.append({
                "token": preset.token,
                "name": preset.Name if hasattr(preset, 'Name') else f"Preset {preset.token}"
            })
            
        return preset_list[:8]
        
    except Exception as e:
        logger.error(f"Failed to get presets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get presets: {str(e)}")

@router.post("/preset/{entity_id}/{preset_token}")
async def goto_preset(entity_id: str, preset_token: str, speed: Optional[float] = 0.5, stream_url: Optional[str] = None):
    """移动到预设位置"""
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(entity_id, stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 创建PTZ服务
        ptz = camera.create_ptz_service()
        
        # 获取配置文件
        media = camera.create_media_service()
        profiles = media.GetProfiles()
        profile_token = profiles[0].token
        
        # 移动到预设位置
        request_obj = {
            'ProfileToken': profile_token,
            'PresetToken': preset_token,
            'Speed': {
                'PanTilt': {'x': speed, 'y': speed},
                'Zoom': {'x': speed}
            }
        }
        
        ptz.GotoPreset(request_obj)
        return {"status": "success", "message": f"Moved to preset {preset_token}"}
        
    except Exception as e:
        logger.error(f"Failed to goto preset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to goto preset: {str(e)}")

@router.post("/preset/set/{entity_id}/{preset_name}")
async def set_preset(entity_id: str, preset_name: str, stream_url: Optional[str] = None):
    """设置当前位置为预设位置"""
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(entity_id, stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 创建PTZ服务
        ptz = camera.create_ptz_service()
        
        # 获取配置文件
        media = camera.create_media_service()
        profiles = media.GetProfiles()
        profile_token = profiles[0].token
        
        # 设置预设位置
        preset_token = ptz.SetPreset({
            'ProfileToken': profile_token,
            'PresetName': preset_name
        })
        
        return {"status": "success", "message": f"Preset {preset_name} set", "token": preset_token}
        
    except Exception as e:
        logger.error(f"Failed to set preset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set preset: {str(e)}")

@router.delete("/preset/{entity_id}/{preset_token}")
async def remove_preset(entity_id: str, preset_token: str, stream_url: Optional[str] = None):
    """删除预设位置"""
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(entity_id, stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 创建PTZ服务
        ptz = camera.create_ptz_service()
        
        # 获取配置文件
        media = camera.create_media_service()
        profiles = media.GetProfiles()
        profile_token = profiles[0].token
        
        # 删除预设位置
        ptz.RemovePreset({
            'ProfileToken': profile_token,
            'PresetToken': preset_token
        })
        
        return {"status": "success", "message": f"Preset {preset_token} removed"}
        
    except Exception as e:
        logger.error(f"Failed to remove preset: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to remove preset: {str(e)}")

# 获取摄像头信息
@router.get("/info/{entity_id}")
async def get_camera_info(entity_id: str, stream_url: Optional[str] = None):
    """获取摄像头信息"""
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(entity_id, stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 获取设备信息
        device_info = camera.devicemgmt.GetDeviceInformation()
        
        # 获取网络接口
        network_interfaces = camera.devicemgmt.GetNetworkInterfaces()
        
        # 获取系统日期和时间
        system_datetime = camera.devicemgmt.GetSystemDateAndTime()
        
        # 获取能力
        capabilities = camera.devicemgmt.GetCapabilities()
        
        # 格式化返回信息
        info = {
            "device": {
                "manufacturer": device_info.Manufacturer,
                "model": device_info.Model,
                "firmware_version": device_info.FirmwareVersion,
                "serial_number": device_info.SerialNumber,
                "hardware_id": device_info.HardwareId
            },
            "network": [],
            "datetime": {
                "type": system_datetime.DateTimeType,
                "timezone": system_datetime.TimeZone.TZ if hasattr(system_datetime, 'TimeZone') and hasattr(system_datetime.TimeZone, 'TZ') else None
            },
            "capabilities": {
                "ptz": hasattr(capabilities, 'PTZ')
            }
        }
        
        # 添加网络接口信息
        for interface in network_interfaces:
            if hasattr(interface, 'IPv4'):
                for ipv4 in interface.IPv4.Config.Manual:
                    info["network"].append({
                        "name": interface.Info.Name,
                        "hw_address": interface.Info.HwAddress,
                        "ip": ipv4.Address,
                        "prefix_length": ipv4.PrefixLength
                    })
        
        return info
        
    except Exception as e:
        logger.error(f"Failed to get camera info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get camera info: {str(e)}")

# 摄像头重启
@router.post("/reboot/{entity_id}")
async def reboot_camera(entity_id: str, stream_url: Optional[str] = None):
    """重启摄像头"""
    try:
        # 解析摄像头URL
        camera_info = parse_camera_url(entity_id, stream_url)
        
        # 获取ONVIF摄像头实例
        camera = get_onvif_camera(
            camera_info["ip"], 
            camera_info["port"], 
            camera_info["username"], 
            camera_info["password"]
        )
        
        # 重启设备
        camera.devicemgmt.SystemReboot()
        
        return {"status": "success", "message": "Camera reboot initiated"}
        
    except Exception as e:
        logger.error(f"Failed to reboot camera: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reboot camera: {str(e)}")
