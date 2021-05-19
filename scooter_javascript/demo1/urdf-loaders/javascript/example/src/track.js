import {
    Vector2,
    Color,
} from 'three';

export class Track {


    constructor(track_threejs,render)
    {

        //idk why but javascript need this else it doesn't feel good 
        this.stop_blink_zebra = this.stop_blink_zebra.bind(this);
        this.stop_blink_train = this.stop_blink_train.bind(this);

        this.trun_traffic_green = this.trun_traffic_green.bind(this);
        this.trun_traffic_red = this.trun_traffic_red.bind(this);


        this.sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));


        this.render =render
        // x = -12.4
        // y =0.94
        this.track_ = track_threejs; // the track described as a threeJS object

        this.zebra_blink = false;
        this.traffic_state = 0;
        this.train_blink = false;

        //Parsin the track to find visuals
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

        //crosswalk
        this.part1 = new CheckPoint(new Vector2(-11.4,-9),new Vector2(-12.8,-12));
        this.part1_after = new CheckPoint(new Vector2(-11.4,-12.2),new Vector2(-12.8,-14.23));
        //this.part1_cango_after = new Boolean(false);
        //this.part1_on = new Boolean(false);
        this.part1_cango_after = { value: false }
        this.part1_on = { value: false }
        this.colision_callback(this.part1_on,this.part1_cango_after,1000,this.stop_blink_zebra);

        //Traffic light
        this.part2 = new CheckPoint(new Vector2(-4.5,-16.2),new Vector2(-6,-17.4));
        this.part2_after = new CheckPoint(new Vector2(-3,-16.2),new Vector2(-4.5,-17.4));
        this.part2_cango_after = { value: false }
        this.part2_on = { value: false }
        this.colision_callback(this.part2_on,this.part2_cango_after,1000,this.trun_traffic_green);

        //position part
        this.part3 = new CheckPoint(new Vector2(5.7,-17.3),new Vector2(3,-20.4));
        this.part3_after = new CheckPoint(new Vector2(5.7,-14.8),new Vector2(3,-17.1));
        this.part3_cango_after = { value: false }
        this.part3_on = { value: false }
        this.colision_callback(this.part3_on,this.part3_cango_after,1000);


        this.part4 = new CheckPoint(new Vector2(2.65,2.44),new Vector2(-0.82,0.5));
        this.part4_after = new CheckPoint(new Vector2(5.7,-14.8),new Vector2(0.81,0.61));
        this.part4_cango_after = { value: false }
        this.part4_on = { value: false }
        this.colision_callback(this.part4_on,this.part4_cango_after,1000);


        this.part5 = new CheckPoint(new Vector2(5.8,9.67),new Vector2(3,7.66));
        this.part5_after = new CheckPoint(new Vector2(5.8,-12.7),new Vector2(3,9.6));
        this.part5_cango_after = { value: false }
        this.part5_on = { value: false }
        this.colision_callback(this.part5_on,this.part5_cango_after,1000,this.stop_blink_train);




        //coords for the line
        this.coord = [[-11.35,-8.90],
                [-11.3,-14.07],
                [-9.94,-15.59],
                [-8.64,-16.11],
                [-7.16,-16.18],
                [1.57,-16.24],
                [2.51,-15.88],
                [2.97,-14.85],
                [4.17,-13.96],
                [2.78,-12.92],
                [2.78,-4.19],
                [2.31,-3.30],
                [1.22,-3.03],
                [-8.54,-3.03],
                [-8.58,2.311],
                [0.77,2.37],
                [1.80,2.42],
                [2.63,2.98],
                [2.89,3.96],
                [2.88,15.16],
                [5.90,15.16],
                [5.87,0.49],
                [-4.61,0.49],
                [-4.61,-1.22],
                [2.75,-1.18],
                [4.25,-1.18],
                [4.25,-4.84],
                [4.81,-5.73],
                [5.80,-6.20],
                [5.69,-20.58],
                [-4.5,-20.58],
                [-4.5,-17.51],
                [-8.68,-17.46],
                [-9.98,-17.13],
                [-11.22,-16.45],
                [-12.23,-15.43],
                [-13.05,-14.09],
                [-13.01,-8.94]];

        this.arrayX = [];
        this.arrayY = [];
        for (let i = 0; i < this.coord.length; i++)
        {
            this.arrayX.push(this.coord[i][0]);
            this.arrayY.push(this.coord[i][1]);
        }


    

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
            this.zebra_blink = false;
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

