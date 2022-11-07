const jsonwebtoken = require("jsonwebtoken");

let secretToken = process.env.JWT_SECRET_TOKEN;

/**
 * @returns {*|string}
 */
const getJwtSecretToken = () =>
{
    return secretToken;
};

const setJwtSecretToken = (token) =>
{
    secretToken = token;
};


/**
 *
 * @param id
 * @param {"HS256"|"RS256"|"HS384"|"HS512"|"RS512"|"PS256"|"PS384"|"PS512"|"ES256"|"ES384"|"ES512"|"none"} [algorithm="RS256"]
 * @param expiration
 * @param loggable
 * @returns {string|null}
 */
const generateToken = (id, {algorithm = "HS256", expiration = Date.now() + (60 * 60), loggable = null} = {}) =>
{
    try
    {
        let jwtSecretKey = getJwtSecretToken();
        if (!jwtSecretKey)
        {
            loggable.error({lid: 1001}, `Server error. Could not generate token`);
            return null;
        }

        let data = {
            exp: expiration,
            id
        };

        return jsonwebtoken.sign(data, jwtSecretKey, {algorithm});
    }
    catch (e)
    {
        loggable.error({lid: 1003}, e.message);
    }

    return null;
};


/**
 * @see https://stackoverflow.com/questions/61665881/how-can-we-store-jwt-token-in-http-only-cookies
 * @returns {Promise<*>}
 * @param token
 * @param algorithm
 * @param loggable
 */
const decodeToken = async (token, {algorithm = "HS256", loggable = null} = {}) =>
{
    try
    {
        const jwtSecret = getJwtSecretToken();
        return await jsonwebtoken.verify(token, jwtSecret, {algorithm});
    }
    catch (err)
    {
        loggable.error(err);
    }

    return null;
};

module.exports.getJwtSecretToken = getJwtSecretToken;
module.exports.setJwtSecretToken = setJwtSecretToken;

module.exports.generateToken = generateToken;
module.exports.decodeToken = decodeToken;
