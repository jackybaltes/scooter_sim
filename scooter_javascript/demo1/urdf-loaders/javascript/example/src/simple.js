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
import {Timer} from './timer.js';
import {Robot} from './robot.js'



let curent_score = 100
let best_score = 999

let score_element = document.getElementById("score");
let comment_element = document.getElementById("comment");
let timer_element = document.getElementById("timer");
let stopwatch;

let scene, camera, renderer, track, scooter_three,scooter_obj, controls;

let a_up=true;
let d_up=true;
let w_up=true;
let s_up=true;

let test_track;
let scooter_loaded =false;

let user_imput_done = false;
let nb_user_imput = 0;
let log_flag = false


init();
render();


function render_no_physics()
{
    requestAnimationFrame(render_no_physics);
    renderer.render(scene, camera);
}


function init() {



    score_element.innerHTML = "caca";
    stopwatch = new Timer();

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
        scooter_three = result;
    });
    manager.onLoad = () => {
        scene.add(scooter_three);
        scooter_obj = new Robot(scooter_three);
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

    if(scooter_loaded)
    {

        steer_keyboard();
    }

    timer_element.innerHTML = stopwatch.getShowTime();

    if(test_track && scooter_loaded)
    {
        test_track.update(scooter_obj.get_wheel_position(),scooter_obj.scooter_yaw_rotation,scooter_obj.blinking_left);
        score_element.innerHTML = "SCORE : "+curent_score+"  |  BEST : "+best_score;
        comment_element.innerHTML = "COMMENTS : <br><br>"+test_track.getMessage();
    

        curent_score = test_track.getscore();
        
        if(test_track.get_done())
        {
            stopwatch.resetTimer();
            stopwatch.startTimer();
            test_track.init_track()
            scooter_obj.init_position();
        }
        
    }


    if(scooter_loaded)
    {

        physics();
        var cam_dist = 10;
        var camdist_x = cam_dist*Math.cos(-scooter_obj.scooter_yaw_rotation);
        var camdist_y = cam_dist*Math.sin(-scooter_obj.scooter_yaw_rotation);
        camera.position.set(scooter_obj.get_position().x-camdist_x, scooter_obj.get_position().y+5, scooter_obj.get_position().z-camdist_y);
        camera.lookAt(scooter_obj.get_position().x, scooter_obj.get_position().y, scooter_obj.get_position().z);
    }



    //UI update


}



function physics() 
{   
    //Velocity of the scooter on the X axis
    var yaw_velocity = scooter_obj.velocity*scooter_obj.steering_angle/scooter_obj.b;
    scooter_obj.scooter_yaw_rotation+=yaw_velocity;
    var x_vel = scooter_obj.velocity*Math.cos(scooter_obj.scooter_yaw_rotation+Math.PI/2);
    var y_vel = scooter_obj.velocity*Math.sin(scooter_obj.scooter_yaw_rotation+Math.PI/2);
    scooter_obj.scooter.position.x += y_vel;
    scooter_obj.scooter.position.z += x_vel;
    scooter_obj.scooter.setJointValue("steering_joint",scooter_obj.steering_angle);
    var phi = scooter_obj.transfer_function_steer_to_tilt(scooter_obj.steering_angle)-scooter_obj.transfer_function_steer_to_tilt(0);
    phi = phi*100;
    if(phi<-0.8)
    {
        phi = -0.8;
    }
    else if(phi>0.8)
    {
        phi=0.8;
    }
    applyRotation(scooter_three,[phi,scooter_obj.scooter_yaw_rotation,0]);
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










function steer_keyboard()
{
    
    nb_user_imput = 0;
    user_imput_done = true;

    const vel_update = 0.01;
    const steer_update = 0.1;

    if(!w_up)
    {
        scooter_obj.velocity += vel_update;
        scooter_obj.go_signal();
    }
    else if(!s_up)
    {
        scooter_obj.velocity -= vel_update;
        scooter_obj.stop_signal();
    }
    else
    {
        scooter_obj.go_signal(); 
    }

    if(!a_up)
    {
        scooter_obj.steering_angle+=steer_update;
    }
    else if(!d_up)
    {
        scooter_obj.steering_angle-=steer_update;
    }

    if(a_up && d_up)
    {
        if(scooter_obj.steering_angle>=0.05)
        {
            scooter_obj.steering_angle-=0.05;
        }
        else if(scooter_obj.steering_angle<=-0.05)
        {
            scooter_obj.steering_angle+=0.05;
        }
    }
    check_angles();
}


function user_imput_up(event)
{
    stopwatch.startTimer();
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


    if(event.key == "q")
    {

        if(!scooter_obj.blinking_left)
        {
            scooter_obj.stop_blink();
            scooter_obj.blink_left();
        }else
        {
            scooter_obj.stop_blink();
        }

    
    }
    else if(event.key == "e")
    {
        
        if(!scooter_obj.blinking_right)
        {
            scooter_obj.stop_blink();
            scooter_obj.blink_right();
        }else
        {
            scooter_obj.stop_blink();
        }

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
    if( scooter_obj.velocity<scooter_obj.min_x_velocity)
    {
        scooter_obj.velocity = scooter_obj.min_x_velocity;
    }
    else if( scooter_obj.velocity>scooter_obj.max_x_velocity)
    {
        scooter_obj.velocity = scooter_obj.max_x_velocity;
    }

    if( scooter_obj.steering_angle<scooter_obj.min_steering_angle)
    {
        scooter_obj.steering_angle = scooter_obj.min_steering_angle;
    }
    else if( scooter_obj.steering_angle>scooter_obj.max_steering_angle)
    {
        scooter_obj.steering_angle = scooter_obj.max_steering_angle;
    }
}
