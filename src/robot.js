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
import { Vector3, Color, Matrix3, Matrix4, Euler, } from 'three';
import { Matrix, pseudoInverse, } from 'ml-matrix';
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
        this.start_pose_L = new Matrix([[0., 0., -Math.PI / 2, Math.PI, -Math.PI / 2, Math.PI / 2, 0., -Math.PI / 2, 0.]]);
        this.last_pose_L = new Matrix([[0., 0., 0., Math.PI / 2, 0., 0., 0., 0., 0.]]);
        this.start_pose_R = new Matrix([[0., 0., -Math.PI / 2, Math.PI, -Math.PI / 2, -Math.PI / 2, 0., Math.PI / 2, 0.]]);
        this.last_pose_R = new Matrix([[0., 0., 0., -Math.PI / 2, 0., 0., 0., 0., 0.]]);
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
    /*
    Change the pose of the robot arms
    */
    Robot.prototype.set_pose = function (q_list_L, q_list_R) {
        this.scooter.setJointValue("torso_y", q_list_L.get(0, 0) + q_list_L.get(0, 1));
        this.scooter.setJointValue("l_arm_sh_p1", q_list_L.get(0, 2));
        this.scooter.setJointValue("l_arm_sh_r", q_list_L.get(0, 3));
        this.scooter.setJointValue("l_arm_sh_p2", q_list_L.get(0, 4));
        this.scooter.setJointValue("l_arm_el_y", q_list_L.get(0, 5));
        this.scooter.setJointValue("l_arm_wr_r", q_list_L.get(0, 6));
        this.scooter.setJointValue("l_arm_wr_y", q_list_L.get(0, 7));
        this.scooter.setJointValue("l_arm_wr_p", q_list_L.get(0, 8));
        this.scooter.setJointValue("r_arm_sh_p1", -q_list_R.get(0, 2));
        this.scooter.setJointValue("r_arm_sh_r", q_list_R.get(0, 3));
        this.scooter.setJointValue("r_arm_sh_p2", -q_list_R.get(0, 4));
        this.scooter.setJointValue("r_arm_el_y", q_list_R.get(0, 5));
        this.scooter.setJointValue("r_arm_wr_r", -q_list_R.get(0, 6));
        this.scooter.setJointValue("r_arm_wr_y", q_list_R.get(0, 7));
        this.scooter.setJointValue("r_arm_wr_p", -q_list_R.get(0, 8));
    };
    Robot.prototype.forward_kin = function (q_list, is_left_arm) {
        if (is_left_arm === void 0) { is_left_arm = true; }
        if (is_left_arm) {
            q_list = Matrix.add(q_list, this.start_pose_L);
            this.q1 = q_list.get(0, 0);
            this.q2 = q_list.get(0, 1);
            this.q3 = q_list.get(0, 2);
            this.q4 = q_list.get(0, 3);
            this.q5 = q_list.get(0, 4);
            this.q6 = q_list.get(0, 5);
            this.q7 = q_list.get(0, 6);
            this.q8 = q_list.get(0, 7);
            this.q9 = 0;
            this.s1 = Math.sin(this.q1);
            this.c1 = Math.cos(this.q1);
            this.s2 = Math.sin(this.q2);
            this.c2 = Math.cos(this.q2);
            this.s3 = Math.sin(this.q3);
            this.c3 = Math.cos(this.q3);
            this.s4 = Math.sin(this.q4);
            this.c4 = Math.cos(this.q4);
            this.s5 = Math.sin(this.q5);
            this.c5 = Math.cos(this.q5);
            this.s6 = Math.sin(this.q6);
            this.c6 = Math.cos(this.q6);
            this.s7 = Math.sin(this.q7);
            this.c7 = Math.cos(this.q7);
            this.s8 = Math.sin(this.q8);
            this.c8 = Math.cos(this.q8);
            this.s9 = Math.sin(this.q9);
            this.c9 = Math.cos(this.q9);
            var pos_end_eff_x = ((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * 0.145 * this.c9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * 0.145 * this.s9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * 0.045 * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * 0.045 * this.s8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * 0.21 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * -0.03 * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -0.03 * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * 0.03 * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * 0.03 * this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * 0.22 + (((this.c1 * this.c2 + -this.s1 * this.s2) * -0.039 * this.c3 + (this.c1 * -this.s2 + -this.s1 * this.c2) * 0.212)))))));
            var pos_end_eff_y = ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * 0.145 * this.c9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * 0.145 * this.s9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * 0.045 * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * 0.045 * this.s8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * 0.21 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * -0.03 * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -0.03 * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * 0.03 * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * 0.03 * this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * 0.22 + (((this.s1 * this.c2 + this.c1 * this.s2) * -0.039 * this.c3 + (this.s1 * -this.s2 + this.c1 * this.c2) * 0.212)))))));
            var pos_end_eff_z = ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.s8) * 0.145 * this.c9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * -this.s7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.c7) * -1) * 0.145 * this.s9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * 0.045 * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * 0.045 * this.s8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * 0.21 + (((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * -0.03 * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * -0.03 * this.s6 + ((((-1) * this.s3) * this.c4) * 0.03 * this.c5 + (((-1) * -this.c3)) * 0.03 * this.s5 + (((-1) * this.s3) * this.s4) * 0.22 + (((-1) * -0.039 * this.s3 + (0.3305))))))));
            var m3 = new Matrix3();
            m3.set(((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * this.c9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.s9), ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * this.c9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.s9), ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.s8) * this.c9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * -this.s7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.c7) * -1) * this.s9), ((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * -this.s9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.c9), ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * -this.s9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.c9), ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.s8) * -this.s9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * -this.s7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.c7) * -1) * this.c9), ((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * -this.s8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.c8)), ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * -this.s8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.c8)), ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * -this.s8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.c8)));
            var m4 = new Matrix4();
            m4.setFromMatrix3(m3);
            var euler = new Euler('XYZ');
            euler.setFromRotationMatrix(m4, 'XYZ');
            return new Matrix([[pos_end_eff_y, pos_end_eff_z, pos_end_eff_x, euler.x + Math.PI / 2, euler.y, euler.z]]);
        }
        else {
            q_list = Matrix.add(q_list, this.start_pose_R);
            this.q1 = q_list.get(0, 0);
            this.q2 = q_list.get(0, 1);
            this.q3 = q_list.get(0, 2);
            this.q4 = q_list.get(0, 3);
            this.q5 = q_list.get(0, 4);
            this.q6 = q_list.get(0, 5);
            this.q7 = q_list.get(0, 6);
            this.q8 = q_list.get(0, 7);
            this.q9 = 0;
            this.s1 = Math.sin(this.q1);
            this.c1 = Math.cos(this.q1);
            this.s2 = Math.sin(this.q2);
            this.c2 = Math.cos(this.q2);
            this.s3 = Math.sin(this.q3);
            this.c3 = Math.cos(this.q3);
            this.s4 = Math.sin(this.q4);
            this.c4 = Math.cos(this.q4);
            this.s5 = Math.sin(this.q5);
            this.c5 = Math.cos(this.q5);
            this.s6 = Math.sin(this.q6);
            this.c6 = Math.cos(this.q6);
            this.s7 = Math.sin(this.q7);
            this.c7 = Math.cos(this.q7);
            this.s8 = Math.sin(this.q8);
            this.c8 = Math.cos(this.q8);
            this.s9 = Math.sin(this.q9);
            this.c9 = Math.cos(this.q9);
            pos_end_eff_x = ((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * 0.145 * this.c9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * 0.145 * this.s9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * 0.045 * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * 0.045 * this.s8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -0.21 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * -0.03 * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -0.03 * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * 0.03 * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * 0.03 * this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -0.22 + (((this.c1 * this.c2 + -this.s1 * this.s2) * -0.039 * this.c3 + (this.c1 * -this.s2 + -this.s1 * this.c2) * -0.212)))))));
            pos_end_eff_y = ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * 0.145 * this.c9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * 0.145 * this.s9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * 0.045 * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * 0.045 * this.s8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -0.21 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * -0.03 * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -0.03 * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * 0.03 * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * 0.03 * this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -0.22 + (((this.s1 * this.c2 + this.c1 * this.s2) * -0.039 * this.c3 + (this.s1 * -this.s2 + this.c1 * this.c2) * -0.212)))))));
            pos_end_eff_z = ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.s8) * 0.145 * this.c9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * -this.s7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.c7) * -1) * 0.145 * this.s9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * 0.045 * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * 0.045 * this.s8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -0.21 + (((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * -0.03 * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * -0.03 * this.s6 + ((((-1) * this.s3) * this.c4) * 0.03 * this.c5 + (((-1) * -this.c3)) * 0.03 * this.s5 + (((-1) * this.s3) * this.s4) * -0.22 + (((-1) * -0.039 * this.s3 + (0.3305))))))));
            var m3 = new Matrix3();
            m3.set(((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * this.c9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.s9), ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * this.c9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.s9), ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.s8) * this.c9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * -this.s7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.c7) * -1) * this.s9), ((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * -this.s9 + (((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.c9), ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * this.c8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.s8) * -this.s9 + (((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * -this.s7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.c7) * -1) * this.c9), ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * this.c8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.s8) * -this.s9 + (((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * -this.s7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.c7) * -1) * this.c9), ((((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * -this.s5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.c5)) * this.s7) * -this.s8 + ((((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.c4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * this.s4) * this.c5 + (((this.c1 * this.c2 + -this.s1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.c1 * this.c2 + -this.s1 * this.s2) * this.c3) * this.s4 + ((this.c1 * -this.s2 + -this.s1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.c8)), ((((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.c6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * this.s6) * this.c7 + (((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * -this.s5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.c5)) * this.s7) * -this.s8 + ((((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.c4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * this.s4) * this.c5 + (((this.s1 * this.c2 + this.c1 * this.s2) * this.s3)) * this.s5) * this.s6 + ((((this.s1 * this.c2 + this.c1 * this.s2) * this.c3) * this.s4 + ((this.s1 * -this.s2 + this.c1 * this.c2)) * -this.c4) * -1) * -this.c6) * -1) * this.c8)), ((((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.c6 + ((((-1) * this.s3) * this.s4) * -1) * this.s6) * this.c7 + (((((-1) * this.s3) * this.c4) * -this.s5 + (((-1) * -this.c3)) * this.c5)) * this.s7) * -this.s8 + ((((((-1) * this.s3) * this.c4) * this.c5 + (((-1) * -this.c3)) * this.s5) * this.s6 + ((((-1) * this.s3) * this.s4) * -1) * -this.c6) * -1) * this.c8)));
            var m4 = new Matrix4();
            m4.setFromMatrix3(m3);
            var euler = new Euler('XYZ');
            euler.setFromRotationMatrix(m4, 'XYZ');
            return new Matrix([[pos_end_eff_y, pos_end_eff_z, pos_end_eff_x, euler.x + Math.PI / 2, euler.y, euler.z]]);
        }
    };
    Robot.prototype.calc_jacob_newton = function (state, is_left_arm) {
        if (is_left_arm === void 0) { is_left_arm = true; }
        var eps = 0.01;
        var current = this.forward_kin(state, is_left_arm);
        var J = Matrix.zeros(6, 9);
        var n = null;
        var s = null;
        for (var j = 0; j < 9; j++) {
            s = new Matrix(state);
            s.set(0, j, s.get(0, j) + eps);
            n = this.forward_kin(s, is_left_arm);
            for (var i = 0; i < 6; i++) {
                J.set(i, j, (n.get(0, i) - current.get(0, i)) / eps);
            }
        }
        return J;
    };
    Robot.prototype.pseudo_inverse = function (p_desired, start_q, max_steps, is_left_arm) {
        if (is_left_arm === void 0) { is_left_arm = true; }
        var use_momentum = false;
        var p_start = this.forward_kin(start_q, is_left_arm);
        var delta_err = Matrix.sub(p_desired, p_start);
        var curent_q_pos = start_q;
        var eps = 0.01;
        var min_err = 0.01;
        ///////////////////////////////////////
        var d_tetha = null;
        var scaled_delta = null;
        var J = null;
        var Jpinv = null;
        var i = 0;
        while (delta_err.norm("frobenius") > min_err && i < max_steps) {
            scaled_delta = scaled_delta = Matrix.div(Matrix.mul(delta_err, eps), delta_err.norm("frobenius"));
            J = this.calc_jacob_newton(curent_q_pos, is_left_arm);
            Jpinv = pseudoInverse(J);
            d_tetha = Jpinv.mmul(scaled_delta.transpose()).transpose();
            curent_q_pos = Matrix.add(curent_q_pos, d_tetha);
            //this is the joint from ground to base line, should be fixed
            curent_q_pos.set(0, 0, 0.0);
            //this is the joint to the end effector should be fixed
            if (true) //if(!is_left_arm)
             {
                curent_q_pos.set(0, 1, 0.0);
            }
            delta_err = Matrix.sub(p_desired, this.forward_kin(curent_q_pos, is_left_arm));
            if (use_momentum) {
                if (i == 0) {
                    var velocity = new Matrix(d_tetha);
                }
                velocity = Matrix.add(velocity, d_tetha); //*1
                var mom = Matrix.add(curent_q_pos, velocity);
                if ((Matrix.sub(p_desired, this.forward_kin(mom)).norm("frobenius") < delta_err.norm("frobenius"))) {
                    curent_q_pos = mom;
                }
                else {
                    velocity = new Matrix(d_tetha);
                }
            }
            i += 1;
        }
        return curent_q_pos;
    };
    Robot.prototype.get_grip_L_pos = function () {
        var object = this.scooter.links["scooter_grip_L"];
        object.updateWorldMatrix(true, true);
        var vector = new Vector3(0, 0, 0);
        var v = object.localToWorld(vector, object.worldMatrix);
        var a = [v.x - this.scooter.position.x,
            v.y - this.scooter.position.y,
            v.z - this.scooter.position.z,
            1.57, 0, 0];
        var pos = new Matrix([a]);
        return pos;
    };
    Robot.prototype.get_grip_R_pos = function () {
        var object = this.scooter.links["scooter_grip_R"];
        object.updateWorldMatrix(true, true);
        var vector = new Vector3(0, 0, 0);
        var euler = new Euler();
        euler.setFromQuaternion(object.getWorldQuaternion());
        var v = object.localToWorld(vector, object.worldMatrix);
        var a = [v.x - this.scooter.position.x,
            v.y - this.scooter.position.y,
            v.z - this.scooter.position.z,
            4.7, 0, 0];
        var pos = new Matrix([a]);
        return pos;
    };
    Robot.prototype.move_arms = function () {
        var goal_p_L = this.get_grip_L_pos();
        var goal_p_R = this.get_grip_R_pos();
        var gen_L = this.pseudo_inverse(goal_p_L, this.last_pose_L, 500, true);
        var gen_R = this.pseudo_inverse(goal_p_R, this.last_pose_R, 500, false);
        this.last_pose_R = gen_R;
        this.last_pose_L = gen_L;
        this.set_pose(this.last_pose_L, this.last_pose_R);
    };
    return Robot;
}());
export { Robot };
