import {
    Vector2,
    Color,
} from 'three';

class Track {
    protected scooter_obj_blinker_state:boolean;
    protected start_score:number;
    protected lost:boolean;
    protected message:string;
    protected zebra_blink:boolean;
    protected traffic_state:number;
    protected train_blink:boolean;
    protected scooter_yaw:number;
    protected scooter_vel:number;

    protected sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

    // protected render;
    protected track_; // the track described as a threeJS object


    //Parsing the track to find visuals
    protected zebra_l;
    protected zebra_r;
    protected traffic_r;
    protected traffic_g;
    protected traffic_y;
    protected train_l;
    protected train_r;

    protected orange:Color;
    protected red:Color;
    protected green:Color;
    protected black:Color;

    //crosswalk
    protected part1:CheckPoint;
    protected part1_after:CheckPoint;
    protected part1_cango_after:boolean;
    protected part1_on:boolean;

    //Traffic light
    protected part2:CheckPoint;
    protected part2_after:CheckPoint;
    protected part2_cango_after:boolean;
    protected part2_on:boolean;

    //position part
    protected part3:CheckPoint;
    protected part3_after:CheckPoint;
    protected part3_cango_after:boolean;
    protected part3_on:boolean;

    protected part4:CheckPoint;
    protected part4_after:CheckPoint;
    protected part4_cango_after:boolean;
    protected part4_on:boolean;

    protected part5:CheckPoint;
    protected part5_after:CheckPoint;
    protected part5_cango_after:boolean;
    protected part5_on:boolean;

    protected part0:CheckPoint;
    protected part0_after:CheckPoint;

    protected part0_on:boolean;
    protected part0_cango_after:boolean;

    protected part35:CheckPoint;
    protected part35_on:boolean;


