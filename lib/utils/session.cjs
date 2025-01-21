let session = {};

const setSession = function (sess)
{
    try
    {
        if (!sess)
        {
            return;
        }

        if (typeof sess === "string" || sess instanceof String)
        {
            session = JSON.parse(sess) || {};
        }
        else
        {
            session = JSON.parse(JSON.stringify(sess)) || {};
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2635"}, e.message);
    }

    return false;
};

const getSession = function ()
{
    return JSON.parse(JSON.stringify(session));
};

const getSessionProperty = function (name)
{
    return JSON.parse(JSON.stringify(session[name]));
};

module.exports.getSessionProperty = getSessionProperty;
module.exports.getSession = getSession;
module.exports.setSession = setSession;
