import {expect, Locator, Page} from "@playwright/test"

export default class Assert {
    constructor(private page: Page) {}

    async assertVisible(selector: string) {
        const element = this.page.locator(selector);
        await expect(element).toBeVisible({timeout: 60000})
    }

    async assertText(selector: string, messageString: string) {
        const element = this.page.locator(selector);
        expect(await element.textContent({timeout: 60000})).toEqual(messageString);
    }

    async assertEnabled(selector: Locator, enabled: string) {
        if (enabled === 'enabled')
            await expect(selector).toBeEnabled({timeout: 60000})
        else
            await expect(selector).toBeDisabled({timeout: 60000})
    }

}
