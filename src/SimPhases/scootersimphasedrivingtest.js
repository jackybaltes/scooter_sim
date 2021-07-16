import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Balance in a straight line completed in fewer than seven seconds 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Wheel crossing lines or either one or both feet touching the ground 
<span style="color:red">- deduct 32 points</span></p>
`;
var ScooterSimPhaseDrivingTestState;
(function (ScooterSimPhaseDrivingTestState) {
    ScooterSimPhaseDrivingTestState["DrivingTest"] = "driving test";
    ScooterSimPhaseDrivingTestState["DrivingTestIntro"] = "driving test-intro";
    ScooterSimPhaseDrivingTestState["DrivingTestSccuess"] = "driving test-success";
    ScooterSimPhaseDrivingTestState["DrivingTestFailure"] = "driving test-failure";
    ScooterSimPhaseDrivingTestState["DrivingTestDone"] = "driving test-done";
})(ScooterSimPhaseDrivingTestState || (ScooterSimPhaseDrivingTestState = {}));
class ScooterSimPhaseDrivingTest extends ScooterSimPhaseOverlay {
    constructor(game, state) {
        super("scooter_sim_phase_driving_test", game, content, [-12.2, 0.94, -15, -Math.PI / 2]);
        this.state = ScooterSimPhaseDrivingTestState[state.toLowerCase()];
    }
}
export { ScooterSimPhaseDrivingTest, ScooterSimPhaseDrivingTestState };
