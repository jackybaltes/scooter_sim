import {Timer} from './timer';

//import { readFileSync,writeFileSync } from 'fs';
export class Score
{

    //const fs = require('fs');
    curent_score:number;
    user_name:String;

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



    account_time_in_score(timer:Timer)
    {
        //300 sec (5 min) is the max you can take to finish before the score turn negative
        var number_of_secs = timer.getSeconds();
        this.curent_score-=(number_of_secs/300)*100;
    }


    get_best_score()
    {
        return 999; //since I can't figure out how the hll I need to import
    }

    //save the curent score to a json file
    //is no user is given it will just use 'anonymous'
    /*
    save_to_file():void
    {
        var users_score = this.read_file();
        var obj;
        if(this.user_name)
        {
            obj = {
                username: this.user_name,
                score: this.curent_score.toString()
            }
        }else
        {
            obj = {
                username: "anonymous",
                score: this.curent_score.toString()
            }
        }
        users_score.push(obj);
        writeFileSync("../data/scores.json",users_score,"utf-8");
    }

    read_file():any
    {
        var usersjson = readFileSync("../data/scores.json","utf-8");
        let users_score = JSON.parse(usersjson);
        return users_score;
    }
    */

}