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
import {Track} from './track';
import {Timer} from './timer';
import {Robot} from './robot'
import {ControlServer} from './controlserver';
import { JBAnimation } from './jbanimation';
import { TaiwanBear } from './taiwanbear';
import { TaiwanPolice, TaiwanCopMale } from './taiwancop';
import { JBScene } from './jbscene';
import { JBGame } from './jbgame';

enum SimChapter {
    FreeDriving = "Free Driving",
    SlowDriving = "Slow Driving",
    HookTurn = "Hook Turn",
    DrivingTest = "Driving Test",
}

class ScooterSimScene extends JBScene {
    g = 9.81;
    test = 0.0;
    phi_vel=0.001;
    max_phi = 0.5
    phi = 0.0;

    prev_rx = 0;
    prev_ry = 0;

    //Score variables
    curent_score :number = 100
    best_score :number= 999
        
    //elements to modify the html page
    score_element : HTMLElement;
    comment_element : HTMLElement;
    timer_element : HTMLElement;

    //Stopwatch used to show the time and TODO: add some score
    stopwatch :Timer;

    controlServer : ControlServer;
    background : Color;
    //camera : PerspectiveCamera;
    controls : OrbitControls;

    updateables = new Array<JBAnimation>(); 

    //Objects ThreeJs of the track and robot
    track :Object3D;
    scooter_three :URDFRobot;
    //Class used to controll the scooter
    test_track :Track;
    //Class used to controll the track
    scooterObj:Robot;

    //Booleans to check user inputs
    a_up :boolean=true;
    d_up :boolean=true;
    w_up :boolean=true;
    s_up :boolean=true;

    constructor( name : string, game : JBGame ) {
        super( name, game );
    }

    async preload() {
        super.preload();
        console.log("ScooterSimScene preload");

        const manager :LoadingManager = new LoadingManager();
        const loader :URDFLoader = new URDFLoader(manager);
        loader.load('../assets/urdf/thormang3/urdf/all.urdf', result => {
            this.scooter_three = result;
        });

        let ref = this;
        manager.onLoad = () => {
            ref.add( this.scooter_three );
            ref.scooterObj = new Robot( this.scooter_three );
            ref.scooterObj.init_position();
        };
        
        const manager2 = new LoadingManager();
        const loader2 = new URDFLoader(manager2);
        loader2.load('../assets/urdf/track/urdf/model.urdf', result => {
            this.track = result;
        });
        
        manager2.onLoad = () => {
            this.track.rotation.x = -Math.PI/2;
            this.add( this.track );
            this.test_track = new Track( this.track ); //, render_no_physics );
            this.test_track.init_track()
        };
        
        const bear = new TaiwanBear( "pooh" );

        await bear.init()
        
        console.log("loaded taiwan bear Pooh", bear.model );
        let m;

        m = bear.home();
        console.log("Pooh", m );
        console.dir(m);
        //scene.add( m );
        //updateables.push( bear );
    
        const pol1 = new TaiwanPolice( "marry" );
        const pol2 = new TaiwanCopMale( "chi tai" );
        
        await pol1.init()
        console.log("loaded taiwan police Marry", pol1.model );
        m = pol1.home();
        console.log("Police 1", m );
        console.dir(m);
        this.add( m );
        this.updateables.push( pol1 );
    
        await pol2.init()
        
        console.log("loaded taiwan police Chi Tai", pol2.model );
        m = pol2.home();
        console.log("Police Chi tai" );
        console.dir(m)

        this.add( m );
        this.updateables.push( pol2 );
    }

    html = `
    <div id="menu">
            <div style="color: rgb(0, 0, 0);">
                <select id="cb_camera_view" class="combobox" type=text list=value>
                    <option value="cb_follow">Follow Camera</option>
                    <option value="cb_orbit">Orbit View</option>
                    <!-- <option value="cb_free">Free Camera</option> -->
                </select>
            </div>
            <div>
                <div style="color: rgb(0, 0, 0); position: relative; width: 90vw;">
                    <span id ="score" style="color: rgb(0, 0, 0);"> SCORE : 1000  |  BEST : 99999 </span>
                    <span id ="comment" style="color: rgb(0, 0, 0); position: absolute; top: 0; right: 0; width: 200px; word-wrap: break-word;"> COMMENT  tttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt</span>
                </div>
                <div id ="timer" style="color: rgb(0, 0, 0);">TIMER = 00:00:00</div>
            </div>
        </div>
    </div>
    `;

