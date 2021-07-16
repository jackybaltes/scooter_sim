import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Balance in a straight line completed in fewer than seven seconds 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Wheel crossing lines or either one or both feet touching the ground 
<span style="color:red">- deduct 32 points</span></p>
`;
var ScooterSimPhaseFreeDrivingState;
(function (ScooterSimPhaseFreeDrivingState) {
    ScooterSimPhaseFreeDrivingState["FreeDriving"] = "free driving";
    ScooterSimPhaseFreeDrivingState["FreeDrivingDone"] = "free driving-done";
})(ScooterSimPhaseFreeDrivingState || (ScooterSimPhaseFreeDrivingState = {}));
class ScooterSimPhaseFreeDriving extends ScooterSimPhaseOverlay {
    constructor(game, state) {
        super("scooter_sim_phase_free_driving_intro", game, content, [-12.2, 0.94, -15, -Math.PI / 2]);
        this.state = ScooterSimPhaseFreeDrivingState[state.toLowerCase()];
    }
}
export { ScooterSimPhaseFreeDriving, ScooterSimPhaseFreeDrivingState };
