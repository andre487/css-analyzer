'use strict';
var packageInfo = require('./package-info.js'),
    cliColor = require('cli-color');


module.exports = function () {
    var argParser = buildArgParser(),
        args = argParser.parseArgs();
    act(args);
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
            choices: ['count-sizes'],
            help: 'What to do'
        }
    );
    parser.addArgument(
        ['-p', '--path'],
        {
            action: 'store',
            required: false,
            defaultValue: process.cwd(),
            help: 'Path for handling (cwd by default). May be a file or a directory'
        }
    );
    return parser;
}


function act(args) {
    var action;
    switch (args.action) {
        case 'count-sizes':
            action = require('./actions/count-sizes.js');
            showPath();
            break;
        default:
            throw new Error('Invalid action: ' + args.action);
    }

    action(args);

    function showPath() {
        console.info(cliColor.magenta('Use path: ' + args.path));
    }
}
