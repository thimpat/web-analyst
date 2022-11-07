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
const loginSession = function (id, {res, expiration = Date.now() + 3600 * 1000, loggable = console} = {})
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

const getSessionInfo = async function (req, {loggable = null} = {})
{
    try
    {
        const cookieString = req.headers.cookie;
        if (!cookieString)
        {
            return {success: false, message: "User has not logged in"};
        }

        const result = parseCookie(cookieString);
        const token = result.token || "";
        if (!token)
        {
            return {success: false, message: "User is not logged in"};
        }

        const decrypt = await decodeToken(token, {loggable});
        if (!decrypt)
        {
            return {success: false, message: "User session invalid"};
        }

        // Json token expired
        if (decrypt.exp < Date.now())
        {
            return {success: false, message: "Session has expired"};
        }

        return {success: true};
    }
    catch (e)
    {
        loggable.error({lid: 1235}, e.message);
    }

    return {success: false, message: "Error during session parsing"};
};

module.exports.getSessionInfo = getSessionInfo;


module.exports.isLogout = isLogout;

module.exports.logoutSession = logoutSession;
module.exports.loginSession = loginSession;
