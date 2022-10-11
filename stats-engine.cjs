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
    processTimerTxt,
    saveData,
    maxPopular,
    words,
    sentence;


processTimerTxt = "Analyst generation";

maxPopular = 8;

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
    userOptions = {
        testMode : false,
        debugMode: false
    };

    defaultOptions = {
        ignoreIPs       : [],
        ignoreRoutes    : [],
        ignoreExtensions: [],
        dataDir         : __dirname,
        route           : "stats",
        testMode        : false,
        debugMode       : false
    };

    resetDatafile1 = pathEngine.join(__dirname, "/data/reset/data-visitors-to-convert.json");
    resetDatafile2 = pathEngine.join(__dirname, "/data/reset/data-for-charts.json");

    dirty = true;

    data2Convert = null;
    dataForCharts = null;

    constructor()
    {
        this.setOptions();

        this.testMode = this.userOptions.testMode;
        this.debugMode = this.userOptions.debugMode;

        lastDayIndex = this.getIndexDay();
        lastWeekIndex = this.getIndexWeek();

        if (!existsSync(this.userOptions.datafile1))
        {
            createReadStream(this.resetDatafile1).pipe(createWriteStream(this.userOptions.datafile1));
        }

        if (!existsSync(this.userOptions.datafile2))
        {
            createReadStream(this.resetDatafile2).pipe(createWriteStream(this.userOptions.datafile2));
        }

        // Start gathering information
        this.startDataAnalyser(
            this.userOptions.frequency
        );
    }

    /**
     * Initialize data
     */
    startDataAnalyser(frequency)
    {
        frequency = frequency || 10000;

        // Load data from data file 1: /data/data-visitors-to-convert.json
        jsonEngine.readFile(this.userOptions.datafile1, {}, (err, dataGroup1) =>
        {
            if (err)
            {
                console.error("Cannot read data file =>", this.userOptions.datafile1);
                return;
            }

            this.data2Convert = dataGroup1;

            // Load data from data file 2: /data/data-for-charts.json
            jsonEngine.readFile(this.userOptions.datafile2, {}, (err, dataGroup2) =>
            {
                if (err)
                {
                    console.error("Cannot read data for charts =>", dataForChartsPath);
                    return;
                }

                this.dataForCharts = dataGroup2;

                // Save data to file
                saveData = function ()
                {
                    if (this.dirty)
                    {
                        // Update visitors file: data/data-visitors-to-convert.json
                        jsonEngine.writeFile(this.userOptions.datafile1, this.data2Convert, (err) =>
                        {
                            if (err)
                            {
                                console.error(err);
                                return;
                            }

                            // Update stats file: data/data-for-charts.json
                            jsonEngine.writeFile(this.userOptions.datafile2, this.dataForCharts, (err) =>
                            {
                                if (err)
                                {
                                    console.error(err);
                                    return;
                                }

                                if (this.debugMode)
                                {
                                    console.log("data saved");
                                }
                            });
                        });
                    }

                    setTimeout(function ()
                    {
                        saveData();
                        this.dirty = false;
                    }.bind(this), frequency);

                }.bind(this);

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
        if (typeof weekStart !== "number" || weekStart % 1 !== 0 || weekStart < 0 || weekStart > 6)
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

    setOptions(opt = {})
    {
        this.userOptions = Object.assign({}, this.defaultOptions, opt);

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

        this.data2Convert.referers = this.data2Convert.referers || {};

        if (!this.data2Convert.referers[referrer])
        {
            this.data2Convert.referers[referrer] = 1;
        }
        else
        {
            ++this.data2Convert.referers[referrer];
        }

        if (this.debugMode)
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
        weekData = this.dataForCharts.weekVisitors.datasets[0].data;
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
            vArr = this.getMaxValues(maxPopular, data);

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
        this.dataForCharts[keyName] = [];
        for (key in data)
        {
            item = {};
            item.color = colours[c % nColours];
            item.highlight = highlight[c % nColours];
            item.label = key;
            item.value = data[key];
            this.dataForCharts[keyName][c] = item;
            ++c;
        }
    }

    updateWeekChart()
    {
        let indexLabel, data;
        indexLabel = this.getIndexDay();

        data = this.dataForCharts.weekVisitors.datasets[0].data;
        ++data[indexLabel];
    }

    updateYearChart()
    {
        let indexLabel, data;
        indexLabel = this.getIndexMonth();

        data = this.dataForCharts.yearVisitors.datasets[0].data;
        ++data[indexLabel];
    }

    updateProgressVisitors()
    {
        let currentMonthIndex;
        currentMonthIndex = this.getIndexMonth();
        this.dataForCharts.progressVisitors.datasets[0].data =
            this.dataForCharts.yearVisitors.datasets[0].data.slice(0, currentMonthIndex + 1);
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

    updateDataForCharts({ipVisitor})
    {
        let indexDay,
            indexWeek,
            indexMonth,
            itsaNewMonth,
            itsaNewDay,
            itsaNewWeek;

        // New day?
        indexDay = this.getIndexDay();
        if (lastDayIndex !== indexDay)
        {
            lastDayIndex = indexDay;
            itsaNewDay = true;
        }

        // New week?
        indexWeek = this.getIndexWeek();
        if (indexWeek !== lastWeekIndex)
        {
            if (this.debugMode)
            {
                console.log("-----------------------------------------------------");
                console.log("New week detected");
                console.log("-----------------------------------------------------");
            }
            lastWeekIndex = indexWeek;
            itsaNewWeek = true;
        }

        // New month?
        indexMonth = this.getIndexMonth();
        if (lastMonthIndex !== indexMonth)
        {
            lastMonthIndex = indexMonth;
            itsaNewMonth = true;
        }

        if (itsaNewDay)
        {
            this.newDay(this.dataForCharts);
        }

        if (itsaNewWeek)
        {
            this.newWeek(this.dataForCharts);
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

    updateData2Convert({ip: ipVisitor, params, url, useragent, acceptlanguage, host, headers})
    {
        try
        {
            let sameVisitor,
                browserName,
                referrer,
                osName,
                uaInfo,
                routeVisitor,
                userAgent,
                langInfo,
                k,
                keyword;

            dirty = true;

            // Generate fake IP in test mode
            if (this.testMode)
            {
                ipVisitor =
                    Math.floor(Math.random() * 256) + "." +
                    Math.floor(Math.random() * 256) + "." +
                    Math.floor(Math.random() * 256) + "." +
                    Math.floor(Math.random() * 256);

                params.query = {
                    "a": this.generateRandom()
                };
            }
            routeVisitor = url;
            userAgent = useragent;
            langInfo = acceptlanguage;

            host = host;
            referrer = headers.referer;

            // --------------------------------------
            // data/data-visitors-to-convert.json => visitorsInfoData
            // --------------------------------------
            ipVisitors = this.data2Convert.ips;
            routeVisitors = this.data2Convert.routes;
            browserVisitors = this.data2Convert.browsers;
            osVisitors = this.data2Convert.os;
            langVisitors = this.data2Convert.lang;
            keywordsVisitors = this.data2Convert.keywords;

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
            if (params && params.query)
            {
                for (k in params.query)
                {
                    keyword = params.query[k];
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

            this.updateDataForCharts({ipVisitor});

            return true;
        }
        catch (e)
        {
            console.error({lid: 4541}, e.message);
        }

        return false;

    }

    parseData({ip, url, headers, referer, host, acceptlanguage, useragent, params})
    {
        try
        {
            let i,
                n,
                ipVisitor,
                routeVisitor,
                acceptHeader;

            if (this.debugMode)
            {
                console.time(processTimerTxt);
            }

            if (!this.dataForCharts)
            {
                console.error("Datafile is invalid or empty");
                return;
            }

            ipVisitor = ip;
            routeVisitor = url;
            acceptHeader = headers.accept;

            // We store referer no matter what
            this.storeReferrer(referer, host);

            // --------------------------------------
            //
            // --------------------------------------
            if (!this.data2Convert)
            {
                this.data2Convert = {};
            }

            // TODO: Replace these with a merge
            this.data2Convert.ips = this.data2Convert.ips || {};
            this.data2Convert.routes = this.data2Convert.routes || {};
            this.data2Convert.browsers = this.data2Convert.browsers || {};
            this.data2Convert.lang = this.data2Convert.lang || {};
            this.data2Convert.os = this.data2Convert.os || {};
            this.data2Convert.assets = this.data2Convert.assets || {};
            this.data2Convert.referers = this.data2Convert.referers || {};
            this.data2Convert.keywords = this.data2Convert.keywords || {};


            // --------------------------------------
            // Case to ignore
            // --------------------------------------
            if (acceptHeader.indexOf("text/html") === -1)
            {
                if (this.debugMode)
                {
                    console.log("Ignoring header: ", acceptHeader);
                }

                if (!this.data2Convert.assets[routeVisitor])
                {
                    this.data2Convert.assets[routeVisitor] = 0;
                }
                this.data2Convert.assets[routeVisitor]++;
                return;
            }

            // Ignore list: routes
            n = this.userOptions.ignoreRoutes.length;
            for (i = 0; i < n; ++i)
            {
                if (routeVisitor.indexOf(this.userOptions.ignoreRoutes[i]) >= 0)
                {
                    if (this.debugMode)
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
                    if (this.debugMode)
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

            if (this.debugMode)
            {
                console.log("Accepting header: ", acceptHeader, " => ", routeVisitor);
            }

            this.updateData2Convert({ip, params, url, useragent, acceptlanguage, host, headers});

            if (this.debugMode)
            {
                console.timeEnd(processTimerTxt);
            }

            return true;
        }
        catch (e)
        {
            console.error({lid: 6543}, e.message);
        }

        return false;
    }

}


module.exports.StatsEngine = StatsEngine;

