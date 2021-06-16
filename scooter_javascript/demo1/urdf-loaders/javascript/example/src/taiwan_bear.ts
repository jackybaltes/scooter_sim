import { 
    Object,
    Object3D,
    AnimationMixer,
 } from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

enum JBObjectType {
    TaiwanBear = 1,
    TaiwanPolice = 2,
};

export class JBAnimation {
    name: string;
    cls: JBObjectType;
    model : Object3D; // Not sure if there are type annotations for gltfloader
    mixer : AnimationMixer;
    data: Object;
    path : string;

    constructor( name : string, path : string, cls : JBObjectType ) {
        this.name = name;
        this.path = path;
        this.cls = cls;
    }

    async init() {
        await this.load();
    }

    async load() {
        const gltfLoader = new GLTFLoader();
        const data = await gltfLoader.loadAsync( this.path );
        this.data = data;
        console.log("Roar data!!!", data );
        this.model = data.scene.children[0];
        console.log("Roar!!!", this.model );
        this.mixer = new AnimationMixer( this.model );
    } 

    tick( delta : Number ) {
        return this.mixer.update( delta );
    }

    translate( tx : Number, ty : Number, tz : Number ) {
        this.model.position.set( tx, ty, tz );
    }

    rotate( a : Number, b : Number, c : Number ) {
        this.model.rotation.set( a, b, c );
    }

    home( ) {
        console.log(`home: this.model ${this.model}`);
        
        return this.model;
    }
}

export class TaiwanBear extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../../urdf/taiwan bear 3.glb", JBObjectType.TaiwanBear );
    }

    home( ) {
        this.translate( -7, 0.0, -12.0 );
        this.rotate( 0.0, -70.0/360.0 * Math.PI, 0.0 );

        const clip = this.data.animations[1];
        const action = this.mixer.clipAction(clip);
        action.play();
        
        //this.model.tick = (delta) => this.mixer.update(delta);
        
        return super.home();
    }
}

// This will probably end up as a superclass
export class TaiwanPolice extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../../urdf/taiwan police.glb", JBObjectType.TaiwanPolice );
    }

    home( ) {
        //this.translate( -9, 0.0, -13.0 );
        //this.rotate( 0.0, -70.0/360.0 * Math.PI, 0.0 );

        return super.home();
    }
}
