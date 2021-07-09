import { 
    WebGLRenderer,
    OrthographicCamera,
    PlaneGeometry,
    Mesh,
    Color,
    MeshBasicMaterial,
    Texture,
    ImageUtils,
    TextureLoader,
    Material,
    DoubleSide,
    NoBlending
} from 'three';

import { IntroScene } from './introscene';
import { JBGame } from './jbgame';

const content = `<h1>Balance in a straight line<br>
(One re-test is allowed)</h1> 
<hr>
<p>1. Balance in a straight line completed in fewer than seven seconds 
<span style="color:red">- deduct 32 points</span></p>
<p>2. Wheel crossing lines or either one or both feet touching the ground 
<span style="color:red">- deduct 32 points</span></p>
`;


class SlowDrivingPhaseIntro extends IntroScene {
    
    constructor( game : JBGame ) {
        super( "slow_driving_control_phase", game, content, "", "", "../assets/images/taiwan traffic board.png", "id_sim_overlay" );
    }
}

export { SlowDrivingPhaseIntro };