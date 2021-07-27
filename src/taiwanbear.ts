import { JBObjectType, JBAnimation } from './jbanimation';
import { AnimationClip } from 'three';

export class TaiwanBear extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan bear.glb", JBObjectType.TaiwanBear );
    }

    async init() {
        await super.init();
        this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.3;
    }

    velocities : number[];

    home( ) {
        
        this.translate( -7, 0.0, -12.0 );
        this.rotate( 0.0, 0.0/360.0 * Math.PI, 0.0 );

        console.log( `TaiwanBear home. data=${typeof(this.data)} animation=` );
        console.dir( this.data );

        let anims = this.data['animations'];

        this.velocities = [0,0, 1];

        let clip : AnimationClip = anims[1];
        let action = this.mixer.clipAction(clip);
        action.play();
        
        //this.model.tick = (delta) => this.mixer.update(delta);
        
        let m = super.home();
        //m.scale.x = m.scale.y = m.scale.z = 0.5;
        return m;
    }

    tick( delta : number ) {
        let [ v_lin, theta_d, freq ] = this.velocities;
        let { x, y, z } = this.model.position;

        let theta = this.model.rotation.y;
        let xd = v_lin * delta * Math.sin( theta );
        let zd = v_lin * delta * Math.cos( theta );

        this.translate( x + xd, 0, z + zd );
        this.rotate( 0, theta + delta * theta_d, 0 );

        return super.tick( delta * freq );
    }
}
