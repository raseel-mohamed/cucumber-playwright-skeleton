declare global{
    namespace NodeJS {
        interface ENV{
            BROWSER: "chrome" | "firefox" | "webkit" | "api";
            ENV: "into" | "staging" | "prod";
            APP_URL: string;
            API_URL: string;
            HEAD: "true" | "false";
            HEADLESS: "true" | "false";
            TEST_ENV: string;
        }
    }

}

export {}