    protected part0_failled:boolean;
    protected part1_failled:boolean;
    protected part2_failled:boolean;
    protected part3_failled:boolean;
    protected part35_failled:boolean;
    protected part4_failled:boolean;
    protected part5_failled:boolean;
    protected line_failled:boolean;
    //coords for the line
    protected coord :Array<Array<number>>;
    protected arrayX:Array<number>;
    protected arrayY:Array<number>;

    
    constructor(track_threejs ) // ,render)
    {
//        this.render = render
        this.track_ = track_threejs; // the track described as a threeJS object
    
        this.scooter_obj_blinker_state = false;
        this.start_score = 100;
        this.lost=false;
        this.message = "";
        this.zebra_blink = false;
        this.traffic_state = 0;
        this.train_blink = false;
        this.scooter_yaw = 0;
    


        this.zebra_l = this.track_.links["left_1"].children[0].children[0].material
        this.zebra_r = this.track_.links["right_1"].children[0].children[0].material
        this.traffic_r = this.track_.links["red_1_traffic"].children[0].children[0].material
        this.traffic_g = this.track_.links["green_1_traffic"].children[0].children[0].material
        this.traffic_y = this.track_.links["yellow_1_traffic"].children[0].children[0].material
        this.train_l = this.track_.links["left_1_train"].children[0].children[0].material
        this.train_r = this.track_.links["right_1_train"].children[0].children[0].material


        this.orange= new Color(255,69,0);
        this.red= new Color(255,0,0);
        this.green= new Color(0,255,0);
        this.black= new Color(0,0,0);
    
        //idk why but javascript need this else it doesn't feel good 
        this.stop_blink_zebra = this.stop_blink_zebra.bind(this);
        this.stop_blink_train = this.stop_blink_train.bind(this);
        this.trun_traffic_green = this.trun_traffic_green.bind(this);
        this.trun_traffic_red = this.trun_traffic_red.bind(this);
    



        this.part1 = new CheckPoint(new Vector2(-11.4,-9),new Vector2(-12.8,-12));
        this.part1_after = new CheckPoint(new Vector2(-11.4,-12.2),new Vector2(-12.8,-14.23));
        this.part1_cango_after= false;
        this.part1_on = false;
    
        //Traffic light
        this.part2 = new CheckPoint(new Vector2(-4.5,-16.2),new Vector2(-6,-17.4));
        this.part2_after = new CheckPoint(new Vector2(-3,-16.2),new Vector2(-4.5,-17.4));
        this.part2_cango_after = false;
        this.part2_on = false;
    
        //position part
        this.part3 = new CheckPoint(new Vector2(5.7,-17.3),new Vector2(3,-20.4));
        this.part3_after = new CheckPoint(new Vector2(5.7,-14.8),new Vector2(3,-17.1));
        this.part3_cango_after = false;
        this.part3_on = false;
    
    
        this.part4 = new CheckPoint(new Vector2(2.65,2.44),new Vector2(-0.82,0.5));
        this.part4_after = new CheckPoint(new Vector2(5.7,3.2),new Vector2(0.81,0.61));
        this.part4_cango_after = false;
        this.part4_on = false;
    
    
        this.part5 = new  CheckPoint(new Vector2(5.8,9.67),new Vector2(3,7.66));
        this.part5_after = new CheckPoint(new Vector2(5.8,12.7),new Vector2(3,9.6));
        this.part5_cango_after = false;
        this.part5_on = false;
    
        this.part0 = new CheckPoint(new Vector2(-10,12.7),new Vector2(-13.8,-2.35)); 
        this.part0_after = new CheckPoint(new Vector2(-10.7,-2.4),new Vector2(-14.8,-7.57)); 
        this.part0_on = false;
        this.part0_cango_after = false;

        this.part35 = new CheckPoint(new Vector2(4.15,-5.29),new Vector2(2.84,-12.94)); 
        this.part35_on = false;
    


        this.part0_failled = false;
        this.part1_failled = false;
        this.part2_failled = false;
        this.part3_failled = false;
        this.part35_failled = false;
        this.part4_failled = false;
        this.part5_failled = false;
        this.line_failled = false;
    


        this.part_1_collision_callback(3000,this.stop_blink_zebra);
        this.part_2_collision_callback(3000,this.trun_traffic_green);
        this.part_3_collision_callback(3000);
        this.part_4_collision_callback(3000);
        this.part_5_collision_callback(3000,this.stop_blink_train);
        this.part_0_collision_callback(7000);
        this.part_35_collision_callback();


        this.coord = [[-11.57,15.86],[-11.57,14.00],[-11.92,12.80],[-11.92,-2.35],[-11.35,-8.90],[-11.3,-14.07],[-9.94,-15.59],[-8.64,-16.11],[-7.16,-16.18],[1.57,-16.24],[2.51,-15.88],[2.97,-14.85],[4.17,-13.96],[2.78,-12.92],[2.78,-4.19],[2.31,-3.30],[1.22,-3.03],[-8.54,-3.03],[-8.58,2.311],[0.77,2.37],[1.80,2.42],[2.63,2.98],[2.89,3.96],[2.88,15.16],[5.90,15.16],[5.87,0.49],[-4.61,0.49],[-4.61,-1.22],[2.75,-1.18],[4.25,-1.18],[4.25,-4.84],[4.81,-5.73],[5.80,-6.20],[5.69,-20.58],[-4.5,-20.58],[-4.5,-17.51],[-8.68,-17.46],[-9.98,-17.13],[-11.22,-16.45],[-12.23,-15.43],[-13.05,-14.09],[-13.01,-8.94],[-12.40,-2.31],[-12.40,12.80],[-12.69,14.00],[-12.74,15.85]];


        this.arrayX= [];
        this.arrayY= [];
    
        for (let i = 0; i < this.coord.length; i++)
        {
            this.arrayX.push(this.coord[i][0]);
            this.arrayY.push(this.coord[i][1]);
        }

    }


    get_done()
    {
        return this.lost;
    }

    



    async stop_blink_zebra()
    {
        this.zebra_blink = false;
        this.change_color(this.zebra_l,this.black);
        this.change_color(this.zebra_r,this.black);
    }


