import asyncio
import websockets
import numpy as np
import cv2

async def echo(websocket, path):
    nb_messages = 0
    async for message in websocket:
        nb_messages+=1
        nparr = np.fromstring(message, np.uint8)
        image = cv2.imdecode(nparr, -1)

        cv2.imshow('image', image)
        cv2.waitKey(1)


asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, 'localhost', 8787))
asyncio.get_event_loop().run_forever()