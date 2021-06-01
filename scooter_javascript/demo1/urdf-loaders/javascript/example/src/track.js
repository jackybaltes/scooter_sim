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
import { Vector2, Color, } from 'three';
var Track = /** @class */ (function () {
    function Track(track_threejs, render) {
        this.sleep = function (milliseconds) { return new Promise(function (resolve) { return setTimeout(resolve, milliseconds); }); };
        this.render = render;
        this.track_ = track_threejs; // the track described as a threeJS object
        this.scooter_obj_blinker_state = false;
        this.start_score = 100;
        this.lost = false;
        this.message = "";
        this.zebra_blink = false;
        this.traffic_state = 0;
        this.train_blink = false;
        this.scooter_yaw = 0;
        this.zebra_l = this.track_.links["left_1"].children[0].children[0].material;
        this.zebra_r = this.track_.links["right_1"].children[0].children[0].material;
        this.traffic_r = this.track_.links["red_1_traffic"].children[0].children[0].material;
        this.traffic_g = this.track_.links["green_1_traffic"].children[0].children[0].material;
        this.traffic_y = this.track_.links["yellow_1_traffic"].children[0].children[0].material;
        this.train_l = this.track_.links["left_1_train"].children[0].children[0].material;
        this.train_r = this.track_.links["right_1_train"].children[0].children[0].material;
        this.orange = new Color(255, 69, 0);
        this.red = new Color(255, 0, 0);
        this.green = new Color(0, 255, 0);
        this.black = new Color(0, 0, 0);
        //idk why but javascript need this else it doesn't feel good 
        this.stop_blink_zebra = this.stop_blink_zebra.bind(this);
        this.stop_blink_train = this.stop_blink_train.bind(this);
        this.trun_traffic_green = this.trun_traffic_green.bind(this);
        this.trun_traffic_red = this.trun_traffic_red.bind(this);
        this.part1 = new CheckPoint(new Vector2(-11.4, -9), new Vector2(-12.8, -12));
        this.part1_after = new CheckPoint(new Vector2(-11.4, -12.2), new Vector2(-12.8, -14.23));
        this.part1_cango_after = false;
        this.part1_on = false;
        //Traffic light
        this.part2 = new CheckPoint(new Vector2(-4.5, -16.2), new Vector2(-6, -17.4));
        this.part2_after = new CheckPoint(new Vector2(-3, -16.2), new Vector2(-4.5, -17.4));
        this.part2_cango_after = false;
        this.part2_on = false;
        //position part
        this.part3 = new CheckPoint(new Vector2(5.7, -17.3), new Vector2(3, -20.4));
        this.part3_after = new CheckPoint(new Vector2(5.7, -14.8), new Vector2(3, -17.1));
        this.part3_cango_after = false;
        this.part3_on = false;
        this.part4 = new CheckPoint(new Vector2(2.65, 2.44), new Vector2(-0.82, 0.5));
        this.part4_after = new CheckPoint(new Vector2(5.7, 3.2), new Vector2(0.81, 0.61));
        this.part4_cango_after = false;
        this.part4_on = false;
        this.part5 = new CheckPoint(new Vector2(5.8, 9.67), new Vector2(3, 7.66));
        this.part5_after = new CheckPoint(new Vector2(5.8, 12.7), new Vector2(3, 9.6));
        this.part5_cango_after = false;
        this.part5_on = false;
        this.part0 = new CheckPoint(new Vector2(-10, 12.7), new Vector2(-13.8, -2.35));
        this.part0_after = new CheckPoint(new Vector2(-10.7, -2.4), new Vector2(-14.8, -7.57));
        this.part0_on = false;
        this.part0_cango_after = false;
        this.part35 = new CheckPoint(new Vector2(4.15, -5.29), new Vector2(2.84, -12.94));
        this.part35_on = false;
        this.part0_failled = false;
        this.part1_failled = false;
        this.part2_failled = false;
        this.part3_failled = false;
        this.part35_failled = false;
        this.part4_failled = false;
        this.part5_failled = false;
        this.line_failled = false;
        this.part_1_colision_callback(3000, this.stop_blink_zebra);
        this.part_2_colision_callback(3000, this.trun_traffic_green);
        this.part_3_colision_callback(3000);
        this.part_4_colision_callback(3000);
        this.part_5_colision_callback(3000, this.stop_blink_train);
        this.part_0_colision_callback(7000);
        this.part_35_colision_callback();
        this.coord = [[-11.57, 15.86], [-11.57, 14.00], [-11.92, 12.80], [-11.92, -2.35], [-11.35, -8.90], [-11.3, -14.07], [-9.94, -15.59], [-8.64, -16.11], [-7.16, -16.18], [1.57, -16.24], [2.51, -15.88], [2.97, -14.85], [4.17, -13.96], [2.78, -12.92], [2.78, -4.19], [2.31, -3.30], [1.22, -3.03], [-8.54, -3.03], [-8.58, 2.311], [0.77, 2.37], [1.80, 2.42], [2.63, 2.98], [2.89, 3.96], [2.88, 15.16], [5.90, 15.16], [5.87, 0.49], [-4.61, 0.49], [-4.61, -1.22], [2.75, -1.18], [4.25, -1.18], [4.25, -4.84], [4.81, -5.73], [5.80, -6.20], [5.69, -20.58], [-4.5, -20.58], [-4.5, -17.51], [-8.68, -17.46], [-9.98, -17.13], [-11.22, -16.45], [-12.23, -15.43], [-13.05, -14.09], [-13.01, -8.94], [-12.40, -2.31], [-12.40, 12.80], [-12.69, 14.00], [-12.74, 15.85]];
        this.arrayX = [];
        this.arrayY = [];
        for (var i = 0; i < this.coord.length; i++) {
            this.arrayX.push(this.coord[i][0]);
            this.arrayY.push(this.coord[i][1]);
        }
    }
    Track.prototype.get_done = function () {
        return this.lost;
    };
    Track.prototype.stop_blink_zebra = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.zebra_blink = false;
                this.change_color(this.zebra_l, this.black);
                this.change_color(this.zebra_r, this.black);
                return [2 /*return*/];
            });
        });
    };
    Track.prototype.blink_zebra = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.zebra_blink) return [3 /*break*/, 4];
                        this.zebra_blink = true;
                        _a.label = 1;
                    case 1:
                        if (!this.zebra_blink) return [3 /*break*/, 4];
                        this.change_color(this.zebra_l, this.black);
                        this.change_color(this.zebra_r, this.black);
                        return [4 /*yield*/, this.sleep(500)];
                    case 2:
                        _a.sent();
                        this.change_color(this.zebra_l, this.red);
                        this.change_color(this.zebra_r, this.red);
                        return [4 /*yield*/, this.sleep(500)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.stop_blink_train = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.train_blink = false;
                this.change_color(this.train_l, this.black);
                this.change_color(this.train_r, this.black);
                return [2 /*return*/];
            });
        });
    };
    Track.prototype.blink_train = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.train_blink) return [3 /*break*/, 5];
                        this.train_blink = true;
                        _a.label = 1;
                    case 1:
                        if (!this.train_blink) return [3 /*break*/, 4];
                        this.change_color(this.train_l, this.black);
                        this.change_color(this.train_r, this.black);
                        return [4 /*yield*/, this.sleep(500)];
                    case 2:
                        _a.sent();
                        this.change_color(this.train_l, this.red);
                        this.change_color(this.train_r, this.red);
                        return [4 /*yield*/, this.sleep(500)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 4:
                        this.train_blink = false;
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.trun_traffic_red = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                //is green
                if (this.traffic_state == 2) {
                    this.change_color(this.traffic_r, this.black);
                    this.change_color(this.traffic_g, this.black);
                    this.change_color(this.traffic_y, this.orange);
                }
                this.traffic_state = 0;
                this.change_color(this.traffic_r, this.red);
                this.change_color(this.traffic_g, this.black);
                this.change_color(this.traffic_y, this.black);
                return [2 /*return*/];
            });
        });
    };
    Track.prototype.trun_traffic_green = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.traffic_state == 0)) return [3 /*break*/, 2];
                        this.change_color(this.traffic_r, this.black);
                        this.change_color(this.traffic_g, this.black);
                        this.change_color(this.traffic_y, this.orange);
                        return [4 /*yield*/, this.sleep(1000)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.traffic_state = 2;
                        this.change_color(this.traffic_r, this.black);
                        this.change_color(this.traffic_g, this.green);
                        this.change_color(this.traffic_y, this.black);
                        return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.change_color = function (obj, color) {
        obj.color.set(color);
        obj.emissive.set(color);
        obj.specular.set(color);
        obj.needsUpdate = true;
    };
    Track.prototype.init_track = function () {
        //this.train_blink = false;
        //this.zebra_blink = false;
        //this.stop_blink_train();
        //this.stop_blink_zebra();
        //this.sleep(1000);
        this.part0_cango_after = false;
        this.part0_on = false;
        this.part1_cango_after = false;
        this.part1_on = false;
        this.part2_cango_after = false;
        this.part2_on = false;
        this.part3_cango_after = false;
        this.part3_on = false;
        this.part35_on = false;
        this.part4_cango_after = false;
        this.part4_on = false;
        this.part5_cango_after = false;
        this.part5_on = false;
        //this.zebra_blink = false;
        //this.traffic_state = 0;
        //this.train_blink = false;
        this.lost = false;
        this.blink_zebra();
        this.trun_traffic_red();
        this.blink_train();
    };
    Track.prototype.update = function (scooter_pos, scooter_yaw, blinker_left_state, scooter_stoped) {
        this.scooter_obj_blinker_state = blinker_left_state;
        //can opti the code a lot here
        this.scooter_yaw = scooter_yaw;
        this.part0_on = this.part0.is_in(scooter_pos);
        this.part1_on = this.part1.is_in(scooter_pos);
        this.part2_on = this.part2.is_in(scooter_pos);
        this.part3_on = this.part3.is_in(scooter_pos);
        this.part35_on = this.part35.is_in(scooter_pos);
        this.part4_on = this.part4.is_in(scooter_pos);
        this.part5_on = this.part5.is_in(scooter_pos);
        if (!this.is_in_track(scooter_pos, this.arrayX, this.arrayY)) {
            this.lost = true;
            this.line_failled = true;
            this.message = "You went of track !";
        }
        if (this.part0_after.is_in(scooter_pos) && !this.part0_cango_after && !scooter_stoped) {
            this.lost = true;
            this.line_failled = true;
            this.message = "You have to stay 7 sec on the line (without stoping)!";
        }
        if (this.part1_after.is_in(scooter_pos) && !this.part1_cango_after) {
            this.part1_failled = true;
            this.message = "Wait before the Zebra crossing !";
        }
        if (this.part2_after.is_in(scooter_pos) && !this.part2_cango_after) {
            this.part2_failled = true;
            this.message = "Wait for the traffic light to turn green";
        }
        if (this.part3_after.is_in(scooter_pos) && !this.part3_cango_after) {
            this.part3_failled = true;
            this.message = "Wait a bit inside the rectangle";
        }
        if (this.part4_after.is_in(scooter_pos) && !this.part4_cango_after) {
            this.part4_failled = true;
            this.message = "You need to stop before crossing";
        }
        if (this.part5_after.is_in(scooter_pos) && !this.part5_cango_after) {
            this.part5_failled = true;
            this.message = "Got hit by a train";
        }
    };
    Track.prototype.getscore = function () {
        var curent_score = this.start_score;
        if (this.part1_failled) {
            curent_score -= 32;
        }
        if (this.part2_failled) {
            curent_score -= 32;
        }
        if (this.part3_failled) {
            curent_score -= 32;
        }
        if (this.part35_failled) {
            curent_score -= 32;
        }
        if (this.part4_failled) {
            curent_score -= 32;
        }
        if (this.part5_failled) {
            curent_score -= 32;
        }
        return curent_score;
    };
    Track.prototype.getMessage = function () {
        return this.message;
    };
    Track.prototype.is_in_track = function (point, cornersX, cornersY) {
        var x = point.x;
        var y = -point.z;
        var i, j = cornersX.length - 1;
        var odd = false;
        var pX = cornersX;
        var pY = cornersY;
        //this may not work in typescript
        for (i = 0; i < cornersX.length; i++) {
            if ((pY[i] < y && pY[j] >= y || pY[j] < y && pY[i] >= y) && (pX[i] <= x || pX[j] <= x)) {
                if ((pX[i] + (y - pY[i]) * (pX[j] - pX[i]) / (pY[j] - pY[i])) < x) {
                    odd = !odd;
                }
            }
            j = i;
        }
        return odd;
    };
    Track.prototype.part_1_colision_callback = function (time_needed_ms, function_) {
        if (function_ === void 0) { function_ = null; }
        return __awaiter(this, void 0, void 0, function () {
            var var_counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.part1_cango_after = false;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        var_counter = 0;
                        _a.label = 2;
                    case 2:
                        if (!this.part1_on) return [3 /*break*/, 4];
                        /*
                        if(!this.part0_cango_after)
                        {
                            this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                        }
                        */
                        var_counter++;
                        return [4 /*yield*/, this.sleep(1000)];
                    case 3:
                        _a.sent();
                        if (var_counter * 1000 >= time_needed_ms) {
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 2];
                    case 4:
                        //if we break and th boolean is true, we can say it's good now 
                        if (this.part1_on) {
                            //this.message = "You can go";
                            if (function_) {
                                function_(this);
                            }
                            this.part1_cango_after = true;
                        }
                        //else we just try again
                        //delay to not kill the computer
                        return [4 /*yield*/, this.sleep(1000)];
                    case 5:
                        //else we just try again
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.part_2_colision_callback = function (time_needed_ms, function_) {
        if (function_ === void 0) { function_ = null; }
        return __awaiter(this, void 0, void 0, function () {
            var var_counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.part2_cango_after = false;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        var_counter = 0;
                        _a.label = 2;
                    case 2:
                        if (!this.part2_on) return [3 /*break*/, 4];
                        /*
                        if(!this.part2_cango_after)
                        {
                            this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                        }
                        */
                        var_counter++;
                        return [4 /*yield*/, this.sleep(1000)];
                    case 3:
                        _a.sent();
                        if (var_counter * 1000 >= time_needed_ms) {
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 2];
                    case 4:
                        //if we break and th boolean is true, we can say it's good now 
                        if (this.part2_on) {
                            //this.message = "You can go";
                            if (function_) {
                                function_(this);
                            }
                            this.part2_cango_after = true;
                        }
                        //else we just try again
                        //delay to not kill the computer
                        return [4 /*yield*/, this.sleep(1000)];
                    case 5:
                        //else we just try again
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.part_3_colision_callback = function (time_needed_ms, function_) {
        if (function_ === void 0) { function_ = null; }
        return __awaiter(this, void 0, void 0, function () {
            var ori_Ok, var_counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.part3_cango_after = false;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        ori_Ok = this.scooter_yaw < 1.8 && this.scooter_yaw > 1.4;
                        if (this.part3_on) {
                            if (ori_Ok) {
                                this.message = "Your orientation is good !";
                            }
                            else {
                                this.message = "You should be perpendicular to the line";
                            }
                        }
                        var_counter = 0;
                        _a.label = 2;
                    case 2:
                        if (!(this.part3_on && ori_Ok)) return [3 /*break*/, 4];
                        if (!this.part3_cango_after) {
                            this.message = "Wait " + ((time_needed_ms / 1000) - var_counter) + " seconds";
                        }
                        var_counter++;
                        return [4 /*yield*/, this.sleep(1000)];
                    case 3:
                        _a.sent();
                        if (var_counter * 1000 >= time_needed_ms) {
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 2];
                    case 4:
                        //if we break and th boolean is true, we can say it's good now 
                        if (this.part3_on && ori_Ok) {
                            this.message = "you can go now";
                            if (function_) {
                                function_(this);
                            }
                            this.part3_cango_after = true;
                        }
                        //else we just try again
                        //delay to not kill the computer
                        return [4 /*yield*/, this.sleep(1000)];
                    case 5:
                        //else we just try again
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.part_4_colision_callback = function (time_needed_ms, function_) {
        if (function_ === void 0) { function_ = null; }
        return __awaiter(this, void 0, void 0, function () {
            var var_counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.part4_cango_after = false;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        var_counter = 0;
                        _a.label = 2;
                    case 2:
                        if (!this.part4_on) return [3 /*break*/, 4];
                        if (!this.part4_cango_after) {
                            this.message = "Wait " + ((time_needed_ms / 1000) - var_counter) + " seconds";
                        }
                        var_counter++;
                        return [4 /*yield*/, this.sleep(1000)];
                    case 3:
                        _a.sent();
                        if (var_counter * 1000 >= time_needed_ms) {
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 2];
                    case 4:
                        //if we break and th boolean is true, we can say it's good now 
                        if (this.part4_on) {
                            this.message = "you can go now";
                            if (function_) {
                                function_(this);
                            }
                            this.part4_cango_after = true;
                        }
                        //else we just try again
                        //delay to not kill the computer
                        return [4 /*yield*/, this.sleep(1000)];
                    case 5:
                        //else we just try again
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.part_5_colision_callback = function (time_needed_ms, function_) {
        if (function_ === void 0) { function_ = null; }
        return __awaiter(this, void 0, void 0, function () {
            var var_counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.part4_cango_after = false;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        var_counter = 0;
                        _a.label = 2;
                    case 2:
                        if (!this.part5_on) return [3 /*break*/, 4];
                        /*
                        if(!this.part5_cango_after)
                        {
                            this.message = "Wait "+((time_needed_ms/1000)-var_counter)+" seconds";
                        }
                        */
                        var_counter++;
                        return [4 /*yield*/, this.sleep(1000)];
                    case 3:
                        _a.sent();
                        if (var_counter * 1000 >= time_needed_ms) {
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 2];
                    case 4:
                        //if we break and th boolean is true, we can say it's good now 
                        if (this.part5_on) {
                            //this.message = "you can go now";
                            if (function_) {
                                function_(this);
                            }
                            this.part5_cango_after = true;
                        }
                        //else we just try again
                        //delay to not kill the computer
                        return [4 /*yield*/, this.sleep(1000)];
                    case 5:
                        //else we just try again
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.part_0_colision_callback = function (time_needed_ms, function_) {
        if (function_ === void 0) { function_ = null; }
        return __awaiter(this, void 0, void 0, function () {
            var var_counter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.part0_cango_after = false;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 6];
                        var_counter = 0;
                        _a.label = 2;
                    case 2:
                        if (!this.part0_on) return [3 /*break*/, 4];
                        if (!this.part0_cango_after) {
                            this.message = var_counter + " seconds | (min 7 seconds)";
                        }
                        var_counter++;
                        return [4 /*yield*/, this.sleep(1000)];
                    case 3:
                        _a.sent();
                        if (var_counter * 1000 >= time_needed_ms) {
                            this.part0_cango_after = true;
                            this.message = "you lasted more than 7 sec !";
                            return [3 /*break*/, 4];
                        }
                        return [3 /*break*/, 2];
                    case 4: 
                    //delay to not kill the computer
                    return [4 /*yield*/, this.sleep(100)];
                    case 5:
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Track.prototype.part_35_colision_callback = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        if (this.part35_on && !this.scooter_obj_blinker_state) {
                            this.part35_failled = true;
                            this.message = "you can't change line without using the blinker";
                            return [3 /*break*/, 2];
                        }
                        //delay to not kill the computer
                        return [4 /*yield*/, this.sleep(100)];
                    case 1:
                        //delay to not kill the computer
                        _a.sent();
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return Track;
}());
export { Track };
var CheckPoint = /** @class */ (function () {
    function CheckPoint(top_left, bottom_right) {
        this.top_left = top_left;
        this.bottom_right = bottom_right;
    }
    CheckPoint.prototype.is_in = function (point) {
        return this.top_left.x > point.x && this.bottom_right.x < point.x && this.top_left.y > -point.z && this.bottom_right.y < -point.z;
    };
    return CheckPoint;
}());
export { CheckPoint };
