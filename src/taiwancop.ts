import { JBAnimation, JBObjectType } from "./jbanimation";

class TaiwanPolice extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan police.glb", JBObjectType.TaiwanPolice );
    }

    home( ) {
        this.translate( -9, 0.0, -13.0 );
        this.rotate( 0.0, -70.0/360.0 * Math.PI, 0.0 );

        return super.home();
    }
}

class TaiwanCopMale extends JBAnimation {
    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan cops male 1.glb", JBObjectType.TaiwanPolice );
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

export { TaiwanPolice, TaiwanCopMale };