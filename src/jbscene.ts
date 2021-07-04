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
    
    create( renderer : WebGLRenderer ) { 
        console.log( `JBScene create renderer ${renderer}` );
        this.renderer = renderer;
    }

    async preload() {
        console.log( "JBScene preload" );
    }

    start( ) { this.enter( null ) }

    pause( ) { }

    enter( prev : JBScene ) { }
    
    leave( next : JBScene ) {}
    
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