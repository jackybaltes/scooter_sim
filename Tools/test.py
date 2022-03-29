import asyncio
import websockets
import numpy as np
import cv2
import json

async def echo(websocket, path):
    
    #We receive a message [IMAGE] from the websocket
    async for message in websocket:
        #Reading image from string to np array
        nparr = np.fromstring(message, np.uint8)
        #decoding the image
        image = cv2.imdecode(nparr, -1)
        #Showing the image
        cv2.imshow('image', image)
        cv2.waitKey(1)

        
        #We create a json file
        json_data =     {"steering" : [0.0,1.0]}
        json_file = json.dumps(json_data)
        #We send the json file
        await websocket.send(json_file)
        


asyncio.get_event_loop().run_until_complete(websockets.serve(echo, 'localhost', 8787))
asyncio.get_event_loop().run_forever()