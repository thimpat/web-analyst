const {getSessionInfo} = require("./helpers/auth-helpers.cjs");
const {getOptions, setOptions} = require("../lib/utils/options.cjs");
const {PLUGIN_NAME} = require("../constants.cjs");

/**
 * @param req
 * @param res
 * @param session
 * @param loggable
 * @returns {{allowed: boolean}}
 */
const onValidate = async (req, res, {session = null, loggable = null} = {}) =>
{
    try
    {
        if (req.method !== "GET")
        {
            return {allowed: false};
        }

        let pluginOptions = getOptions();
        if (!pluginOptions || !Object.keys(pluginOptions).length)
        {
            const plugins = session.plugins || [];
            const indexPlugin = plugins.findIndex(x => x.name === PLUGIN_NAME);;
            pluginOptions = plugins[indexPlugin];
            setOptions(pluginOptions);
        }
        const {success, message, pathname, code} = await getSessionInfo(req, {pluginOptions, loggable});
        return {allowed: success, message, pathname, code};
    }
    catch (e)
    {
        loggable.error({lid: 1000}, e.message);
    }

    return {allowed: false};
};

module.exports.onValidate = onValidate;

