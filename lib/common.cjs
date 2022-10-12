const getTodayDate = function()
{
    let now = new Date();
    return now.toISOString().slice(0, 10);
};

const getCurrentTime = function()
{
    let now = new Date();
    return now.toLocaleTimeString();
};

const get24HoursLabels = function ()
{
    // Build labels
    const labels = [];
    for (let i = 0; i < 24; ++i)
    {
        labels.push(i + "h");
    }

    return labels;
};

module.exports.get24HoursLabels = get24HoursLabels;
module.exports.getCurrentTime = getCurrentTime;
module.exports.getTodayDate = getTodayDate;
