
# CIDC-V2-BDDTESTS
BDD tests for CIDC-IODH. Includes both UI and API tests

This BDD project involves cucumber with playwright framework with typescript as the language.

## Installing and setup
Download the project:
```shell
git clone https://github.com/NCI-CIDC/cidc-v2-bddtests
cd cidc-v2-bddtests
```
Please install node js. Ideally the version of node installed should be 23 or above.
Installing the project
```shell
npm install
```
Installing Playwright browsers
```shell
npx playwright install --with-deps
```

## Running tests
Use the scripts found in `package.json` to run your tests. 
To get a list of scripts run

```shell
npm run
```

### Setting up environment variables. 
Setup environment you want to run the test against. 
```shell
export ENV=staging # for staging environment. default is dev-cloudTwo 
```
Setting up password for users. Make sure that the following variables are setup in the environment with the proper values 
for their respective tiers. 
```shell
export CIDC_PASSWORD_ADMIN='substiture with the correct value for the tier'
export CIDC_PASSWORD_NCI_BIOBANK='substiture with the correct value for the tier'
export CIDC_PASSWORD_CIMAC_BIOFX='substiture with the correct value for the tier'
export CIDC_PASSWORD_NETWORK_VIEWER='substiture with the correct value for the tier'
export CIDC_PASSWORD_CIMAC='substiture with the correct value for the tier'
export CIDC_PASSWORD_CIDC_BIOFX='substiture with the correct value for the tier'
export CIDC_PASSWORD_PACT='substiture with the correct value for the tier'
export CIDC_PASSWORD_CLINICAL_TRIAL='substiture with the correct value for the tier'
export AUTH0_DOMAIN='substiture with the correct value for the tier'
export AUTH0_CLIENT_ID='substiture with the correct value for the tier'
export AUTH0_CLIENT_SECRET='substiture with the correct value for the tier'
export AUTH0_PASSWORD='substiture with the correct value for the tier'
export AUTH0_CIMAC_BIOFX_USER_USERNAME='substiture with the correct value for the tier'
export AUTH0_CIDC_BIOFX_USER_USERNAME='substiture with the correct value for the tier'
export AUTH0_NETWORK_USER_USERNAME='substiture with the correct value for the tier'
export AUTH0_NCI_BIOBANK_USER_USERNAME='substiture with the correct value for the tier'
export LOGIN_PASSWORD='substiture with the correct value for the tier'
```

### Examples:


Running locally against dev with a tag eg: (`@speedRun`)
```shell
npm run test:local @speedRun
```
in headless mode 
```shell
npm run test:localHeadless @speedRun
```

Running locally against stage with a tag eg: (`@speedRun`)
```shell
npm run test:localStage @speedRun
```

Run all ui tests in dev
```shell
npm run test:ui_int
```

In case you want to add more options or flags to the run command, you can do so
```shell
npm run test:local @speedRun -- --<flag1> <value1> --<flag2> <value2>
```
⚠️
Do not forget the additional `--` after the initial command

🗒 the default browser is chromium. You can set the browser to on of your choice through changing the `BROWSER` value in `scripts` within `package.json`
The options available are. 
```shell
firefox, chrome and webkit
```

👉 Files used in tests that actually verify the error generated should be marked with the ticket that they are used for. Files that are either good files
OR are not used to verify the error generated must be used without the ticket number. This is to prevent the overwriting of existing files during reuse and maintain consistency of error generated. 

```text
mock_value_mapping.xlsx
```
Is a file that is "good" and will not generate errors
while
```text
mockDemographicsMessy_2762.xlsx 
```
is a file used to generate an error and is used in the test marked with the tag CIDC-2762


