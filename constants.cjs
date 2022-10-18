const MEANINGFUL_LOG_FILES = {
    HITS_LOG_FILENAME: "hits.log",
};

const LIST_DATA_FILES = {
    IPS_REFS      : "indexers/ips.json",
    BROWSERS_REFS : "indexers/browsers.json",
    OS_REFS       : "indexers/oses.json",
    ENDPOINTS_REFS: "indexers/endpoints.json",
    LANGUAGES_REF : "indexers/languages.json",
};

const CHART_DATA_FILES = {
    HITS_DATA_FILENAME     : "charts/hits.json",
    TODAY_DATA_FILENAME    : "charts/today.json",
    WEEK_DATA_FILENAME     : "charts/week.json",
    MONEY_DATA_FILENAME    : "charts/money.json",
    BROWSERS_DATA_FILENAME : "charts/browser-popularity.json",
    OSES_DATA_FILENAME     : "charts/os-popularity.json",
    LANGUAGES_DATA_FILENAME: "charts/language-popularity.json",
    ENDPOINTS_DATA_FILENAME: "charts/endpoints-table.json"
};

const CHART_TYPE = {
    LINE : "line",
    BAR  : "bar",
    PIE  : "pie",
    TABLE: "table"
};

const INIT_DATA_CHART = "{}";


module.exports.MEANINGFUL_LOG_FILES = MEANINGFUL_LOG_FILES;
module.exports.LIST_DATA_FILES = LIST_DATA_FILES;

module.exports.CHART_TYPE = CHART_TYPE;
module.exports.CHART_DATA_FILES = CHART_DATA_FILES;

module.exports.INIT_DATA_CHART = INIT_DATA_CHART;