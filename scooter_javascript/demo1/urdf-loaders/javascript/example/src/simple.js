import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    Mesh,
    PlaneBufferGeometry,
    ShadowMaterial,
    MeshPhongMaterial,
    DirectionalLight,
    PCFSoftShadowMap,
    sRGBEncoding,
    Color,
    AmbientLight,
    Box3,
    LoadingManager,
    MathUtils,
    Vector2,
    Quaternion,
    Vector3,
    Euler,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from '../../src/URDFLoader.js';
import {Track} from './track.js';


let scene, camera, renderer, track, scooter, controls;

let test_track;
let scooter_loaded =false;

let user_imput_done = false;

let velocity = 0.0; //m/s
let scooter_yaw_rotation = 0.0;
const max_x_velocity = 10;
const min_x_velocity = 0;
let steering_angle = 0.0;
const max_steering_angle = 0.5235;
const min_steering_angle = -0.5235;

const m = 125; //mass of scooter + robot in kg
const h = 0.98; // height of the center of mass
const b = 1.184012; //inter wheel distance=
const a = b/2;
const g= 9.806;
/*
const m_i = (1/12)*m
const box_h = 1.5;
const box_w = 0.6;
const box_d = 1.5;
*/

var J = m*Math.pow(h,2); //aprox
var D = m*a*h;


let log_flag = false



init();
render();


function render_no_physics()
{
    requestAnimationFrame(render_no_physics);
    renderer.render(scene, camera);
}


function init() {

    scene = new Scene();
    scene.background = new Color(0x92fffb);
    camera = new PerspectiveCamera();
    camera.position.set(0, 10, 0);
    camera.lookAt(-10,0,10);
    renderer = new WebGLRenderer({ antialias: false });
    //renderer.outputEncoding = sRGBEncoding;
    //renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
    const directionalLight = new DirectionalLight(0xffffff, 1.0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.setScalar(1024);
    directionalLight.position.set(5, 30, 5);
    scene.add(directionalLight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 4;
    controls.target.y = 1;
    controls.update();

    // Load robot
    
    const manager = new LoadingManager();
    const loader = new URDFLoader(manager);
    loader.load('../../urdf/thormang3/urdf/all.urdf', result => {
        scooter = result;
    });
    manager.onLoad = () => {
        scooter.position.x = -12.2;
        scooter.position.y = 0.94;
        scooter.position.z = -15.15;
        //scooter.rotation.y = -Math.PI/2;
        scene.add(scooter);
        scooter_loaded = true;
    };
    
    const manager2 = new LoadingManager();
    const loader2 = new URDFLoader(manager2);
    loader2.load('../../urdf/track/urdf/model.urdf', result => {
        track = result;
    });
    
    manager2.onLoad = () => {
        track.rotation.x = - Math.PI/2;
        scene.add(track);
        test_track = new Track(track,render_no_physics);
        test_track.init_track()
        
    };
    
    onResize();
    window.addEventListener('resize', onResize);
    document.addEventListener("keydown",user_imput);
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
    if(scooter_loaded)
    {
        physics();

    }

}




function user_imput(event)
{
    const vel_update = 0.1;
    const steer_update = 0.05;

    //console.log(`Key pressed: ${event.key}`);
    if(event.key == "w")
    {
        velocity += vel_update;
    }
    else if(event.key == "s")
    {
        velocity -= vel_update;
    }
    else if(event.key == "a")
    {
        steering_angle+=steer_update;
    }
    else if(event.key == "d")
    {
        steering_angle-=steer_update;
    }
    user_imput_done = true
}



function check_angles()
{
    //controls
    if( velocity<min_x_velocity)
    {
        velocity = min_x_velocity;
    }
    else if( velocity>max_x_velocity)
    {
        velocity = max_x_velocity;
    }

    if( steering_angle<min_steering_angle)
    {
        steering_angle = min_steering_angle;
    }
    else if( steering_angle>max_steering_angle)
    {
        steering_angle = max_steering_angle;
    }
}


function physics() 
{   
    if(test_track)
    {
        test_track.update(scooter.position);
        check_angles();
    }
    //Velocity of the scooter on the X axis
    var yaw_velocity = velocity*steering_angle/b;
    scooter_yaw_rotation+=yaw_velocity;
    var x_vel = velocity*Math.cos(scooter_yaw_rotation+Math.PI/2);
    var y_vel = velocity*Math.sin(scooter_yaw_rotation+Math.PI/2);
    scooter.position.x += y_vel;
    scooter.position.z += x_vel;
    scooter.setJointValue("steering_joint",steering_angle);
    var phi = transfer_function_steer_to_tilt(steering_angle);
    applyRotation(scooter,[phi*100,scooter_yaw_rotation,0]);
}

function applyRotation(obj, rpy, additive = false) {
    var tempQuaternion = new Quaternion();
    var tempEuler = new Euler();
    // if additive is true the rotation is applied in
    // addition to the existing rotation
    if (!additive) obj.rotation.set(0, 0, 0);
    tempEuler.set(rpy[0], rpy[1], rpy[2], 'ZYX');
    tempQuaternion.setFromEuler(tempEuler);
    tempQuaternion.multiply(obj.quaternion);
    obj.quaternion.copy(tempQuaternion);

}

//take stearing and convert it to the tilt
function transfer_function_steer_to_tilt(s)
{
    return ((a*velocity)/(b*h)) * ( (s+(velocity/a) )/( (Math.pow(s,2)-(g/h))  ));
}








