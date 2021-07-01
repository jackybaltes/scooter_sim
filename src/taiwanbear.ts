import { JBObjectType, JBAnimation } from './jbanimation';

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
