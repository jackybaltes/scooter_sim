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

let spawn_x =-12.2;
let spawn_y =0.94;
let spawn_z =-15;




let a_up=true;
let d_up=true;
let w_up=true;
let s_up=true;

let test_track;
let scooter_loaded =false;

let user_imput_done = false;
let nb_user_imput = 0;

let velocity = 0.0; //m/s
let scooter_yaw_rotation = 0.0;
const max_x_velocity = 1;
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
    camera.position.set(-11, 10, 17);
    camera.lookAt(-11, 0, 17);
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

    const ambientLight = new AmbientLight(0xffffff, 0.01);
    scene.add(ambientLight);


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
        scooter.position.x = spawn_x;
        scooter.position.y = spawn_y;
        scooter.position.z = spawn_z;
        scooter.rotation.y = -Math.PI/2;
        scooter_yaw_rotation = -Math.PI/2;
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
    document.addEventListener("keydown",user_imput_down);
    document.addEventListener("keyup",user_imput_up);

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


    steer_keyboard();

    if(test_track)
    {
        if(test_track.get_done())
        {
            test_track.init_track()
            scooter.position.x = spawn_x;
            scooter.position.y = spawn_y;
            scooter.position.z = spawn_z;
            scooter.rotation.y = -Math.PI/2;
            scooter_yaw_rotation = -Math.PI/2;
            steering_angle =0.0;
            velocity =0.0;

        }
    }

    if(scooter_loaded)
    {
        physics();
        var cam_dist = 10;
        var camdist_x = cam_dist*Math.cos(-scooter_yaw_rotation);
        var camdist_y = cam_dist*Math.sin(-scooter_yaw_rotation);
        camera.position.set(scooter.position.x-camdist_x, scooter.position.y+5, scooter.position.z-camdist_y);
        camera.lookAt(scooter.position.x, scooter.position.y, scooter.position.z);
    }

}



function physics() 
{   
    if(test_track)
    {
        var point_x = a*Math.cos(-scooter_yaw_rotation);
        var point_y = a*Math.sin(-scooter_yaw_rotation);
        var wheel_position = new Vector3(scooter.position.x+point_x,scooter.position.y,scooter.position.z+point_y)
        test_track.update(wheel_position,scooter_yaw_rotation);
    }
    //Velocity of the scooter on the X axis
    var yaw_velocity = velocity*steering_angle/b;
    scooter_yaw_rotation+=yaw_velocity;
    var x_vel = velocity*Math.cos(scooter_yaw_rotation+Math.PI/2);
    var y_vel = velocity*Math.sin(scooter_yaw_rotation+Math.PI/2);
    scooter.position.x += y_vel;
    scooter.position.z += x_vel;
    scooter.setJointValue("steering_joint",steering_angle);
    var phi = transfer_function_steer_to_tilt(steering_angle)-transfer_function_steer_to_tilt(0);
    phi = phi*100;
    if(phi<-0.8)
    {
        phi = -0.8;
    }
    else if(phi>0.8)
    {
        phi=0.8;
    }
    applyRotation(scooter,[phi,scooter_yaw_rotation,0]);
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











function steer_keyboard()
{
    
    nb_user_imput = 0;
    user_imput_done = true;

    const vel_update = 0.01;
    const steer_update = 0.1;

    if(!w_up)
    {
        velocity += vel_update;
    }
    else if(!s_up)
    {
        velocity -= vel_update;
    }
    if(!a_up)
    {
        steering_angle+=steer_update;
    }
    else if(!d_up)
    {
        steering_angle-=steer_update;
    }

    if(a_up && d_up)
    {
        if(steering_angle>=0.05)
        {
            steering_angle-=0.05;
        }
        else if(steering_angle<=-0.05)
        {
            steering_angle+=0.05;
        }
    }
    check_angles();
}


function user_imput_up(event)
{
    if(event.key == "w")
    {
        w_up = true;
    }
    else if(event.key == "s")
    {
        s_up = true;
    }
    if(event.key == "a")
    {
        a_up=true;
    }
    else if(event.key == "d")
    {
        d_up=true;
    }
}




function user_imput_down(event)
{

    if(event.key == "w")
    {
        w_up = false;
    }
    else if(event.key == "s")
    {
        s_up = false;
    }
    if(event.key == "a")
    {
        a_up=false;
    }
    else if(event.key == "d")
    {
        d_up=false;
    }
    
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
