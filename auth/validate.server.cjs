const {getSessionInfo} = require("./helpers/auth-helpers.cjs");

/**
 * @param req
 * @param res
 * @param loggable
 * @returns {{allowed: boolean}}
 */
const onValidate = async (req, res, {loggable = null} = {}) =>
{
    try
    {
        if (req.method !== "GET")
        {
            return {allowed: false};
        }

        const {success} = await getSessionInfo(req, {loggable});
        return {allowed: success};
    }
    catch (e)
    {
        loggable.error({lid: 1000}, e.message);
    }

    return {allowed: false};
};

module.exports.onValidate = onValidate;

