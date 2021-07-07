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

const content = `<h1>Taiwan Scooter Licence Test</h1> 
        
    <h2>Control</h2>

    <p>Use the following controls:</p>
    
    <table>
    <tr>
    <td>'w'</td><td>Increase throttle</td>
    </tr>
    <tr>
    <td>'s'</td><td>Decrease throttle</td>
    </tr>
    <tr>
    <td>'a'</td><td>Steer left</td>
    </tr>
    <tr>
    <td>'d'</td><td>Steer right</td>
    </tr>
    <tr>
    <td>'q'</td><td>Turn signal left</td>
    </tr>
    <tr>
    <td>'d'</td><td>Turn signal right</td>
    </tr>
    </table>

    <button id="control_intro_btn_prev" class="game_button_prev">Previous</button>

    <button id="control_intro_btn_next" class="game_button_next">Next</button>
    `;

class ControlIntroScene extends IntroScene {
    
    constructor( game : JBGame ) {
        super( "control_intro", game, content, "start_intro", "sim" );
    }
}

export { ControlIntroScene };