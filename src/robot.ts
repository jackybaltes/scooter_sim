import {
    Vector3,
    Color,
    Matrix3,
    Matrix4,
    Euler,
} from 'three';

import { 
    Matrix,
    pseudoInverse,
} from 'ml-matrix';

export class Robot{

    public scooter;
    public velocity:number; //m/s
    public scooter_yaw_rotation:number;
    public max_x_velocity:number;
    public min_x_velocity:number;
    public steering_angle:number;
    public max_steering_angle:number;
    public min_steering_angle:number;
    protected m:number; //mass of scooter + robot in kg
    public h:number; // height of the center of mass
    public b:number; //inter wheel distance=
    protected a:number;
    public g:number;
    protected J:number;//aprox
    protected D:number;
    public spawn_x:number;
    public spawn_y:number;
    public spawn_z:number;

    protected orange:Color;
    protected red:Color;
    protected green:Color;
    protected black:Color;

    protected blinker_l;
    protected blinker_r;
    protected stop_light;
    protected sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

    public blinking_left:boolean;
    public blinking_right:boolean;

    public q1:number;
    public q2:number;
    public q3:number;
    public q4:number;
    public q5:number;
    public q6:number;
    public q7:number;
    public q8:number;
    public q9:number;
    public s1:number;
    public c1:number;
    public s2:number;
    public c2:number;
    public s3:number;
    public c3:number;
    public s4:number;
    public c4:number;
    public s5:number;
    public c5:number;
    public s6:number;
    public c6:number;
    public s7:number;
    public c7:number;
    public s8:number;
    public c8:number;
    public s9:number;
    public c9:number;


    protected last_pose_L:Matrix;
    protected start_pose_L:Matrix;
    protected last_pose_R:Matrix;
    protected start_pose_R:Matrix;

    public phi:number;
    public lean:number;

    protected test ;
    protected phi_vel;
    public max_phi;
    protected prev_rx:number;
    protected prev_ry:number;
    protected crash_frames_countdown:number;


    constructor(robot_three)
    {   
        this.scooter = robot_three;
        this.velocity = 0.0; //m/s
        this.scooter_yaw_rotation = 0.0;
        this.max_x_velocity = 1;
        this.min_x_velocity = 0;
        this.steering_angle = 0.0;
        this.max_steering_angle = 0.6;
        this.min_steering_angle = -0.6;

        this.phi_vel=0.001;
        this.max_phi = 0.5
        this.prev_rx=0;
        this.prev_ry=0;
        this.test = 0.0;
        this.crash_frames_countdown;

        this.m = 125; //mass of scooter + robot in kg
        this.h = 0.89; // height of the center of mass
        this.b = 1.184012; //inter wheel distance=
        this.a = this.b/2;
        this.g= 5.0; //low gravity mode else it's too hard
        this.J = this.m*Math.pow(this.h,2); //aprox
        this.D = this.m*this.a*this.h;
        this.spawn_x =-12.2;
        this.spawn_y =0.94;
        this.spawn_z =-15;

        this.orange= new Color(255,69,0);
        this.red= new Color(255,0,0);
        this.green= new Color(0,255,0);
        this.black= new Color(0,0,0);

        this.blinker_l = this.scooter.links["blinker_left"].children[0].children[0].material
        this.blinker_r = this.scooter.links["blinker_right"].children[0].children[0].material
        this.stop_light = this.scooter.links["stop_light"].children[0].children[0].material
        this.sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

        this.blinking_left = false;
        this.blinking_right = false;


        this.start_pose_L = new Matrix([[0.,0.,-Math.PI/2,Math.PI,-Math.PI/2,Math.PI/2,0.,-Math.PI/2,0.]]);
        this.last_pose_L = new Matrix([[0.,0.,0.,Math.PI/2,0.,0.,0.,0.,0.]]);

        this.start_pose_R = new Matrix([[0.,0.,-Math.PI/2,Math.PI,-Math.PI/2,-Math.PI/2,0.,Math.PI/2,0.]]);
        this.last_pose_R = new Matrix([[0.,0.,0.,-Math.PI/2,0.,0.,0.,0.,0.]]);

    }



