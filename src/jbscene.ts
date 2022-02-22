import { Camera, OrthographicCamera, PerspectiveCamera, WebGLRenderer } from 'three';

import { Scene } from 'three';
import { JBGame } from './jbgame';
import { ScooterSimScene } from './scootersimscene';

class JBScene extends Scene {
    name : string;
    currentPhase : string;
    game : JBGame;
    camera : PerspectiveCamera | OrthographicCamera;

    root : string;
    userID:string;
    constructor( name : string, game : JBGame, root : string ) {
        super();
        this.name = name;
        this.game = game;
        this.root = root;
        this.userID = "anon"
        console.log( "JBScene constructor" );
    }

    renderer : WebGLRenderer;

    async preload() {
        console.log( "JBScene preload" );
    }

    start( ) { this.enter( null ) }

    private pause( ) { }

    public set_user_id(id:string)
    {
        this.userID = id;
        console.log("setting user ID");
        console.log(this.userID);
    }

    async enter( prev : JBScene, phase? : string ) { 
        this.renderer = new WebGLRenderer( { antialias: false } );
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.domElement.id = "id_" + this.name;

        let parent = document.getElementById( this.root );
        parent.appendChild( this.renderer.domElement );

        this.currentPhase = phase;
    }
    
    async leave( next : JBScene ) {
        let parent = document.getElementById( "game" );
        while ( parent.lastChild ) {
            parent.removeChild( parent.lastChild );
        }
    }
    
    tick( dt: number ) {}

    _onResize() {
        if (this.renderer !== null ) {
            let parent = document.getElementById( this.root );
        
            this.renderer.setSize( parent.clientWidth, parent.clientHeight );
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }

    onResize = this._onResize.bind( this );

}

export { JBScene };