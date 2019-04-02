/*eslint-env node*/
const chalk = require('chalk');
const util = require('util');

// class SuiteStart {
//     constructor({name, fullname, tests, childSuites, testCounts}) {
//         this.name = name;
//         this.fullname = fullname;
//         this.tests = tests;
//         this.childSuites = childSuites;
//         this.testCounts = testCounts;
//     }
// }

// class SuiteEnd extends SuiteStart {
//     constructor(arg) {
//         super(arg);
//         const {status, testCounts, runtime} = arg;
//         this.status = status;
//         this.testCounts = testCounts;
//         this.runtime = runtime;
//     }
// }

// class TestStart {
//     constructor({name, suiteName, fullName}) {
//         this.name = name;
//         this.suiteName = suiteName;
//         this.fullName = fullName;
//     }
// }

// class TestEnd extends TestStart {
//     constructor(arg) {
//         super(arg);
//         const {status, runtime, errors, assertions} = arg;
//         this.status = status;
//         this.runtime = runtime;
//         this.errors = errors;
//         this.assertions = assertions;
//     }
// }



class Reporter {
    constructor() {

    }

    suiteStart() {

    }

    reportTest(report) {
        process.stdout.write(util.format('test: %s in %d ms\n', report.name, report.elapsed));
        switch (report.status) {
        case 'passed':
            process.stdout.write(util.format('  %s  \n', chalk.green('ok')));
            break;
        case 'failed':
            process.stdout.write(util.format('fail: %s : %s\n', report.name, report.failure));
            break;
        case 'exception':
            process.stdout.write(util.format('ex  : %s : %s\n', report.name, report.exception.message));
            break;
        case 'skipped':
            process.stdout.write(util.format('skip: %s\n', report.name));
            break;
        case 'todo':
            process.stdout.write(util.format('todo: %s\n', report.name));
            break;
        }
    }
}

module.exports = {Reporter};