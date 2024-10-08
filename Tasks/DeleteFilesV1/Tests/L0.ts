import assert = require('assert');
import path = require('path');
import fs = require('fs');
import * as ttm from 'azure-pipelines-task-lib/mock-test';

const testRoot = path.join(__dirname, 'test_structure');

const removeFolder = function(curPath) {
    if (fs.existsSync(curPath)) {
        fs.readdirSync(curPath).forEach((file, index) => {
        const newPath = path.join(curPath, file);
        if (fs.lstatSync(newPath).isDirectory()) {
            removeFolder(newPath);
        } else {
            fs.unlinkSync(newPath);
        }
        });
        fs.rmdirSync(curPath);
    }
}

describe('DeleteFiles Suite', function () {
    this.timeout(60000);

    before(() => {
        removeFolder(testRoot);
        fs.mkdirSync(testRoot);
    })

    function runValidations(validator: () => void, tr: ttm.MockTestRunner) {
        try {
            validator();
        }
        catch (error) {
            console.log("STDERR", tr.stderr);
            console.log("STDOUT", tr.stdout);
            throw error;
        }
    }

    it('Deletes multiple nested folders', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'nested');
        fs.mkdirSync(root);

        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', 'test.txt'), 'test');
        fs.mkdirSync(path.join(root, 'A', 'A'));
        fs.writeFileSync(path.join(root, 'A', 'A', 'test2.txt'), 'test2');
        fs.writeFileSync(path.join(root, 'A', 'A', 'test3.txt'), 'test3');
        fs.mkdirSync(path.join(root, 'B'));
        fs.writeFileSync(path.join(root, 'B', 'test4.txt'), 'test4');
        fs.mkdirSync(path.join(root, 'C'));
        fs.writeFileSync(path.join(root, 'C', 'dontDelete.txt'), 'dont delete');

        let tp: string = path.join(__dirname, 'L0Nested.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        runValidations(() => {
            assert(!fs.existsSync(path.join(root, 'A')));
            assert(!fs.existsSync(path.join(root, 'B')));
            assert(fs.existsSync(path.join(root, 'C')));
            assert(fs.existsSync(path.join(root, 'C', 'dontDelete.txt')));
        }, tr);
    });

    it('Deletes files with negate pattern', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'negate');
        fs.mkdirSync(root);

        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', 'test1.js'), 'test1');
        fs.writeFileSync(path.join(root, 'A', 'test2.css'), 'test2');

        let tp: string = path.join(__dirname, 'L0Negate.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        runValidations(() => {
            assert(!fs.existsSync(path.join(root, 'A', 'test2.css')));
            assert(fs.existsSync(path.join(root, 'A', 'test1.js')));
        }, tr);
    });

    it('Deletes files starting with a dot', async () => {
        const root = path.join(testRoot, 'removeDotFiles');
        fs.mkdirSync(root);
      
        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', '.txt'), 'test1');
        fs.writeFileSync(path.join(root, 'A', '.sample.txt'), 'test2');
      
        let tp: string = path.join(__dirname, 'L0RemoveDotFiles.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
      
        await tr.runAsync();
      
        runValidations(() => {
            assert(!fs.existsSync(path.join(root, 'A', '.txt')));
            assert(!fs.existsSync(path.join(root, 'A', '.sample.txt')));
        }, tr);
      });

    it('Doesnt delete files starting with a dot', async () => {
        const root = path.join(testRoot, 'DoesntRemoveDotFiles');
        fs.mkdirSync(root);
      
        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', '.txt'), 'test1');
        fs.writeFileSync(path.join(root, 'A', '.sample.txt'), 'test2');
      
        let tp: string = path.join(__dirname, 'L0DoesntRemoveDotFiles.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
      
        await tr.runAsync();
      
        runValidations(() => {
            assert(fs.existsSync(path.join(root, 'A', '.txt')));
            assert(fs.existsSync(path.join(root, 'A', '.sample.txt')));
        }, tr);
      });

    it('Deletes files using braces statement', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'braces');
        fs.mkdirSync(root);

        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', 'one.txt'), 'test1');
        fs.writeFileSync(path.join(root, 'A', 'two.txt'), 'test2');
        fs.writeFileSync(path.join(root, 'A', 'three.txt'), 'test3');
        fs.writeFileSync(path.join(root, 'A', 'four.txt'), 'test4');

        let tp: string = path.join(__dirname, 'L0Braces.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        runValidations(() => {
            assert(!fs.existsSync(path.join(root, 'A', 'one.txt')));
            assert(!fs.existsSync(path.join(root, 'A', 'two.txt')));
            assert(fs.existsSync(path.join(root, 'A', 'three.txt')));
            assert(fs.existsSync(path.join(root, 'A', 'four.txt')));
        }, tr);
    });

    it('Deletes a single file', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'singleFile');
        fs.mkdirSync(root);

        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', 'test.txt'), 'test');
        fs.mkdirSync(path.join(root, 'A', 'A'));
        fs.writeFileSync(path.join(root, 'A', 'A', 'test.txt'), 'test2');
        fs.writeFileSync(path.join(root, 'A', 'A', 'test2.txt'), 'test3');

        let tp: string = path.join(__dirname, 'L0SingleFile.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        runValidations(() => {
            assert(fs.existsSync(path.join(root, 'A')));
            assert(!fs.existsSync(path.join(root, 'A', 'test.txt')));
            assert(fs.existsSync(path.join(root, 'A', 'A')));
            assert(fs.existsSync(path.join(root, 'A', 'A', 'test.txt')));
            assert(fs.existsSync(path.join(root, 'A', 'A', 'test2.txt')));
        }, tr);
    });

    it('Removes the source folder if its empty', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'rmSource');
        fs.mkdirSync(root);

        fs.mkdirSync(path.join(root, 'A'));
        fs.writeFileSync(path.join(root, 'A', 'test.txt'), 'test');
        fs.mkdirSync(path.join(root, 'A', 'A'));
        fs.writeFileSync(path.join(root, 'A', 'A', 'test2.txt'), 'test2');
        fs.writeFileSync(path.join(root, 'A', 'A', 'test3.txt'), 'test3');

        let tp: string = path.join(__dirname, 'L0RmSource.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        runValidations(() => {
            assert(!fs.existsSync(root));
        }, tr);
    });

    it('Doesnt remove folder outside the root', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'insideRoot');
        const outsideRoot = path.join(testRoot, 'outsideRoot');
        fs.mkdirSync(root);
        fs.mkdirSync(outsideRoot);

        fs.writeFileSync(path.join(outsideRoot, 'test.txt'), 'test');

        let tp: string = path.join(__dirname, 'L0OutsideRoot.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        await tr.runAsync();

        runValidations(() => {
            assert(fs.existsSync(path.join(outsideRoot, 'test.txt')));
        }, tr);
    });

    it('Removes folder with locked file', async () => {
        this.timeout(5000);

        const root = path.join(testRoot, 'locked');
        fs.mkdirSync(root);
        fs.mkdirSync(path.join(root, 'A'));
        fs.appendFileSync(path.join(root, 'A', 'test.txt'), 'test');
        var fd = fs.openSync(path.join(root, 'A', 'test.txt'), 'r');

        let tp: string = path.join(__dirname, 'L0Locked.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

        try {
            await tr.runAsync();
        }
        catch (err) {}
        finally {
            fs.closeSync(fd);
        }
        
        runValidations(() => {
            assert(!fs.existsSync(path.join(root, 'A')));
            assert(tr.succeeded);
        }, tr);
    });
});
