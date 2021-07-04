import { 
    WebGLRenderer,
    OrthographicCamera,
    PlaneGeometry,
    Mesh,
    MeshBasicMaterial,
    Texture,
    ImageUtils,
    TextureLoader,
    Material,
    DoubleSide
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

    create( renderer : WebGLRenderer ) {
        super.create( renderer );   
        console.log( "Start scene create");

        this.preload().then( () => {
            // camera
            let vWidth = 300;
            let vHeight = 300;

            this.camera = new OrthographicCamera( vWidth / -2, vWidth / 2 , vHeight / -2, vHeight / 2, 1, 1000);
            this.camera.position.x = 0;
            this.camera.position.y = 0;
            this.camera.position.z = 100;
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
            console.log(`startScene tick ${this.camera}`);
            this.renderer.render( this, this.camera );
        }
    }
}

export { StartScene };