    createDOM( ) {
        let gel = document.getElementById("game");

        let h = document.createElement('div');
        
        h.innerHTML = this.html;

        gel.appendChild( h );

        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        gel.appendChild( this.renderer.domElement );

        this.score_element = document.getElementById("score");
        this.comment_element = document.getElementById("comment");
        this.timer_element = document.getElementById("timer");
    
        console.log("ScooterSimScene create");
    }

    async enter( prev : JBScene ) {

        await this.preload(); 
        console.log( `ScooterSimScene enter ${prev}`);
        
        this.createDOM();

        console.log("ScooterSimScene create after preload");
        //setting the HTML elements
        this.score_element.innerHTML = "";
        //creating the stopwatch
        this.stopwatch = new Timer();

        this.background = new Color(0x92fffb);
        
        this.camera = new PerspectiveCamera();
        this.camera.position.set( -11, 10, 17 );
        this.camera.lookAt( -11, 0, 17 );
        
        // this.renderer = new WebGLRenderer({ antialias: false });
        // //renderer.outputEncoding = sRGBEncoding;
        // //renderer.shadowMap.enabled = true;
        // //renderer.shadowMap.type = PCFSoftShadowMap;
        // document.body.appendChild( this.renderer.domElement );
    
        const directionalLight : DirectionalLight = new DirectionalLight(0xffffff, 1.0);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.setScalar(1024);
        directionalLight.position.set(30, 100, 5);
        directionalLight.target.position.set( 0, 0, 0 );
    
        const ambientLight : AmbientLight = new AmbientLight(0xffffff, 0.01);
        //ading the stuff to the scene
        this.add( directionalLight );
        this.add(ambientLight);

        this.controls = new OrbitControls( this.camera, this.renderer.domElement);
        this.controls.minDistance = 4;
        this.controls.target.y = 1;
        this.controls.update();
        // Load robot
        
        let count = 0;
        setInterval( function () {
            let msg = `State message ${count}`;  
            console.log( `Trying to send message ${msg}`);
            this.controlServer.send( msg ); 
            count++; }
        , 5000 );

        this._onResize();
        window.addEventListener('resize', this.onResize );
        document.addEventListener("keydown", this.user_input_down);
        document.addEventListener("keyup", this.user_input_up);

        this.clock = new Clock();

        //setting the server to port 8878
        this.controlServer = new ControlServer(8878);
    }

    clock : Clock = new Clock(); 
    dt: number;

    tick() {

        this.dt = this.clock.getDelta();
        console.log("ScooterSimScene tick");
        console.log( `ScooterSimScene tick scooter ${this.scooterObj} controlServer ${this.controlServer}` );
    
        console.log(`tick: updateables ${this.updateables} dt ${this.dt}`);

        if( this.scooterObj == null ) {
            return;
        }

        if( this.controlServer.velocity != 0) {
            this.scooterObj.velocity = this.controlServer.velocity;
            this.scooterObj.steering_angle = this.controlServer.steering_angle;    
        }
    
        if( this.scooterObj ) {
            this.steer_keyboard();
        }
    
        this.timer_element.innerHTML = this.stopwatch.getShowTime();
    
        if( this.test_track && this.scooterObj ) {
            this.test_track.update( this.scooterObj.get_wheel_position(),
                                    this.scooterObj.scooter_yaw_rotation,
                                    this.scooterObj.blinking_left,
                                    this.scooterObj.velocity == 0 );
            this.score_element.innerHTML = "SCORE : " + this.curent_score + "  |  BEST : " + this.best_score;
            this.comment_element.innerHTML = "COMMENTS : <br><br>" + this.test_track.getMessage();
        
            this.curent_score = this.test_track.getscore();
            
            if (true) { // (this.phase !== SimChapter.FreeDriving ) {
                if( this.test_track.get_done() || this.phi >= this.max_phi || this.phi <= - this.max_phi ) {
                    this.stopwatch.resetTimer();
                    this.stopwatch.startTimer();
                    this.test_track.init_track()
                    this.scooterObj.init_position();
                    this.phi =0.0;
                    this.phi_vel = 0.001;
        
                    this.prev_rx = 0;
                    this.prev_ry = 0;
                }
            }
        }
    
        if( this.scooterObj ) {
            this.physics();
            let cam_dist : number = 10;
            let camdist_x : number = cam_dist*Math.cos( - this.scooterObj.scooter_yaw_rotation );
            let camdist_y : number = cam_dist*Math.sin( - this.scooterObj.scooter_yaw_rotation );

            let view = document.getElementById( "cb_camera_view" );

            let e = (document.getElementById("cb_camera_view")) as HTMLSelectElement;
            let sel = e.selectedIndex;
            let opt = e.options[sel];
            let cb_view = (<HTMLOptionElement>opt).value;

            if ( cb_view == "cb_follow" ) {
                this.camera.position.set( this.scooterObj.get_position().x - camdist_x, this.scooterObj.get_position().y+5, this.scooterObj.get_position().z-camdist_y);
                this.camera.lookAt( this.scooterObj.get_position().x, this.scooterObj.get_position().y, this.scooterObj.get_position().z );
            }
        }
            
        for (const object of this.updateables) {
            object.tick( this.dt );
        }

        this.renderer.render( this, this.camera );
    }
    
