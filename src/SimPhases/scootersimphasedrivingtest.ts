import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
import { JBGame } from '../jbgame';
import { ScooterSimScene } from "../scootersimscene";

const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Balance in a straight line completed in fewer than seven seconds 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Wheel crossing lines or either one or both feet touching the ground 
<span style="color:red">- deduct 32 points</span></p>
`;

enum ScooterSimPhaseDrivingTestState {
    DrivingTest = "driving test",
    DrivingTestIntro = "driving test-intro",
    DrivingTestSccuess = "driving test-success",
    DrivingTestFailure = "driving test-failure",
    DrivingTestDone = "driving test-done"
}

class ScooterSimPhaseDrivingTest extends ScooterSimPhaseOverlay {
    state : ScooterSimPhaseDrivingTestState;

    constructor( game : JBGame, state : string ) {
        super( "scooter_sim_phase_driving_test", game, content, [ -12.2, 0.94, -15, -Math.PI/2 ] );
        this.state = ScooterSimPhaseDrivingTestState[ state.toLowerCase() ];
    }

        tickPhase( dt : number ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        
        if ( sim.prevPhase !== sim.currentPhase ) {
            sim.overlayPhase.switchPhase( sim.prevPhase, sim.currentPhase );
        }
        //console.log(`SlowDriving tick phase ${sim.currentPhase} dt ${dt}`);

        if( sim.test_track && sim.scooterObj ) {
            let tret = sim.test_track.update(   sim.scooterObj.get_wheel_position(),
                                                sim.scooterObj.scooter_yaw_rotation,
                                                sim.scooterObj.blinking_left,
                                                sim.scooterObj.velocity == 0 );
            sim.score_element.innerHTML = "SCORE = " + sim.curent_score + "  |  BEST SCORE = " + sim.best_score +" ("+sim.best_user+")";
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
        //updating the state of the training challenge
        //checking the reset conditions of this part 
        // if(sim.is_done())
        // {
        //     this.switchPhase(sim.prevPhase,ScooterSimPhaseSlowDrivingState.SlowDrivingFailure)
        // }
        //if challenge completed 
        // if( sim.test_track.part0_after.is_in(sim.scooterObj.get_wheel_position()) && sim.test_track.part0_cango_after)
        // {
        //     //sim.reset();
        //     this.switchPhase(sim.prevPhase,ScooterSimPhaseSlowDrivingState.SlowDrivingSuccess )
        // }
        
            
        for (const object of sim.updateables) {
            object.tick( sim.dt,sim );
        }

        if ( ! this.wrapper.hidden ) {
            this.tick( dt );
        }
    }

}

export { ScooterSimPhaseDrivingTest, ScooterSimPhaseDrivingTestState };