    async blink_zebra()
    {
        if(!this.zebra_blink)
        {
            this.zebra_blink = true;
            while(this.zebra_blink)
            {
                this.change_color(this.zebra_l,this.black);
                this.change_color(this.zebra_r,this.black);
                await this.sleep(500);
                this.change_color(this.zebra_l,this.red);
                this.change_color(this.zebra_r,this.red);
                await this.sleep(500);
            }
        }
        
    }




    async stop_blink_train()
    {
        this.train_blink = false;
        this.change_color(this.train_l,this.black);
        this.change_color(this.train_r,this.black);
    }


    async blink_train()
    {
    
        if(!this.train_blink)
        {
            this.train_blink = true;
            while(this.train_blink)
            {
                this.change_color(this.train_l,this.black);
                this.change_color(this.train_r,this.black);
                await this.sleep(500);
                this.change_color(this.train_l,this.red);
                this.change_color(this.train_r,this.red);
                await this.sleep(500);
            }
            this.train_blink = false;
        }
        
    }



    async trun_traffic_red()
    {   
        //is green
        if(this.traffic_state ==2)
        {
            this.change_color(this.traffic_r,this.black);
            this.change_color(this.traffic_g,this.black);
            this.change_color(this.traffic_y,this.orange);
            
        }

        this.traffic_state = 0
        this.change_color(this.traffic_r,this.red);
        this.change_color(this.traffic_g,this.black);
        this.change_color(this.traffic_y,this.black);
    }


    async trun_traffic_green()
    {   
        //is red
        if(this.traffic_state ==0)
        {
            this.change_color(this.traffic_r,this.black);
            this.change_color(this.traffic_g,this.black);
            this.change_color(this.traffic_y,this.orange);
            await this.sleep(1000);
        }
        this.traffic_state = 2
        this.change_color(this.traffic_r,this.black);
        this.change_color(this.traffic_g,this.green);
        this.change_color(this.traffic_y,this.black);
    }



    change_color(obj,color)
    {
        obj.color.set(color);
        obj.emissive.set(color);
        obj.specular.set(color);
        obj.needsUpdate = true;

    }


    init_track()
    {
        //this.train_blink = false;
        //this.zebra_blink = false;
        //this.stop_blink_train();
        //this.stop_blink_zebra();
        //this.sleep(1000);

        this.part0_cango_after = false;
        this.part0_on= false;
        this.part1_cango_after = false;
        this.part1_on= false;
        this.part2_cango_after= false;
        this.part2_on= false;
        this.part3_cango_after = false;
        this.part3_on = false;
        this.part35_on = false;
        this.part4_cango_after = false;
        this.part4_on = false;
        this.part5_cango_after = false;
        this.part5_on = false;
        

        this.part0_failled = false;
        this.part1_failled = false;
        this.part2_failled = false;
        this.part3_failled = false;
        this.part35_failled = false;
        this.part4_failled = false;
        this.part5_failled = false;
        this.line_failled = false;

        //this.zebra_blink = false;
        //this.traffic_state = 0;
        //this.train_blink = false;
        this.lost = false;

        this.blink_zebra();
        this.trun_traffic_red();
        this.blink_train();
    }


