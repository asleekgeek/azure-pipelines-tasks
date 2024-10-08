import os = require('os');
import assert = require('assert');
import path = require('path');
import * as ttm from 'azure-pipelines-task-lib/mock-test';

const isWin = os.type().match(/^Win/);

describe('GruntV0 Suite', function () {
    this.timeout(parseInt(process.env.TASK_TEST_TIMEOUT) || 20000);

    before(() => {
        process.env['SYSTEM_DEFAULTWORKINGDIRECTORY'] = '/user/build';
    });

    it('runs a gruntFile through global grunt-cli', async () => {
        const tp = path.join(__dirname, 'L0GruntGlobalGood.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.ran('/usr/local/bin/grunt --gruntfile gruntfile.js'), 'it should have run grunt');
        assert(tr.invokedToolCount == 1, 'should have only run grunt');
        assert(tr.stderr.length == 0, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
    });

    it('runs a gruntFile through local grunt-cli', async () => {
        const tp = path.join(__dirname, 'L0GruntLocalGood.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        if (isWin) {
            assert(
                tr.ran('/usr/local/bin/node c:\\fake\\wd\\node_modules\\grunt-cli\\bin\\grunt --gruntfile gruntfile.js'),
                'it should have run grunt'
            );
        } else {
            assert(
                tr.ran('/usr/local/bin/node /fake/wd/node_modules/grunt-cli/bin/grunt --gruntfile gruntfile.js'),
                'it should have run grunt'
            );
        }
        assert(tr.invokedToolCount == 1, 'should have only run grunt');
        assert(tr.stderr.length == 0, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
    });

    it('runs a gruntFile when code coverage is enabled', async () => {
        const tp = path.join(__dirname, 'L0GruntFileWithCodeCoverage.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.ran('/usr/local/bin/grunt --gruntfile gruntfile.js'), 'it should have run grunt');
        assert(tr.invokedToolCount == 3, 'should have only npm, grunt and istanbul');
        assert(tr.stderr.length == 0, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
    });

    it('runs a gruntFile when publishJUnitTestResults is false', async () => {
        const tp = path.join(__dirname, 'L0publishJUnitTestResultIsFalse.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.ran('/usr/local/bin/grunt --gruntfile gruntfile.js'), 'it should have run grunt');
        assert(tr.invokedToolCount == 1, 'should have only run grunt');
        assert(tr.stderr.length == 0, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
    });

    it('fails if grunt-cli no exist globally and locally', async () => {
        const tp = path.join(__dirname, 'L0GruntNoGruntCli.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.stdOutContained('loc_mock_GruntCliNotInstalled'), 'Should have printed: loc_mock_GruntCliNotInstalled');
        assert(tr.failed, 'task should have failed');
    });

    it('errors if gruntfile not found', async () => {
        const tp = path.join(__dirname, 'L0NoGruntFile.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.stdOutContained('Not found gruntfile.js'), 'Should have printed: Not found gruntfile.js');
        assert(tr.invokedToolCount == 0, 'should exit before running Grunt');
        assert(tr.failed, 'should have failed');
    });

    it('fails if npm fails', async () => {
        const tp = path.join(__dirname, 'L0NpmFails.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.invokedToolCount == 2, 'should have only run npm');
        assert(tr.stdOutContained('loc_mock_NpmFailed'), 'Should have printed: loc_mock_NpmFailed');
        assert(tr.failed, 'task should have failed');
    });

    it('fails if grunt fails', async () => {
        const tp = path.join(__dirname, 'L0GruntFails.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.ran('/usr/local/bin/grunt build test --gruntfile gruntfile.js -v'), 'it should have run grunt');
        assert(tr.invokedToolCount == 1, 'should have only run npm and Grunt');
        // success scripts don't necessarily set a result
        assert(tr.stdOutContained('loc_mock_GruntFailed'), 'Should have printed: loc_mock_GruntFailed');
        assert(tr.failed, 'task should have failed');
    });

    it('fails if istanbul fails', async () => {
        const tp = path.join(__dirname, 'L0IstanbulFails.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.invokedToolCount == 3, 'should have only run npm and Grunt');
        assert(tr.stdOutContained('loc_mock_IstanbulFailed'), 'Should have printed: loc_mock_IstanbulFailed');
        assert(tr.failed, 'task should have failed');
    });

    it('errors if cwd not set', async () => {
        const tp = path.join(__dirname, 'L0CwdNotSet.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.stdOutContained('Input required: cwd'), 'Should have printed: Input required: cwd');
        assert(tr.invokedToolCount == 0, 'should exit before running Grunt');
        assert(tr.failed, 'should have failed');
    });

    it('errors if gruntFile not set', async () => {
        const tp = path.join(__dirname, 'L0GruntFileNotSet.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.stdOutContained('Input required: gruntFile'), 'Should have printed: Input required: gruntFile');
        assert(tr.invokedToolCount == 0, 'should exit before running Grunt');
        assert(tr.failed, 'should have failed');
    });

    it('errors if gruntCli not set', async () => {
        const tp = path.join(__dirname, 'L0GruntCliNotSet.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.stdOutContained('Input required: gruntCli'), 'Should have printed: Input required: gruntCli');
        assert(tr.invokedToolCount == 0, 'should exit before running Grunt');
        assert(tr.failed, 'should have failed');
    });

    it('Fails when test result files input is not provided', async () => {
        const tp = path.join(__dirname, 'L0TestResultFilesNotSet.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.invokedToolCount == 0, 'should exit before running gulp');
        assert(tr.failed, 'task should have failed');
        assert(tr.stdOutContained('Input required: testResultsFiles'), 'Should have printed: Input required: testResultsFiles');
    });

    it('gives warning and runs when test result files input does not match any file', async () => {
        process.env['SYSTEM_DEBUG'] = 'true';
        const tp = path.join(__dirname, 'L0TestResultFilesDoesNotMatchAnyFile.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.ran('/usr/local/bin/grunt --gruntfile gruntfile.js'), 'it should have run grunt');
        assert(tr.invokedToolCount == 1, 'should run completely');
        assert(
            tr.stdout.search('No pattern found in testResultsFiles parameter') >= 0,
            'should give a warning for test file pattern not matched.'
        );
        assert(tr.succeeded, 'task should have succeeded');
    });

    it('Fails when test source files input is not provided for coverage', async () => {
        const tp = path.join(__dirname, 'L0NoTestSourceFiles.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.invokedToolCount == 0, 'should exit before running grunt');
        assert(tr.stdOutContained('Input required: testFiles'), 'Should have printed: Input required: testFiles');
        assert(tr.failed, 'task should have failed');
    });

    it('fails when test source files input does not match any file', async () => {
        const tp = path.join(__dirname, 'L0InvalidTestSource.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.failed, 'task should have failed');
        assert(tr.invokedToolCount == 3, 'should exit while running istanbul');
        assert(tr.stdOutContained('loc_mock_IstanbulFailed'), 'Should have printed: loc_mock_IstanbulFailed');
        assert(tr.failed, 'task should have failed');
    });
});
