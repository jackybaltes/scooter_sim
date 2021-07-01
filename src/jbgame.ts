import {
    WebGLRenderer,
} from 'three';

import { JBScene } from './jbscene';
import { ScooterSimScene } from './scootersimscene';

class JBGame {
    name : string;
    scenes = new Array<JBScene>();
    renderer : WebGLRenderer;

    currentSceneIndex : number = -1;

    constructor( name : string ) {
        console.log( `JBGame constructor ${name}` );
        
        this.name = name;
        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        let s1 =  new ScooterSimScene( "Scooter Simulation Scene", this );
        this.addScene( s1 );
        this.currentSceneIndex = 0;
    }

    start() {
        let ci = this.currentSceneIndex;

        console.log( `JBGame start ci ${ci}` );

        if ( ci >= 0 ) {
            this.scenes[ci].enter(null);
            this.scenes[ci].create( this.renderer );
            
            this.render();
        }
    }

    addScene( scene : JBScene ) {
        console.log("JBGame addScene");
        
        this.scenes.push( scene );
    }

    render = this._render.bind( this );

    _render() {
        console.log( `JBGame render` );
        
        this.render_game( true );
    }
    
    render_no_physics = this._render_no_physics.bind( this );

    _render_no_physics() {
        console.log( `JBGame render_no_physics` );
        
        this.render_game( false );
    }
    
    render_game = this._render_game.bind( this );

    count = 0;
    _render_game( physics : boolean ) {
        if ( this.count >= 100 ) {
            console.log("*** STOP ***");
            return;            
        }
        this.count = this.count + 1;
        console.log( `render_game physics ${physics}` );
        if ( physics ) {
            requestAnimationFrame( this.render );
            console.log( `JBGame render currentScene ${this.currentSceneIndex}`);
            let ci = this.currentSceneIndex;
            if ( ci >= 0 ) {
                this.scenes[ci].renderStep();
            }
        } else {
            requestAnimationFrame( this.render_no_physics );
        }
    }
}

export { JBGame };