    update(scooter_pos,scooter_yaw,blinker_left_state,scooter_stoped)
    {

        this.scooter_vel = scooter_stoped;
        this.scooter_obj_blinker_state = blinker_left_state
        //can opti the code a lot here
        this.scooter_yaw = scooter_yaw;

        this.part0_on =this.part0.is_in(scooter_pos); 
        this.part1_on =this.part1.is_in(scooter_pos); 
        this.part2_on =this.part2.is_in(scooter_pos); 
        this.part3_on =this.part3.is_in(scooter_pos); 
        this.part35_on = this.part35.is_in(scooter_pos); 
        this.part4_on =this.part4.is_in(scooter_pos); 
        this.part5_on =this.part5.is_in(scooter_pos); 

        
        if(!this.is_in_track(scooter_pos,this.arrayX,this.arrayY))
        {
            this.lost = true;
            this.line_failled = true;
            this.message = "You went off track !"
        }
        
        
        if((this.part0_after.is_in(scooter_pos) && !this.part0_cango_after) || (this.part0_on && this.part0_failled) )
        {
            this.lost = true;
            this.message = "You have to stay 7 sec on the line (without stoping)!"
        }

        if(this.part1_after.is_in(scooter_pos) && !this.part1_cango_after)
        {
            this.part1_failled = true;
            this.message = "Wait before the Zebra crossing !"

            
        }

        if(this.part2_after.is_in(scooter_pos) && !this.part2_cango_after)
        {
            this.part2_failled = true;
            this.message = "Wait for the traffic light to turn green";


        }
        if(this.part3_after.is_in(scooter_pos) && !this.part3_cango_after)
        {
            this.part3_failled = true;
            this.message = "Wait a bit inside the rectangle";


        }
        if(this.part4_after.is_in(scooter_pos) && !this.part4_cango_after)
        {
            this.part4_failled = true;
            this.message = "You need to stop before crossing"

        }


        if(this.part5_after.is_in(scooter_pos) && !this.part5_cango_after)
        {
            this.part5_failled = true;
            this.message = "Got hit by a train"

        }
        
    }





    getscore()
    {
        var curent_score = this.start_score;
        if(this.part1_failled)
        {
            curent_score-=32;
        }
        if(this.part2_failled)
        {
            curent_score-=32;
        }
        if(this.part3_failled)
        {
            curent_score-=32;
        }
        if(this.part35_failled)
        {
            curent_score-=32;
        }
        if(this.part4_failled)
        {
            curent_score-=32;
        }
        if(this.part5_failled)
        {
            curent_score-=32;
        }


        return curent_score
    }


    getMessage()
    {
        return this.message
    }





    is_in_track(point,cornersX, cornersY)
    {

        var x = point.x;
        var y = -point.z;
        var i, j=cornersX.length-1 ;
        var odd = false;
    
        var pX = cornersX;
        var pY = cornersY;
    
        //this may not work in typescript
        for (i=0; i<cornersX.length; i++) 
        {
            if ((pY[i]< y && pY[j]>=y ||  pY[j]< y && pY[i]>=y) && (pX[i]<=x || pX[j]<=x)) 
            {


                if( (pX[i]+(y-pY[i])*(pX[j]-pX[i])/(pY[j]-pY[i])) < x)
                {
                    odd = !odd;
                }
            }
            j=i; 
        }
        return odd;
    }




    async part_1_collision_callback(time_needed_ms,function_ = null)
    {
        this.part1_cango_after = false; 
        while(true)
        {   
            var var_counter = 0;
            while(this.part1_on)
            {
                /*
                if(!this.part0_cango_after)
                {
                    this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                }
                */ 

                var_counter++;
                await this.sleep(100);
                if(var_counter*100>=time_needed_ms)
                {
                    break;
                }
            }
            //if we break and th boolean is true, we can say it's good now 
            if(this.part1_on)
            {
                //this.message = "You can go";
                if(function_)
                {
                    function_(this);
                }
                this.part1_cango_after = true; 
            }
            //else we just try again
            //delay to not kill the computer
            await this.sleep(1000);
        }
    }







    async part_2_collision_callback(time_needed_ms,function_ = null)
    {
        this.part2_cango_after = false; 
        while(true)
        {   
            var var_counter = 0;
            while(this.part2_on)
            {
                /*
                if(!this.part2_cango_after)
                {
                    this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                }
                */

                var_counter++;
                await this.sleep(1000);
                if(var_counter*1000>=time_needed_ms)
                {
                    break;
                }
            }
            //if we break and th boolean is true, we can say it's good now 
            if(this.part2_on)
            {
                //this.message = "You can go";
                if(function_)
                {
                    function_(this);
                }
                this.part2_cango_after = true; 
            }
            
            //else we just try again
            //delay to not kill the computer
            await this.sleep(1000);
        }
    }





