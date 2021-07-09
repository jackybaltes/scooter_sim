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
import { JBScene } from './jbscene';
import { JBGame } from './jbgame';
import { SimPhase } from './scootersimscene';

class ChapterSelectScene extends IntroScene {
    
    constructor( game : JBGame ) {
        let name = "chapter_select";
        let content = `<h1>Taiwan Scooter Licence Test</h1> 
        
        <h2>Select Chapter</h2>
    
        <table>
        <tr>
        <td><button id="chapter_free_driving" class="chapter_select">Practice: Free Driving</button></td>
        </tr>
        <tr>
        <td><button id="chapter_slow_driving" class="chapter_select">Practice: Slow Driving</button></td>
        </tr>
        <tr>
        <td><button id="chapter_railway_crossing" class="chapter_select">Practice: Railway Crossing</button></td>
        </tr>
        <tr>
        <td><button id="chapter_hook_turn" class="chapter_select">Practice: Hook Turn</button></td>
        </tr>
        <tr>
        <td><button id="chapter_driving_test" class="chapter_select">Take the Driving Test</button></td>
        </tr>
        </table>
    
        <button id="${name}_btn_prev" class="game_button_prev">Previous</button>
        `;
    
        super( name, game, content, "control_intro", "", "../assets/images/taiwan_drivers_licence_intro.png", "game" );        
    }

    private delay(ms: number)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async enter( prev: JBScene ) {
        await super.enter( prev );

        let nb : HTMLElement;

        nb =  document.getElementById( "chapter_free_driving");
        nb.onclick = () => {
            console.log("chapter free driving");
            this.game.switch( "sim", SimPhase.FreeDriving );
        };

        nb =  document.getElementById( "chapter_slow_driving");
        nb.onclick = () => {
            console.log("chapter slow driving");
            this.game.switch( "sim", SimPhase.SlowDrivingIntro );
        };

        nb =  document.getElementById( "chapter_driving_test");
        nb.onclick = () => {
            console.log("chapter driving test");
            this.game.switch( "sim", SimPhase.DrivingTest );
        };
    }
}


export { ChapterSelectScene };