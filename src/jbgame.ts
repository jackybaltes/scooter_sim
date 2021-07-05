import {
    Color,
    WebGLRenderer,
} from 'three';

import { JBScene } from './jbscene';
import { ScooterSimScene } from './scootersimscene';
import { StartIntroScene } from './startintroscene';
import { ControlIntroScene } from './controlintroscene';

class JBGame {
    name : string;
    scenes = new Array<JBScene>();
    renderer : WebGLRenderer;

    currentSceneName: string;
    currentScene : JBScene;

    constructor( name : string ) {
        console.log( `JBGame constructor ${name}` );
        
        this.name = name;
        let s1 =  new StartIntroScene( this );
        this.addScene( s1 );
        
        let sIntro =  new ControlIntroScene( this );
        this.addScene( sIntro );
        
        let sSim =  new ScooterSimScene( "sim", this );
        this.addScene( sSim );
    }

    sceneByName( name : string ) {
        return this.scenes.find( scene => scene.name === name );
    }

    start() {
        this.currentSceneName = "start_intro";
        
        this.currentScene = this.sceneByName( this.currentSceneName );

        console.log( `JBGame start ci ${ this.currentScene }` );

        if ( this.currentScene !== null ) {
            this.currentScene.enter( null );
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
        console.log( `game switching to ${nextSceneName}`);

        let ns = this.sceneByName( nextSceneName );
        if ( this.currentScene !== null ) {
            this.currentScene.leave( this.currentScene );
            this.currentScene = null;
            this.currentSceneName = "UNKNOWN";
        }
        if ( ns !== null ) {
            this.currentScene = ns;
            ns.enter( ns );
        }
    }
}

export { JBGame };