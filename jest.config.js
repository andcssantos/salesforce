const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    moduleNameMapper: {
        "^@salesforce/apex/(.*)$": "<rootDir>/force-app/main/default/classes/$1"
    },
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver']
};
