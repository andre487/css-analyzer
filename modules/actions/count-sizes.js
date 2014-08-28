'use strict';
var cssFs = require('../fs.js'),
    cliColor = require('cli-color'),
    async = require('async'),
    _ = require('lodash'),
    css = require('css');

module.exports = function (args) {
    var astTable = {},
        filesList,
        contentsTable;
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
                console.log('Parse CSS');
                var handler = function (pair, locCallback) {
                    process.nextTick(function () {
                        astTable[pair[0]] = css.parse(pair[1]);
                        locCallback(null);
                    });
                };
                async.each(_.pairs(contentsTable), handler, callback);
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
