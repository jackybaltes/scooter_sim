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
        
<h2>National Taiwan Normal University, Taipei, Taiwan</h2>

<p>This game is an off-shoot of our research into developing a humanoid robot
that is able to pass the Taiwan scooter licence test.</p>

<table>
<tr>
<td>
<img height="150vh" src="../assets/images/thormang2.png"></img>
</td>
<td>
<img height="150vh" src="../assets/images/thormang1.png"></img>
</td>
</tr>
<tr>
<td>Thormang 3 and Gogoro Scooter</td>
<td>Thormang 3 First Driving Tests </td>
</tr>
</table>

<!-- <button id="start_intro_btn_prev" class="game_button_prev">>Previous</button> -->
<button id="start_intro_btn_next" class="game_button_next">Next</button>
`;


class StartIntroScene extends IntroScene {
    
    constructor( game : JBGame ) {
        super( "start_intro", game, content, "", "control_intro", "../assets/images/taiwan_drivers_licence_intro.png", "game" );
    }
}

export { StartIntroScene };