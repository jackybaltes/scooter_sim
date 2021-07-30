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
}

export { ScooterSimPhaseDrivingTest, ScooterSimPhaseDrivingTestState };