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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const jwt_decode_1 = require("jwt-decode");
class Auth0 {
    constructor() {
        this.username = "";
        this.password = "";
        this.clientId = "";
        this.clientSecret = "";
        this.domain = "";
        this.grantType = "";
        this.tokenFile = path_1.default.resolve(`${__dirname}/../../../token.json`);
        this.response = null;
    }
    buildAndStoreToken(props) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.assign(this, props);
            let data = yield this.readTokensFromFile();
            // @ts-ignore
            if (!(data[this.username] && (yield this.tokenValid(data[this.username])))) {
                console.log("I  DONT have a file and/or a valid token");
                yield this.buildToken();
                yield this.storeIdToken();
            }
        });
    }
    buildToken() {
        return __awaiter(this, void 0, void 0, function* () {
            this.grantType = this.grantType ? this.grantType : "password";
            let url = `https://${this.domain}/oauth/token12`;
            let reqBody = {
                grant_type: "password",
                client_id: this.clientId,
                client_secret: this.clientSecret,
                username: this.username,
                password: this.password,
            };
            this.response = yield (0, node_fetch_1.default)(url, {
                method: 'post',
                body: JSON.stringify(reqBody),
                headers: { 'Content-Type': 'application/json' }
            });
            let response = yield this.response;
            if (response.status !== 200) {
                throw new Error("Cannot generate access token");
            }
            this.response = yield response.json();
        });
    }
    readTokensFromFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let data = {};
            if ((0, fs_1.existsSync)(this.tokenFile)) {
                let fileBuffer = (0, fs_1.readFileSync)(this.tokenFile, "utf8");
                data = JSON.parse(fileBuffer);
            }
            return data;
        });
    }
    storeIdToken() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.tokenFile);
            let data = this.readTokensFromFile();
            // @ts-ignore
            data[this.username] = this.response['id_token'];
            (0, fs_1.writeFileSync)(this.tokenFile, JSON.stringify(data, null, 2));
        });
    }
    tokenValid(token) {
        return __awaiter(this, void 0, void 0, function* () {
            let decoded = (0, jwt_decode_1.jwtDecode)(token);
            // @ts-ignore
            return decoded.exp > parseInt(String(Date.now() / 1000));
        });
    }
    retrieveToken(username) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = yield this.readTokensFromFile();
            username = username ? username : this.username;
            // @ts-ignore
            return data[username];
        });
    }
}
exports.default = Auth0;
