'use strict';
var cssFs = require('../fs.js'),
    cliColor = require('cli-color'),
    async = require('async'),
    _ = require('lodash'),
    css = require('css'),
    metrics = require('../metrics.js'),
    report = require('../report.js');


module.exports = function (args) {
    var astTable = {},
        astStatistics = {},
        whitespacesStatistics = {},
        filesList,
        contentsTable;

    async.waterfall(
        [
            function (callback) {
                console.log('Extracting files info');
                cssFs.getFilesList(args.path, '**/*.css', callback);
            },
            function (result, callback) {
                console.info(cliColor.white(result.length + ' CSS files found'));
                console.log('Reading files contents');
                filesList = result;
                cssFs.getFilesContents(filesList, callback);
            },
            function (result, callback) {
                console.log('Parse CSS');
                contentsTable = result;
                _.forIn(contentsTable, function (cssContent, path) {
                    astTable[path] = css.parse(cssContent);
                });
                callback(null);
            },
            function (callback) {
                console.log('Counting statistics');
                _.forIn(astTable, function (ast, path) {
                    astStatistics[path] = metrics.countAstStat(ast);
                });
                _.forIn(contentsTable, function (content, path) {
                    whitespacesStatistics[path] = metrics.countWhitespaces(content);
                });
                callback(null);
            }
        ],
        function (err) {
            if (err) {
                throw new Error(typeof(err) + ': ' + err);
            }

            report.printStatisticsReport(
                astStatistics,
                whitespacesStatistics,
                filesList
            );

            console.log(
                cliColor.green('Flawless victory')
            );
        }
    );
};
