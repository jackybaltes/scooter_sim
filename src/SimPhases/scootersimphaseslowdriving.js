import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Balance in a straight line completed in fewer than seven seconds 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Wheel crossing lines or either one or both feet touching the ground 
<span style="color:red">- deduct 32 points</span></p>
`;
var ScooterSimPhaseSlowDrivingState;
(function (ScooterSimPhaseSlowDrivingState) {
    ScooterSimPhaseSlowDrivingState["SlowDriving"] = "slow driving";
    ScooterSimPhaseSlowDrivingState["SlowDrivingIntro"] = "slow driving-intro";
    ScooterSimPhaseSlowDrivingState["SlowDrivingSuccess"] = "slow driving-success";
    ScooterSimPhaseSlowDrivingState["SlowDrivingFailure"] = "slow driving-failure";
    ScooterSimPhaseSlowDrivingState["SlowDrivingDone"] = "slow driving-done";
})(ScooterSimPhaseSlowDrivingState || (ScooterSimPhaseSlowDrivingState = {}));
class ScooterSimPhaseSlowDriving extends ScooterSimPhaseOverlay {
    constructor(game, state) {
        super("scooter_sim_phase_slow_driving_intro", game, content, [-12.2, 0.94, -15, -Math.PI / 2]);
        this.state = ScooterSimPhaseSlowDrivingState[state.toLowerCase()];
    }
    switchPhase(prev, next) {
        let sim = this.game.currentScene;
        if (next === ScooterSimPhaseSlowDrivingState.SlowDrivingIntro) {
            this.updateDOM();
            this.show(true);
            sim.reset();
            sim.lock_imputs = true;
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseSlowDrivingState.SlowDriving; }, 5000);
        }
        else if (next === ScooterSimPhaseSlowDrivingState.SlowDriving) {
            sim.reset();
        }
        else if (next === ScooterSimPhaseSlowDrivingState.SlowDrivingSuccess) {
            sim.scooterObj.velocity = 0.0;
            sim.lock_imputs = true;
            this.updateDOM();
            this.content = `<h1 style="color:green">Well done !<br></h1> 
            <hr>
            <span style="color:green">You passed the straight line training !</span></p>
            <p>You will be brought back into the menu in 5sec<p>
            `;
            this.show(true);
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseSlowDrivingState.SlowDrivingDone; }, 5000);
        }
        else if (next === ScooterSimPhaseSlowDrivingState.SlowDrivingDone) {
            //go to menu 
            this.stop();
            this.hide();
            this.game.switch("chapter_select");
        }
        else if (next === ScooterSimPhaseSlowDrivingState.SlowDrivingFailure) {
            sim.test_track.setMessage("You have to stay 7 sec on the line (without stoping)!");
            sim.reset();
        }
        if (next === ScooterSimPhaseSlowDrivingState.SlowDriving) {
            this.show(false);
        }
    }
    tickPhase(dt) {
        let sim = this.game.currentScene;
        if (sim.prevPhase !== sim.currentPhase) {
            sim.overlayPhase.switchPhase(sim.prevPhase, sim.currentPhase);
        }
        //console.log(`SlowDriving tick phase ${sim.currentPhase} dt ${dt}`);
        if (sim.test_track && sim.scooterObj) {
            let tret = sim.test_track.update(sim.scooterObj.get_wheel_position(), sim.scooterObj.scooter_yaw_rotation, sim.scooterObj.blinking_left, sim.scooterObj.velocity == 0);
            sim.score_element.innerHTML = "SCORE : " + sim.curent_score + "  |  BEST : " + sim.best_score;
            sim.comment_element.innerHTML = "COMMENTS : <br><br>" + sim.test_track.getMessage();
            sim.curent_score = sim.test_track.getscore();
        }
        if (sim.scooterObj) {
            sim.physics();
            let cam_dist = 8;
            let camdist_x = cam_dist * Math.cos(-sim.scooterObj.scooter_yaw_rotation);
            let camdist_y = cam_dist * Math.sin(-sim.scooterObj.scooter_yaw_rotation);
            let view = document.getElementById("cb_camera_view");
            let e = (document.getElementById("cb_camera_view"));
            let sel = e.selectedIndex;
            let opt = e.options[sel];
            let cb_view = opt.value;
            if (cb_view == "cb_follow") {
                sim.camera.position.set(sim.scooterObj.get_position().x - camdist_x, sim.scooterObj.get_position().y + 5, sim.scooterObj.get_position().z - camdist_y);
                sim.camera.lookAt(sim.scooterObj.get_position().x, sim.scooterObj.get_position().y, sim.scooterObj.get_position().z);
            }
        }
        //updating the state of the training challenge
        //checking the reset conditions of this part 
        if (sim.is_done()) {
            this.switchPhase(sim.prevPhase, ScooterSimPhaseSlowDrivingState.SlowDrivingFailure);
        }
        //if challenge completed 
        if (sim.test_track.part0_after.is_in(sim.scooterObj.get_wheel_position()) && sim.test_track.part0_cango_after) {
            //sim.reset();
            this.switchPhase(sim.prevPhase, ScooterSimPhaseSlowDrivingState.SlowDrivingSuccess);
        }
        for (const object of sim.updateables) {
            object.tick(sim.dt);
        }
        if (!this.wrapper.hidden) {
            this.tick(dt);
        }
    }
}
export { ScooterSimPhaseSlowDriving, ScooterSimPhaseSlowDrivingState };
