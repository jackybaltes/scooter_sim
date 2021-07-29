import { JBObjectType, JBAnimation } from './jbanimation';
import { AnimationClip } from 'three';
import { ScooterSimScene } from './scootersimscene';
import { Clock } from 'three';

enum States {
    Roaming,
    Chase,
    Attack,
    AttackDone,
    AttackCoolDown
};

class TaiwanBear extends JBAnimation {
    state: States = States.Roaming;

    clock : Clock;

    constructor ( name : string ) {
        super( name, "../assets/tlgf/taiwan bear.glb", JBObjectType.TaiwanBear );
        this.clock = new Clock();
        this.clock.start();
    }

    async init() {
        await super.init();
        this.model.scale.x = this.model.scale.y = this.model.scale.z = 0.4;
        this.state = States.Roaming;
    }

    velocities : number[];

    freq = 2.0;

    home( ) {
        
        this.translate( -7, 0.0, -12.0 );
        this.rotate( 0.0, 0.0/360.0 * Math.PI, 0.0 );

        console.log( `TaiwanBear home. data=${typeof(this.data)} animation=` );
        console.dir( this.data );

        
        this.velocities = [0,0, 1];

        //this.playAnimation( "slow walking" );
        //this.playAnimation( "slow_walking" );
        
        //this.model.tick = (delta) => this.mixer.update(delta);
        
        let m = super.home();
        //m.scale.x = m.scale.y = m.scale.z = 0.5;
        return m;
    }

    normalizeAngle( theta ) {
        while( theta < - 180.0/180.0 * Math.PI ) {
            theta = theta + 360.0/180.0 * Math.PI;
        }
        while( theta > 180.0/180.0 * Math.PI ) {
            theta = theta - 360.0/180.0 * Math.PI;
        }
        return theta;
    }

    // angleDifference( a1, a2 ) {
    //     let sign = a1 > a2 ? +1 : -1;
    //     let diff;
    //     if ( sign === 1 ) {
    //         diff = a1 - a2;
    //     } else {
    //         diff = a2 - a1;
    //     }
    //     while ( diff > 180.0/360.0 * Math.PI ) {
    //         sign = - sign;
    //         diff = diff - 360.0/360.0 * Math.PI;
    //     }
    //     return sign * diff;
    // }

    angleDifference( a1 : number , a2 : number ) {
        let a1n = a1; //this.normalizeAngle( a1 );
        let a2n = a2; //this.normalizeAngle( a2 );

        let diff = a2 - a1;
        if ( diff > 180.0/180.0*Math.PI ) {
            diff = diff - 360.0/180.0 * Math.PI;
        }
        if ( diff < - 180.0/180.0 * Math.PI ) {
            diff = diff + 360.0/180.0 * Math.PI;
        }
        return diff;
    }

    kpa = 10; kda = 0; kia = 0;
    kpv = 1; kdv = 0; kiv = 0;

    prevDiff = 0;

    maxVelocity = 5;

    updateClock : Clock = new Clock();

    update( ) {
        const delta = this.updateClock.getDelta();
        let { x, y, z } = this.model.position;
        let theta = this.normalizeAngle( this.model.rotation.y );

        const [ v_lin, theta_d ]  = this.velocities;

        let dx = Math.sin( theta ) * v_lin * delta;
        let dz = Math.cos( theta ) * v_lin * delta;
        this.translate( x + dx, y, z + dz );
        this.rotate( 0, this.normalizeAngle( theta + theta_d * delta ), 0 );
    }

    chase( xt : number, zt : number, vel : number = 0.4 ) {
        let { x, y, z } = this.model.position;
        let dist = Math.hypot( z - zt, x - xt );
        let theta = this.normalizeAngle( this.model.rotation.y );

        let phi = this.normalizeAngle( Math.atan2( xt - x, zt - z ) );
        let diff = this.angleDifference( theta, phi );

        this.velocities[1] = diff * this.kpa + this.kda * ( diff - this.prevDiff );
        this.velocities[0] = vel; 

        this.prevDiff = diff;
        console.log( `dist ${dist} x ${x} z ${z} theta ${theta} xt ${xt} zt ${zt} phi ${phi} diff ${diff} theta_d ${this.velocities[1]} v_lin ${this.velocities[0]}` );
    }

    roamX: number = 0;
    roamZ: number = 0;
    attackTime : number = 0;

    tick( delta : number, sim : ScooterSimScene ) {
        let scooter = sim.scooterObj;
        if ( this.state === States.Roaming ) {
            this.playAnimation("slow_walking");

            if ( Math.random() < 0.01 ) {
                this.roamX = - 10 + Math.random() * 20.0;
                this.roamZ = - 10 + Math.random() * 20.0;
            }
            this.chase( this.roamX, this.roamZ, 0.4 );
            let xt = scooter.get_position().x;
            let zt = scooter.get_position().z;

            let { x, y, z } = this.model.position;
            let dist = Math.hypot( z - zt, x - xt );

            if ( dist < 7.0 ) {
                this.state = States.Chase;
            }
        } else if ( this.state === States.Chase ) {
            this.playAnimation("slow walking");

            if ( ( scooter !== undefined ) && ( scooter !== null ) ) {
                let xt = scooter.get_position().x;
                let zt = scooter.get_position().z;
                
                this.chase( xt, zt );

                let { x, y, z } = this.model.position;
                let dist = Math.hypot( z - zt, x - xt );

                if ( dist >= 10.0 ) {
                    this.state = States.Roaming;
                } else if ( dist < 2.0 ) {
                    this.state = States.Attack;
                }
            }
        } else if ( this.state === States.Attack ) {
            this.playAnimation("standup");
            this.attackTime = this.clock.getElapsedTime();
            this.velocities = [0, 0];
            
            this.state = States.AttackDone;

        } else if ( this.state === States.AttackDone ) {
            if ( this.clock.getElapsedTime() > this.attackTime + 2.5 ) {
                this.playAnimation("slow_walking");

                this.rotate( 0, this.normalizeAngle( this.model.rotation.y + 180.0/180.0 * Math.PI ), 0 );
                this.state = States.AttackCoolDown;
                this.attackTime = this.clock.getElapsedTime();
                this.velocities[0] = 0.4;
            }
        } else if ( this.state === States.AttackCoolDown ) {
            if ( this.clock.getElapsedTime() > this.attackTime + 7.0 ) {
                this.state = States.Roaming;
                this.attackTime = this.clock.getElapsedTime();
            }
        }
        this.update();
        return super.tick( delta, sim );
    }
}


export { TaiwanBear };