    async part_3_collision_callback(time_needed_ms,function_ = null)
    {
        this.part3_cango_after = false; 
        while(true)
        {   
            var ori_Ok = this.scooter_yaw<1.8 && this.scooter_yaw>1.4;
            
            if(this.part3_on)
            {
                if(ori_Ok)
                {
                    this.message = "Your orientation is good !";

                }
                else
                {
                    this.message = "You should be perpendicular to the line";
                }
            }

            var var_counter = 0;
            while(this.part3_on && ori_Ok)
            {
                
                if(!this.part3_cango_after)
                {
                    this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                }    
                var_counter++;
                await this.sleep(1000);
                if(var_counter*1000>=time_needed_ms)
                {
                    break;
                }
            }
            //if we break and th boolean is true, we can say it's good now 
            if(this.part3_on && ori_Ok)
            {
                this.message = "you can go now";

                if(function_)
                {
                    function_(this);
                }
                this.part3_cango_after = true; 
            }
            //else we just try again
            //delay to not kill the computer
            await this.sleep(1000);
        }
    }


    async part_4_collision_callback(time_needed_ms,function_ = null)
    {
        this.part4_cango_after = false; 
        while(true)
        {   
            var var_counter = 0;
            while(this.part4_on)
            {
                if(!this.part4_cango_after)
                {
                    this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                }    

                var_counter++;
                await this.sleep(1000);
                if(var_counter*1000>=time_needed_ms)
                {
                    break;
                }
            }
            //if we break and th boolean is true, we can say it's good now 
            if(this.part4_on)
            {
                this.message = "you can go now";

                if(function_)
                {
                    function_(this);
                }
                this.part4_cango_after = true; 
            }
            //else we just try again
            //delay to not kill the computer
            await this.sleep(1000);
        }
    }






    async part_5_collision_callback(time_needed_ms,function_ = null)
    {
        this.part4_cango_after = false; 
        while(true)
        {   
            var var_counter = 0;
            while(this.part5_on)
            {
                /*
                if(!this.part5_cango_after)
                {
                    this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                }    
                */

                var_counter++;
                await this.sleep(1000);
                if(var_counter*1000>=time_needed_ms)
                {
                    break;
                }
            }
            //if we break and th boolean is true, we can say it's good now 
            if(this.part5_on)
            {
                //this.message = "you can go now";

                if(function_)
                {
                    function_(this);
                }
                this.part5_cango_after = true; 
            }
            //else we just try again
            //delay to not kill the computer
            await this.sleep(1000);
        }
    }



    async part_0_collision_callback(time_needed_ms,function_ = null)
    {
        this.part0_cango_after = false; 
        while(true)
        {   
            var var_counter = 0;
            while(this.part0_on)
            {
                if(!this.part0_cango_after)
                {
                    this.message = (var_counter/10)+" seconds | (min 7 seconds)";
                }

                if(this.scooter_vel)
                {
                    this.part0_failled = true;
                    break;
                }

                var_counter++;
                await this.sleep(100);
                if(var_counter*100>=time_needed_ms)
                {
                    this.part0_cango_after = true
                    this.message = "you lasted more than 7 sec !";
                    break;
                }
            }
            //delay to not kill the computer
            await this.sleep(100);
        }        
    }





    async part_35_collision_callback()
    {
        while(true)
        {   
            if(this.part35_on && !this.scooter_obj_blinker_state)
            {
                this.part35_failled = true;
                this.message = "you can't change line without using the blinker";
                break;
            }
            //delay to not kill the computer
            await this.sleep(100);
        }        
    }
}

export {  Track }; 

















export class CheckPoint
{
    protected top_left :Vector2;
    protected bottom_right :Vector2;

    constructor(top_left,bottom_right)
    {
        this.top_left=top_left;
        this.bottom_right=bottom_right;
    }


    is_in(point)
    {
        return this.top_left.x>point.x && this.bottom_right.x<point.x && this.top_left.y > -point.z &&this.bottom_right.y <-point.z;
    }


}





