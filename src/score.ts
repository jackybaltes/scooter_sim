import {Timer} from './timer';

//import { readFileSync,writeFileSync } from 'fs';
export class Score
{

    //const fs = require('fs');
    private curent_score:number;
    private user_name:String;

    //need change when we have a static server
    private score_server_ip_set_csv = "http://localhost:8080/set_csv";
    private score_server_ip_get_csv = "http://localhost:8080/get_csv";

    constructor(username)
    {
        this.user_name =  username;
        this.reset();
    }

    reset():void
    {
        this.curent_score = 100;
    }

    get_number_of_points():number
    {
        return this.curent_score;
    }


    remove_points(points:number):void
    {
        this.curent_score-=points;
    }

    add_points(points:number):void
    {
        this.curent_score+=points;
    }


    account_time_in_score(timer:Timer):void
    {
        //300 sec (5 min) is the max you can take to finish before the score turn negative
        var number_of_secs = timer.getSeconds();
        this.curent_score-=(number_of_secs/300)*100;
    }


    get_best_score():any
    {
        return this.get_best_score_server(); //since I can't figure out how the hll I need to import
    }

    //save the curent score to a json file
    //is no user is given it will just use 'anonymous'
    save_to_file():void
    {
        /*
        try
        {
            var xmlHttp = new XMLHttpRequest();
            if(this.user_name)
            {
                var string_posted = "{\"username\":\""+this.user_name+"\",\"score\":\""+this.curent_score+"\"}"
            }
            else
            {
                var string_posted = "{\"username\":\"Anonymous\",\"score\":\""+this.curent_score+"\"}"
            }
            console.log(this.score_server_ip_set_csv);
            xmlHttp.open( "POST", this.score_server_ip_set_csv, false ); // false for synchronous request
            xmlHttp.send(string_posted);
        }
        catch(err) 
        {
            console.log(err);
        }
        */
    }



    private get_best_simple()
    {
        return "0.0\nServer down\n";
        /*
        try
        {
            var t0 = performance.now()
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open( "GET", this.score_server_ip_get_csv, false ); // false for synchronous request
            xmlHttp.send( null );
            var t1 = performance.now()
            console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.")
    
            return xmlHttp.responseText;
        }
        catch(err)
        {
            console.log(err);
            return "0,0\n0,Server not responding\n";
        }
        */
    }


    
    private get_best_score_server():any
    {
/*
        try
        {
        
            var response = this.get_best_simple();
            var max:number  = parseInt(response.split(",")[0]);
            var best_user:string = response.split(",")[1];
            return [max,best_user];
        }
        catch(err)
        {
            console.log(err);
            return [0,"Server not responding"];
        }
        */
        return [0.0,"Server Down"];
    }

}