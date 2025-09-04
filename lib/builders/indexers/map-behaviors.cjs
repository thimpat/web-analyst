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

/**
 * Sorts an object by a nested 'time' property and returns the last n selected items.
 * @param {object} data The input object with keys mapping to objects containing a 'time' property.
 * @param {number} n The number of items to return from the end of the sorted list.
 * @returns {Array} An array of the last n selected objects, sorted by time.
 */
function getSortedLastN(data, n = 20) {
    data = {...data};
    for (let k in data) {
        const item = data[k];
        item.id = k;
        delete item.ips;
    }
    // 1. Get the values (the inner objects) from the input object.
    const values = Object.values(data);

    // 2. Sort the values based on the 'time' property in ascending order.
    values.sort((a, b) => a.time - b.time);

    // 3. Use .slice() to return the last n items from the sorted array.
    //    .slice(-n) is a convenient way to get the last n elements.
    return values.slice(-n);
}

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

        // Build behaviorGroup
        myMap =  getRegisteredBehaviors();
        const addedBehaviorGroup = {
            resolution: clientSideData.resolution,
            time: new Date().getTime(),
            ips: [ip],
            // behaviors: [{
            //     // visitedPage: clientSideData.visitedPage,
            //     durationMs: clientSideData.durationMs,
            //     viewport: clientSideData.viewport,
            //     events: []
            // }],
        };

        const behaviors = [];
        let currentVisitedPage = clientSideData.visitedPage;
        for (let i = 0; i < clientSideData.events.length; ++i) {
            const event = clientSideData.events[i];
            let {page/*, type, selector, timestamp, scrollY, coordinates*/} = event;
            page = page || currentVisitedPage;

            if (!behaviors.length) {
                currentVisitedPage = page;
                behaviors.push({
                    visitedPage: page,
                    durationMs: clientSideData.durationMs,
                    viewport: clientSideData.viewport,
                    events: [event]
                });
                continue;
            }

            if (currentVisitedPage !== page) {
                behaviors.push({
                    visitedPage: page,
                    durationMs: clientSideData.durationMs,
                    viewport: clientSideData.viewport,
                    events: [event]
                });

                currentVisitedPage = page;
                continue;
            }

            const lastBehavior = behaviors[behaviors.length - 1];
            lastBehavior.events.push(event);
        }

        addedBehaviorGroup.behaviors = behaviors;

        if (!isBehaviorRegistered(token))
        {
            myMap[token] = addedBehaviorGroup;
            return true;
        }

        const previousBehaviorGroup = myMap[token];
        previousBehaviorGroup.behaviors.push(...addedBehaviorGroup.behaviors);
        previousBehaviorGroup.time = addedBehaviorGroup.time;
        if (!previousBehaviorGroup.ips.includes(ip)) {
            previousBehaviorGroup.ips.push(ip);
        }
        myMap[token] = previousBehaviorGroup;

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
module.exports.getSortedLastN = getSortedLastN;
