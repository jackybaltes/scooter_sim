import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
import { JBGame } from '../jbgame';
import { ScooterSimScene } from "../scootersimscene";
import { Robot } from "../robot";

const content = `<h1>Free Driving</h1>
`;

enum ScooterSimPhaseFreeDrivingState {
    FreeDriving = "free driving",
    FreeDrivingDone = "free driving-done"
}

class ScooterSimPhaseFreeDriving extends ScooterSimPhaseOverlay {
    state : ScooterSimPhaseFreeDrivingState;

    constructor( game : JBGame, state : string ) {
        super( "scooter_sim_phase_free_driving_intro", game, content, [ -12.2, 0.94, -15, -Math.PI/2 ] );
        this.state = ScooterSimPhaseFreeDrivingState[ state.toLowerCase() ];

    }

    switchPhase( prev: string, next: string ) {
        if ( next === ScooterSimPhaseFreeDrivingState.FreeDriving ) {
            let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
            let scooter = sim.scooterObj;
            let track = sim.test_track;

            scooter.init_position(  sim.overlayPhase.spawn  );

            
        }
    }

    tickPhase( dt : number ) {
        let sim : ScooterSimScene = this.game.currentScene as ScooterSimScene;
        let scooter : Robot = sim.scooterObj;
        let track = sim.test_track;

        if ( sim.prevPhase !== sim.currentPhase ) {
            sim.overlayPhase.switchPhase( sim.prevPhase, sim.currentPhase );
        }
        console.log(`SlowDriving tick phase ${sim.currentPhase} dt ${dt}`);
    }
}

export { ScooterSimPhaseFreeDriving, ScooterSimPhaseFreeDrivingState };