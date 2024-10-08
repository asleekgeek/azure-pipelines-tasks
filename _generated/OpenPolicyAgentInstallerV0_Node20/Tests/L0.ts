import fs = require('fs');
import assert = require('assert');
import path = require('path');
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('OpenPolicyAgentInstallerV0 Suite', function () {
    it('Task should have succeeded with no issues', async () => {
        const tp: string = path.join(__dirname, 'L0ValidRunShouldSucceed.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 0);
        assert.strictEqual(tr.stderr.length, 0);
        assert(tr.stdOutContained('VerifyOpaInstallation'));
        assert(tr.succeeded, 'task should have succeeded');
    }).timeout(20000);

    it('Invalid semver versino should fail', async () => {
        const tp: string = path.join(__dirname, 'L0InvalidSemVerVersionShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('NotAValidSemverVersion'));
        assert(tr.failed, 'task should have fail');
    });

    it('Download OPA from location should fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadOpaFromLocationShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('DownloadOpaFailedFromLocation'));
        assert(tr.failed, 'task should have fail');
    });

    it('getStableOpaVersion should log "OpaLatestNotKnown" exception and fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadOpaFromLocationShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('OpaLatestNotKnown'));
        assert(tr.failed, 'task should have fail');
    });

    it('Download stable OPA version for Windows should fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadOpaForWindowsShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('https://github.com/open-policy-agent/opa/releases/download/v0.13.5/opa_windows_amd64.exe'));
        assert(tr.stdOutContained('DownloadOpaFailedFromLocation'));
        assert(tr.failed, 'task should have fail');
    });

    it('Download stable OPA version for Linux should fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadOpaForLinuxShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('https://github.com/open-policy-agent/opa/releases/download/v0.13.5/opa_linux_amd64'));
        assert(tr.stdOutContained('DownloadOpaFailedFromLocation'));
        assert(tr.failed, 'task should have fail');
    });

    it('Download stable OPA version for MacOS should fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadOpaForMacOsShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('https://github.com/open-policy-agent/opa/releases/download/v0.13.5/opa_darwin_amd64'));
        assert(tr.stdOutContained('DownloadOpaFailedFromLocation'));
        assert(tr.failed, 'task should have fail');
    });

    it('Download stable OPA version for unknown OS type should fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadOpaForUnknownOsTypeShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('Unknown OS type'));
        assert(tr.failed, 'task should have fail');
    });

    it('Download specific OPA version should fail', async () => {
        const tp: string = path.join(__dirname, 'L0DownloadSpecificOpaVersionShouldFail.js');
        const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();
        assert.strictEqual(tr.errorIssues.length, 1);
        assert(tr.stdOutContained('https://github.com/open-policy-agent/opa/releases/download/v1.0.0'));
        assert(tr.failed, 'task should have fail');
    });
});