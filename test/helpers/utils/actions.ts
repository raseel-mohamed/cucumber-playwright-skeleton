import {expect, Locator, Page} from "@playwright/test";
import {PageWorld} from "../../hooks/pageWorld";
import fs from "fs";

export default class Actions {
    constructor(private page: Page) {}

    async goToPage(url: string){
        await this.page.goto(url, {
            waitUntil: "domcontentloaded"
        });
    }

    async waitAndClick(locator: string){
        const element = this.page.locator(locator);
        await element.waitFor({
            state: "visible"
        });
        await element.click();
    }

    async fill(locator: string, entry: string){
        await this.page.locator(locator).fill(entry);
    }

    async pauseFor(seconds: number){
        await this.page.waitForTimeout(seconds * 1000)
    }

    async waitUntilElementVisible(locator:string) {
        const element = this.page.locator(locator);
        await element.waitFor({
            state: "visible", timeout: 30000
        });
        return element;
    }

    async waitLongerUntilElementVisible(locator:string, waitTime:any=null) {
        let time:any = waitTime === null ? 75000 : waitTime
        const element = this.page.locator(locator);
        await element.waitFor({
            state: "visible", timeout: time
        });
        return element;
    }

    async scrollToPageBottom(page:Page) {
        await page.evaluate(() => window.scrollTo(0,document.body.scrollHeight));
        await PageWorld.page.waitForTimeout(1000);
        return page;
    }

    async pageRefresh(){
        await PageWorld.page.reload();
        await PageWorld.page.waitForLoadState("domcontentloaded");
        await PageWorld.page.evaluate(() => window.scrollTo(0,0));
        await PageWorld.page.waitForTimeout(5000);
    }

    async type(selector:any, text:string, waitAfter=500) {
        if(text.includes(".xlsx") || text.includes(".docx"))
            await this.checkFileExistenceBeforeUploading(text)
        await this.fill(selector, text);
        await this.page.waitForTimeout(500);
        return this;
    }

    async checkFileExistenceBeforeUploading(text:string){
        let splitFileName = text.split("/")
        let fileName = splitFileName[splitFileName.length-1]
        let path = text.replace(fileName,"").trim()
        // let check:Promise<boolean | any>[] = this.checkAFileExists(path, fileName)
        const [exists, _foundFileName] = this.checkAFileExists(path, fileName);
        if (!exists) {
            console.log(text + ' is missing !!!');
        }
        expect(exists).toEqual(true)
        return this;
    }

    checkAFileExists(path:string, filename:string): [boolean, string] {
        let check = false
        let downloadedFileName = '';

        fs.readdirSync(path).forEach(file => {
            if (file.includes(filename)) {
                console.log('\n' + file + ' exists at ' + path + '\n');
                check = true;
                downloadedFileName = file;
            }
        });
        return [check, downloadedFileName];
    }
}