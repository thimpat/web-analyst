const PLUGIN_NAME = "web-analyst";

const CONTEXT_TYPE = {
    contextName: "WEB-ANALYST",
    color: "#65fd12",
    symbol: "📊",
    bold: true,
    bgColor: "grey",
};

const DETECTION_METHOD = {
    COOKIE: "cookie",
    BROWSER_STORAGE: "browser",
    IP: "ip"
};

const DATA_GATHERING_METHOD = {
    COOKIE: "cookie",
    FETCH: "fetch"
};

const PAGES = {
    LOGIN_PAGE_NAME: "login-web-analyst.server.cjs"
};

module.exports.PLUGIN_NAME = PLUGIN_NAME;
module.exports.CONTEXT_TYPE = CONTEXT_TYPE;
module.exports.DETECTION_METHOD = DETECTION_METHOD;
module.exports.DATA_GATHERING_METHOD = DATA_GATHERING_METHOD;
module.exports.PAGES = PAGES;
