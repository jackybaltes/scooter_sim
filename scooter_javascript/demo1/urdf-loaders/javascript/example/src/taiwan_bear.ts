import { Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

enum JBObjectType {
    TaiwanBear = 1,
};

// This will probably end up as a superclass
export class TaiwanBear {
    name: string;
    class: JBObjectType;
    model : Object3D; // Not sure if there are type annotations for gltfloader

    constructor( name : string ) {
        this.class = JBObjectType.TaiwanBear;
        this.name = name;

    }

    async init() {
        await this.load();
    }

    async load() {
        const gltfLoader = new GLTFLoader();
        const data = await gltfLoader.loadAsync("../../urdf/taiwan bear 3.glb");
        console.log("Roar data!!!", data );
        this.model = data.scene.children[0];
        console.log("Roar!!!", this.model );
    }

    setup( ) {
        this.model.position.set( -7, 0.0, -5.0 );
        this.model.rotation.set(0.0, 60.0/360.0 * Math.PI, 0.0 );
        return this.model;
    }
}
