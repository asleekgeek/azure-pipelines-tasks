import fs = require('fs');
import assert = require('assert');
import path = require('path');
import { MockTestRunner } from 'azure-pipelines-task-lib/mock-test';

describe('InstallSSHKey Suite', function () {
    this.timeout(parseInt(process.env.TASK_TEST_TIMEOUT) || 20000);
    before(() => {
    });

    after(() => {
    });

    it('Start ssh-agent', async () => {
        this.timeout(1000);

        let testPath: string = path.join(__dirname, 'L0StartAgent.js');
        let testRunner: MockTestRunner = new MockTestRunner(testPath);

        await testRunner.runAsync();

        assert.equal(testRunner.stderr.length, 0, 'should not have written to stderr');
        assert(testRunner.succeeded, 'task should have succeeded');
    });

    it('Start ssh-agent (no public key specified)', async () => {
        this.timeout(1000);

        let testPath: string = path.join(__dirname, 'L0StartAgentWithoutPubKey.js');
        let testRunner: MockTestRunner = new MockTestRunner(testPath);

        await testRunner.runAsync();

        assert.equal(testRunner.stderr.length, 0, 'should not have written to stderr');
        assert(testRunner.succeeded, 'task should have succeeded');
    });

    it('SSH key already installed', async () => {
        this.timeout(1000);

        let testPath: string = path.join(__dirname, 'L0KeyAlreadyInstalled.js');
        let testRunner: MockTestRunner = new MockTestRunner(testPath);

        await testRunner.runAsync();

        assert(testRunner.failed, 'task should have failed');
        assert(testRunner.stdOutContained('loc_mock_SSHKeyAlreadyInstalled'), 'expected error: SSH key already installed');
    });

    it('SSH key already installed (no public key specified)', async () => {
        this.timeout(1000);

        let testPath: string = path.join(__dirname, 'L0KeyAlreadyInstalledWithoutPubKey.js');
        let testRunner: MockTestRunner = new MockTestRunner(testPath);

        await testRunner.runAsync();

        assert(testRunner.failed, 'task should have failed');
        assert(testRunner.stdOutContained('loc_mock_SSHKeyAlreadyInstalled'), 'expected error: SSH key already installed');
    });

    it('SSH key malformed', async () => {
        this.timeout(1000);

        let testPath: string = path.join(__dirname, 'L0KeyMalformed.js');
        let testRunner: MockTestRunner = new MockTestRunner(testPath);

        await testRunner.runAsync();

        assert(testRunner.failed, 'task should have failed');
        assert(testRunner.stdOutContained('loc_mock_SSHPublicKeyMalformed'), 'expected error: SSH key malformed');
    });

    it('SSH key uninstalled from running agent', async () => {
        this.timeout(1000);

        const testPath: string = path.join(__dirname, 'L0RemoveFromAgent.js');
        const testRunner: MockTestRunner = new MockTestRunner(testPath);

        await testRunner.runAsync();

        assert(testRunner.succeeded, 'task should have succeeded');
        assert(testRunner.stdOutContained('removed from running agent'), 'expected message: removed from running agent');
        assert(testRunner.ran('/usr/bin/ssh-add -d keyToRemove'),'ssh should have been uninstalled');
    });
});