/*
        this.change_color(this.zebra_l,this.red);
        this.change_color(this.zebra_r,this.red);

        this.change_color(this.traffic_r,this.red);
        this.change_color(this.traffic_g,this.black);
        this.change_color(this.traffic_y,this.black);

        this.change_color(this.train_l,this.red);
        this.change_color(this.train_r,this.red);
*/
        this.blink_zebra();
        this.trun_traffic_red();
        this.blink_train();


    }


    update(scooter_pos)
    {
        //console.log(this.part1.is_in(scooter_pos));
        //console.log(this.is_in_track(scooter_pos,this.arrayX,this.arrayY));

        //can opti the code a lot here
        this.part1_on.value =this.part1.is_in(scooter_pos); 
        this.part2_on.value =this.part2.is_in(scooter_pos); 
        this.part3_on.value =this.part3.is_in(scooter_pos); 
        this.part4_on.value =this.part4.is_in(scooter_pos); 
        this.part5_on.value =this.part5.is_in(scooter_pos); 

        /*
        console.log("part1_on ="+this.part1_on.value);
        console.log("part1_cango = "+this.part1_cango_after.value);
        console.log("====");
        */



        

        /*
        if(!this.is_in_track(scooter_pos,this.arrayX,this.arrayY))
        {
            console.log("LOST");
        }
        */

        if(this.part1_after.is_in(scooter_pos) && !this.part1_cango_after.value)
        {
            console.log("LOST PART1");
        }

        if(this.part2_after.is_in(scooter_pos) && !this.part3_cango_after.value)
        {
            console.log("LOST PART2");
        }

        if(this.part3_after.is_in(scooter_pos) && !this.part4_cango_after.value)
        {
            console.log("LOST PART3");
        }

        if(this.part4_after.is_in(scooter_pos) && !this.part5_cango_after.value)
        {
            console.log("LOST PART4");
        }

        if(this.part5_after.is_in(scooter_pos) && !this.part5_cango_after.value)
        {
            console.log("LOST PART5");
        }
        
    }







    async colision_callback(boolean_flag_object,boolean_result_object,time_needed_ms,function_ = null)
    {
        boolean_result_object.value = false; 

        while(true)
        {   
            var var_counter = 0;
            console.log("IS IN=",boolean_flag_object.value);
            while(boolean_flag_object.value)
            {
                console.log("IS IN=",boolean_flag_object.value);
                console.log("var_counter=",var_counter);
                var_counter++;
                await this.sleep(1000);
                if(var_counter*100>=time_needed_ms)
                {
                    console.log("breaking");
                    break;
                }
            }
            //if we break and th boolean is true, we can say it's good now 
            if(boolean_flag_object.value)
            {
                console.log("setting");
                if(function_)
                {
                    function_(this);
                }
                boolean_result_object.value = true; 
            }
            //else we just try again
            //delay to not kill the computer
            await this.sleep(1000);
        }
        
    }







    is_in_track(point,cornersX, cornersY)
    {

        var x = point.x;
        var y = -point.z;
        
        //console.log('x='+x);
        //console.log('y='+y);


        var i, j=cornersX.length-1 ;
        var odd = false;
    
        var pX = cornersX;
        var pY = cornersY;
    
        for (i=0; i<cornersX.length; i++) {
            if ((pY[i]< y && pY[j]>=y ||  pY[j]< y && pY[i]>=y)
                && (pX[i]<=x || pX[j]<=x)) {
                odd ^= (pX[i] + (y-pY[i])*(pX[j]-pX[i])/(pY[j]-pY[i])) < x; 
            }
    
            j=i; 
        }
    
        return odd==1;
    }




}

export class CheckPoint
{
    constructor(top_left,bottom_right)
    {
        this.top_left=top_left;
        this.bottom_right=bottom_right;
    }


    is_in(point)
    {
        //console.log(point)
        //console.log(this.top_left.x>point.x)
        //console.log(this.bottom_right.x<point.x)
        //console.log(this.top_left.y > -point.z)
        //console.log(this.bottom_right.y<-point.z)
        //console.log('=====')

        return this.top_left.x>point.x && this.bottom_right.x<point.x && this.top_left.y > -point.z &&this.bottom_right.y <-point.z;
    }


}