    init_position( pos) {
        this.scooter.position.x = pos[0];
        this.scooter.position.y = pos[1];
        this.scooter.position.z = pos[2];
        this.scooter.rotation.y = pos[3];

        //this.scooter.rotation.y = -Math.PI/2;
        this.scooter_yaw_rotation = pos[3];
        var r = (Math.random()-0.5)*2; //random -1 to 1
        this.steering_angle = 0; // r/5;
        //this.steering_angle = 0.0;
        this.phi=0;
        this.lean=0;
        this.prev_rx=0;
        this.prev_ry=0;
        this.test = 0.0;
        this.phi_vel = 0.001;
        this.velocity =0.0;
        this.crash_frames_countdown =0;
    }


    change_color(obj,color):void
    {
        obj.color.set(color);
        obj.emissive.set(color);
        obj.specular.set(color);
        obj.needsUpdate = true;
    }



    get_wheel_position(): Vector3
    {

        var point_x = this.a*Math.cos(-this.scooter_yaw_rotation);
        var point_y = this.a*Math.sin(-this.scooter_yaw_rotation);
        var wheel_position = new Vector3(this.scooter.position.x+point_x,this.scooter.position.y,this.scooter.position.z+point_y)
        return wheel_position
    }



    get_position()
    {
        return this.scooter.position
    }



    transfer_function_steer_to_tilt(s)
    {
        return ((this.a*this.velocity)/(this.b*this.h)) * ( (s+(this.velocity/this.a) )/( (Math.pow(s,2)-(this.g/this.h))  ));
        //return ((this.a*this.velocity)/(this.b*this.h)) * ( (s+(this.velocity/this.a) )/( (Math.pow(s,2)-(this.g/this.h))  ));
    }

    stop_signal() {
        this.change_color(this.stop_light,this.red);
    }

    go_signal()
    {
        this.change_color(this.stop_light,this.black);
    }


    async stop_blink()
    {
        this.blinking_left = false;
        this.blinking_right = false;

        this.change_color(this.blinker_l,this.black);
        this.change_color(this.blinker_r,this.black);
    }


    async blink_right()
    {
        if(!this.blinking_right)
        {
            this.blinking_right = true;
            while(this.blinking_right)
            {
                this.change_color(this.blinker_r,this.black);
                this.change_color(this.blinker_l,this.black);

                await this.sleep(500);
                this.change_color(this.blinker_r,this.orange);
                this.change_color(this.blinker_l,this.black);

                await this.sleep(500);
            }
        }    
        this.change_color(this.blinker_l,this.black);
        this.change_color(this.blinker_r,this.black);    
    }


    async blink_left()
    {
        if(!this.blinking_left)
        {
            this.blinking_left = true;
            while(this.blinking_left)
            {
                this.change_color(this.blinker_l,this.black);
                this.change_color(this.blinker_r,this.black);

                await this.sleep(500);
                this.change_color(this.blinker_l,this.orange);
                this.change_color(this.blinker_r,this.black);
                await this.sleep(500);
            }
        }  
        this.change_color(this.blinker_l,this.black);
        this.change_color(this.blinker_r,this.black);
    }
    
