#!/usr/bin/env python

import sys
import argparse
import socket
import logging
import time

logging.basicConfig( level = logging.DEBUG )
logger = logging.getLogger( __name__ )

def main( argv = None ):
    if argv is None:
        argv = sys.argv
    parser = argparse.ArgumentParser( prog='control_server', description='proxies control messages received via UDP broadcast to the ws server, so that we can control the game in the browser instance')
    parser.add_argument( '-u', '--udp_port', type=int, default='8877' ) 
    parser.add_argument( '--udp_ip', type=str, default='0.0.0.0' )

    args = parser.parse_args()

    server = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
    server.bind( ( args.udp_ip, args.udp_port ) )
    logger.debug("UDP server up and listening")

    while True:
        logger.debug( f"waiting for message" )
        data,addr = server.recvfrom(1024)
        logger.info( f'received message from {addr}: {data}')

if __name__ == '__main__':
    main()
