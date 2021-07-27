import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
import { JBGame } from '../jbgame';
import { ScooterSimScene } from "../scootersimscene";

const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Failure to comply with the regultations for two part turn or direct turn
<span style="color:red">- deduct 32 points</span></p>
<p>2. Failure to comply with the regultations for reducing speed to enter the turn waiting area
<span style="color:red">- deduct 16 points</span></p>
<p>3. Failure to comply with the regultations for stopping in the turn waiting area
<span style="color:red">- deduct 16 points</span></p>

`;

enum ScooterSimPhaseHookTurnState {
    HookTurn = "hook turn",
    HookTurnIntro = "hook turn-intro",
    HookTurnSuccess = "hook turn-success",
    HookTurnFailure = "hook turn-failure",
    HookTurnDone = "hook turn-done"
}

class ScooterSimPhaseHookTurn extends ScooterSimPhaseOverlay {
    state : ScooterSimPhaseHookTurnState;

    constructor( game : JBGame, state : string ) {
        super( "scooter_sim_phase_hook_turn_intro", game, content, [ -4, 0.94, 16.7, 0.0 ] );
        this.state = ScooterSimPhaseHookTurnState[ state.toLowerCase() ];
    }


    switchPhase( prev: string, next: string ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        if ( next === ScooterSimPhaseHookTurnState.HookTurnIntro ) 
        {
            this.updateDOM( );
            this.show( true );
            sim.reset();
            sim.lock_imputs = true;
            //to avoid unrelated messages
            
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;    
            sim.test_track.setMessage("");

            setTimeout(()=>{sim.currentPhase = ScooterSimPhaseHookTurnState.HookTurn;}, 5000 );
        }
        else if ( next === ScooterSimPhaseHookTurnState.HookTurn )
        {
            sim.reset();
            
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;    
            sim.test_track.setMessage("");

        }
        else if ( next === ScooterSimPhaseHookTurnState.HookTurnSuccess )
        {

            sim.scooterObj.velocity = 0.0;
            sim.lock_imputs = true;

            this.content = `<h1 style="color:green">Well done !<br></h1> 
            <hr>
            <span>You passed the hook turn training !</span></p>
            <p>You will be brought back into the menu in 5sec<p>
            `;
            this.updateDOM( );
            this.show( true );
            setTimeout(()=>{sim.currentPhase = ScooterSimPhaseHookTurnState.HookTurnDone;},5000);
        }
        else if ( next === ScooterSimPhaseHookTurnState.HookTurnDone )
        {
            //go to menu 
            this.stop();
            this.show( false );
            this.game.switch("chapter_select");

        }
        else if(next === ScooterSimPhaseHookTurnState.HookTurnFailure)
        {
            sim.test_track.setMessage("Wait a bit inside the rectangle with the good orientation !");
            sim.reset();
        }
        console.log("prev=",prev);
        console.log("next=",next);

        if (next === ScooterSimPhaseHookTurnState.HookTurn) 
        {
            this.updateDOM( );
            this.show( false );
        }
    }

    tickPhase( dt : number ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;

        
        sim.test_track.part1_cango_after = true;
        sim.test_track.part2_cango_after = true;

        if ( sim.prevPhase !== sim.currentPhase ) {
            sim.overlayPhase.switchPhase( sim.prevPhase, sim.currentPhase );
        }
        //console.log(`HookTurn tick phase ${sim.currentPhase} dt ${dt}`);

        if( sim.test_track && sim.scooterObj ) {
            let tret = sim.test_track.update(   sim.scooterObj.get_wheel_position(),
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
        //updating the state of the training challenge
        //checking the reset conditions of this part 
        if(sim.is_done() || (sim.test_track.part3_after.is_in(sim.scooterObj.get_wheel_position()) && !sim.test_track.part3_cango_after) )
        {
            this.switchPhase(sim.prevPhase,ScooterSimPhaseHookTurnState.HookTurnFailure)
        }
        //if challenge completed 
        if( !sim.test_track.part3_after.is_in(sim.scooterObj.get_wheel_position()) && sim.test_track.part3_cango_after)
        {
            //sim.reset();
            this.switchPhase(sim.prevPhase,ScooterSimPhaseHookTurnState.HookTurnSuccess )
        }
        

            
        for (const object of sim.updateables) {
            object.tick( sim.dt );
        }

        if ( ! this.wrapper.hidden ) {
            this.tick( dt );
        }
    }
}

export { ScooterSimPhaseHookTurn, ScooterSimPhaseHookTurnState };
