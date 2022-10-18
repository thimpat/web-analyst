let session = {};

const setSession = function (sess)
{
    try
    {
        if (!sess)
        {
            return;
        }

        session = JSON.parse(sess) || {};
        return true;
    }
    catch (e)
    {
        console.error({lid: 2635}, e.message);
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
