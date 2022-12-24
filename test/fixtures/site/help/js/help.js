
const init = () =>
{
    try
    {
        return true;
    }
    catch (e)
    {
        console.error({lid: 6543}, e.message);
    }

    return false;

};

init();