const {resolvePath, joinPath} = require("@thimpat/libutils");
const {initPatterns} = require("./patterns.cjs");
const {STATS_DIR} = require("../../hybrid/cjs/constants.cjs");

let options = {};

const setOptions = function (opts)
{
    try
    {
        if (opts)
        {
            options = JSON.parse(opts) || {};
        }

        options.outputDir = options.dir ? resolvePath(options.dir) : joinPath(process.cwd(), STATS_DIR);
        initPatterns(options.pages, options.earnings);

        return true;
    }
    catch (e)
    {
        console.error({lid: 2635}, e.message);
    }

    return false;
};

const setOptionProperty = function (name, value)
{
    options[name] = value;
};

const getOptions = function ()
{
    return options;
};

const getOptionProperty = function (name)
{
    return options[name];
};

module.exports.getOptionProperty = getOptionProperty;
module.exports.getOptions = getOptions;

module.exports.setOptions = setOptions;
module.exports.setOptionProperty = setOptionProperty;
