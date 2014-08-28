'use strict';
var _ = require('lodash'),
    cliColor = require('cli-color');

module.exports = {
    printStatisticsReport: printStatisticsReport
};


function printStatisticsReport(astStat, whitespacesStat, filesList) {
    var paths = _.chain(_.keys(astStat))
            .union(_.keys(whitespacesStat))
            .uniq()
            .sort()
            .valueOf();

    console.log(cliColor.magenta('CSS statistics'));
    _.forEach(paths, printPathReport);

    function printPathReport(path) {
        console.log(cliColor.blue(path));

        console.log(cliColor.white('File info'));
        var fileInfo = _.pick(filesList, function(value, key) {
            return value.path === path;
        })[0];
        if (fileInfo) {
            var bSize = fileInfo.stats.size,
                kibSize = Math.round(bSize * 1000 / 1024) / 1000;
            console.log('Size:', kibSize, 'KiB', '(' + bSize + ' bytes)');
            console.log('Modification time:', fileInfo.stats.mtime);
            console.log('Change time:', fileInfo.stats.ctime);
            console.log('Access time:', fileInfo.stats.atime);
        }

        console.log(cliColor.white('AST statistics'));
        var astNamesTable = {
            selectors: 'Selectors',
            comments: 'Comments',
            property_names: 'Property names',
            property_values: 'Property values',
            inline_media: 'Inline media (data in urls)',
            all_important: 'All important text',
            ignored_nodes: 'Ignored nodes'
        };
        _.forIn(astNamesTable, function (name, key) {
            if (key === 'ignored_nodes') {
                var nodes = astStat[path][key];
                if (nodes.length) {
                    console.log(name + ': ' + astStat[path][key].toString());
                }
            } else {
                console.log(name + ': ' + astStat[path][key] + ' bytes');
            }
        });

        console.log(cliColor.white('Whitespaces statistics'));
        var spacesNamesTable = {
            leading_spaces: 'Leading spaces',
            trailing_spaces: 'Trailing spaces',
            all_whitespaces: 'All whitespaces'
        };
        _.forIn(spacesNamesTable, function (name, key) {
            console.log(name + ': ' + whitespacesStat[path][key] + ' bytes');
        });
    }
}
