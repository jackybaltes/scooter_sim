import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Failure to follow the designated routes  
<span style="color:red">- deduct 16 points</span></p>
<p>2. Failure to use the turn signal prior to lane changes
<span style="color:red">- deduct 32 points</span></p>
<p>2. Failure to check the rearview mirror and turn head to check traffinc on left and right sides before lane changes
<span style="color:red">- deduct 16 points</span></p>
`;
var ScooterSimPhaseLineCrossState;
(function (ScooterSimPhaseLineCrossState) {
    ScooterSimPhaseLineCrossState["LineCross"] = "line cross";
    ScooterSimPhaseLineCrossState["LineCrossIntro"] = "line cross-intro";
    ScooterSimPhaseLineCrossState["LineCrossSuccess"] = "line cross-success";
    ScooterSimPhaseLineCrossState["LineCrossFailure"] = "line cross-failure";
    ScooterSimPhaseLineCrossState["LineCrossDone"] = "line cross-done";
})(ScooterSimPhaseLineCrossState || (ScooterSimPhaseLineCrossState = {}));
class ScooterSimPhaseLineCross extends ScooterSimPhaseOverlay {
    constructor(game, state) {
        super("scooter_sim_phase_line_cross_intro", game, content, [5, 0.94, 13, 1.57]);
        this.state = ScooterSimPhaseLineCrossState[state.toLowerCase()];
    }
    switchPhase(prev, next) {
        let sim = this.game.currentScene;
        if (next === ScooterSimPhaseLineCrossState.LineCrossIntro) {
            this.updateDOM();
            this.show(true);
            sim.reset();
            sim.lock_imputs = true;
            //to avoid unrelated messages
            sim.test_track.part0_cango_after = true;
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;
            sim.test_track.setMessage("");
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseLineCrossState.LineCross; }, 5000);
        }
        else if (next === ScooterSimPhaseLineCrossState.LineCross) {
            sim.reset();
            sim.test_track.part0_cango_after = true;
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;
            sim.test_track.setMessage("");
        }
        else if (next === ScooterSimPhaseLineCrossState.LineCrossSuccess) {
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseLineCrossState.LineCrossDone; }, 5000);
            sim.scooterObj.velocity = 0.0;
            sim.lock_imputs = true;
            this.updateDOM();
            this.content = `<h1 style="color:green">Well done !<br></h1> 
            <hr>
            <span>You passed the crossing lane training !</span></p>
            <p>You will be brought back into the menu in 5sec<p>
            `;
            this.show(true);
        }
        else if (next === ScooterSimPhaseLineCrossState.LineCrossDone) {
            //go to menu 
            this.stop();
            this.game.switch("chapter_select");
        }
        else if (next === ScooterSimPhaseLineCrossState.LineCrossFailure) {
            sim.test_track.setMessage("You have to use the blinker [keyboard: A or E] to cross the line !");
            sim.reset();
        }
        if (next === ScooterSimPhaseLineCrossState.LineCross) {
            this.show(false);
        }
    }
    tickPhase(dt) {
        let sim = this.game.currentScene;
        sim.test_track.part0_cango_after = true;
        sim.test_track.part1_cango_after = true;
        sim.test_track.part2_cango_after = true;
        if (sim.prevPhase !== sim.currentPhase) {
            sim.overlayPhase.switchPhase(sim.prevPhase, sim.currentPhase);
        }
        console.log(`LineCross tick phase ${sim.currentPhase} dt ${dt}`);
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
        if (sim.is_done() || sim.test_track.part35.is_in(sim.scooterObj.get_wheel_position()) && !sim.test_track.scooter_obj_blinker_state) {
            this.switchPhase(sim.prevPhase, ScooterSimPhaseLineCrossState.LineCrossFailure);
        }
        //if challenge completed 
        if (sim.test_track.part35.is_in(sim.scooterObj.get_wheel_position()) && sim.test_track.scooter_obj_blinker_state) {
            //sim.reset();
            this.switchPhase(sim.prevPhase, ScooterSimPhaseLineCrossState.LineCrossSuccess);
        }
        for (const object of sim.updateables) {
            object.tick(sim.dt);
        }
        if (!this.wrapper.hidden) {
            this.tick(dt);
        }
    }
}
export { ScooterSimPhaseLineCross, ScooterSimPhaseLineCrossState };
