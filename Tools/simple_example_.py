import json

import asyncio
import websockets

async def main():
    async with websockets.connect('ws://127.0.0.1:8878') as websocket:
        while 1:
            try:
                speed    = input("SPEED : ")
                steering = input("STEERING : ")
                data_set = {"steering": [steering,speed]}
                json_dump = json.dumps(data_set)
                #we send the json to the websocket
                await websocket.send(json_dump)
                
            except Exception as e:
                print(e)



asyncio.get_event_loop().run_until_complete(main())

