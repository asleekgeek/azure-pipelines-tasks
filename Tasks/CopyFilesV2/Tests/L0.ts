import * as assert from 'assert';
import * as mocktest from 'azure-pipelines-task-lib/mock-test';
import * as os from 'os';
import * as path from 'path';
import mockrun = require('azure-pipelines-task-lib/mock-run');

describe('CopyFiles L0 Suite', function () {
    this.timeout(parseInt(process.env.TASK_TEST_TIMEOUT) || 20000);

    function runValidations(validator: () => void, tr, done) {
        try {
            validator();
            done();
        }
        catch (error) {
            console.log("STDERR", tr.stderr);
            console.log("STDOUT", tr.stdout);
            done(error);
        }
    }

    before(() => { });

    after(() => { });

    it('copy files from srcdir to destdir', (done: Mocha.Done) => {
        this.timeout(1000);

        let tp = path.join(__dirname, 'L0copyAllFiles.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(tp);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir2')}`),
                        'should have mkdirP someOtherDir2');
                    assert(
                        !runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir3')}`),
                        'should not have mkdirP someOtherDir3');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied dir1 file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied dir1 file2');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir2/file1.file')} to ${path.normalize('/destDir/someOtherDir2/file1.file')}`),
                        'should have copied dir2 file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir2/file2.file')} to ${path.normalize('/destDir/someOtherDir2/file2.file')}`),
                        'should have copied dir2 file2');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir2/file3.file')} to ${path.normalize('/destDir/someOtherDir2/file3.file')}`),
                        'should have copied dir2 file3');
                }, runner, done);
            });
    });

    it('copy files from srcdir to destdir with brackets in src path', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0copyAllFilesWithBracketsInSrcPath.js');
        let runner2: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir2')}`),
                        'should have mkdirP someOtherDir2');
                    assert(
                        !runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir3')}`),
                        'should not have mkdirP someOtherDir3');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir [bracket]/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied dir1 file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir [bracket]/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied dir1 file2');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir [bracket]/someOtherDir2/file1.file')} to ${path.normalize('/destDir/someOtherDir2/file1.file')}`),
                        'should have copied dir2 file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir [bracket]/someOtherDir2/file2.file')} to ${path.normalize('/destDir/someOtherDir2/file2.file')}`),
                        'should have copied dir2 file2');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir [bracket]/someOtherDir2/file3.file')} to ${path.normalize('/destDir/someOtherDir2/file3.file')}`),
                        'should have copied dir2 file3');
                }, runner, done);
            });
    });

    it('copy files and subtract based on exclude pattern', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0copySubtractExclude.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        !runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir2')}`),
                        'should not have mkdirP someOtherDir2');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied dir1 file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied dir1 file2');
                    assert(
                        !runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir2/file1.file')} to ${path.normalize('/destDir/someOtherDir2/file1.file')}`),
                        'should not have copied dir2 file1');
                }, runner, done);
            });

    });

    it('fails if Contents not set', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0failsIfContentsNotSet.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(runner.failed, 'should have failed');
                    assert(runner.createdErrorIssue('Error: Input required: Contents'), 'should have created error issue');
                }, runner, done);
            });
    });

    it('fails if SourceFolder not set', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0failsIfSourceFolderNotSet.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(runner.failed, 'should have failed');
                    assert(runner.createdErrorIssue('Error: Input required: SourceFolder'), 'should have created error issue');
                }, runner, done);
            });
    });

    it('fails if TargetFolder not set', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0failsIfTargetFolderNotSet.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(runner.failed, 'should have failed');
                    assert(runner.createdErrorIssue('Error: Input required: TargetFolder'), 'should have created error issue');
                }, runner, done);
            });
    });

    it('fails if SourceFolder not found', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0failsIfSourceFolderNotFound.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(runner.failed, 'should have failed');
                    assert(runner.createdErrorIssue(`Error: Not found ${path.normalize('/srcDir')}`), 'should have created error issue');
                }, runner, done);
            });
    });

    it('fails if target file is a directory', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0failsIfTargetFileIsDir.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(runner.failed, 'should have failed');
                    assert(runner.createdErrorIssue(`Error: loc_mock_TargetIsDir ${path.normalize('/srcDir/someOtherDir/file1.file')} ${path.normalize('/destDir/someOtherDir/file1.file')}`), 'should have created error issue');
                }, runner, done);
            });
    });

    it('skips if exists', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0skipsIfExists.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        !runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should not have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it('overwrites if specified', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0overwritesIfSpecified.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it('preserves timestamp if specified', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0preservesTimestampIfSpecified.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`Calling fs.utimes on ${path.normalize('/destDir')}`),
                        'should have copied timestamp');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it('cleans if specified', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0cleansIfSpecified.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`rmRF ${path.normalize('/destDir/clean-subDir')}`),
                        'should have cleaned destDir/clean-subDir');
                    assert(
                        runner.stdOutContained(`rmRF ${path.normalize('/destDir/clean-file.txt')}`),
                        'should have cleaned destDir/clean-file.txt');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.join('/destDir', 'someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it("skips cleaning when destination folder doesn't exist", (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0cleansIfSpecifiedAndDestDoesntExist.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    // This will fail if stat is called with throwEnoent=true
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        !runner.stdOutContained(`rmRF ${path.normalize('/destDir/clean-subDir')}`),
                        'should have skipped cleaning non-existent directory');
                    assert(
                        !runner.stdOutContained(`rmRF ${path.normalize('/destDir/clean-file.txt')}`),
                        'should have skipped cleaning non-existent directory');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.join('/destDir', 'someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it('cleans if specified and target is file', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0cleansIfSpecifiedAndTargetIsFile.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`rmRF ${path.normalize('/destDir')}`),
                        'should have cleaned destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                        'should have mkdirP destDir');
                    assert(
                        runner.stdOutContained(`creating path: ${path.join('/destDir', 'someOtherDir')}`),
                        'should have mkdirP someOtherDir');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it('roots patterns', (done: Mocha.Done) => {
        this.timeout(1000);

        let testPath = path.join(__dirname, 'L0rootsPatterns.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir2/file2.file')} to ${path.normalize('/destDir/someOtherDir2/file2.file')}`),
                        'should have copied file1');
                }, runner, done);
            });
    });

    it('ignores errors during target folder creation if ignoreMakeDirErrors is true', (done: Mocha.Done) => {
        let testPath = path.join(__dirname, 'L0IgnoresMakeDirError.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.succeeded,
                        'should have succeeded');
                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                        'should have copied file1');

                    assert(
                        runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                        'should have copied file2');
                }, runner, done);
            });
    });

    it('fails if there are errors during target folder creation if ignoreMakeDirErrors is false', (done: Mocha.Done) => {
        let testPath = path.join(__dirname, 'L0FailsIfThereIsMkdirError.js');
        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);
        // runner.run();
        runner.runAsync()
            .then(() => {
                runValidations(() => {
                    assert(
                        runner.failed,
                        'should have failed');
                }, runner, done);
            });
    });

    if (process.platform == 'win32') {
        it('overwrites readonly', (done: Mocha.Done) => {
            this.timeout(1000);

            let testPath = path.join(__dirname, 'L0overwritesReadonly.js');
            let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

            runner.runAsync()
                .then(() => {
                    runValidations(() => {
                        assert(
                            runner.succeeded,
                            'should have succeeded');
                        assert(
                            runner.stdOutContained(`creating path: ${path.normalize('/destDir')}`),
                            'should have mkdirP destDir');
                        assert(
                            runner.stdOutContained(`creating path: ${path.normalize('/destDir/someOtherDir')}`),
                            'should have mkdirP someOtherDir');
                        assert(
                            runner.stdOutContained(`chmodSync ${path.normalize('/destDir/someOtherDir/file1.file')} ${(6 << 6) + (6 << 3) + 6}`), // rw-rw-rw-
                            'should have chmod file1');
                        assert(
                            runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file1.file')} to ${path.normalize('/destDir/someOtherDir/file1.file')}`),
                            'should have copied file1');
                        assert(
                            !runner.stdOutContained(`chmodSync ${path.normalize('/destDir/someOtherDir/file2.file')} ${(6 << 6) + (6 << 3) + 6}`), // rw-rw-rw-
                            'should not have chmod file2');
                        assert(
                            runner.stdOutContained(`copying ${path.normalize('/srcDir/someOtherDir/file2.file')} to ${path.normalize('/destDir/someOtherDir/file2.file')}`),
                            'should have copied file2');
                    }, runner, done);
                });
        });
    }

});
