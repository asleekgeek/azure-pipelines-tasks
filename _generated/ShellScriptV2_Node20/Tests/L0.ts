
// npm install mocha --save-dev
// typings install dt~mocha --save --global

import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('ShellScript L0 Suite', function () {
    this.timeout(parseInt(process.env.TASK_TEST_TIMEOUT) || 200000);

    it('runs shellscript in cwd', async () => {
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0runsInCwd.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert(tr.ran('/usr/local/bin/bash /script.sh arg1 arg2'), 'it should have run ShellScript');
        assert(tr.invokedToolCount == 1, 'should have only run ShellScript');
        assert(tr.stdout.indexOf('bash output here') >= 0, "bash stdout");
        assert(tr.stderr.length == 0, 'should not have written to stderr');
        assert(tr.succeeded, 'task should have succeeded');
    });

    it('fails if script returns 1', async () => {
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0failIfReturns1.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert(tr.ran('/usr/local/bin/bash /script.sh arg1 arg2'), 'it should have run ShellScript');
        assert(tr.invokedToolCount == 1, 'should have only run ShellScript');

        assert(tr.stdOutContained('loc_mock_BashFailed 1'), 'should have said: loc_mock_BashFailed 1');
        // failOnStdErr not set
        assert(!tr.stderr, 'should not have written to stderr');
        assert(tr.failed, 'task should have failed');
    })

    it('fails if failOnStdErr and script writes to stderr', async () => {
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0failIfStdErr.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert(tr.ran('/usr/local/bin/bash /script.sh arg1 arg2'), 'it should have run ShellScript');
        assert(tr.invokedToolCount == 1, 'should have only run ShellScript');
        // failOnStdErr true
        assert(tr.stderr.length > 0, 'should have written to stderr');
        assert(tr.failed, 'task should have failed');
    })

    it('fails if cwd not set', async () => {
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0failNoCwd.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.invokedToolCount == 0, 'should not have run ShellScript');
        assert(tr.failed, 'task should have failed');
    })

    it('fails if script not found', async () => {
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0failIfScriptNotFound.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        assert(tr.invokedToolCount == 0, 'should not have run ShellScript');
        assert(tr.failed, 'task should have failed');
        assert(tr.stdOutContained('Not found /notexistscript.sh'));
    })
});
