import {
    Vector3,
    Color,
} from 'three';


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




}

