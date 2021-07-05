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

import { JBGame } from './jbgame';
import { JBScene } from './jbscene';

class IntroScene extends JBScene {

    texture : Texture;
    material : Material;
    plane : Mesh;
    loader : TextureLoader = null;
    content : string;
    prev : string;
    next : string;

    constructor( name : string, game : JBGame, content: string, prev: string, next : string ) {
        super(name, game );
        this.content = content;
        this.prev = prev;
        this.next = next;
    }

    async preload( ) {
        if ( this.loader === null ) {
            this.loader = new TextureLoader( );
        }
        this.texture = this.loader.load( "../assets/images/taiwan_drivers_licence_intro.png");
    }

    labels : HTMLDivElement;

    createDOM( ) {
        let parent = document.getElementById( "game" );

        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.domElement.id = "id_" + this.name;
        parent.appendChild( this.renderer.domElement );

        let l = document.createElement( "div" );
        l.className = "intro_scene";
        l.id = "id_" + this.name + "_labels";
        l.style.position = "absolute";
        l.innerHTML = this.content;

        parent.appendChild( l );
        console.log(`inner ${l.innerHTML}`);
        
        this.labels = l;

        if (this.next !== "" ) {
            let nb =  document.getElementById( this.name + "_btn_next");
            nb.onclick = () => {
                console.log("intro scene next button pressed");
                this.game.switch( this.next );
            };
        }

        if ( this.prev !== "" ) {
            let pb =  document.getElementById( this.name + "_btn_prev");
            pb.onclick = () => {
                console.log("intro scene prev button pressed");
                this.game.switch( this.prev );
            };
        }
    }

    enter( prev : JBScene ) {
        this.preload().then( () => {

            this.createDOM();

            // camera
            let vWidth = 300;
            let vHeight = 300;

            this.camera = new OrthographicCamera( vWidth / -2, vWidth / 2 , vHeight / -2, vHeight / 2, 1, 2);
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.camera.position.z = 1;
            this.camera.rotation.x = 0.0 * (Math.PI / 180);

            this.add( this.camera );

            this.material = new MeshBasicMaterial( { map: this.texture,  side: DoubleSide, } );

            this.plane = new Mesh(new PlaneGeometry( vWidth, vHeight), this.material );
            this.add( this.plane );

            this._onResize();
            window.addEventListener('resize', this.onResize );        
        });    
    }

    tick( ) {
        if ( ( this.camera !== null ) && (this.camera !== undefined ) ){
            console.log(`intro scene tick ${this.camera}`);
            this.renderer.render( this, this.camera );
        }
    }
}

export { IntroScene };

