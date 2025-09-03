const {LIST_DATA_FILES} = require("../../../hybrid/cjs/wa-constants.cjs");
const {writeFileSync} = require("fs");
const {buildIndexer, getRegisteredElements, getDataPath} = require("../../common/common-maps.cjs");

let myMap = null;

/**
 * Create browser map file
 * @returns {boolean}
 */
const buildBehaviorIndexer = () =>
{
    try
    {
        const behaviorLogPath = getDataPath(LIST_DATA_FILES.BEHAVIORS_REF);
        return buildIndexer(behaviorLogPath);
    }
    catch (e)
    {
        console.error({lid: "WA2113"}, e.message);
    }

    return false;
};

const getRegisteredBehaviors = () =>
{
    return getRegisteredElements(LIST_DATA_FILES.BEHAVIORS_REF, myMap);
};

// -----------------------------------------------------------
//
// -----------------------------------------------------------
const isBehaviorRegistered = function (token)
{
    return myMap && myMap[token];
};

function keepMostRecent(data, maxEntries = 1) {
    const sorted = Object.entries(data)
        .sort(([, a], [, b]) => b.time - a.time) // Descending by time
        .slice(0, maxEntries); // Keep only the newest N

    return Object.fromEntries(sorted);
}

const updateBehaviorIndexer = function ({cookieData, clientSideData} = {})
{
    try
    {
        if (!cookieData || !clientSideData) {
            return ;
        }

        const dataPath = getDataPath(LIST_DATA_FILES.BEHAVIORS_REF);
        let registeredEntries = getRegisteredBehaviors();
        const nbEntries = Object.keys(registeredEntries).length;
        if (nbEntries > 0) {
            registeredEntries = keepMostRecent(registeredEntries, 500);
        }
        writeFileSync(dataPath, JSON.stringify(registeredEntries, null, 2), {encoding: "utf8"});

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2989"}, e.message);
    }

    return false;
};

function addToBehaviorIndexer({cookieData, clientSideData, ip} = {})
{
    try
    {
        if (!cookieData || !clientSideData) {
            return ;
        }

        const {token} = cookieData;
        if (!token) {
            return ;
        }

        myMap =  getRegisteredBehaviors();
        const addedBehavior = {
            resolution: clientSideData.resolution,
            time: new Date().getTime(),
            ips: [ip],
            behaviors: [{
                visitedPage: clientSideData.visitedPage,
                durationMs: clientSideData.durationMs,
                viewport: clientSideData.viewport,
                events: clientSideData.events
            }],
        };

        if (!isBehaviorRegistered(token))
        {
            myMap[token] = addedBehavior;
            return true;
        }

        const previousBehavior = myMap[token];
        previousBehavior.behaviors.push(...addedBehavior.behaviors);
        previousBehavior.time = addedBehavior.time;
        if (!previousBehavior.ips.includes(ip)) {
            previousBehavior.ips.push(ip);
        }
        myMap[token] = previousBehavior;

        return true;
    }
    catch (e)
    {
        console.error({lid: "WA2451"}, e.message);
    }

    return false;
}

module.exports.getRegisteredBehaviors = getRegisteredBehaviors;

module.exports.buildBehaviorIndexer = buildBehaviorIndexer;

module.exports.addToBehaviorIndexer = addToBehaviorIndexer;
module.exports.updateBehaviorIndexer = updateBehaviorIndexer;

module.exports.isBrowserRegistered = isBehaviorRegistered;
