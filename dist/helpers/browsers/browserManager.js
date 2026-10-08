"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeBrowser = void 0;
const test_1 = require("@playwright/test");
const options = {
    headless: false
};
const invokeBrowser = () => {
    const browserType = process.env.BROWSER || "chrome";
    switch (browserType) {
        case "chrome":
            return test_1.chromium.launch(options);
        case "firefox":
            return test_1.firefox.launch(options);
        case "webkit":
            return test_1.webkit.launch();
        case "api":
            console.log("API test, browser will not be launched");
            return;
        default:
            throw new Error("Please set the proper browser!");
    }
};
exports.invokeBrowser = invokeBrowser;
