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
import { JBScene } from './jbscene';

class StartScene extends JBScene {

    texture : Texture;
    material : Material;
    plane : Mesh;
    loader : TextureLoader = null;

    async preload( ) {
        if ( this.loader === null ) {
            this.loader = new TextureLoader( );
        }
        this.texture = this.loader.load( "../assets/images/taiwan_drivers_licence_intro.png");
    }

    create( ) {
        super.create( );   
        console.log( "Start scene create");

        this.preload().then( () => {
            this.enter( null );
        });
    }

    labels : HTMLDivElement;

    createDOM( ) {
        let parent = document.getElementById( "game" );
        while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }

        this.renderer = new WebGLRenderer({ antialias: false });
        //renderer.outputEncoding = sRGBEncoding;
        //renderer.shadowMap.enabled = true;
        //renderer.shadowMap.type = PCFSoftShadowMap;
        this.renderer.domElement.id = "id_" + this.name;
        parent.appendChild( this.renderer.domElement );

        let l = document.createElement( "div" );
        l.id = "id_" + this.name + "_labels";
        l.style.position = "absolute";
        l.innerHTML = `<h1>Taiwan Scooter Licence Test</h1> 
        
        <h2>National Taiwan Normal University, Taipei, Taiwan</h2>

        <p>This game is an off-shoot of our research into developing a humanoid robot
        that is able to pass the Taiwan scooter licence test.</p>
        
        <table>
        <tr>
        <td>
        <img height="300px" src="../assets/images/thormang2.png"></img>
        </td>
        <td>
        <img height="300px" src="../assets/images/thormang1.png"></img>
        </td>
        </tr>
        <tr>
        <td>Thormang 3 and Gogoro Scooter</td>
        <td>Thormang 3 First Driving Tests </td>
        </tr>
        </table>

        <!-- <button id="start_btn_prev" class="game_button_prev">>Previous</button> -->
        <button id="start_btn_next" class="game_button_next">Next</button>
        `;

        parent.appendChild( l );
        this.labels = l;

        let nb =  document.getElementById("start_btn_next");
        nb.onclick = () => {
            console.log("start scene next button pressed");
            this.game.switch( "start2" );
        };
    }

    enter( prev : JBScene ) {
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
    }

    tick( ) {
        if ( ( this.camera !== null ) && (this.camera !== undefined ) ){
            console.log(`startScene tick ${this.camera}`);
            this.renderer.render( this, this.camera );
        }
    }
}

export { StartScene };