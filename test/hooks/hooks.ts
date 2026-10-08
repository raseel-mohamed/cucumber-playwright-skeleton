import * as fs from "fs"
import path from "path"
import {BeforeAll, Before, After, Status, AfterAll} from "@cucumber/cucumber"
import {
    Browser,
    BrowserContext,
    chromium,
    firefox,
    LaunchOptions,
    Page,
    webkit
} from "@playwright/test";

import { PageWorld } from "./pageWorld";
import {invokeBrowser} from "../helpers/browsers/browserManager";
import {getEnv} from "../helpers/env/env";
import Utilities from "../helpers/utils/utilities";
import {defaultLogger} from "../helpers/logger/logger";

let page: Page
let browser: Browser
let context: BrowserContext
let utils = new Utilities(PageWorld.page)

const ROOT_FOLDER = path.resolve(`${__dirname}/../..`)
const DOWNLOAD_FOLDER = path.resolve(`${ROOT_FOLDER}/downloadFolder`)
const RESULTS_FOLDER = path.resolve(`${ROOT_FOLDER}/test-results`)
// const sessionFile = path.resolve(`${ROOT_FOLDER}/session.json`)

BeforeAll(async function () {
    getEnv();
    browser = await invokeBrowser();
    if (!fs.existsSync(DOWNLOAD_FOLDER)) {
        fs.mkdirSync(DOWNLOAD_FOLDER,{ recursive: true });
    }
    if (!fs.existsSync(RESULTS_FOLDER)){
        fs.mkdirSync(RESULTS_FOLDER, {recursive: true});
    }
    process.env.ROOT_FOLDER = ROOT_FOLDER;
    defaultLogger.info(`Running on URL for UI: ${process.env.APP_URL}`)
    defaultLogger.info(`Running on URL for API: ${process.env.API_URL}`);
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 10)));
});

Before(async function (scenario) {
    console.log();
    defaultLogger.info(`Running '${scenario.pickle.name}'`);
    context = await browser.newContext({
        userAgent: process.env.userAgent,
        acceptDownloads: true
    });
    page = await context.newPage();
    PageWorld.page = page;
})

After(async function (scenario) {
    defaultLogger.info(`***** Scenario '${scenario.pickle.name}': ${scenario.result?.status} ****`)
    let screenshotImage = await utils.camelCase(scenario.pickle.name)
    if(scenario.result?.status !== Status.PASSED){
        const image = await PageWorld.page.screenshot({
            path: `./test-results/screenshots/${screenshotImage}.png`,
            type: "png",
            fullPage: true
        })
        await this.attach(image, "image/png")
    }


    await PageWorld.page.close();
    await context.close();
})

AfterAll(async function () {
    // fs.writeFile(sessionFile, "{}", function(){console.log('done')})
    // await PageWorld.page.close();
    // await context.close();
    await browser.close();
})
