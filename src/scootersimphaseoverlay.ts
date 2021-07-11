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

class ScooterSimPhaseOverlay extends IntroScene {
    
    constructor( name : string, game : JBGame ) {
        super( "scooter_sim_phase_overlay", game, "", "", "", "../assets/images/taiwan traffic board.png", "id_sim_overlay" );
    }

    updateDOM( content : string ) {
        this.labels.innerHTML = content;
    }
}

export { ScooterSimPhaseOverlay };