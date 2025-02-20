import os
import os.path as osp
import re
import sys
import glob
import logging
import datetime

from omegaconf.errors import ConfigAttributeError
from loguru import logger
logger.remove()

from hass_panel.utils.log_handler import CompatibleSMTPSSLHandler
from hass_panel.utils.config import cfg

# exce_handler 自动发送邮件handler
try:
    exce_handler = CompatibleSMTPSSLHandler(mailhost=tuple(cfg.log.mailhost),
                            is_use_ssl=cfg.log.is_use_ssl,
                            fromaddr=cfg.log.fromaddr,
                            toaddrs=tuple(cfg.log.toaddrs),
                            credentials=tuple(cfg.log.credentials),
                            subject=cfg.log.subject,
                            mail_time_interval=int(cfg.log.mail_time_interval))
except ConfigAttributeError:
    ...

# makedir
LOG_OUTPUT_DIR = cfg.log.log_output_dir
os.makedirs(LOG_OUTPUT_DIR, exist_ok=True)

# handler
LOG_HANDLER = [
    {
        'sink': sys.stdout,
        'format': '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>'
    },
    {
        'sink': os.path.join(LOG_OUTPUT_DIR, '{time}.log'),
        'format': '<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>',
        'rotation': '00:00',
        'retention': '10 days'
    },
    # {
    #     'sink': exce_handler,
    #     'level': 'ERROR'
    # }
]

# extra handle retention
# warning: retention must use days rather than months or hours
for h in LOG_HANDLER:
    rtt = int(re.match(r'(\d+) days', h.get('retention')).group(1)) if h.get('retention') else None
    if rtt and isinstance(h['sink'], str):
        for p in glob.glob(f'{LOG_OUTPUT_DIR}/*'):
            pattern = h['sink'].format(time=r"(\d+-\d+-\d+_\d+-\d+-\d+_\d+)")
            obj = re.match(f"^{pattern}$", p)
            if obj:
                timestr = obj.group(1)
                dt = datetime.datetime.strptime(timestr, '%Y-%m-%d_%H-%M-%S_%f')
                if (datetime.datetime.now()-dt).days > rtt:
                    os.remove(p)

class InterceptHandler(logging.Handler):
    """
    Default handler from examples in loguru documentaion.
    See https://loguru.readthedocs.io/en/stable/overview.html#entirely-compatible-with-standard-logging
    """

    def emit(self, record: logging.LogRecord):
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )