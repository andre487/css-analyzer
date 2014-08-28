'use strict';
var cssFs = require('../fs.js'),
    cliColor = require('cli-color'),
    async = require('async');

module.exports = function (args) {
    var filesList, contentsTable;
    async.waterfall(
        [
            function (callback) {
                console.log('Extracting files info');
                cssFs.getFilesList(args.path, '**/*.css', callback);
            },
            function (result, callback) {
                filesList = result;
                console.info(cliColor.white(result.length + ' CSS files found'));
                console.log('Reading files contents');
                cssFs.getFilesContents(filesList, callback);
            },
            function (result, callback) {
                contentsTable = result;
                callback(null);
            }
        ],
        function (err) {
            if (err) {
                throw new Error(typeof(err) + ': ' + err);
            }
            console.log(
                cliColor.green('Flawless victory')
            );
        }
    );
};