    physics() {   
        //Velocity of the scooter on the X axis
        if( this.scooterObj.velocity !=0 ) {
            if( this.scooterObj.steering_angle<0 ) {   
                var r :number  = Math.random()*-1; //random -1 to 1
                this.scooterObj.steering_angle = this.scooterObj.steering_angle + r/100;
            } else {
                var r :number  = Math.random(); //random -1 to 1
                this.scooterObj.steering_angle = this.scooterObj.steering_angle + r/100;
            }
        }
        this.scooterObj.move_arms();
    
        let yaw_velocity:number = this.scooterObj.velocity * this.scooterObj.steering_angle / this.scooterObj.b;
        this.scooterObj.scooter_yaw_rotation += yaw_velocity;
        let x_vel:number = this.scooterObj.velocity * Math.cos( this.scooterObj.scooter_yaw_rotation + Math.PI/2 );
        let y_vel:number = this.scooterObj.velocity * Math.sin( this.scooterObj.scooter_yaw_rotation + Math.PI/2 );
        this.scooterObj.scooter.setJointValue( "steering_joint",this.scooterObj.steering_angle );
        this.scooterObj.scooter.position.x += y_vel;
        this.scooterObj.scooter.position.z += x_vel;
    
        this.phi = this.scooterObj.transfer_function_steer_to_tilt( this.scooterObj.steering_angle ) - this.scooterObj.transfer_function_steer_to_tilt( 0 );
        this.phi = this.phi * 1000 * this.scooterObj.velocity;
    
        if( this.scooterObj.steering_angle>0 && this.phi_vel>0 ) {
            this.phi_vel *= 1 + this.scooterObj.velocity;
        } else if( ( this.scooterObj.steering_angle > 0 ) && ( this.phi_vel < 0 ) ) {
            this.phi_vel += 0.01;
        } else if( ( this.scooterObj.steering_angle < 0 ) && ( this.phi_vel > 0 ) ) {
            this.phi_vel -= 0.01;
        } else if( ( this.scooterObj.steering_angle < 0 ) && ( this.phi_vel < 0 ) ) {
            this.phi_vel = - Math.abs( this.phi_vel ) * ( 1 + this.scooterObj.velocity );//-Math.abs(phi_vel)*1.1;
        }
        
        if( this.phi_vel > 0.8 ) {
            this.phi_vel = 0.8;
        }

        if( this.phi_vel < -0.8 ) {
            this.phi_vel = -0.8;
        }
    
        this.phi += this.phi_vel;
        
        if( this.phi < - this.max_phi ) {
            this.phi = - this.max_phi;
        } else if( this.phi > this.max_phi ) {
            this.phi = this.max_phi;
        }
    
        if( this.test != this.phi ) {
            let delta = this.test - this.phi
            let a = Math.sin( this.phi ) * ( this.scooterObj.h );
            let [rx,ry] = this.rotate_around( 0, 0, 0, a, - ( this.scooterObj.scooter_yaw_rotation + ( Math.PI/2 ) ) );
    
            this.scooterObj.scooter.position.x -= ry - this.prev_ry;
            this.scooterObj.scooter.position.z -= rx - this.prev_rx;
    
            this.prev_rx = rx;
            this.prev_ry = ry;
        }
        
        this.test = this.phi;
    
        this.applyRotation( this.scooter_three, [ this.phi, this.scooterObj.scooter_yaw_rotation, 0 ] );
    }
    
