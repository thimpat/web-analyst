const getPluginOptions = function ({session, pluginName, loggable})
{
    try
    {
        const plugins = session.plugins;
        let pluginOptions;
        for (let i = 0; i < plugins.length; ++i)
        {
            const plugin = plugins[i];
            if (plugin.name === pluginName)
            {
                return plugin;
            }
        }

    }
    catch (e)
    {
        loggable.error({lid: 7549}, e.message);
    }

    return null;
};

module.exports.getPluginOptions = getPluginOptions;
