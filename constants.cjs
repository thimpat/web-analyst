const MEANINGFUL_LOG_FILES = {
    HITS_LOG_FILENAME: "hits.log",
};

const LIST_DATA_FILES = {
    IPS_REFS     : "maps/ips.json",
    BROWSERS_REFS: "maps/browsers.json",
    OS_REFS      : "maps/oses.json",
    LANGUAGES_REF: "maps/languages.json",
};

const CHART_DATA_FILES = {
    HITS_DATA_FILENAME    : "charts/hits.json",
    TODAY_DATA_FILENAME   : "charts/today.json",
    WEEK_DATA_FILENAME    : "charts/week.json",
    BROWSERS_DATA_FILENAME: "charts/browsers.json",
};

const CHART_TYPE = {
    BAR: "bar",
    PIE: "pie"
};

const INIT_DATA_CHART = "{}";


module.exports.MEANINGFUL_LOG_FILES = MEANINGFUL_LOG_FILES;
module.exports.LIST_DATA_FILES = LIST_DATA_FILES;

module.exports.CHART_TYPE = CHART_TYPE;
module.exports.CHART_DATA_FILES = CHART_DATA_FILES;

module.exports.INIT_DATA_CHART = INIT_DATA_CHART;