#!/usr/bin/env python

import sys
import argparse
import asyncio
import websockets
import logging
import json
import time
import re

logging.basicConfig( level = logging.DEBUG )
logger = logging.getLogger( __name__ )

class ControlServer:
    def __init__( self, ws, proto, p_ip, p_port ):
        self.p_ip = p_ip
        self.p_port = p_port
        self.proto = proto
        
        self.ws = ws
        self.ws_in_queue = self.ws.in_queue
        self.ws_out_queue = self.ws.out_queue
        
    def start( self ):        
        t = asyncio.get_event_loop().create_datagram_endpoint( self.proto, local_addr=(self.p_ip, self.p_port ) )
        t = asyncio.get_event_loop().run_until_complete(t) # Server starts listening
        self.transport, self.udp = t
        # self.ws.runner()
        # addr, data = asyncio.get_event_loop().run_until_complete( self.udp.out_queue.get() )
        # logger.debug( f'ControlServer: udp out_queue {addr}, {data}' )
        # asyncio.get_event_loop().run_forever()

    async def serve( self ):
        logger.debug( f'starting ControlServer.serve')
        prev_time = None
        while True:
            logger.debug( f'waiting for udp out_queue')
            addr,data = await self.udp.out_queue.get()
            logger.debug( f'from udp queue {addr}: {data}' )
            
            now = time.monotonic()
            if ( ( prev_time is None ) or ( prev_time + 0.0 < now ) ):
                dat = self.toJSON( data.decode( 'utf-8') )
                logger.debug( f'json data: {dat}')
                await self.ws.send( json.dumps(dat) )
                prev_time = now

    def toJSON( self, data ):
        # 'Counter: 69528 State: Stop Orientation: 1.5321085006042097 1.5734616529266432 0.038779620321615985 gyroscope: 0.0005326165119186044 -0.0009320789249613881 -0.0001331541279796511
        result = {}

        cnt_pat = re.compile( r'[Cc]ounter:\s*(\d+)')
        state_pat = re.compile( r'[Ss]tate:\s*(\w+)')
        orient_pat = re.compile( r'[Oo]rientation:\s*(?P<n1>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)\s+(?P<n2>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)\s+(?P<n3>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)')
        gyro_pat = re.compile( r'[Gg]yroscope:\s*(?P<n1>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)\s+(?P<n2>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)\s+(?P<n3>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)')
        steering_pat = re.compile( r'[Ss]teering\s*:\s*(?P<n1>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)\s+(?P<n2>[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?)')

        m = re.search( cnt_pat, data )
        if m:
            result['counter'] = int( m.group(1) )

        m = re.search( state_pat, data )
        if m:
            result['state'] = str( m.group(1) )

        m = re.search( orient_pat, data )
        if m:
            result['orientation'] = [ float( m.group('n1') ), float( m.group('n2') ), float( m.group('n3') ) ]

        m = re.search( gyro_pat, data )
        if m:
            result['gyroscope'] = [ float( m.group('n1') ), float( m.group('n2') ), float( m.group('n3') ) ]

        m = re.search( steering_pat, data )
        if m:
            result['steering'] = [ float( m.group('n1') ), float( m.group('n2') ) ]

        return result

class WSServer:
    def __init__( self, ip, port ):
        self.port = port
        self.ip = ip
        self.connection = None
        self.websocket = None
        self.done = True
        
        self.in_queue = asyncio.Queue()
        self.out_queue = asyncio.Queue()
        self.done = False

    def make_server(self):
        obj = self
        obj.done = False

        async def server( websocket, path ):
            obj.websocket = websocket
            obj.path = path
            while True:
                async for data in websocket:
                    logger.debug( f'ws received {data}' )
                    sd = await obj.in_queue.get()
                    
                

        return server

    # async def __aenter__(self):
    #     url = f'ws://{self.ip}:{self.port}/'
    #     logger.info(f'__aenter__, connect to {url}')
    #     self.connection = websockets.serve( url )
    #     self.websocket = await self.connection.__aenter__()
    #     return self

    # async def __aexit__(self, *args, **kwargs ):
    #     logger.info(f'__aexit__')
    #     await self.connection.__aexit__(*args, **kwards )

    async def send( self, data ):
        logger.debug( f'trying to send to webscoket client {data}')
        if self.websocket:
            logger.debug( f'sending to websocket client {data}')
            await self.websocket.send( data )

    # async def receive( self ):
    #     if self.websocket:
    #         return await self.websocket.recv()

    def runner(self):
        start_server = websockets.serve( self.make_server(), self.ip, self.port )

        asyncio.get_event_loop().run_until_complete( start_server )
        #asyncio.get_event_loop().run_forever()

    # async def __async__looper( self ):
    #     async with self as ws:
    #         logger.debug( f'Waiting for data on ws')
    #         d = await self.queue.get()
    #         logger.debug( f'Received data {d}')
    #         await ws.send( d )
    #         logger.debug( f'Send data {d}')
            
    # def make_static( self, func, * args ):
    #     async def trampoline( ):
    #         self.func( * args )
    #     return trampoline

    # async def queueRunner( self ):
    #     while ( not self.done ):
    #         logger.debug("Getting element from queue")
    #         d = await self.queue.get()
    #         await self.send( d )
    #         await self.queue.task_done()

    # def start( self, queue ):
    #     self.queue = queue
    #     logger.debug( f"starting ws server on port {self.port}" )
    #     start_server = websockets.serve( self.connect, self.ip, self.port)
    #     asyncio.get_event_loop().run_until_complete( start_server )
    #     asyncio.get_event_loop().run_forever()
    #     self.done = False
    #     #asyncio.get_event_loop().run_until_complete( self.queueRunner() )


class ScooterControlProtocol(asyncio.DatagramProtocol):
    def connection_made(self, transport) -> "Used by asyncio":
        self.in_queue = asyncio.Queue()
        self.out_queue = asyncio.Queue()
        self.transport = transport

    def datagram_received(self, data, addr) -> "Main entrypoint for processing message":
        # Here is where you would push message to whatever methods/classes you want.
        logger.debug(f"Received UDP message {addr}: {data}")
        loop = asyncio.get_event_loop()
        loop.create_task(  self.process_data( addr, data ) )

    async def process_data( self, addr, data ):
        logger.debug( f'process_data {addr},{data}' )
        await self.out_queue.put( ( addr, data ) )

def main( argv = None ):
    if argv is None:
        argv = sys.argv
    parser = argparse.ArgumentParser( prog='control_server', description='proxies control messages received via UDP broadcast to the ws server, so that we can control the game in the browser instance')
    parser.add_argument( '-w', '--ws_port', type=int, default='8878' )
    parser.add_argument( '-u', '--udp_port', type=int, default='8877' ) 
    parser.add_argument( '--ws_ip', type=str, default='localhost' )
    parser.add_argument( '--udp_ip', type=str, default='0.0.0.0' )

    args = parser.parse_args()

    ws = WSServer( args.ws_ip, args.ws_port )
    udp = ScooterControlProtocol 
    cs = ControlServer( ws, udp, args.udp_ip, args.udp_port )
    
    cs.start( )
    logger.debug( f'Finished controlserver.start')
    
    ws.runner()
    logger.debug( f'Finished ws.runner')
    
    #asyncio.get_event_loop().run_until_complete( cs.serve() )
    #asyncio.run( cs.serve() )
    logger.debug( f'Start controlserver.serve')
    asyncio.get_event_loop().run_until_complete( cs.serve() )
    

if __name__ == '__main__':
    main()