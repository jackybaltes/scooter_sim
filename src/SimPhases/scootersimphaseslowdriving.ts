import { Vector2 } from "three";

import { ScooterSimPhaseOverlay } from "./scootersimphaseoverlay";
import { JBGame } from './jbgame';
import { ScooterSimScene, SimPhase } from "./scootersimscene";
import { CheckPoint } from "./track";
import { Robot } from "./robot";


const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Balance in a straight line completed in fewer than seven seconds 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Wheel crossing lines or either one or both feet touching the ground 
<span style="color:red">- deduct 32 points</span></p>
`;

enum ScooterSimPhaseSlowDrivingState {
    SlowDriving = "slow driving",
    SlowDrivingIntro = "slow driving-intro",
    SlowDrivingWait = "slow driving-wait",
    SlowDrivingSuccess = "slow driving-success",
    SlowDrivingFailure = "slow driving-failure",
    SlowDrivingDone = "slow driving-done"
}

enum TrackUpdateReturn {
    OK,
    TrialStarted,
    ErrScooterFall,
    ErrSlowDrivingStopped,
    ErrSlowDrivingCrossed,
    ErrSlowDrivingTooFast,
}


class ScooterSimPhaseSlowDriving extends ScooterSimPhaseOverlay {
    state : ScooterSimPhaseSlowDrivingState;

    protected startBox: CheckPoint;
    protected endBox:CheckPoint;

    protected onTrack:boolean;
    protected canGo : boolean;
    protected canGoAfter : boolean;

    protected failed: boolean;
    protected tries: number;
    
    coord : Array<[ number, number ]>;
    arrayX : Array<number>;
    arrayY : Array<number>;

    constructor( game : JBGame, state : string ) {
        super( "scooter_sim_phase_slow_driving_intro", game, content, [ -12.2, 0.94, -15, -Math.PI/2 ] );
        this.state = ScooterSimPhaseSlowDrivingState[ state.toLowerCase() ];
        this.startBox = new CheckPoint(new Vector2(-10,12.7),new Vector2(-13.8,-2.35));
        this.endBox = new CheckPoint( new Vector2(-10.7,-2.4),new Vector2(-14.8,-7.57));
        this.onTrack = false;
        this.canGo = false;
        this.tries = 0;
        this.failed = false;

        //this.coord = [[-11.57,15.86],[-11.57,14.00],[-11.92,12.80],[-11.92,-2.35],[-11.35,-8.90],[-11.3,-14.07],[-9.94,-15.59],[-8.64,-16.11],[-7.16,-16.18],[1.57,-16.24],[2.51,-15.88],[2.97,-14.85],[4.17,-13.96],[2.78,-12.92],[2.78,-4.19],[2.31,-3.30],[1.22,-3.03],[-8.54,-3.03],[-8.58,2.311],[0.77,2.37],[1.80,2.42],[2.63,2.98],[2.89,3.96],[2.88,15.16],[5.90,15.16],[5.87,0.49],[-4.61,0.49],[-4.61,-1.22],[2.75,-1.18],[4.25,-1.18],[4.25,-4.84],[4.81,-5.73],[5.80,-6.20],[5.69,-20.58],[-4.5,-20.58],[-4.5,-17.51],[-8.68,-17.46],[-9.98,-17.13],[-11.22,-16.45],[-12.23,-15.43],[-13.05,-14.09],[-13.01,-8.94],[-12.40,-2.31],[-12.40,12.80],[-12.69,14.00],[-12.74,15.85]];

        this.arrayX = new Array<number>();
        this.arrayY = new Array<number>();
        
        this.coord = [ [-11.57,  15.86], 
                       [-11.57,  14.  ], 
                       [-11.92,  12.8 ], 
                       [ -11.92,  -2.35], 
                       [-11.35,  -8.9 ], 
                       [-13.01, -8.94],
                       [ -12.4, -2.31], 
                       [-12.4,   12.8 ], 
                       [-12.69,  14.  ], 
                       [-12.74,  15.85], 
                        ];

        for( let [x,y] of this.coord ) {
            this.arrayX.push(x);
            this.arrayY.push(y);
        }

        this.collisionCallback(7000);
    }

    initTrack() {
        this.canGo = false;
        this.onTrack = false;
        this.failed = false;

    }

    updateTrack( scooter : Robot ) : TrackUpdateReturn {
        let tret : TrackUpdateReturn = TrackUpdateReturn.OK;
        let scooterPos = scooter.get_position();

        this.onTrack = this.startBox.is_in( scooterPos );
        if ( (this.currentPhase === SimPhase.SlowDrivingWait ) && ( scooter.velocity > 0.0001 ) ) {
            tret = TrackUpdateReturn.TrialStarted;
        } else if ( scooter.velocity < 0.0001 ) {
            this.tries = this.tries + 1;
            tret = TrackUpdateReturn.ErrScooterFall;
        } else if ( ! this.isInTrack( scooterPos ) ) {
            this.onTrack = false;
            this.tries = this.tries + 1;
            tret = TrackUpdateReturn.ErrSlowDrivingCrossed;
        }

        return tret;
    }

    switchPhase( prev: string, next: string ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        let scooter = sim.scooterObj;
        let track = sim.test_track;

        if ( next === ScooterSimPhaseSlowDrivingState.SlowDrivingIntro ) {
            this.updateDOM( );
            this.show( true );
            sim.reset();
            sim.lock_imputs = true;
            setTimeout(()=>{sim.currentPhase = ScooterSimPhaseSlowDrivingState.SlowDriving;}, 5000 );
        }
        else if ( next === ScooterSimPhaseSlowDrivingState.SlowDriving )
        {
            sim.reset();
        }
        else if ( next === ScooterSimPhaseSlowDrivingState.SlowDrivingSuccess )
        {

            sim.stopwatch.resetTimer();
            sim.stopwatch.startTimer();
            track.init_track()
            scooter.init_position(  sim.overlayPhase.spawn  );
            
            sim.phi =0.0;
            sim.phi_vel = 0.001;
    
            sim.prev_rx = 0;
            sim.prev_ry = 0;

            setTimeout( () => {
                sim.nextPhase = ScooterSimPhaseSlowDrivingState.SlowDrivingWait;
            }, 5000 );
        } else if ( next === ScooterSimPhaseSlowDrivingState.SlowDrivingWait ) {
            this.show( false );
        } else if ( next === ScooterSimPhaseSlowDrivingState.SlowDriving ) {
            this.show( false );
        
            sim.stopwatch.resetTimer();
            sim.stopwatch.startTimer();
            sim.test_track.init_track()
            sim.scooterObj.init_position(  sim.overlayPhase.spawn  );
            
            sim.phi =0.0;
            sim.phi_vel = 0.001;
    
            sim.prev_rx = 0;
            sim.prev_ry = 0;
        
        }        
    }

    tickPhase( dt : number ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        let scooter : Robot = sim.scooterObj;
        let track = sim.test_track;

        if ( sim.prevPhase !== sim.currentPhase ) {
            sim.overlayPhase.switchPhase( sim.prevPhase, sim.currentPhase );
        }
        //console.log(`SlowDriving tick phase ${sim.currentPhase} dt ${dt}`);

        if ( ( track != null ) && ( scooter != null ) ) {
            let terr = this.updateTrack( scooter );

            if ( terr === TrackUpdateReturn.OK ) {

            } else if ( terr === TrackUpdateReturn.TrialStarted ) { 
                sim.nextPhase = SimPhase.SlowDriving;
            } else if ( terr === TrackUpdateReturn.ErrSlowDrivingCrossed ) {
                let html = `
                <h1>Slow Driving Failure- Crossed the Line</h1>
                <p>You must stay within the line while driving your scooter.</p>
                `;
                this.content = html;
                this.updateDOM();
                this.show( true );
                sim.nextPhase = ScooterSimPhaseSlowDrivingState.SlowDrivingFailure;
            } else if ( terr === TrackUpdateReturn.ErrSlowDrivingStopped ) {
                let html = `
                <h1>Slow Driving Failure - Stopped during the Trial</h1>
                <p>You stopped the scooter while driving the line.</p>
                `;
                this.content = html;
                this.updateDOM();
                this.show( true );
                sim.nextPhase = ScooterSimPhaseSlowDrivingState.SlowDrivingFailure;
            } else if ( terr === TrackUpdateReturn.ErrScooterFall ) {
                let html = `
                <h1>Slow Driving Failure - Scooter Crash</h1>
                <p>You crashed the scooter.</p>
                `;
                this.content = html;
                this.updateDOM();
                this.show( true );
                sim.nextPhase = ScooterSimPhaseSlowDrivingState.SlowDrivingFailure;
            }

            sim.score_element.innerHTML = "SCORE : " + sim.curent_score + "  |  BEST : " + sim.best_score;
            sim.comment_element.innerHTML = "COMMENTS : <br><br>" + track.getMessage();
        
            sim.curent_score = sim.test_track.getscore();
        }


        // if( sim.test_track && sim.scooterObj ) {
        //     let tret = sim.test_track.update( sim.scooterObj.get_wheel_position(),
        //                                        sim.scooterObj.scooter_yaw_rotation,
        //                                        sim.scooterObj.blinking_left,
        //                                        sim.scooterObj.velocity == 0 );
        //     sim.score_element.innerHTML = "SCORE : " + sim.curent_score + "  |  BEST : " + sim.best_score;
        //     sim.comment_element.innerHTML = "COMMENTS : <br><br>" + sim.test_track.getMessage();
        
        //     sim.curent_score = sim.test_track.getscore();
        // }        
    }

    isInTrack(point : { x: number, y: number, z:number, yaw: number} ) {
        let x = point.x;
        let y = -point.z;
        let i=0;
        let j=this.arrayX.length-1 ;
        let odd = false;
    
        let pX = this.arrayX;
        let pY = this.arrayY;
    
        //this may not work in typescript
        for (i=0; i<this.arrayX.length; i++) 
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

    private sleep(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    async collisionCallback(time_needed_ms,function_ = null)
    {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        let scooter : Robot = sim.scooterObj;
        let track = sim.test_track;

        this.canGoAfter = false; 
        while(true)
        {   
            let counter = 0;
            while(this.onTrack)
            {
                if(!this.canGoAfter)
                {
                   track.message = (counter/10)+" seconds | (min 7 seconds)";
                }

                if(scooter.velocity < 0.0001 ) {
                    this.failed = true;
                    break;
                }

                counter++;
                await this.sleep(100);
                if(counter*100>=time_needed_ms)
                {
                    this.canGoAfter = true
                    track.message = "you lasted more than 7 sec !";
                    break;
                }
            }
            //delay to not kill the computer
            await this.sleep(100);
        }        
    }

}

export { ScooterSimPhaseSlowDriving, ScooterSimPhaseSlowDrivingState };
