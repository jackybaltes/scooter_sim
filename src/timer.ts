

export class Timer {

    private startTime :number;
    private updatedTime:number;
    private difference:number;
    private tInterval;
    private savedTime:number;
    private paused = 0;
    private running = 0;

    constructor()
    {
        this.paused = 0;
        this.running = 0;
    }

    startTimer(){
        if(!this.running)
        {
            this.startTime = new Date().getTime();
            this.tInterval = setInterval(this.getShowTime, 1);// change 1 to 1000 above to run script every second instead of every millisecond. one other change will be needed in the getShowTime() function below for this to work. see comment there.   
            this.paused = 0;
            this.running = 1;
        }
    }

    pauseTimer(){
        if (!this.difference){
            // if timer never started, don't allow pause button to do anything
        } else if (!this.paused) {
            clearInterval(this.tInterval);
            this.savedTime = this.difference;
            this.paused = 1;
            this.running = 0;
        } 
    }


    resetTimer()
    {
        clearInterval(this.tInterval);
        this.savedTime = 0;
        this.difference = 0;
        this.paused = 0;
        this.running = 0;
    }

    getShowTime()
    {
        this.updatedTime = new Date().getTime();
        if (this.savedTime){
            this.difference = (this.updatedTime - this.startTime) + this.savedTime;
        } else {
            this.difference =  this.updatedTime - this.startTime;
        }
        // var days = Math.floor(difference / (1000 * 60 * 60 * 24));
        var hours:number = Math.floor((this.difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes :number= Math.floor((this.difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds:number = Math.floor((this.difference % (1000 * 60)) / 1000);
        var milliseconds:number = Math.floor((this.difference % (1000 * 60)) / 100);
        
        var hours_ :string;
        var minutes_:string;
        var seconds_:string;
        var millisecond_:string;

        if(isNaN(hours))
        {
            hours = 0;
        }
        if(isNaN(minutes))
        {
            minutes = 0;
        }
        if(isNaN(seconds))
        {
            seconds = 0;
        }

        if(isNaN(milliseconds))
        {
            milliseconds = 0;
        }






        if(hours < 10)
        {
            hours_ = "0"+hours.toString();
        }
        else{
            hours_ =hours.toString();
        }
        if(minutes < 10)
        {
            minutes_ =  "0"+minutes.toString();
        }
        else{
            minutes_ =minutes.toString();
        }

        if(seconds < 10)
        {
            seconds_ =  "0"+seconds.toString();
        }
        else{
            seconds_ =seconds.toString();
        }

        if(milliseconds < 100)
        {
            millisecond_ =  "0"+milliseconds.toString();
        }
        else if(milliseconds < 10)
        {
            millisecond_ =  "00"+milliseconds.toString();
        }

        else{
            millisecond_ =milliseconds.toString();
        }

        return minutes_ + ':' + seconds_ + ':' + millisecond_;
    }


}