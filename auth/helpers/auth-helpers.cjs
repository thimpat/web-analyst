const {generateToken, decodeToken} = require("./token-helpers.cjs");
const {parseCookie} = require("./connection-helpers.cjs");

/**
 * Log client for a duration
 * @param id
 * @param res
 * @param expiration
 * @param loggable
 * @returns {boolean}
 */
const loginSession = function (id, {res, expiration = Date.now() + 3600 * 1000, loggable = null} = {})
{
    try
    {
        const token = generateToken(id, {res, expiration, loggable});
        res.setHeader("Set-Cookie", [`token=${token}; HttpOnly`, `expires=${new Date(expiration)}`]);
        return true;
    }
    catch (e)
    {
        loggable.error({lid: 1231}, e.message);
    }

    return false;
};

const isLogout = function (req)
{
    if (!req)
    {
        return false;
    }

    if (!req.headers)
    {
        return false;
    }

    return !!req.headers.cookie;
};

/**
 * Logout user from the session
 * @param req
 * @param res
 * @param {Loggable} loggable
 * @param errorMessage
 * @returns {*|boolean}
 */
const logoutSession = function (req, res, {loggable = null, errorMessage = ""} = {})
{
    try
    {
        res.setHeader("Set-Cookie", [`token=; HttpOnly`, `maxAge=0`]);
        if (isLogout(req) && errorMessage)
        {
            return res.end(JSON.stringify({success: true, message: errorMessage ?? `User is already logged out`}));
        }

        return true;
    }
    catch (e)
    {
        loggable.error({lid: 1233}, e.message);
    }

    return false;
};

/**
 * Retuns info about session user (not session server i.e. Session)
 * @param req
 * @param session
 * @param loggable
 * @returns {Promise<{success: boolean}|{code: number, success: boolean, message: string, pathname: string}|{code:
 *     number, success: boolean, message: string}>}
 */
const getSessionInfo = async function (req, {pluginOptions = {}, loggable = null} = {})
{
    try
    {
        const userDefinedErors = pluginOptions.errors || {};
        const cookieString = req.headers.cookie;
        if (!cookieString)
        {
            const error = userDefinedErors["401"] || {};
            return {
                success : false,
                message : error.message || "User has not logged in",
                pathname: error.pathname || error.unprocessed || "/login-web-analyst.server.cjs",
                code    : 401
            };
        }

        const result = parseCookie(cookieString);
        const token = result.token || "";
        if (!token)
        {
            const error = userDefinedErors["401"] || {};
            return {
                success : false,
                message : error.message || "User is not logged in",
                pathname: error.pathname || error.unprocessed || "/login-web-analyst.server.cjs",
                code    : 401
            };
        }

        const decrypt = await decodeToken(token, {loggable});
        if (!decrypt)
        {
            const error = userDefinedErors["401"] || {};
            return {
                success : false,
                message : error.message || "User session invalid",
                pathname: error.pathname || error.unprocessed || "/login-web-analyst.server.cjs",
                code    : 401
            };
        }

        // Json token expired
        if (decrypt.exp < Date.now())
        {
            const error = userDefinedErors["401"] || {};
            return {
                success : false,
                message : error.message || "Session has expired",
                pathname: error.pathname || error.unprocessed || "/login-web-analyst.server.cjs",
                code    : 401
            };
        }

        return {success: true};
    }
    catch (e)
    {
        loggable.error({lid: 1235}, e.message);
    }

    return {success: false, message: "Error during session parsing in web-analyst plugin", code: 500};
};

module.exports.getSessionInfo = getSessionInfo;


module.exports.isLogout = isLogout;

module.exports.logoutSession = logoutSession;
module.exports.loginSession = loginSession;
