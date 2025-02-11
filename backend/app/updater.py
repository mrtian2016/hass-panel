import json
import os
import shutil
import requests
from datetime import datetime
import zipfile
from loguru import logger

GITHUB_REPO = "mrtian2016/hass-panel"
APP_DIR = "/app"
VERSION_FILE = os.path.join(APP_DIR, "version.json")
TMP_DIR = "/tmp/hass-panel-update"

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

def backup_important_files() -> list[str]:
    """备份重要文件"""
    backup_files = ['env.js', 'env.template.js']
    backed_up = []
    for file in backup_files:
        src = os.path.join(APP_DIR, file)
        if os.path.exists(src):
            dst = os.path.join(TMP_DIR, f"{file}.backup")
            logger.info(f"备份文件: {src} -> {dst}")
            shutil.copy2(src, dst)
            backed_up.append(file)
    return backed_up

def restore_backup_files(backed_up_files: list[str]):
    """恢复备份的文件"""
    for file in backed_up_files:
        backup = os.path.join(TMP_DIR, f"{file}.backup")
        if os.path.exists(backup):
            dst = os.path.join(APP_DIR, file)
            logger.info(f"恢复文件: {backup} -> {dst}")
            shutil.copy2(backup, dst)

def update_version_file(version: str):
    """更新版本文件"""
    current_time = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    logger.info(f"更新版本信息: {version}, 时间: {current_time}")
    with open(VERSION_FILE, 'w') as f:
        json.dump({"version": version, "updateTime": current_time}, f)

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
            
            # 备份重要文件
            backed_up_files = backup_important_files()
            
            # 删除旧文件
            logger.info("清理旧文件")
            for item in os.listdir(APP_DIR):
                path = os.path.join(APP_DIR, item)
                if os.path.isfile(path):
                    os.remove(path)
                elif os.path.isdir(path):
                    shutil.rmtree(path)
            
            # 复制新文件
            logger.info("复制新文件")
            for item in os.listdir(extract_path):
                src = os.path.join(extract_path, item)
                dst = os.path.join(APP_DIR, item)
                if os.path.isfile(src):
                    shutil.copy2(src, dst)
                else:
                    shutil.copytree(src, dst)
            
            # 恢复备份的文件
            restore_backup_files(backed_up_files)
            
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