import {Page, Locator, expect} from '@playwright/test'
import fs from "fs";
import path from "path";
import {defaultLogger} from "../logger/logger";
const dataFolder = path.resolve(`${__dirname}/../../../dataFolder`)
const downloadFolder = path.resolve(`${__dirname}/../../../downloadFolder`)

export default class Utilities {
    constructor(private page: Page) {}

    async pauseFor(seconds: number): Promise<void> {
        await new Promise(r => setTimeout(r, seconds * 1000));
    }

    /*
    * Returns string provided as a camelCase. Considers any non-alphanumeric characters as delimiters
    * camelCase("This is an !@#$%^&*()<>?,./{}[]\| Apple") => "thisIsAnApple"
    *
    * camelCase("This is a pineapple") => "thisIsAPineapple"
    *
    * camelCase("This is a pine-apple") => "thisIsAPineApple" : Note that "-" between pine and apple is considered a
    * delimiter so both "pine" and "apple" has bot "P" and "A" capitalized
    * */
    async camelCase(name: string):Promise<string> {
        return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr){
            return chr.toUpperCase();
        });
    }

    /*
    * Returns trimmed string provided as snake_case. Considers spaces and any other non-alphanumeric characters as delimiters
    *  snakeCase("dev int") => 'dev_int'
    *  snakeCase("dev int ") => 'dev_int'
    *  snakeCase("dev/int") => 'dev_int'
    *  snakeCase("staging") => 'staging'
    * */
    async snakeCase(name: string):Promise<string> {
        return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr){
            return `_${chr.toLowerCase()}`;
        }).trim();
    }

    /*
    * Returns hyphenated lower case string. Considers spaces, tabs, newline characters as delimiters
    *  hyphenatedLowerCase("Upload Assay Data") => 'upload-assay-data'
    *  hyphenatedLowerCase("Upload  Manifests") => 'upload-manifests'
    *  hyphenatedLowerCase("Staging") => 'staging'
    * */
    async hyphenatedLowerCase(name: string):Promise<string> {
        return name.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(match, chr){
            return `-${chr.toLowerCase()}`;
        }).trim();
    }

    /*
    * Returns string in Title case
    * await titleCase("INITIAL string") => 'Initial String'
    * await titleCase("iNitIal STRING") => 'Initial String'
    * */
    async titleCase(str: string):Promise<string> {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    /*
    * Returns an array with the filename and the extension separated
    * await getFileNameAndExtension("abcd.xlsx") => [ 'abcd', 'xlsx' ]
    * await getFileNameAndExtension("aliph.pdf") => [ 'aliph', 'pdf' ]
    * */
    async getFileNameAndExtension(fileName: string):Promise<string[]> {
        let separator = fileName.lastIndexOf('.');
        let file:string = fileName.slice(0,separator);
        let extension = fileName.substring(separator + 1);
        return [file, extension]
    }

    async getCurrentGMTDate():Promise<string> {
        let date = new Date();
        let dateObject = new Date(date)
        let gmtDT = dateObject.toUTCString();
        let parsedDT = Date.parse(gmtDT);
        let compactDT = new Date(parsedDT).toJSON().slice(0,10);
        let reqMonth = compactDT.substring(5,7)
        let reqDate = compactDT.substring(8,10)
        let reqYear = compactDT.substring(0,4)
        return `${reqYear}-${reqMonth}-${reqDate}`;
    }

    async getCurrentESTDate(dateFormat: string, separator: string) {
        const now = new Date();
        let easternStandardTime: string;
        easternStandardTime = now.toLocaleString('en-US', {
            timeZone: 'America/New_York', // IANA timezone identifier for Eastern Time
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Use 24-hour format
        });
        let [reqMonth, reqDate, reqYear] = easternStandardTime.split(",")[0].split("/")

        return this.returnDateFormat(dateFormat, separator, reqYear, reqMonth, reqDate)
    }

    async getGMTDate(dateFormat: string, separator: string) {
        const now = new Date();
        let gmtDate = now.toLocaleString('en-US', {
            timeZone: 'GMT',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        let [reqMonth, reqDate, reqYear] = gmtDate.split(",")[0].split("/")
        return this.returnDateFormat(dateFormat, separator, reqYear, reqMonth, reqDate)
    }

    async returnDateFormat(dateFormat:string, separator: string, year: string, month: string, day: string) {
        switch(dateFormat) {
            case 'yyyymmdd': {
                return [year, month, day].join(separator);
            }
            case 'mmddyyyy': {
                return [month, day, year].join(separator);
            }
            case 'mmddyy': {
                return [month, day, year.substring(2)].join(separator);
            }
        }
    }

    /*
    * This function returns the column Index of the column within the table where heading matches the name of the headingName
    * */
    async getColumnIndexByHeadingName(tableSelectorString:Locator, headingName: string):Promise<number>{
        let headingSelector = tableSelectorString.locator(`thead td`);
        let headingList = await headingSelector.allTextContents()

        return headingList.indexOf(headingName);
    }

    async getTableRowByValue(tableSelectorString:Locator, columnValue:string, columnIndex:number): Promise<null | Locator> {
        let rowSelector = `${tableSelectorString} tbody tr`
        let rowCount = await tableSelectorString.locator(`tbody tr`).count();
        let rowData:string | null
        let row: Locator | null = null;
        for (let i = 0; i < rowCount; i++) {
            rowData = await this.page.locator(`${rowSelector}`).nth(i).locator('td').nth(columnIndex).textContent()
            if(rowData === columnValue){
                row = this.page.locator(`${rowSelector}`).nth(i).locator('td')
            }
        }
        return row;
    }

    async compareArrays(array1: string[], array2: string[], sort = true){
        let difference = await this.findTheDifferentElements(array1, array2, sort)
        console.log("difference : ", difference)
        if(difference.length > 0 )
            return false
        else
            return true
    }

    async findTheDifferentElements(array1: any, array2: any, sort = true){
        let difference = []
        if (array1.length !== array2.length){
            let max = array1.length > array2.length ? array1.length : array2.length
            let modifiedMaxArray = array1.length > array2.length ? array1.sort() : array2.sort()
            let modifiedMinArray = array1.length > array2.length ? array2.sort() : array1.sort()
            let message = array1.length > array2.length ? "array1" : "array2"
            for(let i=0; i<max; i++){
                if(!modifiedMinArray.includes(modifiedMaxArray[i])) {
                    console.log(("i= " + i + "array1: " + modifiedMaxArray[i]) + " of " + message + " is extra")
                    difference.push(modifiedMaxArray[i])
                }
            }
        }
        else {
            let modifiedArray1 = sort ? array1.sort() : array1
            let modifiedArray2 = sort ? array2.sort() : array2
            for (let i = 0; i < modifiedArray1.length; i++) {
                if (modifiedArray1[i] !== modifiedArray2[i]) {
                    console.log(("i= " +i + "array1: " +modifiedArray1[i]))
                    difference.push(modifiedArray1[i])
                }
            }
        }
        return difference
    }

    async sortDescendingArray(strArray:string[]){
        return strArray.sort((a,b) => {
            let aUpperCase = a!.toUpperCase();
            let bUpperCase = b!.toUpperCase();
            if(aUpperCase < bUpperCase ) {
                return -1;
            }
            if(aUpperCase > bUpperCase ) {
                return 1;
            }
            return 0
        })
    }


    async dynamicWaitForElement(elementLocator:any, timeOut:number){
        let attempts:number = timeOut/5;
        while(attempts > 0){
            if(await elementLocator.count() > 0){
                return
            }
            await this.page.waitForTimeout(5000);
            attempts -= 1 ;
        }
    }

    async clickElementToDownload(element:Locator, fileName:string|null = null){
        await expect(element).toBeVisible({timeout: 20000})
        let downloadPromise = this.page.waitForEvent('download');
        await element.click();
        let download = await downloadPromise;
        if(!fileName){
            fileName = download.suggestedFilename();
        }
        defaultLogger.info(`Downloading file: ${fileName}`);
        await download.saveAs(`${downloadFolder}/${fileName}`)
        defaultLogger.info(`File saved to '${downloadFolder}/${fileName}'`)
        return fileName;
    }

    async clickDownloadButtonSaveSuggestedName(buttonName:string){
        await this.page.waitForSelector('.right-panel', { timeout: 60000 });
        const buttonLocator = this.page.locator('button').filter({hasText: buttonName});
        await expect(buttonLocator).toBeVisible({timeout: 60000})
        await buttonLocator.scrollIntoViewIfNeeded();
        let downloadPromise = this.page.waitForEvent('download');
        await buttonLocator.click({timeout: 10000});
        let download = await downloadPromise;
        let suggestedFileName = download.suggestedFilename()
        defaultLogger.info(`Downloading file ${suggestedFileName}`)
        await download.saveAs(`${downloadFolder}/`+`${suggestedFileName}`)
        return suggestedFileName
    }

    async capitalizeFirstLetter(str:string) {
        let strArray = str.split(' ');
        for (let i = 0; i < strArray.length; i++) {
            strArray[i] = strArray[i].charAt(0).toUpperCase() + strArray[i].slice(1);
        }
        return strArray.join('');
    }

    async getElementsList(page:any, selector:any){
        let list:any = [];
        let cnt = await page
            .element.findAll(selector);
        return list;
    }

    async getMostRecentFileName(dir:string, extension:string,timeout=15000) {
        defaultLogger.info(`Dir to search for : ${dir}`);
        const start = Date.now();

        while (Date.now() - start < timeout) {
            const files = fs.readdirSync(dir)
                .filter(f =>
                    !f.endsWith('.crdownload') &&
                    !f.endsWith('.tmp') &&
                    f.endsWith(extension)
                );

            if (files.length > 0) {
                const latestFile = files
                    .map(file => ({
                        name: file,
                        time: fs.statSync(path.join(dir, file)).mtime.getTime()
                    }))
                    .sort((a, b) => b.time - a.time)[0];

                defaultLogger.info(`Latest file found: ${latestFile.name}`);
                return latestFile.name;
            }

            await new Promise(res => setTimeout(res, 500));
        }

        throw new Error(`No files with extension ${extension} found in ${dir} within timeout`);
    }

    /*
    * This function is used to convert from hex entries on the css property to rgb. Useful when we want to compare the colors
    * The CSS property value used by the CSS property name (background-color) is in hex format (#031df4), but the
    * received value is in rgb(3,29, 244) format
    * see 'https://playwrightsolutions.com/what-the-hex-or-how-i-check-colors-with-playwright/' for more info
    * */
    async convertHexToRGB(hex: string) {
        hex = hex.replace(/^#/, "");
        // Parse the hex values into separate R, G, and B values
        const red = parseInt(hex.substring(0, 2), 16);
        const green = parseInt(hex.substring(2, 4), 16);
        const blue = parseInt(hex.substring(4, 6), 16);

        // Return the RGB values in an object
        return {
            red: red,
            green: green,
            blue: blue,
        };
    }

    /*
    * This function is used to extract total number of files from strings used under left pane eg: "trial 32 _ of 24 long_field_test (28)"
    * or the total count in a table eg: "displaying 10 to 20 of 28"
    * In both cases the return is "28"
    * if nothing is found the return is null, eg: applebees
    * */

    async extractTotal(checkElement:Locator):Promise<string|null>{
        const checkString = (await checkElement.textContent()) ?? '';
        const regex_paren = /\((\d+)\)/;
        const regex_of    = /(?<=of )(\d+)/;
        const match = checkString.match(regex_paren) ?? checkString.match(regex_of);
        return match?.[1] ?? null
    }

    /*
    * This function will return a string with all non-alphanumeric characters removed. This is useful when comparing
    * actual strings with different breaks and spaces to compare the text only
    * */
    async minifyText(text:string):Promise<string>{
        return text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    /*
    * Returns the table element as an array of objects
    * */
    async readTableIntoArray(table:Locator):Promise<any[]>{
        return  await table.evaluate((elem) =>{
            const headers = Array.from(elem.querySelectorAll('th')).map(
                el => el.innerText
            )
            const rows = Array.from(elem.querySelectorAll('tr')).slice(1);
            return rows.map(row => {
                const cell = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
                return headers.reduce((obj:any, header:string, index:number) => {
                    obj[header] = cell[index] || "";
                    return obj;
                }, {})
            })
        })
    }
}