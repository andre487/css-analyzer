'use strict';
var packageInfo = require('./package-info.js');

module.exports = function () {
    var argParser = buildArgParser();
    console.log(argParser.parseArgs());
};

function buildArgParser() {
    var ArgumentParser = require('argparse').ArgumentParser,
        parser = new ArgumentParser({
            version: packageInfo.version,
            description: packageInfo.description,
            addHelp: true,
            prog: 'bem-csser'
        });
    parser.addArgument(
        ['action'],
        {
            action: 'store',
            choices: ['help'],
            required: true,
            help: 'What to do'
        }
    );
    return parser;
}
