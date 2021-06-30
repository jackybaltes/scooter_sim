import {
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    DirectionalLight,
    Color,
    AmbientLight,
    LoadingManager,
    Quaternion,
    Object3D,
    Euler,
    Clock,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader, { URDFRobot } from '../urdf/src/URDFLoader.js';
import {Track} from './track.js';
import {Timer} from './timer.js';
import {Robot} from './robot.js'
import {ControlServer} from './server.js';
import {JBAnimation, TaiwanBear, TaiwanPolice, TaiwanCopMale } from './taiwan_bear.js';
import { loadOptions } from '@babel/core';
import JBGame from './jbgame';

class ScooterSimScene extends JBScene {

    constructor( game ) {
        super( game );
    }

    test = 0.0;
    g = 9.81;
    phi_vel=0.001;
    max_phi = 0.5
    phi = 0.0;

    prev_rx = 0;
    prev_ry = 0;

    //Score variables
    curent_score :number = 100
    best_score :number= 999

    //elements to modify the html page
    score_element :HTMLElement= document.getElementById("score");
    comment_element :HTMLElement= document.getElementById("comment");
    timer_element :HTMLElement= document.getElementById("timer");

    //Stopwatch used to show the time and TODO: add some score
    stopwatch :Timer;

    controlServer : ControlServer;
    stopWatch : Timer;
    background : Color;
    camera : PerspectiveCamera;
    renderer : WebGLRenderbuffer;
    controls : OrbitControls;

    updateables : Array<JBAnimation>;

    //Objects ThreeJs of the track and robot
    track :Object3D;
    scooter_three :URDFRobot;
    //Class used to controll the scooter
    test_track :Track;
    //Class used to controll the track
    scooter_obj:Robot;

    //Booleans to check user imputs
    a_up :boolean=true;
    d_up :boolean=true;
    w_up :boolean=true;
    s_up :boolean=true;

    //Scene initialisation
    init() {
        //setting the server to port 8878
        this.controlServer = new ControlServer(8878);

        //setting the HTML elements
        score_element.innerHTML = "";
        //creating the stopwatch
        this.stopWatch = new Timer();

        this.background = new Color(0x92fffb);
        
        this.camera = new PerspectiveCamera();
        this.camera.position.set(-11, 10, 17);
        this.camera.lookAt(-11, 0, 17);
        
        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
    
        const directionalLight :DirectionalLight = new DirectionalLight(0xffffff, 1.0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.setScalar(1024);
        directionalLight.position.set(30, 100, 5);
        directionalLight.target.position.set( 0, 0, 0 );
    
        const ambientLight :AmbientLight = new AmbientLight(0xffffff, 0.01);
        //ading the stuff to the scene
        this.add(directionalLight);
        this.add(ambientLight);

        this.controls = new OrbitControls(camera, renderer.domElement);
        this.controls.minDistance = 4;
        this.controls.target.y = 1;
        this.controls.update();
        // Load robot
        
        const manager :LoadingManager = new LoadingManager();
        const loader :URDFLoader = new URDFLoader(manager);
        loader.load('../assets/urdf/thormang3/urdf/all.urdf', result => {
            scooter_three = result;
        });

        let ref = this;
        manager.onLoad = () => {
            ref.add(scooter_three);
            ref.scooter_obj = new Robot(scooter_three);
            ref.scooter_obj.init_position();
        };
        
        const manager2 = new LoadingManager();
        const loader2 = new URDFLoader(manager2);
        loader2.load('../assets/urdf/track/urdf/model.urdf', result => {
            track = result;
        });
        
        manager2.onLoad = () => {
            track.rotation.x = -Math.PI/2;
            scene.add(track);
            test_track = new Track(track,render_no_physics);
            test_track.init_track()
            
        };
        
        const bear = new TaiwanBear( "pooh" );

        bear.init().then( () => {
            console.log("loaded taiwan bear Pooh", bear.model );
            const m = bear.home();
            console.log("Pooh", m );
            console.dir(m);
            //scene.add( m );
            //updateables.push( bear );
        });

        const pol1 = new TaiwanPolice( "marry" );
        const pol2 = new TaiwanCopMale( "chi tai" );
        
        pol1.init().then( () => {
            console.log("loaded taiwan police Marry", pol1.model );
            const m = pol1.home();
            console.log("Police 1", m );
            console.dir(m);
            scene.add( m );
            updateables.push( pol1 );
        });

        pol2.init().then( () => {
            console.log("loaded taiwan police Chi Tai", pol2.model );
            const m = pol2.home();
            console.log("Police Chi tai" );
            console.dir(m)

            scene.add( m );
            updateables.push( pol2 );
        });

        let count = 0;
        setInterval( function () {
            let msg = `State message ${count}`;  
            console.log( `Trying to send message ${msg}`);
            controlServer.send( msg ); 
            count++; }
        , 5000 );
   
        onResize();
        window.addEventListener('resize', onResize);
        document.addEventListener("keydown",user_imput_down);
        document.addEventListener("keyup",user_imput_up);

        this.updateables = new Array<JBAnimation>();
        this.clock = new Clock();
    }

    clock : Clock; 
    dt: number;

    //function used to render the scene but without aplying physics on the scooter
    render_no_physics() {
        requestAnimationFrame(render_no_physics);
        renderer.render(scene, camera);
    }



    onResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    tick() {
        dt = clock.getDelta();
        console.log(`tick: updateables ${updateables} ${dt}`);

        for (const object of updateables) {
        object.tick( dt );
        }
    }

    render() {

        requestAnimationFrame(render);
        tick();
    
    
        if(controlServer.velocity != 0)
        {
            scooter_obj.velocity = controlServer.velocity;
            scooter_obj.steering_angle = controlServer.steering_angle;    
        }
    
    
        if(scooter_obj)
        {
    
            steer_keyboard();
        }
    
        timer_element.innerHTML = stopwatch.getShowTime();
    
        if(test_track && scooter_obj)
        {
            console.log(scooter_obj.velocity == 0)
            test_track.update(scooter_obj.get_wheel_position(),scooter_obj.scooter_yaw_rotation,scooter_obj.blinking_left,scooter_obj.velocity == 0);
            score_element.innerHTML = "SCORE : "+curent_score+"  |  BEST : "+best_score;
            comment_element.innerHTML = "COMMENTS : <br><br>"+test_track.getMessage();
        
    
            curent_score = test_track.getscore();
            
            
            if(test_track.get_done() || phi>=max_phi || phi<=-max_phi)
            {
                stopwatch.resetTimer();
                stopwatch.startTimer();
                test_track.init_track()
                scooter_obj.init_position();
                phi =0.0;
                phi_vel = 0.001;
    
                prev_rx = 0;
                prev_ry = 0;
    
            }
            
            
        }
    
    
        if(scooter_obj)
        {
    
            physics();
            var cam_dist:number = 10;
            var camdist_x:number = cam_dist*Math.cos(-scooter_obj.scooter_yaw_rotation);
            var camdist_y:number = cam_dist*Math.sin(-scooter_obj.scooter_yaw_rotation);
            camera.position.set(scooter_obj.get_position().x-camdist_x, scooter_obj.get_position().y+5, scooter_obj.get_position().z-camdist_y);
            camera.lookAt(scooter_obj.get_position().x, scooter_obj.get_position().y, scooter_obj.get_position().z);
        }
    
        renderer.render(scene, camera);
    }
    
    
    
    physics() {   
        //Velocity of the scooter on the X axis
        if(scooter_obj.velocity !=0)
        {
            if(scooter_obj.steering_angle<0)
            {   
                var r :number  = Math.random()*-1; //random -1 to 1
                scooter_obj.steering_angle = scooter_obj.steering_angle+r/100;
            }
            else
            {
                var r :number  = Math.random(); //random -1 to 1
                scooter_obj.steering_angle = scooter_obj.steering_angle+r/100;
            }
        }
        //scooter_obj.move_arms();
    
        var yaw_velocity:number = scooter_obj.velocity*scooter_obj.steering_angle/scooter_obj.b;
        scooter_obj.scooter_yaw_rotation+=yaw_velocity;
        var x_vel:number = scooter_obj.velocity*Math.cos(scooter_obj.scooter_yaw_rotation+Math.PI/2);
        var y_vel:number = scooter_obj.velocity*Math.sin(scooter_obj.scooter_yaw_rotation+Math.PI/2);
        scooter_obj.scooter.setJointValue("steering_joint",scooter_obj.steering_angle);
        scooter_obj.scooter.position.x += y_vel;
        scooter_obj.scooter.position.z += x_vel;
    
        phi = scooter_obj.transfer_function_steer_to_tilt(scooter_obj.steering_angle)-scooter_obj.transfer_function_steer_to_tilt(0);
        phi = phi*1000*scooter_obj.velocity;
    
        if(scooter_obj.steering_angle>0 && phi_vel>0)
        {
            phi_vel *= 1 + scooter_obj.velocity ;
        }
        else if(scooter_obj.steering_angle>0 && phi_vel<0)
        {
            phi_vel += 0.01;
        }
        else if(scooter_obj.steering_angle<0 && phi_vel>0)
        {
            phi_vel -= 0.01;
        }
        else if(scooter_obj.steering_angle<0 && phi_vel<0)
        {
            phi_vel = -Math.abs(phi_vel)* (1+scooter_obj.velocity);//-Math.abs(phi_vel)*1.1;
        }
        
    
        if(phi_vel>0.8)
        {
            phi_vel = 0.8;
        }
        if(phi_vel<-0.8)
        {
            phi_vel = -0.8;
        }
    
    
        phi += phi_vel;
        
        
        if(phi<-max_phi)
        {
            phi = -max_phi;
        }
        else if(phi>max_phi)
        {
            phi=max_phi;
        }
    
        
        if(test != phi)
        {
    
            var delta = test-phi
            var a = Math.sin(phi)*(scooter_obj.h);
            var [rx,ry] = rotate_around(0,0, 0, a, -(scooter_obj.scooter_yaw_rotation+(Math.PI/2)))
    
            scooter_obj.scooter.position.x-=ry-prev_ry;
            scooter_obj.scooter.position.z-=rx-prev_rx;
    
            prev_rx = rx;
            prev_ry = ry;
    
    
        }
        
        test = phi;
    
        applyRotation(scooter_three,[phi,scooter_obj.scooter_yaw_rotation,0]);
    
        
    
    }
    
    applyRotation(obj, rpy, additive = false) {
        var tempQuaternion:Quaternion = new Quaternion();
        var tempEuler:Euler = new Euler();
        // if additive is true the rotation is applied in
        // addition to the existing rotation
        if (!additive) obj.rotation.set(0, 0, 0);
        tempEuler.set(rpy[0], rpy[1], rpy[2], 'ZYX');
        tempQuaternion.setFromEuler(tempEuler);
        tempQuaternion.multiply(obj.quaternion);
        obj.quaternion.copy(tempQuaternion);
    }
    
    
    
    
    rotate_around(cx, cy, x, y, radians) {
        var cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }
    
    steer_keyboard() {
        
        const vel_update :number= 0.12;
        const steer_update:number = 1.5;
    
        if(!w_up)
        {
            scooter_obj.velocity += vel_update * dt;
            scooter_obj.go_signal();
        }
        else if(!s_up)
        {
            scooter_obj.velocity -= vel_update * dt;
            scooter_obj.stop_signal();
        }
        else
        {
            scooter_obj.go_signal(); 
        }
    
        if(!a_up)
        {
            scooter_obj.steering_angle+=steer_update * dt;
        }
        else if(!d_up)
        {
            scooter_obj.steering_angle-=steer_update * dt;
        }
    
        // if(a_up && d_up && scooter_obj.velocity != 0)
        // {
    
        //     var update :number = 0.05;
        //     if(scooter_obj.steering_angle>=update)
        //     {
        //         scooter_obj.steering_angle-=update;
        //     }
        //     else if(scooter_obj.steering_angle<=-update)
        //     {
        //         scooter_obj.steering_angle+=update;
        //     }
        // }
        check_angles();
    }
    
    
    user_imput_up(event) {
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
    
    
    user_imput_down(event) {
    
        if(event.key == "w")
        {
            w_up = false;
        }
        else if(event.key == "s")
        {
            s_up = false;
        }
        if(event.key == "a") {
            a_up=false;
        }
        else if(event.key == "d")
        {
            d_up=false;
        }
        
    }
    
    
    check_angles() {
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
}


