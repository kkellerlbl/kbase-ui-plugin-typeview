/*eslint-env node*/
/*eslint {strict: ['error', 'global']} */
'use strict';

const util = require('util');
const chalk = require('chalk');

// class Test {
//     constructor(name, test, reporter) {
//         this.name = name;
//         this.testFun = test;
//         this.reporter = reporter;
//     }

//     reportTest(name, elapsed, status, failure, exception) {
//         this.reporter.reportTest({
//             name: name,
//             elapsed: elapsed,
//             status: status,
//             failure: failure,
//             exception: exception
//         });

//     }

//     run() {
//         let name = this.name;
//         let fun = this.testFun;
//         let start = new Date().getTime();
//         try {
//             let result = fun();
//             let elapsed = new Date().getTime() - start;

//             if (result === true) {
//                 this.reportTest(name, elapsed, 'passed');
//             } else {
//                 this.reportTest(name, elapsed, 'failed', result);
//             }
//         } catch (ex) {
//             let elapsed = new Date().getTime() - start;
//             this.reportTest(name, elapsed, 'exception', null, ex);
//         }
//     }
// }

// class TestSuite {
//     constructor(name, reporter) {
//         this.name = name;
//         this.reporter = reporter;
//         this.tests = [];
//     }

//     addTest(name, test) {
//         this.tests.push(new Test(name, test, this.reporter));
//     }

//     run() {
//         process.stdout.write(util.format('\n** %s\n', this.name));
//         this.tests.forEach((tester) => {
//             tester.run();
//         });
//     }
// }

function print(message) {
    process.stdout.write(util.format('%s\n', message));
}

const testState = {
    success: Symbol(),
    failure: Symbol(),
    error: Symbol(),
    skipped: Symbol(),
    incomplete: Symbol()
};

class Test {
    constructor({name}) {
        this.name = name;
        this.startedAt;
        this.endedAt;
        this.status = null;
        this.resolution;
    }

    header() {
        process.stdout.write(util.format('test: %s in %d ms\n', this.name, this.endedAt - this.startedAt));
    }

    start() {
        this.status = 'started';
        this.startedAt = new Date().getTime();
    }

    finish() {
        this.status = 'finished';
        this.endedAt = new Date().getTime();
    }

    success() {
        this.finish();
        this.header();
        process.stdout.write(util.format('  %s  \n', chalk.green('ok')));
        this.resolution = testState.success;
    }

    fail(info) {
        this.finish();
        this.header();
        process.stdout.write(util.format('  %s\n', chalk.red('fail')));
        if (info) {
            Object.keys(info).forEach((key) => {
                print('    ' + key + ': ' + info[key]);
            });
        }
        this.resolution = testState.failure;
    }

    error(exception) {
        this.finish();
        this.header();
        process.stdout.write(util.format('ex  : %s : %s\n', this.name, exception.message));
        process.stdout.write(util.inspect(exception, {showHidden: false, depth: null}));
        this.resolution = testState.error;
    }

    skip() {
        this.finish();
        this.header();
        process.stdout.write(util.format('  %s  \n', chalk.blue('skipped')));
        this.resolution = testState.skipped;
    }

    dispose() {
        if (this.status !== 'finished') {
            this.finish();
            this.header();
            process.stdout.write(util.format('  %s  \n', chalk.red('test did not finish')));
            this.resolution = testState.incomplete;
        }
    }
}


class UnitTestRunner {
    constructor({testModules, coverage}) {
        this.testModules = testModules;
        this.coverage = coverage;
        this.resolutions = {
            [testState.success]: 0,
            [testState.failure]: 0,
            [testState.error]: 0,
            [testState.skipped]: 0,
            [testState.incomplete]: 0
        };

    }

    runTestModule(testModule) {
        const testMethodNames = Object.getOwnPropertyNames(testModule);
        const testNames = testMethodNames
            .map((methodName) => {
                const m = /^test(.*)$/.exec(methodName);
                if (m) {
                    return m[1];
                }
            })
            .filter((testName) => {
                return testName;
            });

        testNames.forEach((testName) => {
            const fun = testModule['test' + testName];
            // let funSource = fun.toSource();
            // let generatedCode = this.coverage.instrumenter.instrumentSync(funSource);
            const test = new Test({
                fun: fun,
                name: testName
            });
            try {
                test.start();
                fun(test);
                test.dispose();
            } catch (ex) {
                test.error(ex);
            } finally {
                test.dispose();
                this.resolutions[test.resolution] += 1;
                // let x = this.coverage.instrumenter.lastFileCoverage();
                // console.log('cov', x, global['__coverage__']);
                // this.coverage.collector.add(this.coverage.instrumeber.lastFileCoverage());
                // console.log('about to collect coverage...', test, global['__coverage__']);
                this.coverage.collector.add(global['__coverage__']);
            }
        });

    }

    run() {
        this.testModules.forEach((testModule) => {
            print('about to run test for module:');
            this.runTestModule(testModule);
        });
    }

    report() {
        print('-----');
        print('Testing Report');
        ['success', 'failure', 'error', 'skipped', 'incomplete'].forEach((state) => {
            print('  ' + state + ': ' + this.resolutions[testState[state]]);
        });
    }

    anyFailureType() {
        return ['failure', 'error', 'incomplete'].some((state) => {
            return this.resolutions[testState[state]] > 0;
        });
    }
}

module.exports = {UnitTestRunner};
