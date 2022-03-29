export class ControlServer {

    steering_angle : number = 0.0; //I changed Number to number here 
    velocity : number = 0.0;
    private socket : WebSocket;
    private port: Number;

    constructor( port : Number ) {
        this.port = port;
        this.waitForSocket();
    }

    public init( ) {
        //console.log("Creating ControlServer");
        this.socket = new WebSocket(`ws://127.0.0.1:${this.port}`);
        this.socket.onopen = this.createOnOpen();
        this.socket.onmessage = this.createOnMessage();
        this.socket.onclose = this.createOnClose();
        this.socket.onerror = this.createOnError();

        this.socket.addEventListener('message', this.createOnMessage())


    }

    public createOnOpen( ) {
        return function ( event :  Event ) {
        console.log("[open] Connection established");
            //console.log("Sending to server");
        }
    }
    
    public createOnMessage() {
        let cs = this;
        //message = event
        return function ( event : MessageEvent ) {
            let js = JSON.parse( event.data );

            console.log( `CONTROL BY PYTHON DETECTED`);
            console.log(js["steering"][0])
            console.log(js["steering"][1])
            console.log( `========================`);


            if ( "steering" in js ) {
                cs.steering_angle = js["steering"][0] * 1.5; // make turns larger
                cs.velocity = js["steering"][1]/4; // slow it down by a factor of 3
            } else {
                cs.velocity = 0.0;
                cs.steering_angle = 0.0;
            }
        }
    }
    
    
    public createOnClose( ) {
        let cs = this;
        return function ( event : CloseEvent ) {
            if (event.wasClean) {
                //console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
                //console.log('[close] Connection died');
            }
            cs.init();
        }
    }

    public createOnError( ) {
        return function ( error : any ) {
            console.log(`[error] ${error.message}`);
        }
    }

    public waitForSocket() {
        console.log(`Waiting for socket on localhost port ${this.port} to become available`);
        let cs = this;
        setTimeout( function( ) {
            cs.init();
        }, 1000 );
    }

    public send( data : string | ArrayBuffer | Blob ) {
        
        this.socket.send( data );
    }
}