    /*
    Change the pose of the robot arms
    */
    set_pose(q_list_L,q_list_R)
    {   
        this.scooter.setJointValue("torso_y",q_list_L.get(0,0)+q_list_L.get(0,1));
        this.scooter.setJointValue("l_arm_sh_p1",q_list_L.get(0,2));
        this.scooter.setJointValue("l_arm_sh_r",q_list_L.get(0,3));
        this.scooter.setJointValue("l_arm_sh_p2",q_list_L.get(0,4));
        this.scooter.setJointValue("l_arm_el_y",q_list_L.get(0,5));
        this.scooter.setJointValue("l_arm_wr_r",q_list_L.get(0,6));
        this.scooter.setJointValue("l_arm_wr_y",q_list_L.get(0,7));
        this.scooter.setJointValue("l_arm_wr_p",q_list_L.get(0,8));

        this.scooter.setJointValue("r_arm_sh_p1",-q_list_R.get(0,2));
        this.scooter.setJointValue("r_arm_sh_r",q_list_R.get(0,3));
        this.scooter.setJointValue("r_arm_sh_p2",-q_list_R.get(0,4));
        this.scooter.setJointValue("r_arm_el_y",q_list_R.get(0,5));
        this.scooter.setJointValue("r_arm_wr_r",-q_list_R.get(0,6));
        this.scooter.setJointValue("r_arm_wr_y",q_list_R.get(0,7));
        this.scooter.setJointValue("r_arm_wr_p",-q_list_R.get(0,8));
    }


    apply_position()
    {
        let yaw_velocity:number = this.velocity * this.steering_angle / this.b;
        this.scooter_yaw_rotation += yaw_velocity;
        let x_vel:number = this.velocity * Math.cos( this.scooter_yaw_rotation + Math.PI/2 );
        let y_vel:number = this.velocity * Math.sin( this.scooter_yaw_rotation + Math.PI/2 );
        this.scooter.position.x += y_vel;
        this.scooter.position.z += x_vel;
    }



    apply_steering()
    {
        //aplying some random noise
        if( this.velocity !=0 ) {
            if( this.steering_angle<0 ) {   
                var r :number  = (Math.random() -0.5)*2; //random -1 to 1
                this.steering_angle = this.steering_angle + r/100;
            } else {
                var r :number  = (Math.random() - 0.5)*2; //random -1 to 1
                this.steering_angle = this.steering_angle+ r/100;
            }
        }
        this.scooter.setJointValue( "steering_joint",this.steering_angle );
    }








    get_pendulum()
    {
        var zero = 0.001
        var pendulum = (this.g/this.h)*Math.sin(this.phi);
        if( this.steering_angle<0.0 &&  (-0.001<=this.phi && this.phi<=0.001))
        {
            this.phi=-zero;
        }
        else if(0.0<this.steering_angle &&  (-0.001<=this.phi && this.phi<=0.001))
        {
            this.phi=zero;
        }
        else if(0.0<this.steering_angle &&  this.phi<=0.0)
        {
            this.phi +=0.01;
            pendulum = 0;
        }
        else if(this.steering_angle<0.0 && 0.0<=this.phi)
        {
            this.phi -=0.01;
            pendulum = 0;
        }
        if(this.velocity ==0)
        {
            pendulum = 0;
        }
        return pendulum;
    }


    get_phi()
    {
        if(this.crash_frames_countdown<=0)
        {

            //var coef = 1.3
            var rad = (this.b/(this.steering_angle*Math.cos(0.52)));
            if(this.velocity !=0)
            {
                this.lean = Math.atan(((this.velocity*30)**2)/(this.g*(rad)));
            }
            this.phi += this.get_pendulum()*0.01*(1/(1+this.velocity*50));
            console.log(this.get_pendulum());

            if( this.phi < - this.max_phi ) {
                this.phi = - this.max_phi;
            } else if( this.phi > this.max_phi ) {
                this.phi = this.max_phi;
            }

            if( this.phi-this.lean < - this.max_phi ) {
                this.lean = -(this.max_phi-this.phi);
            } else if( this.phi+this.lean > this.max_phi ) {
                this.lean = (this.max_phi-this.phi);
            }

            
            if( this.test != this.phi ) {
                let a = Math.sin( this.phi+this.lean ) * ( this.h );
                let [rx,ry] = this.rotate_around( 0, 0, 0, a, - ( this.scooter_yaw_rotation + ( Math.PI/2 ) ) );
                this.scooter.position.x -= ry - this.prev_ry;
                this.scooter.position.z -= rx - this.prev_rx;
                this.prev_rx = rx;
                this.prev_ry = ry;
            }
            
            this.test = this.phi;
            return this.phi+this.lean;
        }
        else
        {
            return this.phi;
        }
    }

