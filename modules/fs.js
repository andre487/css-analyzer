'use strict';
var async = require('async'),
    _ = require('lodash'),
    fs = require('fs'),
    glob = require('glob');


module.exports = {
    getFilesList: getFilesList,
    getFilesContents: getFilesContents,
    globPatternTest: globPatternTest
};


/**
 * Get files with stats by pattern recursive
 * @param {String} path A file or a directory base path
 * @param {String} pattern Glob pattern for files check
 * @param {Function} doneCallback
 */
function getFilesList(path, pattern, doneCallback) {
    var filesList = { length: 0 };
    async.waterfall(
        [
            fs.realpath.bind(null, path),
            function (resolvedPath, callback) {
                fs.lstat(path, function (err, stats) {
                    callback(err, resolvedPath, stats);
                });
            },
            function (resolvedPath, stats, callback) {
                var fileInfo = {
                    path: resolvedPath,
                    stats: stats,
                    isDir: stats.isDirectory(),
                    matchesPattern: globPatternTest(resolvedPath, pattern)
                };
                callback(null, fileInfo);
            },
            function (fileInfo, callback) {
                filesList = _.assign(filesList, fileInfo);
                if (fileInfo.isDir) {
                    getFilesFromDir(callback);
                } else {
                    addOneFile(callback);
                }
            }
        ],
        function (err) {
            if (err) {
                doneCallback(err);
            } else {
                doneCallback(null, filesList);
            }
        }
    );

    function addOneFile(callback) {
        if (filesList.matchesPattern) {
            filesList[0] = {
                path: filesList.path,
                stats: filesList.stats
            };
            filesList.length = 1;
        }
        callback(null);
    }

    function getFilesFromDir(doneCallback) {
        async.waterfall(
            [
                glob.bind(null, filesList.path + '/' + pattern),
                function (files, callback) {
                    async.mapSeries(files, fs.lstat, function (err, stats) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, files, stats);
                        }
                    });
                }
            ],
            function (err, files, stats) {
                if (err) {
                    return doneCallback(err);
                }
                _.forEach(files, function (file, i) {
                    filesList[filesList.length] = {
                        path: file,
                        stats: stats[i]
                    };
                    ++filesList.length;
                });
                doneCallback(null, filesList);
            }
        );
    }
}


/**
 * Check if file name matches the glob pattern
 * @param {String} path
 * @param {String} pattern
 * @returns {boolean}
 */
function globPatternTest(path, pattern) {
    var regexpPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*+/, '.+?'),
        regexp = new RegExp(regexpPattern);
    return regexp.test(path);
}


/**
 * Get files contents
 * @param {Object} filesList Object returned by getFilesList function
 * @param {Function} callback
 */
function getFilesContents(filesList, callback) {
    var handler = function (fileInfo, locCallback) {
        fs.readFile(fileInfo.path, function (err, buffer) {
            if (err) {
                return locCallback(err);
            }
            locCallback(null, [fileInfo.path, buffer.toString()]);
        });
    };
    async.map(filesList, handler, function (err, result) {
        if (err) {
            return callback(err);
        }
        callback(null, _.object(result));
    });
}
