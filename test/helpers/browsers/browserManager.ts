import { chromium, firefox, LaunchOptions, webkit } from "@playwright/test";

const headless = process.env.HEADLESS === "true";
const options: LaunchOptions = {
    headless: headless,
}

export const invokeBrowser = ()=>{
    const browserType = process.env.BROWSER;
    switch(browserType){
        case "chrome":
            process.env.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
            return chromium.launch(options);

        case "firefox":
            process.env.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0"
            return firefox.launch(options);

        case "webkit":
            process.env.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15"
            return webkit.launch(options);

        case "api":
            process.env.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
            return chromium.launch(options);

        default:
            throw new Error("Please set the proper browser!")
    }
}