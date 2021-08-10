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
import { ScooterSimScene } from './scootersimscene';

class ScooterSimPhaseOverlay extends IntroScene {
    
    content : string;
    spawn : [ number, number, number, number ];

    constructor( name : string, game : JBGame, content : string, spawn : [ number, number, number, number ] ) {
        super( "scooter_sim_phase_overlay", game, "", "", "", "../assets/images/taiwan traffic board.png", "id_sim_overlay" );
        this.content = content;
        this.spawn = spawn;

    }

    
    start( ) {
        this.updateDOM( );
        this.show( true );

        // setTimeout( () => {
        //     this.currentPhase = SimPhase.SlowDriving;
        // }, 5000 );

        // if ( ( prev === SimPhase.SlowDrivingIntro ) && ( next === SimPhase.SlowDriving ) ) {
        //     this.overlayPhase.show( false );
        // }
        return false;
    }

    stop( ) {
        this.show( false );
    }

    updateDOM( ) {
        this.labels.innerHTML = this.content;
    }

    switchPhase( prev : string, next : string ) { }

    tickPhase( dt: number ) { }

    show( show : boolean ) {
        if ( show ) {
            this.wrapper.hidden = false;
        } else {
            this.wrapper.hidden = true;
        }
    }

    hide( ) {
        this.wrapper.hidden = true;
    }
}

export { ScooterSimPhaseOverlay };