const PLUGIN_NAME = "web-analyst";

const CONTEXT_TYPE = {
    contextName: "WEB-ANALYST",
    color      : "#65fd12",
    symbol     : "📊",
    bold       : true,
    bgColor    : "grey",
};

const DETECTION_METHOD = {
    COOKIE: "cookie",
    IP    : "ip"
};

const PAGES = {
    LOGIN_PAGE_NAME: "login-web-analyst.server.cjs"
};

module.exports.PLUGIN_NAME = PLUGIN_NAME;
module.exports.CONTEXT_TYPE = CONTEXT_TYPE;
module.exports.DETECTION_METHOD = DETECTION_METHOD;
module.exports.PAGES = PAGES;
