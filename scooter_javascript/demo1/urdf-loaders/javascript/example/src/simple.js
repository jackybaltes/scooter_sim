import { WebGLRenderer, PerspectiveCamera, Scene, DirectionalLight, Color, AmbientLight, LoadingManager, Quaternion, Euler, } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from '../../src/URDFLoader.js';
import { Track } from './track.js';
import { Timer } from './timer.js';
import { Robot } from './robot.js';
import { ControlServer } from './server.js';
//server for the app comunication
var controlServer;
//Score variables
var curent_score = 100;
var best_score = 999;
//elements to modify the html page
var score_element = document.getElementById("score");
var comment_element = document.getElementById("comment");
var timer_element = document.getElementById("timer");
//Stopwatch used to show the time and TODO: add some score
var stopwatch;
//ThreeJs scene
var scene;
var camera;
var renderer; //idk the type of this
//Objects ThreeJs of the track and robot
var track;
var scooter_three;
//Class used to controll the scooter
var test_track;
//Class used to controll the track
var scooter_obj;
//Booleans to check user imputs
var a_up = true;
var d_up = true;
var w_up = true;
var s_up = true;
var user_imput_done = false;
var nb_user_imput = 0;
var log_flag = false;
var controls;
init();
render();
//function used to render the scene but without aplying physics on the scooter
function render_no_physics() {
    requestAnimationFrame(render_no_physics);
    renderer.render(scene, camera);
}
//Scene initialisation
function init() {
    //setting the server to port 8878
    controlServer = new ControlServer(8878);
    //setting the HTML elements
    score_element.innerHTML = "";
    //creating the stopwatch
    stopwatch = new Timer();
    //Making a basic scene with camera and lights
    scene = new Scene();
    scene.background = new Color(0x92fffb);
    camera = new PerspectiveCamera();
    camera.position.set(-11, 10, 17);
    camera.lookAt(-11, 0, 17);
    renderer = new WebGLRenderer({ antialias: false });
    //renderer.outputEncoding = sRGBEncoding;
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    var directionalLight = new DirectionalLight(0xffffff, 1.0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar(1024);
    directionalLight.position.set(30, 100, 5);
    directionalLight.target.position.set(0, 0, 0);
    var ambientLight = new AmbientLight(0xffffff, 0.01);
    //ading the stuff to the scene
    scene.add(directionalLight);
    scene.add(ambientLight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4;
    controls.target.y = 1;
    controls.update();
    // Load robot
    var manager = new LoadingManager();
    var loader = new URDFLoader(manager);
    loader.load('../../urdf/thormang3/urdf/all.urdf', function (result) {
        scooter_three = result;
    });
    manager.onLoad = function () {
        scene.add(scooter_three);
        scooter_obj = new Robot(scooter_three);
        scooter_obj.init_position();
    };
    var manager2 = new LoadingManager();
    var loader2 = new URDFLoader(manager2);
    loader2.load('../../urdf/track/urdf/model.urdf', function (result) {
        track = result;
    });
    manager2.onLoad = function () {
        track.rotation.x = -Math.PI / 2;
        scene.add(track);
        test_track = new Track(track, render_no_physics);
        test_track.init_track();
    };
    var count = 0;
    setInterval(function () {
        var msg = "State message " + count;
        console.log("Trying to send message " + msg);
        controlServer.send(msg);
        count++;
    }, 5000);
    onResize();
    window.addEventListener('resize', onResize);
    document.addEventListener("keydown", user_imput_down);
    document.addEventListener("keyup", user_imput_up);
    console.log("FINISHED INIT");
}
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    if (controlServer.velocity != 0) {
        scooter_obj.velocity = controlServer.velocity;
        scooter_obj.steering_angle = controlServer.steering_angle;
    }
    if (scooter_obj) {
        steer_keyboard();
    }
    timer_element.innerHTML = stopwatch.getShowTime();
    if (test_track && scooter_obj) {
        test_track.update(scooter_obj.get_wheel_position(), scooter_obj.scooter_yaw_rotation, scooter_obj.blinking_left);
        score_element.innerHTML = "SCORE : " + curent_score + "  |  BEST : " + best_score;
        comment_element.innerHTML = "COMMENTS : <br><br>" + test_track.getMessage();
        curent_score = test_track.getscore();
        console.log(test_track.get_done());
        if (test_track.get_done()) {
            stopwatch.resetTimer();
            stopwatch.startTimer();
            test_track.init_track();
            scooter_obj.init_position();
        }
    }
    if (scooter_obj) {
        physics();
        var cam_dist = 10;
        var camdist_x = cam_dist * Math.cos(-scooter_obj.scooter_yaw_rotation);
        var camdist_y = cam_dist * Math.sin(-scooter_obj.scooter_yaw_rotation);
        camera.position.set(scooter_obj.get_position().x - camdist_x, scooter_obj.get_position().y + 5, scooter_obj.get_position().z - camdist_y);
        camera.lookAt(scooter_obj.get_position().x, scooter_obj.get_position().y, scooter_obj.get_position().z);
    }
    //UI update
}
function physics() {
    //Velocity of the scooter on the X axis
    var yaw_velocity = scooter_obj.velocity * scooter_obj.steering_angle / scooter_obj.b;
    scooter_obj.scooter_yaw_rotation += yaw_velocity;
    var x_vel = scooter_obj.velocity * Math.cos(scooter_obj.scooter_yaw_rotation + Math.PI / 2);
    var y_vel = scooter_obj.velocity * Math.sin(scooter_obj.scooter_yaw_rotation + Math.PI / 2);
    scooter_obj.scooter.position.x += y_vel;
    scooter_obj.scooter.position.z += x_vel;
    scooter_obj.scooter.setJointValue("steering_joint", scooter_obj.steering_angle);
    var phi = scooter_obj.transfer_function_steer_to_tilt(scooter_obj.steering_angle) - scooter_obj.transfer_function_steer_to_tilt(0);
    phi = phi * 100;
    if (phi < -0.8) {
        phi = -0.8;
    }
    else if (phi > 0.8) {
        phi = 0.8;
    }
    applyRotation(scooter_three, [phi, scooter_obj.scooter_yaw_rotation, 0]);
}
function applyRotation(obj, rpy, additive) {
    if (additive === void 0) { additive = false; }
    var tempQuaternion = new Quaternion();
    var tempEuler = new Euler();
    // if additive is true the rotation is applied in
    // addition to the existing rotation
    if (!additive)
        obj.rotation.set(0, 0, 0);
    tempEuler.set(rpy[0], rpy[1], rpy[2], 'ZYX');
    tempQuaternion.setFromEuler(tempEuler);
    tempQuaternion.multiply(obj.quaternion);
    obj.quaternion.copy(tempQuaternion);
}
function steer_keyboard() {
    nb_user_imput = 0;
    user_imput_done = true;
    var vel_update = 0.01;
    var steer_update = 0.1;
    if (!w_up) {
        scooter_obj.velocity += vel_update;
        scooter_obj.go_signal();
    }
    else if (!s_up) {
        scooter_obj.velocity -= vel_update;
        scooter_obj.stop_signal();
    }
    else {
        scooter_obj.go_signal();
    }
    if (!a_up) {
        scooter_obj.steering_angle += steer_update;
    }
    else if (!d_up) {
        scooter_obj.steering_angle -= steer_update;
    }
    if (a_up && d_up) {
        if (scooter_obj.steering_angle >= 0.05) {
            scooter_obj.steering_angle -= 0.05;
        }
        else if (scooter_obj.steering_angle <= -0.05) {
            scooter_obj.steering_angle += 0.05;
        }
    }
    check_angles();
}
function user_imput_up(event) {
    stopwatch.startTimer();
    if (event.key == "w") {
        w_up = true;
    }
    else if (event.key == "s") {
        s_up = true;
    }
    if (event.key == "a") {
        a_up = true;
    }
    else if (event.key == "d") {
        d_up = true;
    }
    if (event.key == "q") {
        if (!scooter_obj.blinking_left) {
            scooter_obj.stop_blink();
            scooter_obj.blink_left();
        }
        else {
            scooter_obj.stop_blink();
        }
    }
    else if (event.key == "e") {
        if (!scooter_obj.blinking_right) {
            scooter_obj.stop_blink();
            scooter_obj.blink_right();
        }
        else {
            scooter_obj.stop_blink();
        }
    }
}
function user_imput_down(event) {
    if (event.key == "w") {
        w_up = false;
    }
    else if (event.key == "s") {
        s_up = false;
    }
    if (event.key == "a") {
        a_up = false;
    }
    else if (event.key == "d") {
        d_up = false;
    }
}
function check_angles() {
    //controls
    if (scooter_obj.velocity < scooter_obj.min_x_velocity) {
        scooter_obj.velocity = scooter_obj.min_x_velocity;
    }
    else if (scooter_obj.velocity > scooter_obj.max_x_velocity) {
        scooter_obj.velocity = scooter_obj.max_x_velocity;
    }
    if (scooter_obj.steering_angle < scooter_obj.min_steering_angle) {
        scooter_obj.steering_angle = scooter_obj.min_steering_angle;
    }
    else if (scooter_obj.steering_angle > scooter_obj.max_steering_angle) {
        scooter_obj.steering_angle = scooter_obj.max_steering_angle;
    }
}
