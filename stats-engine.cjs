/**
 * Created by thimpat on 06/11/2015.
 */

const {existsSync, createReadStream, createWriteStream} = require("fs");
const pathEngine = require("path");
const jsonEngine = require("jsonfile");
const UAParser = require("ua-parser-js");

let
    ipVisitors,
    routeVisitors,
    browserVisitors,
    osVisitors,
    keywordsVisitors,
    langVisitors,
    lastDayIndex,
    lastWeekIndex,
    lastMonthIndex,
    parser,
    colours,
    highlight,
    nColours,
    defaultOptions,
    processTimerTxt,
    saveData,
    data2Convert,
    dataForCharts,
    dirty,
    debugMode,
    testMode,
    maxPopular,
    resetDatafile1,
    resetDatafile2,
    words,
    sentence;


processTimerTxt = "Analyst generation";
dirty = true;

maxPopular = 8;

resetDatafile1 = pathEngine.join(__dirname, "/data/reset/data-visitors-to-convert.json");
resetDatafile2 = pathEngine.join(__dirname, "/data/reset/data-for-charts.json");

// Testing mode only
sentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" +
    " incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis " +
    " exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure" +
    " dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." +
    " Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt" +
    " mollit anim id est laborum";
words = sentence.split(" ");

parser = new UAParser();


jsonEngine.spaces = 4;
ipVisitors = {};

defaultOptions = {
    ignoreIPs       : [],
    ignoreRoutes    : [],
    ignoreExtensions: [],
    dataDir         : __dirname,
    route           : "stats",
    testMode        : false,
    debugMode       : false
};

routeVisitors = {};
browserVisitors = {};
osVisitors = {};
keywordsVisitors = {};
langVisitors = {};
colours = ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"];
highlight = ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"];
nColours = colours.length;


class StatsEngine
{
    constructor()
    {
        testMode = this.userOptions.testMode;
        debugMode = this.userOptions.debugMode;

        lastDayIndex = this.getIndexDay();
        lastWeekIndex = this.getIndexWeek();

        if (!existsSync(this.userOptions.datafile1))
        {
            createReadStream(resetDatafile1).pipe(createWriteStream(this.userOptions.datafile1));
        }

        if (!existsSync(this.userOptions.datafile2))
        {
            createReadStream(resetDatafile2).pipe(createWriteStream(this.userOptions.datafile2));
        }

        // Start gathering information
        this.startDataAnalyser(
            this.userOptions.datafile1,
            this.userOptions.datafile2,
            this.userOptions.frequency
        );
    }

    /**
     * Initialize data
     */
    startDataAnalyser(dataVisitorsToConvertPath, dataForChartsPath, frequency)
    {
        frequency = frequency || 10000;

        // Load data from data file 1: /data/data-visitors-to-convert.json
        jsonEngine.readFile(dataVisitorsToConvertPath, {}, function (err, dataGroup1)
        {
            if (err)
            {
                console.error("Cannot read data file =>", dataVisitorsToConvertPath);
                return;
            }

            data2Convert = dataGroup1;

            // Load data from data file 2: /data/data-for-charts.json
            jsonEngine.readFile(dataForChartsPath, {}, function (err, dataGroup2)
            {
                if (err)
                {
                    console.error("Cannot read data for charts =>", dataForChartsPath);
                    return;
                }

                dataForCharts = dataGroup2;

                // Save data to file
                saveData = function ()
                {
                    if (dirty)
                    {
                        // Update visitors file: data/data-visitors-to-convert.json
                        jsonEngine.writeFile(dataVisitorsToConvertPath, data2Convert, function (err)
                        {
                            if (err)
                            {
                                console.error(err);
                                return;
                            }

                            // Update stats file: data/data-for-charts.json
                            jsonEngine.writeFile(dataForChartsPath, dataForCharts, function (err)
                            {
                                if (err)
                                {
                                    console.error(err);
                                    return;
                                }

                                if (debugMode)
                                {
                                    console.log("data saved");
                                }
                            });
                        });
                    }

                    setTimeout(function ()
                    {
                        saveData();
                        dirty = false;
                    }, frequency);
                };

                saveData();

            });

        });

    };

    getIndexDay()
    {
        let d, n;
        d = new Date();
        n = d.getDay() - 1;
        if (n <= -1)
        {
            n = 6;
        }
        return n;
    }

