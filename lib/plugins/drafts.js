var _ = require("lodash");

/**
 * @param config
 * @param item
 */
function filterDrafts(item, config) {

    var front = item.front || {};
    var paths = item.paths || {};

    // never allow _ at beginning.
    if (paths.baseName.match(/^_/)) {
        return false;
    }

    // Never allow posts from the drafts folder
    if (item.key.match(/^drafts/)) {
        return false;
    }

    if (!_.isUndefined(front.published)) {
        return front.published
            ? item
            : false;
    }

    return item;
}

module.exports = filterDrafts;