
# Web-Analyst
Web Analyst is a simple back-end tracking system to measure your web app performances..

## Installation
   
npm install web-analyst


## Note

It is recommended to install the package locally.


## Usage

```javascript
    // Load the library
    var webAnalyst = require('web-analyst');

    // Initialize with options
    webAnalyst.init({
      ignoreIPs: ['192.168.x.x'],
      ignoreRoutes: ['/stats','favicon'],
      ignoreExtensions: ['.map'],
      dataDir: './'
    });

    // Start the engine
    app.use(webAnalyst.track());

    // Analytics will be available at: http://yoursite.com/stats
    // Note that you might want to provide some sort of authentication
    // in order for this page to be available only by you.
    app.get('/stats', webAnalyst.render());
```

## Usage with authentication page

    To protect access to your page, the process is slightly different.
    You would need to load a session manager (In this example cookie-session is used).

```javascript    
    var cookieSession = require('cookie-session');
    app.use(cookieSession({
        name: 'session',
        keys: ['key1', 'key2']
    }));

    // Initialize with options users (Array of authorized users)
    webAnalyst.init({
        // List of options
        // ...: ...
        // ---------------------
        users: [{
            username: 'johndoe',
            password: 'demopass'
        },
        {
            username: 'someoneelse',
            password: 'demo'
        }]
    });

    // Start the engine
    app.use(webAnalyst.track());

    // Set route
    app.all('/stats', webAnalyst.check(), webAnalyst.render());
```    

## Screenshot

![screenshot1](https://perspectivedev.com/portfolio/img/screenshot3.jpg)    

![screenshot2](https://perspectivedev.com/portfolio/img/screenshot4.jpg)    