    rotate_around( cx, cy, x, y, radians) {
        var cos = Math.cos( radians ),
            sin = Math.sin( radians ),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }



    forward_kin(q_list,is_left_arm = true)
    {
        if(is_left_arm)
        {
            q_list = Matrix.add(q_list,this.start_pose_L)

            this.q1= q_list.get(0,0);
            this.q2= q_list.get(0,1);
            this.q3= q_list.get(0,2);
            this.q4= q_list.get(0,3);
            this.q5= q_list.get(0,4);
            this.q6= q_list.get(0,5);
            this.q7= q_list.get(0,6);
            this.q8= q_list.get(0,7);
            this.q9=0;
            this.s1=Math.sin(this.q1);
            this.c1=Math.cos(this.q1);
            this.s2=Math.sin(this.q2);
            this.c2=Math.cos(this.q2);
            this.s3=Math.sin(this.q3);
            this.c3=Math.cos(this.q3);
            this.s4=Math.sin(this.q4);
            this.c4=Math.cos(this.q4);
            this.s5=Math.sin(this.q5);
            this.c5=Math.cos(this.q5);
            this.s6=Math.sin(this.q6);
            this.c6=Math.cos(this.q6);
            this.s7=Math.sin(this.q7);
            this.c7=Math.cos(this.q7);
            this.s8=Math.sin(this.q8);
            this.c8=Math.cos(this.q8);
            this.s9=Math.sin(this.q9);
            this.c9=Math.cos(this.q9);

            var pos_end_eff_x=  ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*0.145*this.c9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*0.145*this.s9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*0.045*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*0.045*this.s8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*0.21+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*-0.03*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-0.03*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*0.03*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*0.03*this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*0.22+(((this.c1*this.c2+-this.s1*this.s2)*-0.039*this.c3+(this.c1*-this.s2+-this.s1*this.c2)*0.212)))))))
            var pos_end_eff_y=  ((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*0.145*this.c9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*0.145*this.s9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*0.045*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*0.045*this.s8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*0.21+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*-0.03*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-0.03*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*0.03*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*0.03*this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*0.22+(((this.s1*this.c2+this.c1*this.s2)*-0.039*this.c3+(this.s1*-this.s2+this.c1*this.c2)*0.212)))))))
            var pos_end_eff_z=  ((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.s8)*0.145*this.c9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*-this.s7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.c7)*-1)*0.145*this.s9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*0.045*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*0.045*this.s8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*0.21+(((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*-0.03*this.c6+((((-1)*this.s3)*this.s4)*-1)*-0.03*this.s6+((((-1)*this.s3)*this.c4)*0.03*this.c5+(((-1)*-this.c3))*0.03*this.s5+(((-1)*this.s3)*this.s4)*0.22+(((-1)*-0.039*this.s3+(0.3305))))))))

            var m3 = new Matrix3();
            m3.set
                (
                ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*this.c9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.s9),((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*this.c9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.s9),((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.s8)*this.c9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*-this.s7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.c7)*-1)*this.s9),
                ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*-this.s9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.c9),((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*-this.s9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.c9),((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.s8)*-this.s9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*-this.s7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.c7)*-1)*this.c9),
                ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*-this.s8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.c8)),((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*-this.s8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.c8)),((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*-this.s8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.c8))
                );
            var m4 = new Matrix4();
            m4.setFromMatrix3(m3);
            var euler = new Euler( 0, 0, 0, 'XYZ' ); 
            euler.setFromRotationMatrix(m4,'XYZ');

            return new Matrix([[pos_end_eff_y,pos_end_eff_z,pos_end_eff_x,0,0,0]])//euler.x+Math.PI/2,euler.y,euler.z]])
        }
        else
        {
            q_list = Matrix.add(q_list,this.start_pose_R)

            this.q1= q_list.get(0,0);
            this.q2= q_list.get(0,1);
            this.q3= q_list.get(0,2);
            this.q4= q_list.get(0,3);
            this.q5= q_list.get(0,4);
            this.q6= q_list.get(0,5);
            this.q7= q_list.get(0,6);
            this.q8= q_list.get(0,7);
            this.q9=0;
            this.s1=Math.sin(this.q1);
            this.c1=Math.cos(this.q1);
            this.s2=Math.sin(this.q2);
            this.c2=Math.cos(this.q2);
            this.s3=Math.sin(this.q3);
            this.c3=Math.cos(this.q3);
            this.s4=Math.sin(this.q4);
            this.c4=Math.cos(this.q4);
            this.s5=Math.sin(this.q5);
            this.c5=Math.cos(this.q5);
            this.s6=Math.sin(this.q6);
            this.c6=Math.cos(this.q6);
            this.s7=Math.sin(this.q7);
            this.c7=Math.cos(this.q7);
            this.s8=Math.sin(this.q8);
            this.c8=Math.cos(this.q8);
            this.s9=Math.sin(this.q9);
            this.c9=Math.cos(this.q9);

            pos_end_eff_x=  ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*0.145*this.c9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*0.145*this.s9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*0.045*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*0.045*this.s8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-0.21+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*-0.03*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-0.03*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*0.03*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*0.03*this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-0.22+(((this.c1*this.c2+-this.s1*this.s2)*-0.039*this.c3+(this.c1*-this.s2+-this.s1*this.c2)*-0.212)))))))
            pos_end_eff_y=  ((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*0.145*this.c9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*0.145*this.s9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*0.045*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*0.045*this.s8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-0.21+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*-0.03*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-0.03*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*0.03*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*0.03*this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-0.22+(((this.s1*this.c2+this.c1*this.s2)*-0.039*this.c3+(this.s1*-this.s2+this.c1*this.c2)*-0.212)))))))
            pos_end_eff_z=  ((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.s8)*0.145*this.c9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*-this.s7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.c7)*-1)*0.145*this.s9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*0.045*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*0.045*this.s8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-0.21+(((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*-0.03*this.c6+((((-1)*this.s3)*this.s4)*-1)*-0.03*this.s6+((((-1)*this.s3)*this.c4)*0.03*this.c5+(((-1)*-this.c3))*0.03*this.s5+(((-1)*this.s3)*this.s4)*-0.22+(((-1)*-0.039*this.s3+(0.3305))))))))

            var m3 = new Matrix3();
            m3.set
                (
                ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*this.c9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.s9),((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*this.c9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.s9),((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.s8)*this.c9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*-this.s7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.c7)*-1)*this.s9),
                ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*-this.s9+(((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.c9),((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*this.c8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.s8)*-this.s9+(((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*-this.s7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.c7)*-1)*this.c9),((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*this.c8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.s8)*-this.s9+(((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*-this.s7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.c7)*-1)*this.c9),
                ((((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.c6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*-this.s5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.c5))*this.s7)*-this.s8+((((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.c4+((this.c1*-this.s2+-this.s1*this.c2))*this.s4)*this.c5+(((this.c1*this.c2+-this.s1*this.s2)*this.s3))*this.s5)*this.s6+((((this.c1*this.c2+-this.s1*this.s2)*this.c3)*this.s4+((this.c1*-this.s2+-this.s1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.c8)),((((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.c6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*this.s6)*this.c7+(((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*-this.s5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.c5))*this.s7)*-this.s8+((((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.c4+((this.s1*-this.s2+this.c1*this.c2))*this.s4)*this.c5+(((this.s1*this.c2+this.c1*this.s2)*this.s3))*this.s5)*this.s6+((((this.s1*this.c2+this.c1*this.s2)*this.c3)*this.s4+((this.s1*-this.s2+this.c1*this.c2))*-this.c4)*-1)*-this.c6)*-1)*this.c8)),((((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.c6+((((-1)*this.s3)*this.s4)*-1)*this.s6)*this.c7+(((((-1)*this.s3)*this.c4)*-this.s5+(((-1)*-this.c3))*this.c5))*this.s7)*-this.s8+((((((-1)*this.s3)*this.c4)*this.c5+(((-1)*-this.c3))*this.s5)*this.s6+((((-1)*this.s3)*this.s4)*-1)*-this.c6)*-1)*this.c8))
                );
            var m4 = new Matrix4();
            m4.setFromMatrix3(m3);
            var euler = new Euler(0, 0, 0, 'XYZ');
            euler.setFromRotationMatrix(m4,'XYZ');
            return new Matrix([[pos_end_eff_y,pos_end_eff_z,pos_end_eff_x,0,0,0]])//,euler.x+Math.PI/2,euler.y,euler.z]])
        }
    }

    calc_jacob_newton(state,is_left_arm =true)
    {
        var eps = 0.01;
        var current = this.forward_kin(state,is_left_arm);
        var J = Matrix.zeros(6,9);
        var n = null;
        var s = null;
        for(let j=0;j<9;j++)
        {
            s = new Matrix(state);
            s.set(0,j, s.get(0,j)+eps);
            n = this.forward_kin(s,is_left_arm);

            for(let i=0;i<6;i++)
            {   
                J.set(i,j, (n.get(0,i)-current.get(0,i)) /eps );
            }            
        }
        return J;
    }

    pseudo_inverse(p_desired,start_q,max_steps,is_left_arm =true)
    {
        var use_momentum = false;
        var p_start = this.forward_kin(start_q,is_left_arm);
        var delta_err = Matrix.sub(p_desired,p_start);
        var curent_q_pos = start_q;
        var eps = 0.01
        var min_err = 0.01
        ///////////////////////////////////////
        var d_tetha = null;
        var scaled_delta = null;
        var J = null;
        var Jpinv = null;
        var i=0
        while (delta_err.norm("frobenius")>min_err && i < max_steps)
        {
            scaled_delta = scaled_delta = Matrix.div(Matrix.mul(delta_err,eps),delta_err.norm("frobenius"));
            J = this.calc_jacob_newton(curent_q_pos,is_left_arm);
            Jpinv = pseudoInverse(J);
            d_tetha = Jpinv.mmul(scaled_delta.transpose()).transpose();
            curent_q_pos = Matrix.add(curent_q_pos,d_tetha);
    
            //this is the joint from ground to base line, should be fixed
            curent_q_pos.set(0,0,0.0);
            //this is the joint to the end effector should be fixed
            if(true)//if(!is_left_arm)
            {
                curent_q_pos.set(0,1,0.0);
            }

            delta_err = Matrix.sub(p_desired,this.forward_kin(curent_q_pos,is_left_arm));
            
            
            if(use_momentum)
            {
                if(i == 0)
                {
                    var velocity = new Matrix(d_tetha);
                }
                velocity = Matrix.add(velocity,d_tetha); //*1
                var mom = Matrix.add(curent_q_pos,velocity);
                if((Matrix.sub(p_desired,this.forward_kin(mom)).norm("frobenius")<delta_err.norm("frobenius")))
                {
                    curent_q_pos = mom;
                }
                else
                {
                    velocity = new Matrix(d_tetha);
                }
            }
            i+=1;
        }
        return curent_q_pos
    }

    get_grip_L_Fkin(yaw,phi,steering)
    {
        var s1=Math.sin(yaw);
        var c1=Math.cos(yaw);
        var s2=Math.sin(phi);
        var c2=Math.cos(phi);
        var s3=Math.sin(steering);
        var c3=Math.cos(steering);
    
        var link_x3=((c1*c2+-s1*Math.cos(Math.PI/2)*s2)*0.25*c3+(c1*-s2*Math.cos(-2.0944)+-s1*Math.cos(Math.PI/2)*c2*Math.cos(-2.0944)+Math.sin(Math.PI/2)*s1*Math.sin(-2.0944))*0.25*s3+(c1*Math.sin(-2.0944)*s2+-s1*Math.cos(Math.PI/2)*-c2*Math.sin(-2.0944)+Math.sin(Math.PI/2)*s1*Math.cos(-2.0944))*0.25+(c1*0*c2+-s1*Math.cos(Math.PI/2)*0*s2+Math.sin(Math.PI/2)*s1*0.4718+0*c1));
        var link_y3=((s1*c2+c1*Math.cos(Math.PI/2)*s2)*0.25*c3+(s1*-s2*Math.cos(-2.0944)+c1*Math.cos(Math.PI/2)*c2*Math.cos(-2.0944)+-c1*Math.sin(Math.PI/2)*Math.sin(-2.0944))*0.25*s3+(s1*Math.sin(-2.0944)*s2+c1*Math.cos(Math.PI/2)*-c2*Math.sin(-2.0944)+-c1*Math.sin(Math.PI/2)*Math.cos(-2.0944))*0.25+(s1*0*c2+c1*Math.cos(Math.PI/2)*0*s2+-c1*Math.sin(Math.PI/2)*0.4718+0*s1));
        var link_z3=((Math.sin(Math.PI/2)*s2)*0.25*c3+(Math.sin(Math.PI/2)*c2*Math.cos(-2.0944)+Math.cos(Math.PI/2)*Math.sin(-2.0944))*0.25*s3+(Math.sin(Math.PI/2)*-c2*Math.sin(-2.0944)+Math.cos(Math.PI/2)*Math.cos(-2.0944))*0.25+(Math.sin(Math.PI/2)*0*s2+Math.cos(Math.PI/2)*0.4718+-0.1758));
    
        return new Matrix([[link_x3,link_z3,-link_y3,0,0,0]]);
    }

    get_grip_R_Fkin(yaw : number, phi : number, steering : number )
    {
        var s1=Math.sin(yaw);
        var c1=Math.cos(yaw);
        var s2=Math.sin(phi);
        var c2=Math.cos(phi);
        var s3=Math.sin(steering);
        var c3=Math.cos(steering);
    
        var link_x4=((c1*c2+-s1*Math.cos(Math.PI/2)*s2)*-0.25*c3+(c1*-s2*Math.cos(-2.0944)+-s1*Math.cos(Math.PI/2)*c2*Math.cos(-2.0944)+Math.sin(Math.PI/2)*s1*Math.sin(-2.0944))*-0.25*s3+(c1*Math.sin(-2.0944)*s2+-s1*Math.cos(Math.PI/2)*-c2*Math.sin(-2.0944)+Math.sin(Math.PI/2)*s1*Math.cos(-2.0944))*0.25+(c1*0*c2+-s1*Math.cos(Math.PI/2)*0*s2+Math.sin(Math.PI/2)*s1*0.4718+0*c1))
        var link_y4=((s1*c2+c1*Math.cos(Math.PI/2)*s2)*-0.25*c3+(s1*-s2*Math.cos(-2.0944)+c1*Math.cos(Math.PI/2)*c2*Math.cos(-2.0944)+-c1*Math.sin(Math.PI/2)*Math.sin(-2.0944))*-0.25*s3+(s1*Math.sin(-2.0944)*s2+c1*Math.cos(Math.PI/2)*-c2*Math.sin(-2.0944)+-c1*Math.sin(Math.PI/2)*Math.cos(-2.0944))*0.25+(s1*0*c2+c1*Math.cos(Math.PI/2)*0*s2+-c1*Math.sin(Math.PI/2)*0.4718+0*s1))
        var link_z4=((Math.sin(Math.PI/2)*s2)*-0.25*c3+(Math.sin(Math.PI/2)*c2*Math.cos(-2.0944)+Math.cos(Math.PI/2)*Math.sin(-2.0944))*-0.25*s3+(Math.sin(Math.PI/2)*-c2*Math.sin(-2.0944)+Math.cos(Math.PI/2)*Math.cos(-2.0944))*0.25+(Math.sin(Math.PI/2)*0*s2+Math.cos(Math.PI/2)*0.4718+-0.1758))
        
        return new Matrix([[link_x4,link_z4,-link_y4,0,0,0]]);
    }


    move_arms()
    {
        if(this.crash_frames_countdown<=0)
        {
            var left_handle  = this.get_grip_L_Fkin(0.0,0.0,this.steering_angle);
            var right_handle  = this.get_grip_R_Fkin(0.0,0.0,this.steering_angle);

            var gen_L = this.pseudo_inverse(left_handle,this.last_pose_L, 500, true);
            var gen_R = this.pseudo_inverse(right_handle,this.last_pose_R, 500, false);
            this.last_pose_R =gen_R;
            this.last_pose_L =gen_L;
            this.set_pose(this.last_pose_L,this.last_pose_R);
        }
        else
        {
            this.crash_frames_countdown--;
        }

    }




    set_sit_pose()
    {
        this.scooter.setJointValue("r_leg_hip_y",0);
        this.scooter.setJointValue("r_leg_hip_p",1.);
        this.scooter.setJointValue("r_leg_kn_p",-0.7);
        this.scooter.setJointValue("r_leg_an_p",0.52);

        this.scooter.setJointValue("l_leg_hip_y",0);
        this.scooter.setJointValue("l_leg_hip_p",-1.);
        this.scooter.setJointValue("l_leg_kn_p",0.7);
        this.scooter.setJointValue("l_leg_an_p",-0.52);
    }

    set_stop_pause_rigth(prct:number)
    {
        this.scooter.setJointValue("l_leg_hip_y",0);
        this.scooter.setJointValue("l_leg_hip_p",-1.0*prct);
        this.scooter.setJointValue("l_leg_kn_p",0.7*prct);
        this.scooter.setJointValue("l_leg_an_p",-0.52*prct);

        this.scooter.setJointValue("r_leg_hip_y",0.7*prct);
        this.scooter.setJointValue("r_leg_hip_r",0.2*prct);
        this.scooter.setJointValue("r_leg_hip_p",0.8*prct);
        this.scooter.setJointValue("r_leg_kn_p",-0.5*prct);
    }


    set_stop_pause_left(prct:number)
    {

        this.scooter.setJointValue("r_leg_hip_y",0);
        this.scooter.setJointValue("r_leg_hip_p",1.0*prct);
        this.scooter.setJointValue("r_leg_kn_p",-0.7*prct);
        this.scooter.setJointValue("r_leg_an_p",0.52*prct);
        this.scooter.setJointValue("l_leg_hip_y",-0.7*prct);
        this.scooter.setJointValue("l_leg_hip_r",-0.2*prct);
        this.scooter.setJointValue("l_leg_hip_p",-0.8*prct);
        this.scooter.setJointValue("l_leg_kn_p",0.5*prct);


    }



    crash() {

        this.velocity = 0.0;
        this.phi = 45.0/180.0 * Math.PI;
        
        //faster to simply do it 
        this.scooter.setJointValue("torso_y",0);
        this.scooter.setJointValue("l_arm_sh_p1",0);
        this.scooter.setJointValue("l_arm_sh_r",-1.57);
        this.scooter.setJointValue("l_arm_sh_p2",0);
        this.scooter.setJointValue("l_arm_el_y",-1.57);
        this.scooter.setJointValue("l_arm_wr_r",0);
        this.scooter.setJointValue("l_arm_wr_y",0);
        this.scooter.setJointValue("l_arm_wr_p",0);

        this.scooter.setJointValue("r_arm_sh_p1",0);
        this.scooter.setJointValue("r_arm_sh_r",1.57);
        this.scooter.setJointValue("r_arm_sh_p2",0);
        this.scooter.setJointValue("r_arm_el_y",1.57);
        this.scooter.setJointValue("r_arm_wr_r",0);
        this.scooter.setJointValue("r_arm_wr_y",0);
        this.scooter.setJointValue("r_arm_wr_p",0);
        this.crash_frames_countdown=100;
        console.log("crash");
    }
}

