import { JBScene } from './jbscene';
import { JBGame } from './jbgame';


class licensecene extends JBScene {
    
    discordid: string;
    score: string;

    constructor( name : string, game : JBGame, root: string, _discordID : string,_score : string ) {
        super( name, game, root );
        this.discordid=_discordID;
        this.score=_score;
    
    }

}

export { licensecene  } 
