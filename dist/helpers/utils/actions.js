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
class Actions {
    constructor(page) {
        this.page = page;
    }
    goToPage(url) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(url, {
                waitUntil: "domcontentloaded"
            });
        });
    }
    waitAndClick(locator) {
        return __awaiter(this, void 0, void 0, function* () {
            const element = yield this.page.locator(locator);
            yield element.waitFor({
                state: "visible"
            });
            yield element.click();
        });
    }
    fill(locator, entry) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.locator(locator).fill(entry);
        });
    }
}
exports.default = Actions;
