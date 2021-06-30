import { Scene } from 'three';
import { JBGame } from 'jbgame';

class JBScene extends Scene {
    name : string;
    game : JBGame;

    constructor( game : JBGame, name : string  ) {
        super();
    }

    preload() {}
    init() { }
    enter( prev : JBScene ) {}
    leave( next : JBScene ) {}
    render() {}
}

export default { JBScene };