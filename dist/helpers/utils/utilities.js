"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Utilities {
    constructor() { }
    /*
    * Returns string provided as a camelCase. Considers any non-alphanumeric characters as delimiters
    * camelCase("This is an !@#$%^&*()<>?,./{}[]\| Apple") => "thisIsAnApple"
    *
    * camelCase("This is a pineapple") => "thisIsAPineapple"
    *
    * camelCase("This is a pine-apple") => "thisIsAPineApple" : Note that "-" between pine and apple is considered a
    * delimiter so both "pine" and "apple" has bot "P" and "A" capitalized
    * */
    camelCase(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
                return chr.toUpperCase();
            });
        });
    }
    /*
    * Returns trimmed string provided as snake_case. Considers spaces and any other non-alphanumeric characters as delimiters
    *  snakeCase("dev int") => 'dev_int'
    *  snakeCase("dev int ") => 'dev_int'
    *  snakeCase("dev/int") => 'dev_int'
    *  snakeCase("staging") => 'staging'
    * */
    snakeCase(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
                return `_${chr.toLowerCase()}`;
            }).trim();
        });
    }
}
exports.default = Utilities;
