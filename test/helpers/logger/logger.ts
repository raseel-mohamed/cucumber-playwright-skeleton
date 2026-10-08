import { configure, getLogger, Logger } from 'log4js';

configure({
  appenders: {
    console: { type: 'console' },
    file: { type: 'file', filename: 'application.log' }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    app: { appenders: ['file', 'console'], level: 'debug' }
  }
});

export const appLogger: Logger = getLogger('app');
export const defaultLogger: Logger = getLogger(); // Gets the 'default' category