import { ScooterSimPhaseOverlay } from "../scootersimphaseoverlay";
const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Wheels crossing the lines
<span style="color:red">- deduct 16 points</span></p>
<p>2. One of both feet resting on the ground while the vehicule is in motion 
<span style="color:red">- deduct 16 points</span></p>
`;
var ScooterSimPhaseHairPinState;
(function (ScooterSimPhaseHairPinState) {
    ScooterSimPhaseHairPinState["HairPin"] = "hair pin";
    ScooterSimPhaseHairPinState["HairPinIntro"] = "hair pin-intro";
    ScooterSimPhaseHairPinState["HairPinSuccess"] = "hair pin-success";
    ScooterSimPhaseHairPinState["HairPinFailure"] = "hair pin-failure";
    ScooterSimPhaseHairPinState["HairPinDone"] = "hair pin-done";
})(ScooterSimPhaseHairPinState || (ScooterSimPhaseHairPinState = {}));
class ScooterSimPhaseHairPin extends ScooterSimPhaseOverlay {
    constructor(game, state) {
        super("scooter_sim_phase_hair_pin_intro", game, content, [3.3, 0.94, 9, 1.57]);
        this.state = ScooterSimPhaseHairPinState[state.toLowerCase()];
    }
    switchPhase(prev, next) {
        let sim = this.game.currentScene;
        if (next === ScooterSimPhaseHairPinState.HairPinIntro) {
            this.updateDOM();
            this.show(true);
            sim.reset();
            sim.lock_imputs = true;
            //to avoid unrelated messages
            sim.test_track.part0_cango_after = true;
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;
            sim.test_track.part3_cango_after = true;
            sim.test_track.setMessage("");
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseHairPinState.HairPin; }, 5000);
        }
        else if (next === ScooterSimPhaseHairPinState.HairPin) {
            sim.reset();
            sim.test_track.part0_cango_after = true;
            sim.test_track.part1_cango_after = true;
            sim.test_track.part2_cango_after = true;
            sim.test_track.part3_cango_after = true;
            sim.test_track.setMessage("");
        }
        else if (next === ScooterSimPhaseHairPinState.HairPinSuccess) {
            sim.scooterObj.velocity = 0.0;
            sim.lock_imputs = true;
            this.updateDOM();
            this.content = `<h1 style="color:green">Well done !<br></h1> 
            <hr>
            <span>You passed the hair pin turn !</span></p>
            <p>You will be brought back into the menu in 5sec<p>
            `;
            this.show(true);
            setTimeout(() => { sim.currentPhase = ScooterSimPhaseHairPinState.HairPinDone; }, 5000);
        }
        else if (next === ScooterSimPhaseHairPinState.HairPinDone) {
            //go to menu 
            this.stop();
            this.game.switch("chapter_select");
        }
        else if (next === ScooterSimPhaseHairPinState.HairPinFailure) {
            sim.test_track.setMessage("you felt !");
            sim.reset();
        }
        if (next === ScooterSimPhaseHairPinState.HairPin) {
            this.show(false);
        }
    }
    tickPhase(dt) {
        let sim = this.game.currentScene;
        sim.test_track.part0_cango_after = true;
        sim.test_track.part1_cango_after = true;
        sim.test_track.part2_cango_after = true;
        sim.test_track.part3_cango_after = true;
        if (sim.prevPhase !== sim.currentPhase) {
            sim.overlayPhase.switchPhase(sim.prevPhase, sim.currentPhase);
        }
        console.log(`HairPin tick phase ${sim.currentPhase} dt ${dt}`);
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
        if (sim.is_done() || (sim.test_track.part4_after.is_in(sim.scooterObj.get_wheel_position()) && !sim.test_track.part4_cango_after)) {
            this.switchPhase(sim.prevPhase, ScooterSimPhaseHairPinState.HairPinFailure);
        }
        //if challenge completed 
        if (sim.test_track.part4.is_in(sim.scooterObj.get_wheel_position())) {
            //sim.reset();
            this.switchPhase(sim.prevPhase, ScooterSimPhaseHairPinState.HairPinSuccess);
        }
        for (const object of sim.updateables) {
            object.tick(sim.dt);
        }
        if (!this.wrapper.hidden) {
            this.tick(dt);
        }
    }
}
export { ScooterSimPhaseHairPin, ScooterSimPhaseHairPinState };
