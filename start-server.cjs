const http = require("http");

const PORT = 3000;

// A simple utility function to parse cookies from the request header
const parseCookies = (request) => {
    const list = {};
    const rc = request.headers.cookie;

    rc && rc.split(";").forEach(function(cookie) {
        const parts = cookie.split("=");
        // DecodeURIComponent is used to handle special characters
        list[parts.shift().trim()] = decodeURIComponent(parts.join("="));
    });

    return list;
};

// Create the server
const server = http.createServer((req, res) => {
    // Read cookies from the incoming request
    const cookies = parseCookies(req);
    console.log("Received Cookies:", cookies);

    // Endpoint for setting a cookie
    if (req.url === "/set-cookie") {
        // Set the cookie with a name 'myCookie' and a value 'helloWorld'
        // Add optional attributes like 'HttpOnly' and 'Max-Age'
        res.setHeader("Set-Cookie", "myCookie=helloWorld; HttpOnly; Max-Age=3600");
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Cookie has been set!");
    }
    // Endpoint for reading and displaying a cookie
    else if (req.url === "/read-cookie") {
        const myCookieValue = cookies.myCookie || "No cookie found";
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`The value of myCookie is: ${myCookieValue}`);
    }
    // Default response for other endpoints
    else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Welcome! Visit /set-cookie or /read-cookie.");
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});