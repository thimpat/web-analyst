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

module.exports.PLUGIN_NAME = PLUGIN_NAME;
module.exports.CONTEXT_TYPE = CONTEXT_TYPE;
module.exports.DETECTION_METHOD = DETECTION_METHOD;