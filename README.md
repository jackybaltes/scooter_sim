# Scooter Simulator

This game was developed by members of the Educational Robotics Lab at the (National Taiwan Normal University (NTNU))[http://www.ntnu.edu.tw] in Taipei, Taiwan.

The game is based on the driving test for motor scooters in Taiwan. If you pass the test and your browser can access your camera, then you will receive a virtual scooter drivier's licence.


# 1 DEPENDENCIES

This project is coded in typescript. To install the dependencies you should run :

```
npm install
```

# 2 BUILD
To build the project and generate JS files from TS files you will need to run :
```
npm run build
```

# 3 RUN

To launch the project :
- Move to the scooter_sim/dist directory
```
cd dist
```
- Launch the server on your machine
 ```
npx static-server
```
- 3 Open your browser (preferably google chrome, issues have been reported when using mozilla) and go to
```
http://localhost:9080
```

# 4 CONTROL

You can control the game using the keyboard keys W-A-S-D

Uou can also control the simulated robot speed and steering angle the simulation listen to the port 8878 of 127.0.0.1, you should send a json file containing the steering and speed to control it. If the robot is not reponding you should add some prints in the scooter_sim/control_server.ts

# 5 CAMERA STREAM

A camera is palced on the robot and the video flux is send via UDP at the port 8787 of 127.0.0.1.
You will find a python script showing how to acces the video flux here : scooter_sim/Tools/image_receiver.py

To setup a python environment that includes websockets, numpy, and opencv, you can use the following commands

```
python -m venv .venv
.venv\Scripts\activate # Windows
source .venv/bin/activate.sh # Linux
python -m pip install websockets numpy opencv-python
```
Ps: The code is curently poorly commented so contact me (Ugo Roux) at ugo.roux31@gmail.com or directly on discord with the username UgoLeRobot#5012

