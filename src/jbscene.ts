import { WebGLRenderer } from 'three';

import { Scene } from 'three';
import { JBGame } from './jbgame';

class JBScene extends Scene {
    name : string;
    game : JBGame;

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

    enter( prev : JBScene ) {}
    
    leave( next : JBScene ) {}
    
    renderStep() {}
}

export { JBScene };