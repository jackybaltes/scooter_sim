import { 
    Object3D,
    AnimationMixer,
    AnimationClip,
 } from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

interface ILoaderObject {
    animations : Array<AnimationClip>;
}

enum JBObjectType {
    TaiwanBear = 1,
    TaiwanPolice = 2,
};

class JBAnimation {
    name: string;
    cls: JBObjectType;
    model : Object3D; // Not sure if there are type annotations for gltfloader
    mixer : AnimationMixer;
    data: ILoaderObject;
    path : string;

    constructor( name : string, path : string, cls : JBObjectType ) {
        this.name = name;
        this.path = path;
        this.cls = cls;
    }

    async init() {
        await this.preload();
    }

    async preload() {
        const gltfLoader = new GLTFLoader();
        const data = await gltfLoader.loadAsync( this.path );
        this.data = data as ILoaderObject;

        console.log(`Roar data!!! ${typeof(data)}` );
        console.dir(data);

        this.model = data.scene.children[0];
        console.log("Roar!!!", this.model );
        this.mixer = new AnimationMixer( this.model );
    } 

    tick( delta : number ) {
        return this.mixer.update( delta );
    }

    translate( tx : number, ty : number, tz : number ) {
        this.model.position.set( tx, ty, tz );
    }

    rotate( a : number, b : number, c : number ) {
        this.model.rotation.set( a, b, c );
    }

    home( ) {
        console.log(`home: this.model ${this.model}`);
        return this.model;
    }
}

export {JBAnimation, JBObjectType };