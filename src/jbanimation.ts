import { 
    Object3D,
    AnimationMixer,
    AnimationClip,
    AnimationAction,
 } from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ScooterSimScene } from './scootersimscene';

interface ILoaderObject {
    animations : Array<AnimationClip>;
}

enum JBObjectType {
    TaiwanBear = 1,
    TaiwanPolice = 2,
};

class JBAnimation {
    constructor( public name : string, public path : string, public cls : JBObjectType, public timeScale : number ) {
        this.name = name;
        this.path = path;
        this.cls = cls;       
    }

    async init() {
        await this.preload();
    }

    model : Object3D; 
    mixer : AnimationMixer;
    data: ILoaderObject;

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

    tick( delta : number, sim : ScooterSimScene ) {
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

    private findAnimation( name : string ) {
        let anims = this.data["animations"];
        let ani : AnimationClip = null;

        for( const a of anims ) {
            if ( a.name === name ) {
                ani = a;
                break;
            }
        }
        return ani;
    }

    private currentClip : AnimationClip;
    private currentAction : AnimationAction;

    playAnimation( name : string ) {
        if ( ( this.currentClip === undefined ) || ( this.currentClip === null ) || ( this.currentClip.name !== name ) ) {                
            let clip : AnimationClip = this.findAnimation( name ); 
            if ( clip !== null ) {
                if ( ( this.currentClip !== undefined ) && ( this.currentClip !== null ) ) {
                    if ( this.currentClip.name !== name ) {
                        this.stopAnimation();
                    }
                }
                this.currentClip = clip;
                this.currentAction = this.mixer.clipAction(this.currentClip);
                if ( this.currentAction !== null ) {
                    this.currentAction.play();
                }
            }
        }
    }

    private stopAnimation( ) {
        if ( (this.currentAction !== undefined ) && ( this.currentAction !== null ) ) {
            this.currentAction.stop();
            this.currentAction = null;
            this.currentClip = null;
        }
    }
}

export {JBAnimation, JBObjectType };