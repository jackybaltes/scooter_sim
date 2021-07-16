import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Not stoping to check for trains or running railroad crossing when signal is flashing 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Stalling or stopping on the rails 
<span style="color:red">- deduct 32 points</span></p>
`;
var ScooterSimPhaseRailCrossState;
(function (ScooterSimPhaseRailCrossState) {
    ScooterSimPhaseRailCrossState["RailCross"] = "rail cross";
    ScooterSimPhaseRailCrossState["RailCrossIntro"] = "rail cross-intro";
    ScooterSimPhaseRailCrossState["RailCrossSuccess"] = "rail cross-success";
    ScooterSimPhaseRailCrossState["RailCrossFailure"] = "rail cross-failure";
    ScooterSimPhaseRailCrossState["RailCrossDone"] = "rail cross-done";
})(ScooterSimPhaseRailCrossState || (ScooterSimPhaseRailCrossState = {}));
class ScooterSimPhaseRailCross extends ScooterSimPhaseOverlay {
    constructor(game, state) {
        super("scooter_sim_phase_rail_cross_intro", game, content, [2, 0.94, -1.7, 0.0]);
        this.state = ScooterSimPhaseRailCrossState[state.toLowerCase()];
    }
    switchPhase(prev, next) {
        let sim = this.game.currentScene;
        if (next === ScooterSimPhaseRailCrossState.RailCrossIntro) {
            this.updateDOM();
            this.show(true);
            sim.lock_imputs = true;
            sim.reset();
            //to avoid unrelated messages
            sim.test_track.part0_cango_after = true;
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;
            sim.test_track.part3_cango_after = true;
            sim.test_track.part4_cango_after = true;
            sim.test_track.setMessage("");
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseRailCrossState.RailCross; }, 5000);
        }
        else if (next === ScooterSimPhaseRailCrossState.RailCross) {
            sim.reset();
            sim.test_track.part0_cango_after = true;
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;
            sim.test_track.part3_cango_after = true;
            sim.test_track.part4_cango_after = true;
            sim.test_track.setMessage("");
        }
        else if (next === ScooterSimPhaseRailCrossState.RailCrossSuccess) {
            sim.scooterObj.velocity = 0.0;
            sim.lock_imputs = true;
            this.updateDOM();
            this.content = `<h1 style="color:green">Well done !<br></h1> 
            <hr>
            <span>You passed the rail crossing training !</span></p>
            <p>You will be brought back into the menu in 5sec<p>
            `;
            this.show(true);
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseRailCrossState.RailCrossDone; }, 5000);
        }
        else if (next === ScooterSimPhaseRailCrossState.RailCrossDone) {
            //go to menu 
            this.stop();
            this.game.switch("chapter_select");
        }
        else if (next === ScooterSimPhaseRailCrossState.RailCrossFailure) {
            sim.test_track.setMessage("Wait for the train to pass  !");
            sim.reset();
        }
        if (next === ScooterSimPhaseRailCrossState.RailCross) {
            this.show(false);
        }
    }
    tickPhase(dt) {
        let sim = this.game.currentScene;
        sim.test_track.part0_cango_after = true;
        sim.test_track.part1_cango_after = true;
        sim.test_track.part2_cango_after = true;
        sim.test_track.part3_cango_after = true;
        sim.test_track.part4_cango_after = true;
        if (sim.prevPhase !== sim.currentPhase) {
            sim.overlayPhase.switchPhase(sim.prevPhase, sim.currentPhase);
        }
        console.log(`RailCross tick phase ${sim.currentPhase} dt ${dt}`);
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
        if (sim.is_done() || (sim.test_track.part5_after.is_in(sim.scooterObj.get_wheel_position()) && !sim.test_track.part5_cango_after)) {
            this.switchPhase(sim.prevPhase, ScooterSimPhaseRailCrossState.RailCrossFailure);
        }
        //if challenge completed 
        if (sim.test_track.part5_after.is_in(sim.scooterObj.get_wheel_position()) && sim.test_track.part5_cango_after) {
            //sim.reset();
            this.switchPhase(sim.prevPhase, ScooterSimPhaseRailCrossState.RailCrossSuccess);
        }
        for (const object of sim.updateables) {
            object.tick(sim.dt);
        }
        if (!this.wrapper.hidden) {
            this.tick(dt);
        }
    }
}
export { ScooterSimPhaseRailCross, ScooterSimPhaseRailCrossState };
