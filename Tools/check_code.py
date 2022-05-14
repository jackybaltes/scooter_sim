import asyncio
from concurrent.futures import process
import websockets
import numpy as np
import cv2
import json
from multiprocessing import Process, Queue
import matplotlib.pylab as plt
import cv2
import numpy as np
from math import atan2, degrees, radians
import time




curent_steering_ = 0.0

class Controll:
        
    def error(lineangle,curent_steering):
        return lineangle-curent_steering

    def controll_law(error, curent_steering):
        return (-1*(curent_steering-error))/2.5

    def filter(angle):
        if(-10<angle and 10>angle):
            return angle
        else:
            return None

class ImageProcess:

    def region_of_interest(img, vertices):
        mask = np.zeros_like(img)
        #channel_count = img.shape[2]
        match_mask_color = 255
        cv2.fillPoly(mask, vertices, match_mask_color)
        masked_image = cv2.bitwise_and(img, mask)
        return masked_image

    def get_middle_line(lines):
        
        if(lines is not None):
            
            left_line  = lines[0]
            right_line = lines[0]

            for line in lines:
                print(line)
                print("====")
                
                x_tested = line[0][0]
                xleft = left_line[0][0]
                xright = right_line[0][0]

                
                if(xleft>x_tested):
                    left_line = line
                    
                if(xright<x_tested):
                    right_line = line
            
            x_1l = left_line[0][0]
            y_1l = left_line[0][1]
            x_2l = left_line[0][2]
            y_2l = left_line[0][3]

            x_1r = right_line[0][2]
            y_1r = right_line[0][3]
            x_2r = right_line[0][0]
            y_2r = right_line[0][1]

            print(y_1l+y_1r)
            print(y_2r+y_2l)

            x_1n = x_1l+int(abs(x_1l-x_1r)/2)
            y_1n = int((y_1l+y_1r)/2)
            x_2n = x_2l+int(abs(x_2l-x_2r)/2)
            y_2n = int((y_2r+y_2l)/2)



            middle_line = []
            
            middle_line.append([x_1n,y_1n,x_2n,y_2n])
            print("left_line =",left_line)
            print("right_line =",right_line)
            print("mid_line =",middle_line)

            return middle_line,left_line,right_line
        
        
        else:
            return None,None,None


    def get_angle(point_1, point_2): #These can also be four parameters instead of two arrays
        angle = atan2(point_1[1] - point_2[1], point_1[0] - point_2[0])
        angle = degrees(angle)
        
        return angle

    def drow_the_lines(img, lines):
        img = np.copy(img)
        blank_image = np.zeros((img.shape[0], img.shape[1], 4), dtype=np.uint8)
        if(lines is not None):
            for line in lines:
                for x1, y1, x2, y2 in line:
                    cv2.line(blank_image, (x1,y1), (x2,y2), (0, 255, 0), thickness=10)

        img = cv2.addWeighted(img, 0.8, blank_image, 1, 0.0)
        return img

    # = cv2.imread('road.jpg')
    #image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    def process(image):
        height = image.shape[0]
        width = image.shape[1]
        region_of_interest_vertices = [
                                        (width/1.2, height/2),
                                        (width/4, height/2),
                                        (width/4, height/1.2),
                                        (width/1.2, height/1.2),
                                    ]
                                    
        gray_image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        cv2.imshow('gray_image', gray_image)
        canny_image = cv2.Canny(gray_image, 100, 120)
        cv2.imshow('canny_image', canny_image)

        cropped_image = ImageProcess.region_of_interest(canny_image,
                        np.array([region_of_interest_vertices], np.int32),)
        
        kernel = np.ones((2,2))
        cropped_image = cv2.dilate(cropped_image,kernel)
        #kernel = np.ones((5,5))
        #cropped_image = cv2.erode(cropped_image,kernel)

        cv2.imshow('cropped_image', cropped_image)

        
        lines = cv2.HoughLinesP(cropped_image,
                                rho=1,
                                theta=np.pi/180,
                                threshold=20,
                                lines=np.array([]),
                                minLineLength=5,
                                maxLineGap=100)
        
        middle_line,left_line,right_line = ImageProcess.get_middle_line(lines)
        if(left_line is not None):
            x1l = left_line[0][0]
            y1l = left_line[0][1]
            x2l = left_line[0][2]
            y2l = left_line[0][3]
            
            x1r = right_line[0][0]
            y1r = right_line[0][1]
            x2r = right_line[0][2]
            y2r = right_line[0][3]

            x1m = middle_line[0][0]
            y1m = middle_line[0][1]
            x2m = middle_line[0][2]
            y2m = middle_line[0][3]

            angle = ImageProcess.get_angle([x1m,y1m], [x2m,y2m])-90.0-2
            print("not filtered angle =",angle)

            angle = Controll.filter(angle)
            print("filtered angle =",angle)
            
            color = (0, 255, 0)
            if(not angle):
                color = (0, 0, 255)
            image_with_lines = cv2.line(image, (x1m,y1m), (x2m,y2m),color, thickness=3)
            color = (255, 0, 0)
            image_with_lines = cv2.line(image_with_lines, (x1r,y1r), (x2r,y2r),color, thickness=3)
            image_with_lines = cv2.line(image_with_lines, (x1l,y1l), (x2l,y2l),color, thickness=3)


            font = cv2.FONT_HERSHEY_SIMPLEX
            org = (10, 10)
            fontScale = 0.3
            color = (255, 0, 0)
            thickness = 1
            if(angle):
                image_with_lines = cv2.putText(image_with_lines, str(int(angle)), org, font, 
                                                fontScale, color, thickness, cv2.LINE_AA)
            
            cv2.imshow('image_with_lines', image_with_lines)

    
            return angle
        else:
            cv2.imshow('image_with_lines', image)
            return None





class Scooter:
    
    
    def __init__(self):
        self.curent_steering_ = 0.0
        self.angle_queue = []
        self.nb_calls = 0

    async def echo(self,websocket,localhost):
        print("===========================")
        #We receive a message [IMAGE] from the websocket
        async for message in websocket:
            #Reading image from string to np array
            nparr = np.fromstring(message, np.uint8)
            #decoding the image
            image = cv2.imdecode(nparr, -1)
            print(image.shape)
            cv2.imshow('image', image)

            angle = ImageProcess.process(image)
            print(angle)
            if(angle is None):
                pass
            else:
                err = Controll.error(angle,self.curent_steering_)
                self.curent_steering_ = Controll.controll_law(err,self.curent_steering_)
                _steering_ = radians(self.curent_steering_)
                self.angle_queue.append(_steering_)
                # self.nb_calls+=1
                # if(self.nb_calls>=10):
                #     print("===============")
                #     smooth_steering = sum(self.angle_queue)/len(self.angle_queue)
                #     print("_steering_ = ",smooth_steering)
                #     json_data =     {"steering" : [smooth_steering,0.1]}
                #     json_file = json.dumps(json_data)
                #     await websocket.send(json_file)
                #     self.nb_calls = 0
                #     self.angle_queue = []
                    
                json_data =     {"steering" : [_steering_,0.05]}
                json_file = json.dumps(json_data)
                await websocket.send(json_file)
                self.nb_calls = 0

            cv2.waitKey(1)
                        
            

scooter = Scooter()
asyncio.get_event_loop().run_until_complete(websockets.serve(scooter.echo, 'localhost', 8787))
asyncio.get_event_loop().run_forever()