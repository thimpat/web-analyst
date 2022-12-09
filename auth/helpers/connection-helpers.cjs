const url = require("url");

/**
 *
 * @param req
 * @returns {Promise<any>}
 */
const getRequestDataFromPost = async (req) =>
{
    try
    {
        const buffers = [];

        for await (const chunk of req)
        {
            buffers.push(chunk);
        }

        return Buffer.concat(buffers).toString();
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }
};

const getRequestDataFromGet = (req) =>
{
    try
    {
        const urlParts = url.parse(req.url, true);
        return urlParts.query;
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }

    return null;
};

/**
 * Parse cookie from req.headers.cookie
 * @param str
 */
const parseCookie = (str) =>
{
    const data = {};
    const items = str.split(";");
    for (let i = 0; i < items.length; ++i)
    {
        const item = items[i];
        let [key, value] = item.split("=");
        key = key.trim();
        data[key] = value;
    }
    return data;
};

/**
 * Parse form data
 * @param req
 * @returns {Promise<any>}
 */
const parseData = async (req) =>
{
    try
    {
        const buffers = [];

        for await (const chunk of req)
        {
            buffers.push(chunk);
        }

        const data = Buffer.concat(buffers).toString();
        return JSON.parse(data);
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }
};

module.exports.getRequestDataFromPost = getRequestDataFromPost;
module.exports.getRequestDataFromGet = getRequestDataFromGet;

module.exports.parseCookie = parseCookie;
module.exports.parseData = parseData;