'use strict';
var _ = require('lodash');


module.exports = {
    countAstStat: countAstStat,
    countWhitespaces: countWhitespaces
};


/**
 * Count AST statistics
 * @param {Object} ast AST returned by css.parse
 * @returns {Object} statistics dictionary
 */
function countAstStat(ast) {
    var stat = {
        selectors: 0,
        property_names: 0,
        property_values: 0,
        inline_media: 0,
        all_important: 0,
        comments: 0,
        ignored_nodes: []
    };
    _.forEach(ast.stylesheet.rules, countNode);

    function countNode(node) {
        switch (node.type) {
            case 'rule':
                countThis();
                break;
            case 'media':
                countMedia(node);
                break;
            case 'supports':
                countSupports(node);
                break;
            case 'comment':
                stat.comments += node.comment.length;
                break;
            default:
                stat.ignored_nodes.push(node.type);
        }

        function countThis() {
            // selectors
            _.forEach(node.selectors, function (selector) {
                stat.selectors += selector.length;
            });

            // declarations
            _.forEach(node.declarations, function (declaration) {
                if (declaration.type === 'comment') {
                    stat.comments += declaration.comment.length;
                    return;
                } else if (declaration.type !== 'declaration') {
                    stat.ignored_nodes.push(declaration.type);
                    return;
                }
                stat.property_names += declaration.property.length;
                stat.property_values += declaration.value.length;

                var mediaMatch = declaration.value.match(/url\((data:.+?)\)/i);
                if (mediaMatch) {
                    stat.inline_media += mediaMatch[0].length;
                }
            });
        }
    }

    function countMedia(node) {
        stat.property_names += node.media.length;
        _.forEach(node.rules, countNode);
    }

    function countSupports(node) {
        stat.property_names += node.supports.length;
        _.forEach(node.rules, countNode);
    }

    var notImportantKeys = ['all_important', 'ignored_nodes', 'inline_media'],
        allImportant = _.pick(stat, function (value, key) {
            return !_.contains(notImportantKeys, key);
        });
    _.mapValues(allImportant, function (val) {
        stat.all_important += val;
    });
    stat.ignored_nodes = _.uniq(stat.ignored_nodes);
    return stat;
}


/**
 * Count whitespaces in text content
 * @param {String} content File content
 * @returns {Object}
 */
function countWhitespaces(content) {
    var spaces = [' ', '\t', '\r', '\n'],
        stat = {
            all_whitespaces: 0,
            leading_spaces: 0,
            trailing_spaces: 0
        };

    _.forEach(content, function (ch) {
        if (_.contains(spaces, ch)) {
            ++stat.all_whitespaces;
        }
    });

    var leadingSpacesMatch = content.match(new RegExp('^[' + spaces.join('') + ']+', 'mg')),
        trailingSpacesMatch = content.match(new RegExp('[' + spaces.join('') + ']+$', 'mg'));
    if (leadingSpacesMatch) {
        _.forEach(leadingSpacesMatch, function (match) {
            stat.leading_spaces += match.length;
        });
    }
    if (trailingSpacesMatch) {
        _.forEach(trailingSpacesMatch, function (match) {
            stat.trailing_spaces += match.length;
        });
    }
    return stat;
}
