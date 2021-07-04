import {
    Color,
    WebGLRenderer,
} from 'three';

import { JBScene } from './jbscene';
import { ScooterSimScene } from './scootersimscene';
import { StartScene } from './startscene';

class JBGame {
    name : string;
    scenes = new Array<JBScene>();
    renderer : WebGLRenderer;

    currentSceneName: string;
    currentScene : JBScene;

    constructor( name : string ) {
        console.log( `JBGame constructor ${name}` );
        
        this.name = name;
        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);

        let s1 =  new StartScene( "start", this );
        this.addScene( s1 );
        s1.background = new Color( "#ffff00" );

        let s2 =  new ScooterSimScene( "sim", this );
        this.addScene( s2 );
        s2.background = new Color( "#ff00ff" );
    }

    sceneByName( name : string ) {
        return this.scenes.find( scene => scene.name === name );
    }

    start() {
        this.currentSceneName = "start";
        
        this.currentScene = this.sceneByName( this.currentSceneName );

        console.log( `JBGame start ci ${ this.currentScene }` );

        if ( this.currentScene !== null ) {
            this.currentScene.create( this.renderer );
            this.currentScene.start();
            this.currentScene.enter( null )
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
            //console.log("*** STOP ***");
            //return;            
        }
        this.count = this.count + 1;
        console.log( `render_game physics ${physics}` );
        if ( physics ) {
            requestAnimationFrame( this.render );
            console.log( `JBGame render currentScene ${this.currentSceneName}`);
            let ci = this.currentScene;
            if ( ci !== null ) {
                ci.tick();
            }
        } else {
            requestAnimationFrame( this.render_no_physics );
        }
    }

    switch( nextSceneName : string ) {
        let ns = this.sceneByName( nextSceneName );
        if ( this.currentScene !== null ) {
            this.currentScene.leave( this.currentScene );
            this.currentScene = null;
            this.currentSceneName = "UNKNOWN";
        }
        this.currentScene = ns;
        ns.enter( ns );
    }
}

export { JBGame };