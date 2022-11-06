const jsonwebtoken = require("jsonwebtoken");

const getJwtSecretToken = () =>
{
    return process.env.JWT_SECRET_TOKEN;
};

/**
 *
 * @param id
 * @param {"HS256"|"RS256"|"HS384"|"HS512"|"RS512"|"PS256"|"PS384"|"PS512"|"ES256"|"ES384"|"ES512"|"none"} [algorithm="RS256"]
 * @param expiration
 * @returns {string}
 */
const generateToken = (id, {algorithm = "HS256", expiration = Date.now() + (60 * 60)} = {}) =>
{
    try
    {
        let jwtSecretKey = getJwtSecretToken();
        let data = {
            exp: expiration,
            id
        };

        return jsonwebtoken.sign(data, jwtSecretKey, {algorithm});
    }
    catch (e)
    {
        console.error({lid: 1000}, e.message);
    }

    return null;
};


/**
 * @see https://stackoverflow.com/questions/61665881/how-can-we-store-jwt-token-in-http-only-cookies
 * @returns {Promise<*>}
 * @param token
 * @param algorithm
 */
const decodeToken = async (token, {algorithm = "HS256"} = {}) =>
{
    try
    {
        const jwtSecret = getJwtSecretToken();
        return await jsonwebtoken.verify(token, jwtSecret, {algorithm});
    }
    catch (err)
    {
        console.error(e);
    }

    return null;
};

module.exports.getJwtSecretToken = getJwtSecretToken;
module.exports.generateToken = generateToken;
module.exports.decodeToken = decodeToken;
