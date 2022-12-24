const loadPageIntoDiv = (uri) =>
{
    try
    {
        localStorage.setItem("lastPage", uri);

        fetch(uri)
            .then(function (response)
            {
                return response.text();
            })
            .then(function (html)
            {
                document.getElementById("main-content").innerHTML = html;

                Prism.highlightAll();
            })
            .catch(function (e)
            {
                console.error({lid: 5639}, e.message);
            });

        return true;
    }
    catch (e)
    {
        console.error({lid: 5641}, e.message);
    }

    return false;

};

const init = (currentPage = "pages/1-setup-and-configure-a-server.html") =>
{
    try
    {
        const lastPage = localStorage.getItem("lastPage");
        if (lastPage)
        {
            currentPage = lastPage;
        }

        loadPageIntoDiv(currentPage);

        const items = document.getElementsByClassName("link");
        for (let i = 0; i < items.length; ++i)
        {
            const item = items[i];
            item.addEventListener("click", function (event)
            {
                event.preventDefault();
                const anchor = this.getElementsByTagName("a");
                const link = anchor[0].getAttribute("href");
                loadPageIntoDiv(link);
            });
        }

        return true;
    }
    catch (e)
    {
        console.error({lid: 6543}, e.message);
    }

    return false;

};

init();