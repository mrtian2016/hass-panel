import aiohttp
import sys
sys.path.append(".")
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import json
from zoneinfo import ZoneInfo
import time
from hass_panel.utils.singleton import singleton
from loguru import logger
from hass_panel.models.database import SessionLocal, HassConfig
import asyncio
import os
import requests

@singleton
class HomeAssistantAPI:
    def __init__(self):
        """
        初始化 Home Assistant API 客户端
        配置从数据库中获取
        """
        self.base_url = None
        self.headers = None
        self.session = None
        self._init_config()
        # 使用同步方法检查 token
        self._check_token_sync()
        
    def _check_token_sync(self) -> None:
        """同步方法检查 token 有效性"""
        db = None
        try:
            response = requests.get(f"{self.base_url}/", headers=self.headers)
            if response.status_code != 200:
                db = SessionLocal()
                hass_config = db.query(HassConfig).first()
                if hass_config:
                    hass_config.hass_token = ''
                    db.commit()
                    db.close()
                    db = None
                logger.error("Home Assistant token 无效")
                raise Exception("Invalid Home Assistant token")
        except Exception as e:
            logger.error(f"检查 Home Assistant token 失败: {str(e)}")
            raise Exception(f"Failed to check Home Assistant token: {str(e)}")
        finally:
            if db:
                db.close()
                logger.debug("Database connection closed in _check_token_sync")
            
    def _init_config(self):
        """初始化时的配置加载（同步方法）"""
        db = SessionLocal()
        try:
            hass_config = db.query(HassConfig).first()
            if not hass_config:
                logger.error("未找到 Home Assistant 配置")
                raise Exception("Home Assistant configuration not found")
            
            
            if not hass_config.hass_token:
                logger.error("数据库中的 token 为空且未找到 SUPERVISOR_TOKEN")
                raise Exception("No valid token found")
            
            self.base_url = f"{hass_config.hass_url}/api"
            self.headers = {
                "Authorization": f"Bearer {hass_config.hass_token}",
                "Content-Type": "application/json",
            }
        finally:
            db.close()

    
    async def close(self):
        """关闭 session"""
        if self.session and not self.session.closed:
            await self.session.close()

    async def check_token(self) -> bool:
        """检查 token 是否有效（异步方法，用于运行时检查）"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}", headers=self.headers) as response:
                    logger.info(f"check_token response: {response.status}")
                    return response.status == 200
        except Exception as e:
            logger.error(f"检查 token 失败: {str(e)}")
            return False

    async def get_states(self) -> list:
        """获取所有实体的状态"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/states", headers=self.headers) as response:
                if response.status >= 400:
                    raise aiohttp.ClientResponseError(
                        response.request_info,
                        response.history,
                        status=response.status,
                        message=f"HTTP Error {response.status}"
                    )
                return await response.json()

    async def get_state(self, entity_id: str) -> Dict[str, Any]:
        """
        获取特定实体的状态
        
        Args:
            entity_id: 实体 ID
        """
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/states/{entity_id}", headers=self.headers) as response:
                if response.status >= 400:
                    raise aiohttp.ClientResponseError(
                        response.request_info,
                        response.history,
                        status=response.status,
                        message=f"HTTP Error {response.status}"
                    )
                return await response.json()

    async def call_service(self, domain: str, service: str, service_data: Optional[Dict] = None) -> Dict[str, Any]:
        """
        调用 Home Assistant 服务
        
        Args:
            domain: 服务域名
            service: 服务名称
            service_data: 服务参数
        """
        url = f"{self.base_url}/services/{domain}/{service}"
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=self.headers, json=service_data or {}) as response:
                if response.status >= 400:
                    raise aiohttp.ClientResponseError(
                        response.request_info,
                        response.history,
                        status=response.status,
                        message=f"HTTP Error {response.status}"
                    )
                return await response.json()

    async def get_config(self) -> Dict[str, Any]:
        """获取 Home Assistant 配置信息"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/config", headers=self.headers) as response:
                if response.status >= 400:
                    raise aiohttp.ClientResponseError(
                        response.request_info,
                        response.history,
                        status=response.status,
                        message=f"HTTP Error {response.status}"
                    )
                return await response.json()

    async def get_history(self, entity_id: str, start_time: Optional[str] = None, end_time: Optional[str] = None) -> list:
        """
        获取实体的历史记录
        
        Args:
            entity_id: 实体 ID
            start_time: 开始时间，ISO 格式
            end_time: 结束时间，ISO 格式
        """
        params = {
            "filter_entity_id": entity_id,
            "minimal_response": "true",
            "no_attributes": "true",
        }
        if end_time:
            params["end_time"] = end_time
        
        url = f"{self.base_url}/history/period/{start_time}" if start_time else f"{self.base_url}/history/period"
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=self.headers, params=params) as response:
                
                if response.status == 404:
                    logger.error(f"实体 {entity_id} 未找到或历史数据不可用")
                    return []
                    
                if response.status >= 400:
                    raise aiohttp.ClientResponseError(
                        response.request_info,
                        response.history,
                        status=response.status,
                        message=f"HTTP Error {response.status}"
                    )
                    
                try:
                    return await response.json()
                except aiohttp.ContentTypeError as e:
                    logger.error(f"解析响应失败: {str(e)}")
                    return []

    async def calculate_energy_consumption(self, entity_id: str, start_time: str, end_time: str) -> float:
        """
        计算指定时间段内的总用电量
        
        Args:
            entity_id: 实体 ID
            start_time: 开始时间，ISO 格式
            end_time: 结束时间，ISO 格式
            
        Returns:
            时间段内的总用电量（千瓦时）
        """
        history = await self.get_history(entity_id, start_time, end_time)
        if not history or not history[0]:
            return 0
        
        data_points = []
        for record in history[0]:
            if record['state'] != 'unavailable' and record['state'] != 'unknown':
                try:
                    power = float(record['state'])
                    timestamp = datetime.fromisoformat(record['last_changed'].replace('Z', '+00:00'))
                    data_points.append((timestamp, power))
                except (ValueError, TypeError):
                    continue
        
        if len(data_points) < 2:
            return 0
        
        # 使用梯形法计算总用电量（千瓦时）
        total_energy = 0
        for i in range(len(data_points) - 1):
            t1, p1 = data_points[i]
            t2, p2 = data_points[i + 1]
            time_diff = (t2 - t1).total_seconds() / 3600  # 转换为小时
            avg_power = (p1 + p2) / 2  # 平均功率（瓦特）
            energy = (avg_power * time_diff) / 1000  # 转换为千瓦时
            total_energy += energy
        
        return round(total_energy, 2)

    async def get_energy_statistics(self, entity_id: str) -> Dict[str, float]:
        """
        获取各个时间段的用电量统计
        
        Args:
            entity_id: 实体 ID
            
        Returns:
            包含不同时间段用电量的字典
        """
        # 使用本地时区
        local_tz = ZoneInfo("Asia/Shanghai")
        now = datetime.now(local_tz)
        
        # 使用最早的开始时间和最晚的结束时间获取一次数据
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        this_year_end = now
        
        # 转换为ISO格式时保留时区信息
        this_year_start_iso = this_year_start.isoformat()
        this_year_end_iso = this_year_end.isoformat()
        
        # 获取一整年的数据
        history = await self.get_history(entity_id, this_year_start_iso, this_year_end_iso)
        if not history or not history[0]:
            return {
                "yesterday": 0,
                "last_month": 0,
                "this_month": 0,
                "this_year": 0
            }
        
        # 预处理所有数据点
        data_points = []
        for record in history[0]:
            if record['state'] not in ['unavailable', 'unknown']:
                try:
                    energy = float(record['state'])
                    timestamp = datetime.fromisoformat(record['last_changed'].replace('Z', '+00:00')).astimezone(local_tz)
                    data_points.append((timestamp, energy))
                except (ValueError, TypeError):
                    continue
        
        if not data_points:
            return {
                "yesterday": 0,
                "last_month": 0,
                "this_month": 0,
                "this_year": 0
            }
        
        def calculate_period_consumption(start_time: datetime, end_time: datetime, points: list) -> float:
            """计算指定时间段内的用电量差值"""
            period_points = sorted([(t, e) for t, e in points if start_time <= t <= end_time])
            if len(period_points) < 2:
                return 0
            return round(period_points[-1][1] - period_points[0][1], 2)
        
        # 定义时间范围
        yesterday_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
        yesterday_end = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_end = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_end = now
        
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        this_year_end = now
        
        # 计算各时间段的用电量
        return {
            "yesterday": calculate_period_consumption(yesterday_start, yesterday_end, data_points),
            "last_month": calculate_period_consumption(last_month_start, last_month_end, data_points),
            "this_month": calculate_period_consumption(this_month_start, this_month_end, data_points),
            "this_year": calculate_period_consumption(this_year_start, this_year_end, data_points)
        }

    async def get_daily_consumption(self, entity_id: str, days: int = 7) -> Dict[str, float]:
        """
        获取指定天数的历史每日用电量
        
        Args:
            entity_id: 实体 ID
            days: 要获取的天数，默认7天
            
        Returns:
            包含每日用电量的字典，键为日期字符串(YYYY-MM-DD)，值为用电量
        """
        local_tz = ZoneInfo("Asia/Shanghai")
        now = datetime.now(local_tz)
        
        # 计算开始时间和结束时间
        end_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
        start_time = end_time - timedelta(days=days)
        
        # 获取历史数据
        history = await self.get_history(entity_id, start_time.isoformat(), end_time.isoformat())
        if not history or not history[0]:
            return {}
        
        # 预处理数据点
        data_points = []
        for record in history[0]:
            if record['state'] not in ['unavailable', 'unknown']:
                try:
                    energy = float(record['state'])
                    timestamp = datetime.fromisoformat(record['last_changed'].replace('Z', '+00:00')).astimezone(local_tz)
                    data_points.append((timestamp, energy))
                except (ValueError, TypeError):
                    continue
        
        if not data_points:
            return {}
        
        # 计算每日用电量
        daily_consumption = {}
        for day in range(days):
            day_start = end_time - timedelta(days=day+1)
            day_end = end_time - timedelta(days=day)
            day_str = day_start.strftime('%Y-%m-%d')
            
            # 找到当天的数据点
            day_points = sorted([(t, e) for t, e in data_points if day_start <= t <= day_end])
            
            if len(day_points) >= 2:
                start_energy = day_points[0][1]
                end_energy = day_points[-1][1]
                daily_consumption[day_str] = round(end_energy - start_energy, 2)
            else:
                daily_consumption[day_str] = 0
        
        # 按日期排序 日期是key, 日期是字符串
        daily_consumption = dict(sorted(daily_consumption.items(), key=lambda x: x[0]))
        return daily_consumption

    async def get_all_statistics(self, entity_id: str, daily_days: int = 7) -> Dict[str, Any]:
        """
        一次性获取所有用电量统计数据
        
        Args:
            entity_id: 实体 ID
            daily_days: 要获取的每日统计天数
            
        Returns:
            包含所有统计数据的字典
        """
        local_tz = ZoneInfo("Asia/Shanghai")
        now = datetime.now(local_tz)
        
        # 找出所需数据的最早时间点
        this_year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        daily_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=daily_days)
        start_time = min(this_year_start, daily_start)
        
        # 只调用一次API获取所有需要的数据
        time0 = time.time()
        history = await self.get_history(entity_id, start_time.isoformat(), now.isoformat())
        time1 = time.time()
        logger.info(f"获取历史数据用时{time1-time0}秒")
        
        if not history or not history[0]:
            return {
                "summary": {
                    "yesterday": 0,
                    "last_month": 0,
                    "this_month": 0,
                    "this_year": 0
                },
                "daily": {}
            }
        
        # 预处理所有数据点
        data_points = []
        for record in history[0]:
            if record['state'] not in ['unavailable', 'unknown']:
                try:
                    energy = float(record['state'])
                    timestamp = datetime.fromisoformat(record['last_changed'].replace('Z', '+00:00')).astimezone(local_tz)
                    data_points.append((timestamp, energy))
                except (ValueError, TypeError):
                    continue
        
        if not data_points:
            return {
                "summary": {
                    "yesterday": 0,
                    "last_month": 0,
                    "this_month": 0,
                    "this_year": 0
                },
                "daily": {}
            }
        
        data_points.sort()  # 按时间排序
        
        def get_period_consumption(start_time: datetime, end_time: datetime) -> float:
            """计算指定时间段内的用电量差值"""
            period_points = [(t, e) for t, e in data_points if start_time <= t <= end_time]
            if len(period_points) < 2:
                return 0
            return round(period_points[-1][1] - period_points[0][1], 2)
        
        # 定义时间范围
        yesterday_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
        yesterday_end = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_end = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # 计算汇总统计
        summary = {
            "yesterday": get_period_consumption(yesterday_start, yesterday_end),
            "last_month": get_period_consumption(last_month_start, last_month_end),
            "this_month": get_period_consumption(this_month_start, now),
            "this_year": get_period_consumption(this_year_start, now)
        }
        
        # 计算每日用电量
        daily = {}
        end_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
        for day in range(daily_days):
            day_start = end_time - timedelta(days=day+1)
            day_end = end_time - timedelta(days=day)
            day_str = day_start.strftime('%Y-%m-%d')
            daily[day_str] = get_period_consumption(day_start, day_end)
        
        # 按日期排序 日期是key, 日期是字符串 返回结果需要是字典
        daily = dict(sorted(daily.items(), key=lambda x: x[0]))
        return {
            "summary": summary,
            "daily": daily
        }
    
    async def get_today_consumption(self, entity_id: str) -> Dict[str, float]:
        """
        获取今日用电量
        
        Args:
            entity_id: 实体 ID
            
        Returns:
            Dict[str, float]: 包含今日用电量的字典，包括：
                - total: 总用电量
        """
        local_tz = ZoneInfo("Asia/Shanghai")
        now = datetime.now(local_tz)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 获取今天的历史数据
        history = await self.get_history(entity_id, today_start.isoformat(), now.isoformat())
        if not history or not history[0]:
            return 0
        
        # 预处理数据点
        data_points = []
        for record in history[0]:
            if record['state'] not in ['unavailable', 'unknown']:
                try:
                    energy = float(record['state'])
                    timestamp = datetime.fromisoformat(record['last_changed'].replace('Z', '+00:00')).astimezone(local_tz)
                    data_points.append((timestamp, energy))
                except (ValueError, TypeError):
                    continue
        
        if not data_points:
            return 0
            
        # 按时间排序
        data_points.sort()
        
        # 计算今日总用电量（最后一个读数减去第一个读数）
        total = round(data_points[-1][1] - data_points[0][1], 2)
        
        return total
    