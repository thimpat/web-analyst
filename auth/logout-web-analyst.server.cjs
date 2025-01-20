const {logoutSession} = require("./helpers/auth-helpers.cjs");

const checkRequest = async (req, res, {loggable = null} = {}) =>
{
    try
    {
        logoutSession(req, res, {loggable});

        res.writeHead(302, {Location: "/login-web-analyst.server.cjs"});
        return res.end(JSON.stringify({success: true, message: `User logout successfully`}));
    }
    catch (e)
    {
        console.error({lid: "WA2305"}, e.message);
    }

    return res.end(JSON.stringify({success: false, message: `Processing error`}));
};

const onRequest = async (req, res, {loggable = null} = {}) =>
{
    try
    {
        await checkRequest(req, res, {loggable});

        return null;
    }
    catch (e)
    {
        console.error({lid: "WA2307"}, e.message);
    }

    return {
        content: {error: "Could not proceed"}, mime: "application/json"
    };
};

module.exports.onRequest = onRequest;