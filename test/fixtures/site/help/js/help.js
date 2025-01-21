
const init = () =>
{
    try
    {
        return true;
    }
    catch (e)
    {
        console.error({lid: "WA6543"}, e.message);
    }

    return false;

};

init();