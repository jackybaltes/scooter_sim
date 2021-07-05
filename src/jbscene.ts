import { Camera, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';

import { Scene } from 'three';
import { JBGame } from './jbgame';

class JBScene extends Scene {
    name : string;
    game : JBGame;
    camera : PerspectiveCamera | OrthographicCamera;

    constructor( name : string, game : JBGame ) {
        super();
        this.name = name;
        this.game = game;
        console.log( "JBScene constructor" );
    }

    renderer : WebGLRenderer;
    
    create( ) { }

    async preload() {
        console.log( "JBScene preload" );
    }

    start( ) { this.enter( null ) }

    pause( ) { }

    enter( prev : JBScene ) { 
        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.domElement.id = "id_" + this.name;
        let parent = document.getElementById( "game" );
        parent.appendChild( this.renderer.domElement );
    }
    
    leave( next : JBScene ) {
        console.log( `leaving scene ${this.name}, next ${next.name}`);
        
        let el = document.getElementById( "id_" + this.name );
        if ( el !== null ) {
            let parent = document.getElementById( "game" );
            parent.removeChild( el );
        }
    }
    
    tick() {}

    _onResize() {
        if (this.renderer !== null ) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }

    onResize = this._onResize.bind( this );

}

export { JBScene };