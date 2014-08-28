'use strict';
var cssFs = require('../fs.js');

module.exports = function (args) {
    cssFs.getFilesList(args.path, '**/*.css', function (err, filesList) {
        if (err) {
            throw new Error(String(err));
        }
        console.log('filesList', filesList);
    });
};
