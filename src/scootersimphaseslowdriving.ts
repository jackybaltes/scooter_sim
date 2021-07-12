import { ScooterSimPhaseOverlay } from "./scootersimphaseoverlay";
import { JBGame } from './jbgame';
import { ScooterSimScene } from "./scootersimscene";

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
    SlowDrivingSuccess = "slow driving-success",
    SlowDrivingFailure = "slow driving-failure",
    SlowDrivingDone = "slow driving-done"
}

class ScooterSimPhaseSlowDriving extends ScooterSimPhaseOverlay {
    state : ScooterSimPhaseSlowDrivingState;

    constructor( game : JBGame, state : string ) {
        super( "scooter_sim_phase_slow_driving_intro", game, content, [ -12.2, 0.94, -15, -Math.PI/2 ] );
        this.state = ScooterSimPhaseSlowDrivingState[ state.toLowerCase() ];
    }

    
    switchPhase( prev: string, next: string ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;

        if ( next === ScooterSimPhaseSlowDrivingState.SlowDrivingIntro ) {
            this.updateDOM( );
            this.show( true );

            sim.stopwatch.resetTimer();
            sim.stopwatch.startTimer();
            sim.test_track.init_track()
            sim.scooterObj.init_position(  sim.overlayPhase.spawn  );
            
            sim.phi =0.0;
            sim.phi_vel = 0.001;
    
            sim.prev_rx = 0;
            sim.prev_ry = 0;

            setTimeout( () => {
                sim.currentPhase = ScooterSimPhaseSlowDrivingState.SlowDriving;
            }, 5000 );
        } else if ( next === ScooterSimPhaseSlowDrivingState.SlowDriving ) {
            sim.stopwatch.resetTimer();
            sim.stopwatch.startTimer();
            sim.test_track.init_track()
            sim.scooterObj.init_position(  sim.overlayPhase.spawn  );
            
            sim.phi =0.0;
            sim.phi_vel = 0.001;
    
            sim.prev_rx = 0;
            sim.prev_ry = 0;
        
        }

        if ( ( prev === ScooterSimPhaseSlowDrivingState.SlowDrivingIntro ) && ( next === ScooterSimPhaseSlowDrivingState.SlowDriving ) ) {
            this.show( false );
        }
    }

    tickPhase( dt : number ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        
        if ( sim.prevPhase !== sim.currentPhase ) {
            sim.overlayPhase.switchPhase( sim.prevPhase, sim.currentPhase );
        }
        console.log(`SlowDriving tick phase ${sim.currentPhase} dt ${dt}`);

        if( sim.test_track && sim.scooterObj ) {
            let tret = sim.test_track.update( sim.scooterObj.get_wheel_position(),
                                               sim.scooterObj.scooter_yaw_rotation,
                                               sim.scooterObj.blinking_left,
                                               sim.scooterObj.velocity == 0 );
            sim.score_element.innerHTML = "SCORE : " + sim.curent_score + "  |  BEST : " + sim.best_score;
            sim.comment_element.innerHTML = "COMMENTS : <br><br>" + sim.test_track.getMessage();
        
            sim.curent_score = sim.test_track.getscore();
        }
        
        if( sim.scooterObj ) {
            sim.physics();
            let cam_dist : number = 8;
            let camdist_x : number = cam_dist*Math.cos( - sim.scooterObj.scooter_yaw_rotation );
            let camdist_y : number = cam_dist*Math.sin( - sim.scooterObj.scooter_yaw_rotation );

            let view = document.getElementById( "cb_camera_view" );

            let e = (document.getElementById("cb_camera_view")) as HTMLSelectElement;
            let sel = e.selectedIndex;
            let opt = e.options[sel];
            let cb_view = (<HTMLOptionElement>opt).value;

            if ( cb_view == "cb_follow" ) {
                sim.camera.position.set( sim.scooterObj.get_position().x - camdist_x, sim.scooterObj.get_position().y+5, sim.scooterObj.get_position().z-camdist_y);
                sim.camera.lookAt( sim.scooterObj.get_position().x, sim.scooterObj.get_position().y, sim.scooterObj.get_position().z );
            }
        }
            
        for (const object of sim.updateables) {
            object.tick( sim.dt );
        }

        if ( ! this.wrapper.hidden ) {
            this.tick( dt );
        }
    }
}

export { ScooterSimPhaseSlowDriving, ScooterSimPhaseSlowDrivingState };
