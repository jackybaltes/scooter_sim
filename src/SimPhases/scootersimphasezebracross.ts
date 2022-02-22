import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
import { JBGame } from '../jbgame';
import { ScooterSimScene } from "../scootersimscene";

const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Not stopping for pedestrians or not allowing them to cross first 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Letting front wheel cross stop line
<span style="color:red">- deduct 32 points</span></p>
`;

enum ScooterSimPhaseZebraState {
    Zebra = "Zebra Crossing",
    ZebraIntro = "Zebra Crossing-intro",
    ZebraSuccess = "Zebra Crossing-success",
    ZebraFailure = "Zebra Crossing-failure",
    ZebraDone = "Zebra Crossing-done"
}

class ScooterSimPhaseZebra extends ScooterSimPhaseOverlay {
    private state : ScooterSimPhaseZebraState;

    constructor( game : JBGame, state : string ) {
        super( "scooter_sim_phase_zebra_crossing_intro", game, content, [ -12.2, 0.94, 7, -Math.PI/2 ] );
        this.state = ScooterSimPhaseZebraState[ state.toLowerCase() ];
    }


    switchPhase( prev: string, next: string ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        if ( next === ScooterSimPhaseZebraState.ZebraIntro ) 
        {
            this.updateDOM( );
            this.show( true );
            sim.reset();
            sim.lock_imputs = true;
            setTimeout(()=>{sim.currentPhase = ScooterSimPhaseZebraState.Zebra;}, 5000 );
        }
        else if ( next === ScooterSimPhaseZebraState.Zebra )
        {
            sim.reset();
        }
        else if ( next === ScooterSimPhaseZebraState.ZebraSuccess )
        {

            sim.scooterObj.velocity = 0.0;
            sim.lock_imputs = true;

            this.content = `<h1 style="color:green">Well done !<br></h1> 
            <hr>
            <span>You passed the zebra crossing training !</span></p>
            <p>You will be brought back into the menu in 5sec<p>
            `;
            this.updateDOM( );
            this.show( true );
            setTimeout(()=>{sim.currentPhase = ScooterSimPhaseZebraState.ZebraDone;},5000);
        }
        else if ( next === ScooterSimPhaseZebraState.ZebraDone )
        {
            //go to menu 
            this.stop();
            this.game.switch("chapter_select");

        }
        else if(next === ScooterSimPhaseZebraState.ZebraFailure)
        {
            sim.test_track.setMessage("Wait for the light before crossing !");
            sim.reset();
        }


        if (next === ScooterSimPhaseZebraState.Zebra) 
        {
            this.show( false );
        }
    }

    tickPhase( dt : number ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        
        if ( sim.prevPhase !== sim.currentPhase ) {
            sim.overlayPhase.switchPhase( sim.prevPhase, sim.currentPhase );
        }
        console.log(`Zebra tick phase ${sim.currentPhase} dt ${dt}`);

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

        if(sim.is_done() || (sim.test_track.part1_after.is_in(sim.scooterObj.get_wheel_position()) && !sim.test_track.part1_cango_after) )
        {            
            this.switchPhase(sim.prevPhase,ScooterSimPhaseZebraState.ZebraFailure)
        }
        //if challenge completed 
        if( sim.test_track.part2.is_in(sim.scooterObj.get_wheel_position()))
        {
            //sim.reset();
            this.switchPhase(sim.prevPhase,ScooterSimPhaseZebraState.ZebraSuccess )
        }
        

            
        for (const object of sim.updateables) {
            object.tick( sim.dt,sim );
        }

        if ( ! this.wrapper.hidden ) {
            this.tick( dt );
        }
    }
}

export { ScooterSimPhaseZebra, ScooterSimPhaseZebraState };