    /**
     * Get week number in the year.
     * @param  {Integer} [weekStart=0]  consFirst day of the week. 0-based. 0 for Sunday, 6 for Saturday.
     * @return {Integer}                0-based number of week.
     *
     * http://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
     */
    getIndexWeek()
    {
        let weekStart, januaryFirst, now;
        weekStart = 1;
        now = new Date();
        januaryFirst = new Date(now.getFullYear(), 0, 1);
        if (weekStart !== undefined && (typeof weekStart !== "number" || weekStart % 1 !== 0 || weekStart < 0 || weekStart > 6))
        {
            throw new Error("Wrong argument. Must be an integer between 0 and 6.");
        }
        weekStart = weekStart || 0;
        return Math.floor((((now - januaryFirst) / 86400000) + januaryFirst.getDay() - weekStart) / 7);
    }

    getIndexMonth()
    {
        let d, n;
        d = new Date();
        n = d.getMonth();
        return n;
    }

    /**
     * Create object by keeping n max values of an another object
     * @param n
     * @param obj
     */
    getMaxValues(n, obj)
    {
        let vArr,
            key,
            minAllowed,
            keyForMinAllowed,
            vArrFulfilled,
            kk;

        vArr = {};
        minAllowed = null;

        for (key in obj)
        {
            // Initialize min and max
            if (minAllowed === null)
            {
                minAllowed = obj[key];
                keyForMinAllowed = key;
                vArr[key] = obj[key];
                continue;
            }

            vArrFulfilled = Object.keys(vArr).length >= n;

            // Get min and max in uncompleted vArr
            if (!vArrFulfilled)
            {
                if (minAllowed > obj[key])
                {
                    minAllowed = obj[key];
                    keyForMinAllowed = key;
                }

                vArr[key] = obj[key];
                continue;
            }

            // New max in
            if (minAllowed < obj[key])
            {
                delete vArr[keyForMinAllowed];
                vArr[key] = obj[key];

                minAllowed = null;
                keyForMinAllowed = null;

                for (kk in vArr)
                {
                    if (minAllowed === null)
                    {
                        minAllowed = vArr[kk];
                        keyForMinAllowed = kk;
                        continue;
                    }

                    if (minAllowed > vArr[kk])
                    {
                        minAllowed = vArr[kk];
                        keyForMinAllowed = kk;
                    }
                }

            }

        }

        return vArr;
    }

    setOptions(opt)
    {
        opt = opt || {};
        this.userOptions = Object.assign({}, defaultOptions, opt);

        this.userOptions.datafile1 = pathEngine.join(this.userOptions.dataDir, "/web-analys1.json");
        this.userOptions.datafile2 = pathEngine.join(this.userOptions.dataDir, "/web-analys2.json");
    };

    getOptions()
    {
        return this.userOptions;
    }

    getUsers()
    {
        let users;
        users = this.userOptions.users || [];
        return users;
    }

    getDatafile()
    {
        return this.userOptions.datafile2;
    }

    storeReferrer(referrer, host)
    {
        if (!referrer)
        {
            return;
        }

        if (host)
        {
            if (referrer.indexOf(host) > -1)
            {
                return;
            }
        }

        data2Convert.referers = data2Convert.referers || {};

        if (!data2Convert.referers[referrer])
        {
            data2Convert.referers[referrer] = 1;
        }
        else
        {
            ++data2Convert.referers[referrer];
        }

        if (debugMode)
        {
            console.log("hostname is:", host);
            console.log("referer detected:", referrer);
        }
    }

    getOtherDatafile()
    {
        return this.userOptions.datafile1;
    }

    clearWeekChart()
    {
        let i, n, weekData;
        weekData = dataForCharts.weekVisitors.datasets[0].data;
        n = weekData.length;
        for (i = 0; i < n; ++i)
        {
            weekData[i] = 0;
        }
    }

    newDay()
    {
        // Future implementation
    }

    newWeek(visitorsInfoData)
    {
        this.clearWeekChart();
        visitorsInfoData.ips = {};
    }

    newMonth()
    {
        // Future implementation
    }

    /**
     *
     * @param keyName
     * @param data
     */
    popularityChart(keyName, data)
    {
        let c,
            vArr,
            key,
            item,
            t,
            k,
            totalOther;

        vArr = {};
        totalOther = 0;

        // Display only the n biggest values
        t = Object.keys(data).length;
        if (t >= maxPopular)
        {
            vArr = getMaxValues(maxPopular, data);

            for (k in data)
            {
                if (!vArr[k])
                {
                    totalOther += data[k];
                }
            }

            vArr.others = totalOther;
            data = vArr;
        }

        c = 0;
        dataForCharts[keyName] = [];
        for (key in data)
        {
            item = {};
            item.color = colours[c % nColours];
            item.highlight = highlight[c % nColours];
            item.label = key;
            item.value = data[key];
            dataForCharts[keyName][c] = item;
            ++c;
        }
    }

