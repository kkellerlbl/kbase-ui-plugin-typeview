/*eslint-env node*/
/*eslint {strict: ['error', 'global']}*/
'use strict';

const Promise = require('bluebird');
const requirejs = Promise.promisify(require('requirejs'));
const process = require('process');
const util = require('util');
const istanbul = require('istanbul');
const glob = Promise.promisify(require('glob').Glob);
const path = require('path');

// let reporter = require('./reporter');
const test = require('./testRunner');

requirejs.config({
    baseUrl: './instrumented',
    nodeRequire: require
});

function print(message) {
    process.stdout.write(util.format('%s\n', message));
}

glob('*_test.js', {
    cwd: 'src/',
    nodir: true
})
    .then((testFiles) => {
        const modules = testFiles.map((file) => {
            return path.basename(file, '.js');
        });
        return requirejs(modules, function (
            stateTests,
            propsTests
        ) {
            const collector = new istanbul.Collector();
            const reporter = new istanbul.Reporter();
            const instrumenter = new istanbul.Instrumenter();
            const report = istanbul.Report.create('text');

            const testRunner = new test.UnitTestRunner({
                testModules: [propsTests, stateTests],
                coverage: {
                    collector, reporter, instrumenter, report
                }
            });
            testRunner.run();
            testRunner.report();
            report.writeReport(collector);

            if (testRunner.anyFailureType()) {
                print('one or more tests failed, errored, or were incomplete');
                process.exit(1);
            }
            print('all tests finished successfully or were skipped');
            process.exit(0);
        });
    });