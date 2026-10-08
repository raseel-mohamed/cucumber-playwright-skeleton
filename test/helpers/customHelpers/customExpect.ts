import {expect, Page} from "@playwright/test";
import {defaultLogger} from "../logger/logger";

/*
* This class will provide the functionality to add a message if the expect message fails
* */
export default class CustomExpect {
    constructor(private page: Page) {}

    /*
    * Playwright runner provides the option to add custom messages on playwright runner only. Since this is not available
    * on the cucumber runner, this function provides a way to add custom messages to expect statement.
    * ```js
    *   import CustomExpect from "../helpers/customHelpers/customExpect"
    *   export default class CucumberPageClass {
    *       private expectMessage:CustomExpect;
    *       constructor (private page: Page) {
    *          this.expectMessage = new CustomExpect(page);
    *       }
    *    async yourFunction(){
    *        let actual = "a";
    *        await this.expectMessage.expectMessage(() =>
    *           expect(actual).toEqual("b"),`Checking for value of actual to equal b`
    *         );
    *     }
    * ```
    * If the step fails the cucumber report looks like this
    * ``` gherkin
    * And I verify value is "a" # test/steps/featurePage.ts:42
       Error: Checking for value of actual to equal b
       expect(received).toEqual(expected) // deep equality

       Expected: "b"
       Received: "a"
    * ```
    * */
    async expectMessage(assertion: () => void | Promise <void>, message: string){
        try {
            await assertion();
        }catch(error){
            throw new Error(`${message}\n${(error as Error).message}`);
        }
    }

    /*
    * Playwright runner provides the option for a soft expect on playwright runner only. Since this is not available
    * on the cucumber runner, this function provides a way to have a soft expect statement. This the test case is not
    * interrupted by failure the test case will actually pass even if error is encountered. T
    * ```js
    *   import CustomExpect from "../helpers/customHelpers/customExpect"
    *   export default class CucumberPageClass {
    *       private expectMessage:CustomExpect;
    *       constructor (private page: Page) {
    *          this.expectMessage = new CustomExpect(page);
    *       }
    *    async yourFunction(){
    *        let actual = "a";
    *        await this.expectMessage.softExpectMessage(() =>
    *           expect(actual).toEqual("b"),`Checking for value of actual to equal b`
    *         );
    *     }
    * ```
    * If the step fails the cucumber report will show the step as pass. But the running log will display the error
    * ```bash
    * [2026-05-12T12:25:26.289] [ERROR] default - Checking for value of actual to equal b
    * [2026-05-12T12:25:26.289] [ERROR] default - expect(received).toEqual(expected) // deep equality
    *
    * Expected: "b"
    * Received: "a"
    * ```
    *
    * ``` gherkin
    * And I verify value is "a" # test/steps/featurePage.ts:42 # Will not raise an error
    * ```
    * */
    async softExpectMessage(assertion: () => void | Promise <void>, message: string){
        try {
            await assertion();
        }catch(error){
            defaultLogger.error(`${message}`)
            defaultLogger.error(`${(error as Error).message}`)
        }
    }
}