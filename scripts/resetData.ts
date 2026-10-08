import axios from "axios"
import Auth0 from "../test/helpers/utils/auth0";
import CsmsHelpers from "../test/helpers/customHelpers/csmsHelpers";
import {defaultLogger} from "../test/helpers/logger/logger.js";
import {getEnv} from "../test/helpers/env/env";

defaultLogger.info("Setting up data for the environment");
getEnv();
defaultLogger.info("Removing samples from CSMS in preparation for testing")
let csmsSampleList = [
    'CEY9L71E3.01',
    'CEY9PEDX0.01',
    'CEY9K119X.01',
    'CEY94X2HI.01',
    'CEY9C0VUH.01',
    'COBP3UEUH.01',
    'COBPSK4TS.01',
    'COBPKIRTS.01',
    'COBP43GTS.01',
    'COBPW6DVR.01',
    'COBPJYCHA.01',
    'COBPDYVBN.01',
    'COBPTOW4P.01',
    'COBP5DNON.01',
    'COBPZR4E3.01',
    'COBP666X0.01',
    'COBPIDHHI.01',
    'COBP44I9X.01',
    'COBPD84UH.01',
    'COBPD84GN.01',
    'COBPIDHXH.01',
    'COBP44I0Z.01',
    'COBPZR4MM.01',
    'COBP666KI.01',
    'COBPCEL7G.01'
]

defaultLogger.info("Retrieving OKTA token");
let auth  = new Auth0();
// let data = await auth.readTokensFromFile();
// for (let [key, value] of Object.entries(data)) {
//     process.env[key] = value as string;
// }



