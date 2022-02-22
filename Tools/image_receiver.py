import asyncio
import websockets

import time
import json
import numpy as np
import cv2

async def echo(websocket, path):
    nb_messages = 0
    #start_time = time.time()

    async for message in websocket:
        await websocket.send(message)
        nb_messages+=1
        nparr = np.fromstring(message, np.uint8)
        image = cv2.imdecode(nparr, -1)

        cv2.imshow('image', image)
        cv2.waitKey(1)


        # print("=============="+str(nb_messages))
        # end_time = time.time()
        # total_time = end_time - start_time
        # print("ms=", total_time*1000, "| fps =",1/(total_time))
        # start_time = time.time()




asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, 'localhost', 8787))
asyncio.get_event_loop().run_forever()