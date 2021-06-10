var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Vector3, Color, } from 'three';
var Robot = /** @class */ (function () {
    function Robot(robot_three) {
        this.sleep = function (milliseconds) { return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); }); };
        this.scooter = robot_three;
        this.velocity = 0.0; //m/s
        this.scooter_yaw_rotation = 0.0;
        this.max_x_velocity = 1;
        this.min_x_velocity = 0;
        this.steering_angle = 0.0;
        this.max_steering_angle = 0.6;
        this.min_steering_angle = -0.6;
        this.m = 125; //mass of scooter + robot in kg
        this.h = 0.89; // height of the center of mass
        this.b = 1.184012; //inter wheel distance=
        this.a = this.b / 2;
        this.g = 9.806;
        this.J = this.m * Math.pow(this.h, 2); //aprox
        this.D = this.m * this.a * this.h;
        this.spawn_x = -12.2;
        this.spawn_y = 0.94;
        this.spawn_z = -15;
        this.orange = new Color(255, 69, 0);
        this.red = new Color(255, 0, 0);
        this.green = new Color(0, 255, 0);
        this.black = new Color(0, 0, 0);
        this.blinker_l = this.scooter.links["blinker_left"].children[0].children[0].material;
        this.blinker_r = this.scooter.links["blinker_right"].children[0].children[0].material;
        this.stop_light = this.scooter.links["stop_light"].children[0].children[0].material;
        this.sleep = function (milliseconds) { return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); }); };
        this.blinking_left = false;
        this.blinking_right = false;
    }
    Robot.prototype.init_position = function () {
        this.scooter.position.x = this.spawn_x;
        this.scooter.position.y = this.spawn_y;
        this.scooter.position.z = this.spawn_z;
        this.scooter.rotation.y = -Math.PI / 2;
        this.scooter_yaw_rotation = -Math.PI / 2;
        var r = (Math.random() - 0.5) * 2; //random -1 to 1
        this.steering_angle = r / 5;
        //this.steering_angle = 0.0;
        this.velocity = 0.0;
    };
    Robot.prototype.change_color = function (obj, color) {
        obj.color.set(color);
        obj.emissive.set(color);
        obj.specular.set(color);
        obj.needsUpdate = true;
    };
    Robot.prototype.get_wheel_position = function () {
        var point_x = this.a * Math.cos(-this.scooter_yaw_rotation);
        var point_y = this.a * Math.sin(-this.scooter_yaw_rotation);
        var wheel_position = new Vector3(this.scooter.position.x + point_x, this.scooter.position.y, this.scooter.position.z + point_y);
        return wheel_position;
    };
    Robot.prototype.get_position = function () {
        return this.scooter.position;
    };
    Robot.prototype.transfer_function_steer_to_tilt = function (s) {
        return ((this.a * this.velocity) / (this.b * this.h)) * ((s + (this.velocity / this.a)) / ((Math.pow(s, 2) - (this.g / this.h))));
        //return ((this.a*this.velocity)/(this.b*this.h)) * ( (s+(this.velocity/this.a) )/( (Math.pow(s,2)-(this.g/this.h))  ));
    };
    Robot.prototype.stop_signal = function () {
        this.change_color(this.stop_light, this.red);
    };
    Robot.prototype.go_signal = function () {
        this.change_color(this.stop_light, this.black);
    };
    Robot.prototype.stop_blink = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.blinking_left = false;
                this.blinking_right = false;
                this.change_color(this.blinker_l, this.black);
                this.change_color(this.blinker_r, this.black);
                return [2 /*return*/];
            });
        });
    };
    Robot.prototype.blink_right = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.blinking_right) return [3 /*break*/, 4];
                        this.blinking_right = true;
                        _a.label = 1;
                    case 1:
                        if (!this.blinking_right) return [3 /*break*/, 4];
                        this.change_color(this.blinker_r, this.black);
                        this.change_color(this.blinker_l, this.black);
                        return [4 /*yield*/, this.sleep(500)];
                    case 2:
                        _a.sent();
                        this.change_color(this.blinker_r, this.orange);
                        this.change_color(this.blinker_l, this.black);
                        return [4 /*yield*/, this.sleep(500)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Robot.prototype.blink_left = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.blinking_left) return [3 /*break*/, 4];
                        this.blinking_left = true;
                        _a.label = 1;
                    case 1:
                        if (!this.blinking_left) return [3 /*break*/, 4];
                        this.change_color(this.blinker_l, this.black);
                        this.change_color(this.blinker_r, this.black);
                        return [4 /*yield*/, this.sleep(500)];
                    case 2:
                        _a.sent();
                        this.change_color(this.blinker_l, this.orange);
                        this.change_color(this.blinker_r, this.black);
                        return [4 /*yield*/, this.sleep(500)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Robot;
}());
export { Robot };
