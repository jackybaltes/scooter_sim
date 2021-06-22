var ControlServer = /** @class */ (function () {
    function ControlServer(port) {
        this.steering_angle = 0.0; //I changed Number to number here 
        this.velocity = 0.0;
        this.port = port;
        this.waitForSocket();
    }
    ControlServer.prototype.init = function () {
        console.log("Creating ControlServer");
        this.socket = new WebSocket("ws://127.0.0.1:" + this.port);
        this.socket.onopen = this.createOnOpen();
        this.socket.onmessage = this.createOnMessage();
        this.socket.onclose = this.createOnClose();
        this.socket.onerror = this.createOnError();
    };
    ControlServer.prototype.createOnOpen = function () {
        return function (event) {
            console.log("[open] Connection established");
            console.log("Sending to server");
        };
    };
    ControlServer.prototype.createOnMessage = function () {
        var cs = this;
        return function (event) {
            //console.log(`[message] Data received from server: ${event.data}`); 
            var js = JSON.parse(event.data);
            console.log("parsed json 2 " + js + " " + ("steering" in js));
            if ("steering" in js) {
                cs.steering_angle = js["steering"][0] * 1.5; // make turns larger
                cs.velocity = js["steering"][1] / 4; // slow it down by a factor of 3
                console.log("steering angle " + cs.steering_angle + " vel " + cs.velocity);
            }
            else {
                cs.velocity = 0.0;
                cs.steering_angle = 0.0;
            }
        };
    };
    ControlServer.prototype.createOnClose = function () {
        var cs = this;
        return function (event) {
            if (event.wasClean) {
                console.log("[close] Connection closed cleanly, code=" + event.code + " reason=" + event.reason);
            }
            else {
                // e.g. server process killed or network down
                // event.code is usually 1006 in this case
                console.log('[close] Connection died');
            }
            cs.init();
        };
    };
    ControlServer.prototype.createOnError = function () {
        return function (error) {
            console.log("[error] " + error.message);
        };
    };
    ControlServer.prototype.waitForSocket = function () {
        console.log("Waiting for socket on localhost port " + this.port + " to become available");
        var cs = this;
        setTimeout(function () {
            cs.init();
        }, 1000);
    };
    ControlServer.prototype.send = function (data) {
        this.socket.send(data);
    };
    return ControlServer;
}());
export { ControlServer };
