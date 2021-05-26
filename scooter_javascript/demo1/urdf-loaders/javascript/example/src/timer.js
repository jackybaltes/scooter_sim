

export class Timer {

    constructor()
    {


    this.timerDisplay = document.querySelector('.timer');

    this.startTime;
    this.updatedTime;
    this.difference;
    this.tInterval;
    this.savedTime;
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
        var hours = Math.floor((this.difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((this.difference % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((this.difference % (1000 * 60)) / 1000);
        var milliseconds = Math.floor((this.difference % (1000 * 60)) / 100);hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        milliseconds = (milliseconds < 100) ? (milliseconds < 10) ? "00" + milliseconds : "0" + milliseconds : milliseconds;
        
        if(isNaN(minutes))
        {
            minutes = "00";

        }
        if(isNaN(seconds))
        {
            seconds = "00";
        }

        if(isNaN(milliseconds))
        {
            milliseconds = "00";
        }

        return minutes + ':' + seconds + ':' + milliseconds;
    }


}