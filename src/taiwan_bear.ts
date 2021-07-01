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

export class JBAnimation {
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

export class TaiwanBear extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan bear 3.glb", JBObjectType.TaiwanBear );
    }

    home( ) {
        this.translate( -7, 0.0, -12.0 );
        this.rotate( 0.0, -70.0/360.0 * Math.PI, 0.0 );

        console.log( `TaiwanBear home. data=${typeof(this.data)} animation=` );
        console.dir( this.data );

        // let anims = this.data['animations'] as keyof Object;

        // const clip : AnimationClip = anims[1];
        // const action = this.mixer.clipAction(clip);
        // action.play();
        
        //this.model.tick = (delta) => this.mixer.update(delta);
        
        return super.home();
    }
}

// This will probably end up as a superclass
export class TaiwanPolice extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan police.glb", JBObjectType.TaiwanPolice );
    }

    home( ) {
        //this.translate( -9, 0.0, -13.0 );
        //this.rotate( 0.0, -70.0/360.0 * Math.PI, 0.0 );

        return super.home();
    }
}

export class TaiwanCopMale extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan cops male 1.glb", JBObjectType.TaiwanBear );
    }

    home( ) {
        this.translate( -7, 0.0, -12.0 );
        this.rotate( 0.0, -70.0/360.0 * Math.PI, 0.0 );

        const clip = this.data.animations[0];
        const action = this.mixer.clipAction(clip);
        
        action.play();
        //this.model.tick = (delta) => this.mixer.update(delta);
        
        return super.home();
    }
}