    applyRotation( obj, rpy, additive = false) {
        var tempQuaternion:Quaternion = new Quaternion();
        var tempEuler:Euler = new Euler();
        // if additive is true the rotation is applied in
        // addition to the existing rotation
        if ( !additive ) {
            obj.rotation.set(0, 0, 0);
        }

        tempEuler.set( rpy[0], rpy[1], rpy[2], 'ZYX');
        tempQuaternion.setFromEuler( tempEuler );
        tempQuaternion.multiply( obj.quaternion );
        obj.quaternion.copy( tempQuaternion );
    }
    
    
    rotate_around( cx, cy, x, y, radians) {
        var cos = Math.cos( radians ),
            sin = Math.sin( radians ),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }
    
    steer_keyboard() { 
        const vel_update :number= 0.12;
        const steer_update:number = 1.5;
    
        if( ! this.w_up ) {
            this.scooterObj.velocity += vel_update * this.dt;
            this.scooterObj.go_signal();
        } else if( ! this.s_up ) {
            this.scooterObj.velocity -= vel_update * this.dt;
            this.scooterObj.stop_signal();
        } else {
            this.scooterObj.go_signal(); 
        }
    
        if( ! this.a_up ) {
            this.scooterObj.steering_angle += steer_update * this.dt;
        } else if( ! this.d_up ) {
            this.scooterObj.steering_angle -= steer_update * this.dt;
        }
    
        // if(a_up && d_up && scooterObj.velocity != 0)
        // {
    
        //     var update :number = 0.05;
        //     if(scooterObj.steering_angle>=update)
        //     {
        //         scooterObj.steering_angle-=update;
        //     }
        //     else if(scooterObj.steering_angle<=-update)
        //     {
        //         scooterObj.steering_angle+=update;
        //     }
        // }
        this.check_angles();
    }
    
    
    _user_input_up(event) {
        if ( this.stopwatch !== null ) {
            this.stopwatch.startTimer();
        }

        if(event.key == "w") {
            this.w_up = true;
        } else if(event.key == "s") {
            this.s_up = true;
        }

        if(event.key == "a") {
            this.a_up=true;
        } else if(event.key == "d") {
            this.d_up=true;
        }
    
        if(event.key == "q") {
            if(! this.scooterObj.blinking_left) {
                this.scooterObj.stop_blink();
                this.scooterObj.blink_left();
            } else {
                this.scooterObj.stop_blink();
            }
        } else if(event.key == "e") {
            if(! this.scooterObj.blinking_right) {
                this.scooterObj.stop_blink();
                this.scooterObj.blink_right();
            } else {
                this.scooterObj.stop_blink();
            }
        }
    }
    
    user_input_up = this._user_input_up.bind( this );

    _user_input_down(event) {
        if(event.key == "w") {
            this.w_up = false;
        } else if(event.key == "s") {
            this.s_up = false;
        } if(event.key == "a") {
            this.a_up=false;
        } else if(event.key == "d") {
            this.d_up=false;
        }
    }
    
    user_input_down = this._user_input_down.bind( this );
    
    check_angles() {
        //controls
        if( this.scooterObj.velocity < this.scooterObj.min_x_velocity ) {
            this.scooterObj.velocity = this.scooterObj.min_x_velocity;
        } else if( this.scooterObj.velocity > this.scooterObj.max_x_velocity ) {
            this.scooterObj.velocity = this.scooterObj.max_x_velocity;
        }
    
        if( this.scooterObj.steering_angle < this.scooterObj.min_steering_angle ) {
            this.scooterObj.steering_angle = this.scooterObj.min_steering_angle;
        } else if( this.scooterObj.steering_angle > this.scooterObj.max_steering_angle) {
            this.scooterObj.steering_angle = this.scooterObj.max_steering_angle;
        }
    }

    _onResize() {
        super._onResize();

        if ( this.camera !== null ) {
            let cam = this.camera as PerspectiveCamera;
            cam.aspect = window.innerWidth / window.innerHeight;
            cam.updateProjectionMatrix();
        }
    }

    onResize = this._onResize.bind( this );

}

export { ScooterSimScene, SimChapter } ;