    updateWeekChart()
    {
        let indexLabel, data;
        indexLabel = getIndexDay();

        data = dataForCharts.weekVisitors.datasets[0].data;
        ++data[indexLabel];
    }

    updateYearChart()
    {
        let indexLabel, data;
        indexLabel = getIndexMonth();

        data = dataForCharts.yearVisitors.datasets[0].data;
        ++data[indexLabel];
    }

    updateProgressVisitors()
    {
        let currentMonthIndex;
        currentMonthIndex = getIndexMonth();
        dataForCharts.progressVisitors.datasets[0].data =
            dataForCharts.yearVisitors.datasets[0].data.slice(0, currentMonthIndex + 1);
    }

    updateBrowserPopularityChart()
    {
        this.popularityChart("browserPopularity", browserVisitors);
    }

    updateOSPopularityChart()
    {
        this.popularityChart("osPopularity", osVisitors);
    }

    updateLangPopularityChart()
    {
        this.popularityChart("langPopularity", langVisitors);
    }

    updateTopRoutes()
    {
        this.popularityChart("topRoutes", routeVisitors);
    }

    updateDataForCharts(dataVisitor)
    {
        let indexDay,
            indexWeek,
            indexMonth,
            itsaNewMonth,
            itsaNewDay,
            itsaNewWeek,
            ipVisitor;

        ipVisitor = dataVisitor.ip;

        // New day?
        indexDay = getIndexDay();
        if (lastDayIndex !== indexDay)
        {
            lastDayIndex = indexDay;
            itsaNewDay = true;
        }

        // New week?
        indexWeek = getIndexWeek();
        if (indexWeek !== lastWeekIndex)
        {
            if (debugMode)
            {
                console.log("-----------------------------------------------------");
                console.log("New week detected");
                console.log("-----------------------------------------------------");
            }
            lastWeekIndex = indexWeek;
            itsaNewWeek = true;
        }

        // New month?
        indexMonth = getIndexMonth();
        if (lastMonthIndex !== indexMonth)
        {
            lastMonthIndex = indexMonth;
            itsaNewMonth = true;
        }

        if (itsaNewDay)
        {
            this.newDay(dataForCharts);
        }

        if (itsaNewWeek)
        {
            this.newWeek(dataForCharts);
        }

        if (itsaNewMonth)
        {
            this.newMonth();
        }

        if (ipVisitors[ipVisitor] <= 1)
        {
            this.updateWeekChart();
            this.updateYearChart();
            this.updateProgressVisitors();
            this.updateBrowserPopularityChart();
            this.updateOSPopularityChart();
            this.updateLangPopularityChart();
        }
        this.updateTopRoutes();
    }

    generateRandom()
    {
        let randWord;
        randWord = words[Math.floor(Math.random() * words.length)];
        return randWord;
    }

    updateData2Convert(dataVisitor)
    {
        let sameVisitor,
            browserName,
            referrer,
            osName,
            uaInfo,
            ipVisitor,
            routeVisitor,
            userAgent,
            langInfo,
            k,
            keyword,
            host;

        dirty = true;

        ipVisitor = dataVisitor.ip;

        // Generate fake IP in test mode
        if (testMode)
        {
            dataVisitor.ip =
                ipVisitor =
                    Math.floor(Math.random() * 256) + "." +
                    Math.floor(Math.random() * 256) + "." +
                    Math.floor(Math.random() * 256) + "." +
                    Math.floor(Math.random() * 256);

            dataVisitor.params.query = {
                "a": this.generateRandom()
            };
        }
        routeVisitor = dataVisitor.url;
        userAgent = dataVisitor.useragent;
        langInfo = dataVisitor.acceptlanguage;

        host = dataVisitor.host;
        referrer = dataVisitor.headers.referer;

        // --------------------------------------
        // data/data-visitors-to-convert.json => visitorsInfoData
        // --------------------------------------
        ipVisitors = data2Convert.ips;
        routeVisitors = data2Convert.routes;
        browserVisitors = data2Convert.browsers;
        osVisitors = data2Convert.os;
        langVisitors = data2Convert.lang;
        keywordsVisitors = data2Convert.keywords;

        // Same visitor?
        sameVisitor = ipVisitors[ipVisitor];
        if (sameVisitor)
        {
            ++ipVisitors[ipVisitor];
        }
        else
        {
            ipVisitors[ipVisitor] = 1;
        }

        // Store routes
        if (!routeVisitors[routeVisitor])
        {
            routeVisitors[routeVisitor] = 1;
        }
        else
        {
            ++routeVisitors[routeVisitor];
        }


        // More infos...
        uaInfo = parser.setUA(userAgent).getResult();

        browserName = uaInfo.browser.name + " " + uaInfo.browser.version;
        osName = uaInfo.os.name + " " + uaInfo.os.version;

        // Store browser info
        if (!browserVisitors[browserName])
        {
            browserVisitors[browserName] = 1;
        }
        else
        {
            ++browserVisitors[browserName];
        }

        // Store O.S. info
        if (!osVisitors[osName])
        {
            osVisitors[osName] = 1;
        }
        else
        {
            ++osVisitors[osName];
        }

        // Store language info
        if (!langVisitors[langInfo])
        {
            langVisitors[langInfo] = 1;
        }
        else
        {
            ++langVisitors[langInfo];
        }

        // Store keywords info
        if (dataVisitor.params && dataVisitor.params.query)
        {
            for (k in dataVisitor.params.query)
            {
                keyword = dataVisitor.params.query[k];
                // Store referrers info
                if (!keywordsVisitors[keyword])
                {
                    keywordsVisitors[keyword] = 1;
                }
                else
                {
                    ++keywordsVisitors[keyword];
                }
            }
        }

        // Store referrers info
        this.storeReferrer(referrer, host);

        this.updateDataForCharts(dataVisitor);
    }

