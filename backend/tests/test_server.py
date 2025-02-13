#!/usr/bin/env python
import sys
import os
import os.path as osp
import asyncio

cur_dir = osp.abspath(osp.dirname(__file__))
sys.path.insert(0, cur_dir+'/../')

import toml
import signal

from loguru import logger
import time
from kombu import Connection, Exchange
from aiomqsrv.base import get_rpc_exchange
from aiomqsrv.server import MessageQueueServer, run_server, make_server

# def echo(a):
#     time.sleep(5)
#     return a

async def echo(a):
    return a

def fib_fn(n):
    if n == 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fib_fn(n - 1) + fib_fn(n - 2)

def handle_event(evt_type, evt_data):
    print ("handle event", evt_type, evt_data)

class FibClass:
    rpc_prefix = 'fibclass'

    def setup(self):
        print ("fib setuped")

    def teardown(self):
        print ("fib teared down")

    def fib(self, n):
        return fib_fn(n)

    def worker(self):
        time.sleep(1)
        return True


def run():
    fib_obj = FibClass()
    addr = "amqp://guest:guest@0.0.0.0:5672/"
    rpc_queue = 'hik_rpc_queue'
    evt_queue = 'hik_event_routing_key'
    server = make_server(
        conn = addr,
        rpc_routing_key=rpc_queue,
        event_routing_keys=[evt_queue],
    )

    server.register_rpc(echo)
    server.register_rpc(fib_fn)

    server.register_context(fib_obj)
    server.register_rpc(fib_obj.fib)

    server.register_event_handler('new', handle_event)

    loop = asyncio.get_event_loop()
    loop.create_task(run_server(server, block=False))
    loop.run_forever()

def run_wrapper(config):
    try:
        run(config)
    except Exception as e:
        logger.exception(e)



if __name__ == "__main__":
    run()
