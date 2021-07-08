import { Camera, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';

import { Scene } from 'three';
import { JBGame } from './jbgame';

class JBScene extends Scene {
    name : string;
    phase : string;
    game : JBGame;
    camera : PerspectiveCamera | OrthographicCamera;
    root : string;

    constructor( name : string, game : JBGame, root : string ) {
        super();
        this.name = name;
        this.game = game;
        this.root = root;

        console.log( "JBScene constructor" );
    }

    renderer : WebGLRenderer;

    async preload() {
        console.log( "JBScene preload" );
    }

    start( ) { this.enter( null ) }

    pause( ) { }

    async enter( prev : JBScene, phase? : string ) { 
        this.renderer = new WebGLRenderer( { antialias: false } );
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.domElement.id = "id_" + this.name;

        let parent = document.getElementById( this.root );
        parent.appendChild( this.renderer.domElement );

        this.phase = phase;
    }
    
    async leave( next : JBScene ) {
        let parent = document.getElementById( "game" );
        while ( parent.lastChild ) {
            parent.removeChild( parent.lastChild );
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