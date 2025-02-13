import re
import time
import json
from threading import Thread
import logging
from logging.handlers import SMTPHandler

import smtplib
from email.message import EmailMessage
import email.utils


class CompatibleSMTPSSLHandler(SMTPHandler):
    """
    官方的SMTPHandler不支持SMTP_SSL的邮箱，这个可以两个都支持,并且支持邮件发送频率限制
    """

    def __init__(self, mailhost, fromaddr, toaddrs: tuple, subject,
                 credentials=None, secure=None, timeout=5.0, is_use_ssl=True, mail_time_interval=0):
        """
        :param mailhost:
        :param fromaddr:
        :param toaddrs:
        :param subject:
        :param credentials:
        :param secure:
        :param timeout:
        :param is_use_ssl:
        :param mail_time_interval: 发邮件的时间间隔，可以控制日志邮件的发送频率，为0不进行频率限制控制，如果为60，代表1分钟内最多发送一次邮件
        """
        super().__init__(mailhost, fromaddr, toaddrs, subject,
                         credentials, secure, timeout)
        self._is_use_ssl = is_use_ssl
        self._time_interval = mail_time_interval
        self.last_time = None

    def emit(self, record: logging.LogRecord):
        """
        Emit a record.

        Format the record and send it to the specified addressees.
        """
        Thread(target=self.__emit, args=(record,)).start()
        # self.__emit(record)

    def __emit(self, record):
        now = time.time()
        if not self.last_time or now - self.last_time > self._time_interval:
            try:
                port = self.mailport
                if not port:
                    port = smtplib.SMTP_PORT
                smtp = smtplib.SMTP_SSL(self.mailhost, port,
                                        timeout=self.timeout) if self._is_use_ssl else smtplib.SMTP(self.mailhost, port,
                                                                                                    timeout=self.timeout)
                msg = EmailMessage()
                msg['From'] = self.fromaddr
                msg['To'] = ','.join(self.toaddrs)
                msg['Subject'] = self.getSubject(record)
                msg['Date'] = email.utils.localtime()
                msg.set_content(self.format(record))
                if self.username:
                    if self.secure is not None:
                        smtp.ehlo()
                        smtp.starttls(*self.secure)
                        smtp.ehlo()
                    smtp.login(self.username, self.password)
                smtp.send_message(msg)
                smtp.quit()
                # print('{}发送邮件给 {} 成功，用时{} ,发送的内容是--> {} [0;35m!!!请去邮箱检查，可能在垃圾邮件中 [0m'.format(self.fromaddr,
                #                                                                                    self.toaddrs, round(
                #         time.time() - t_start, 2), record.msg))
                self.last_time = now
            except Exception:
                self.handleError(record)

        else:
            pass
            print('邮件发送太频繁，此次不发送这个邮件内容:{}'.format(record.msg))