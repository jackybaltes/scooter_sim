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
    protected g:number;
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
        this.m = 125; //mass of scooter + robot in kg
        this.h = 0.89; // height of the center of mass
        this.b = 1.184012; //inter wheel distance=
        this.a = this.b/2;
        this.g= 9.806;
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



    init_position()
    {
        this.scooter.position.x = this.spawn_x;
        this.scooter.position.y = this.spawn_y;
        this.scooter.position.z = this.spawn_z;
        this.scooter.rotation.y = -Math.PI/2;
        this.scooter_yaw_rotation = -Math.PI/2;
        var r :number  = (Math.random()-0.5)*2; //random -1 to 1
        this.steering_angle = r/5;
        //this.steering_angle = 0.0;
        this.phi=0;
        this.velocity =0.0;
    }


    change_color(obj,color)
    {
        obj.color.set(color);
        obj.emissive.set(color);
        obj.specular.set(color);
        obj.needsUpdate = true;
    }



    get_wheel_position()
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




    stop_signal()
    {
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


    get_phi()
    {
        var phi = this.transfer_function_steer_to_tilt(this.steering_angle)-this.transfer_function_steer_to_tilt(0);
        return phi*1000*this.velocity;    
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

            return new Matrix([[pos_end_eff_y,pos_end_eff_z,pos_end_eff_x,euler.x+Math.PI/2,euler.y,euler.z]])
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
            return new Matrix([[pos_end_eff_y,pos_end_eff_z,pos_end_eff_x,euler.x+Math.PI/2,euler.y,euler.z]])
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



    get_grip_L_pos()
    {
        var object = this.scooter.links["scooter_grip_L"];
        object.updateWorldMatrix( true, true );
        var vector = new Vector3( 0, 0, 0 );
        var v = object.localToWorld(vector,object.worldMatrix);

        var x = v.x-this.scooter.position.x
        var z = v.z-this.scooter.position.z
        var s = Math.sin(this.scooter_yaw_rotation);
        var c = Math.cos(this.scooter_yaw_rotation);

        var a =[Math.abs(x*s+z*c),
                v.y-this.scooter.position.y-(0.17*Math.sin(this.phi)),
                Math.abs(x*c)+Math.abs(z*s),
                1.57,0,0];
        /*
        console.log("Scooter=",this.scooter_yaw_rotation);
        console.log("PHI=",this.phi);
        console.log("YAW=",a[3]);
        console.log("sin=",s);
        console.log("cos=",c);
        console.log("x=",a[0]);
        console.log("y=",a[1]);
        console.log("z=",a[2]);
        console.log("======");
        */
        var pos = new Matrix([a]);
        return pos;
    }

    get_grip_R_pos()
    {
        var object = this.scooter.links["scooter_grip_R"];
        object.updateWorldMatrix( true, true );
        var vector = new Vector3( 0, 0, 0 );
        var euler = new Euler()
        euler.setFromQuaternion(object.getWorldQuaternion())
        var v = object.localToWorld(vector,object.worldMatrix);

        var x = v.x-this.scooter.position.x
        var z = v.z-this.scooter.position.z
        var s = Math.sin(this.scooter_yaw_rotation);
        var c = Math.cos(this.scooter_yaw_rotation);



        var a =[-Math.abs(x*s+z*c),
                v.y-this.scooter.position.y+(0.17*Math.sin(this.phi)),
                Math.abs(x*c)+Math.abs(z*s),
                4.7,0,0];

        

        var pos = new Matrix([a]);
        return pos;
    }

    move_arms()
    {
        var goal_p_L = this.get_grip_L_pos();
        var goal_p_R = this.get_grip_R_pos();
        var gen_L = this.pseudo_inverse(goal_p_L,this.last_pose_L, 500, true);
        var gen_R = this.pseudo_inverse(goal_p_R,this.last_pose_R, 500, false);
        this.last_pose_R =gen_R;
        this.last_pose_L =gen_L;
        this.set_pose(this.last_pose_L,this.last_pose_R);
    }
}