    parse(dataVisitor)
    {
        let i,
            n,
            ipVisitor,
            routeVisitor,
            acceptHeader,
            referer,
            host;

        if (debugMode)
        {
            console.time(processTimerTxt);
        }

        if (!dataVisitor)
        {
            console.error("Data visitor empty");
            return;
        }

        if (!dataForCharts)
        {
            console.error("Datafile is invalid or empty");
            return;
        }

        ipVisitor = dataVisitor.ip;
        routeVisitor = dataVisitor.url;
        acceptHeader = dataVisitor.headers.accept;
        referer = dataVisitor.referer;
        host = dataVisitor.host;

        // We store referer no matter what
        this.storeReferrer(referer, host);

        // --------------------------------------
        //
        // --------------------------------------
        if (!data2Convert)
        {
            data2Convert = {};
        }

        // TODO: Replace these with a merge
        data2Convert.ips = data2Convert.ips || {};
        data2Convert.routes = data2Convert.routes || {};
        data2Convert.browsers = data2Convert.browsers || {};
        data2Convert.lang = data2Convert.lang || {};
        data2Convert.os = data2Convert.os || {};
        data2Convert.assets = data2Convert.assets || {};
        data2Convert.referers = data2Convert.referers || {};
        data2Convert.keywords = data2Convert.keywords || {};


        // --------------------------------------
        // Case to ignore
        // --------------------------------------
        if (acceptHeader.indexOf("text/html") === -1)
        {
            if (debugMode)
            {
                console.log("Ignoring header: ", acceptHeader);
            }

            if (!data2Convert.assets[routeVisitor])
            {
                data2Convert.assets[routeVisitor] = 0;
            }
            data2Convert.assets[routeVisitor]++;
            return;
        }

        // Ignore list: routes
        n = this.userOptions.ignoreRoutes.length;
        for (i = 0; i < n; ++i)
        {
            if (routeVisitor.indexOf(this.userOptions.ignoreRoutes[i]) >= 0)
            {
                if (debugMode)
                {
                    console.log("Ignoring route: ", this.userOptions.ignoreRoutes[i]);
                }
                return;
            }
        }

        n = this.userOptions.ignoreIPs.length;
        for (i = 0; i < n; ++i)
        {
            if (ipVisitor.indexOf(this.userOptions.ignoreIPs[i]) >= 0)
            {
                if (debugMode)
                {
                    console.log("Ignoring IP: ", this.userOptions.ignoreIPs[i]);
                }
                return;
            }
        }

        n = this.userOptions.ignoreExtensions.length;
        for (i = 0; i < n; ++i)
        {
            if (routeVisitor.indexOf(this.userOptions.ignoreExtensions[i]) >= 0)
            {
                return;
            }
        }

        if (debugMode)
        {
            console.log("Accepting header: ", acceptHeader, " => ", routeVisitor);
        }

        this.updateData2Convert(dataVisitor);

        if (debugMode)
        {
            console.timeEnd(processTimerTxt);
        }

    }

}


module.exports.StatsEngine = StatsEngine;

