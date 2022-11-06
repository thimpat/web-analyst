const path = require("path");
const fs = require("fs");

const {parseData} = require("./helpers/connection-helpers.cjs");
const {loginSession, logoutSession} = require("./helpers/auth-helpers.cjs");
const {getPluginOptions} = require("./helpers/plugin-helpers.cjs");

let content = null;
let random = null;

// ---------------------------------------------
// Show login page
// ---------------------------------------------
/**
 * Return login page content
 * @returns {string}
 */
const generateHTML = ({loggable}) =>
{
    try
    {
        // Load an HTML template compatible with Handlebars
        // They are not precompiled and therefore not optimised
        const contentPath = path.join(__dirname, "./templates/login.hbs");
        content = fs.readFileSync(contentPath, {encoding: "utf-8"});
        return content;
    }
    catch (e)
    {
        loggable.error(e);
    }
};

/**
 * Show login page
 * @param req
 * @param res
 * @param session
 * @param loggable
 * @returns {null|{data: (*&{random: number|*, today: *}), content: string}}
 */
const showLoginPage = (req, res, {session, loggable = null} = {}) =>
{
    try
    {
        content = content || generateHTML({loggable});

        random = Math.floor(Math.random() * 88888888) + 11111111;

        const today = new Date();
        const data = {
            ...{
                today: today.toLocaleDateString(),
                random
            },
            ...session,
        };

        return {
            content,
            data
        };

    }
    catch (e)
    {
        loggable.error({lid: 6541}, e.message);
    }

    return null;
};

// ---------------------------------------------
// Check login information
// ---------------------------------------------
/**
 *
 * @param req
 * @param res
 * @param loggable
 * @returns {Promise<*>}
 */
const checkRequest = async (req, res, {session, pluginOptions, loggable = console} = {}) =>
{
    try
    {
        const data = await parseData(req);
        if (!data)
        {
            res.end(JSON.stringify({success: false, message: "Information missing in request"}));
            return;
        }

        if (data.random !== "" + random)
        {
            res.end(JSON.stringify({success: false, message: "Incorrect data. Please, reload the page"}));
            return;
        }

        if (!pluginOptions && !pluginOptions.credentials)
        {
            // The developer has not set a credential file
            res.end(JSON.stringify({success: false, message: "Server error. Please, try again later"}));
            return;
        }

        const creds = require(pluginOptions.credentials) || {};

        const currentPassword = creds[data.username]?.password;
        if (!creds.hasOwnProperty(data.username) || data.password !== currentPassword)
        {
            res.end(JSON.stringify({success: false, message: "Login failed"}));
            return;
        }

        let success = loginSession(data.username, {req, res, session, creds});

        let destination, message;
        if (success)
        {
            destination = success ? "/automator.tests/index.html": "";
        }
        else
        {
            message = "Login failed";
        }

        return res.end(JSON.stringify({success, message, destination}));
    }
    catch (e)
    {
        loggable.error({lid: 1000}, e.message);
    }

    return res.end(JSON.stringify({success: false, message: `Processing error`}));
};

/**
 * Not in the same thread as the server.
 * The server sends all requests here but does not wait for it to proceed
 * @param req
 * @param res
 * @param session
 * @param options
 * @param loggable
 * @returns {Promise<{data: *, content: string}|null>}
 */
const onRequest = async (req, res, {session, loggable}) =>
{
    if (req.method === "GET")
    {
        return showLoginPage(req, res, {session});
    }
    else if (req.method === "POST")
    {
        logoutSession(req, res);

        const pluginOptions = getPluginOptions({session, pluginName: "web-analyst", loggable});
        await checkRequest(req, res, {session, pluginOptions, loggable});
        return null;
    }
};

module.exports.onRequest = onRequest;