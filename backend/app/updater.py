import json
import os
import shutil
import requests
from datetime import datetime
import zipfile
from loguru import logger
import subprocess

GITHUB_REPO = "mrtian2016/hass-panel"
APP_DIR = "/app"
VERSION_FILE = os.path.join(APP_DIR, "version.json")
TMP_DIR = "/tmp/hass-panel-update"
EXCLUDE_PATH = ['media', 'env.js', 'env.template.js']

def ensure_version_file():
    """确保version.json文件存在"""
    if not os.path.exists(VERSION_FILE):
        logger.info(f"创建版本文件: {VERSION_FILE}")
        with open(VERSION_FILE, 'w') as f:
            json.dump({"version": "0.0.0", "updateTime": ""}, f)

def get_current_version() -> str:
    """获取当前版本"""
    with open(VERSION_FILE, 'r') as f:
        return json.load(f)["version"]

def get_latest_release() -> tuple[str, str]:
    """获取最新版本信息"""
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
    logger.info(f"正在获取最新版本信息: {api_url}")
    response = requests.get(api_url)
    response.raise_for_status()
    release_data = response.json()
    version = release_data["tag_name"]
    download_url = f"https://ghfast.top/{release_data['assets'][0]['browser_download_url']}"
    logger.info(f"获取到最新版本: {version}")
    return version, download_url

def update_version_file(version: str):
    """更新版本文件"""
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    logger.info(f"更新版本信息: {version}, 时间: {current_time}")
    with open(VERSION_FILE, 'w') as f:
        json.dump({"version": version, "updateTime": current_time}, f)

def sync_files(src_dir: str, dst_dir: str):
    """使用rsync同步文件，排除特定目录
    
    Args:
        src_dir: 源目录路径
        dst_dir: 目标目录路径
        
    Raises:
        Exception: 当目录不存在或同步失败时抛出
    """
    # 验证目录是否存在
    if not os.path.exists(src_dir):
        raise Exception(f"源目录不存在: {src_dir}")
    if not os.path.exists(dst_dir):
        raise Exception(f"目标目录不存在: {dst_dir}")
        
    # 直接使用相对路径构建exclude参数
    exclude_args = ' '.join([f"--exclude='{path}'" for path in EXCLUDE_PATH])
    
    # 使用列表构建命令，避免命令注入
    cmd_parts = ['rsync', '-a']
    cmd_parts.extend(exclude_args.split())
    cmd_parts.extend([f"{src_dir}/", f"{dst_dir}/"])
    
    logger.info(f"开始同步文件: {' '.join(cmd_parts)}")
    try:
        result = subprocess.run(
            cmd_parts,
            check=True,
            capture_output=True,
            text=True
        )
        # 只在debug级别记录输出
        if result.stdout.strip():
            logger.debug(f"rsync输出: {result.stdout}")
    except subprocess.CalledProcessError as e:
        error_msg = f"同步失败: 退出码 {e.returncode}"
        if e.stderr.strip():
            error_msg += f"\n错误输出: {e.stderr}"
        logger.error(error_msg)
        raise Exception(error_msg)
    logger.info("文件同步完成")

def run_update() -> str | None:
    """
    执行更新逻辑
    返回:
        str: 更新后的版本号
        None: 如果已经是最新版本
    抛出:
        Exception: 更新过程中的错误
    """
    try:
        logger.info("开始更新流程")
        # 确保version.json文件存在
        ensure_version_file()
        
        # 获取当前版本
        current_version = get_current_version()
        logger.info(f"当前版本: {current_version}")
        
        # 获取最新版本信息
        latest_version, download_url = get_latest_release()
        
        if current_version == latest_version:
            logger.info("已经是最新版本，无需更新")
            return None
        
        logger.info(f"开始更新到版本 {latest_version}")
        logger.debug(f"下载地址: {download_url}")
        
        # 创建临时目录
        if os.path.exists(TMP_DIR):
            logger.debug(f"清理临时目录: {TMP_DIR}")
            shutil.rmtree(TMP_DIR)
        os.makedirs(TMP_DIR)
        
        try:
            # 下载新版本
            zip_path = os.path.join(TMP_DIR, "release.zip")
            logger.info("下载新版本文件")
            response = requests.get(download_url)
            response.raise_for_status()
            with open(zip_path, 'wb') as f:
                f.write(response.content)
            
            # 解压新版本
            extract_path = os.path.join(TMP_DIR, "app")
            logger.info(f"解压文件到: {extract_path}")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
            
            # 使用rsync同步文件
            sync_files(extract_path, APP_DIR)
            
            # 更新版本文件
            update_version_file(latest_version)
            
            logger.success("更新成功完成")
            return latest_version
            
        finally:
            # 清理临时文件
            logger.debug(f"清理临时文件: {TMP_DIR}")
            shutil.rmtree(TMP_DIR)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"网络请求错误: {e}")
        raise Exception(f"网络请求错误: {e}")
    except json.JSONDecodeError as e:
        logger.error(f"JSON解析错误: {e}")
        raise Exception(f"JSON解析错误: {e}")
    except Exception as e:
        logger.error(f"更新过程中发生错误: {e}")
        logger.exception(e)
        raise 