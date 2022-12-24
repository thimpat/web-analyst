/**
 * Test GenServe in a browser. For these tests to pass, you must define two hosts
 * (http://test1 and http://test2) pointing to the loopback address (127.0.0.1)
 *
 * You can add these entries on Windows via the host file:
 * C:\Windows\System32\drivers\etc\host
 *
 * On Linux:
 * /etc/hosts
 *
 * --------------------------------------------------------------------------------
 * https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver/
 */
const {existsSync, unlinkSync, rmSync} = require("fs");
const {sleep, resolvePath, joinPath} = require("@thimpat/libutils");

const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const {By} = require("selenium-webdriver");
const chromium = require("chromium");

const shell = require("shelljs");

require("chromedriver");

const chai = require("chai");
chai.use(require("chai-fs"));

const clientPath = joinPath(__dirname, "../node_modules/genserve/client.cjs");

// ------------------------------------
// Chai plugins
// ------------------------------------
const expect = chai.expect;

// ------------------------------------
// Genserve NameSpace
// ------------------------------------
process.env.GENSERVE_NAMESPACE = "genserve-e2e-deploy";
process.env.GENSERVE_DEBUG = "no";
process.env.GENSERVE_DATA = resolvePath("test/running/data");

let driver;

async function init()
{
    let options = new chrome.Options();
    options.setChromeBinaryPath(chromium.path);
    options.addArguments("--headless");
    options.addArguments("--sandbox");
    options.addArguments("--disable-gpu");
    options.addArguments("--window-size=1280,960");
    options.addArguments("--ignore-certificate-errors");

    driver = await new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

    return driver;
}

describe("After a local deployment", function ()
{
    this.timeout(60000);

    before(async () =>
    {
        shell.cd(joinPath(__dirname, ".."));

        driver = await init();

        if (existsSync("test/tmp-325598.pack.zip"))
        {
            unlinkSync("test/tmp-325598.pack.zip");
        }

        // Server for testing static and dynamic pages in non-secure environments
        shell.exec(`node ${clientPath} shutdown now`, {silent: true});
        shell.exec(`node ${clientPath} erase all now --force --clean`, {silent: true});

        rmSync("deployment/", {recursive: true, force: true});
        expect("./deployment/").not.to.be.a.path();

        rmSync("running/", {recursive: true, force: true});
        expect("./running/").not.to.be.a.path();

        await sleep(5000);
    });

    after(async function ()
    {
        await driver.close();
        await driver.quit();

        // The driver takes time to quit
        await sleep(10000);

        shell.cd(__dirname);
        shell.exec(`node .${clientPath} shutdown now`, {silent: true});
        shell.exec(`node .${clientPath} erase all now --force --clean`, {silent: false});

        rmSync("deployment/", {recursive: true, force: true});
        expect("./deployment/").not.to.be.a.path();

        rmSync("running/", {recursive: true, force: true});
        expect("./running/").not.to.be.a.path();

        unlinkSync("./tmp-325598.pack.zip");
    });

    describe("Against the config file [lp12.test-1.json]", function ()
    {
        before(function ()
        {
            shell.cd(__dirname);

            // Create a server against the test folder, so it has a default server
            shell.exec(`node ${clientPath} create config ./fixtures/01-local-deployment/lp12.test-1.json`, {silent: false});
        });

        after(function ()
        {
            shell.exec(`node ${clientPath} erase all now --force --clean`, {silent: false});
        });

        it("should do a deployment on the default deployment/ directory", function ()
        {
            const {stdout} = shell.exec(`node ${clientPath} deploy`, {silent: false});

            expect(stdout)
                .to.contain("Packing [./fixtures/site/help/]")
                .to.contain("Archive generated in")
                .to.contain("./tmp-325598.pack.zip")
                .to.contain("Successfully unpacked archive for")
                .to.contain("Applying config from")
                .to.contain("Server configuration successfully loaded from")
                .to.contain("Statistics plugin URL:")
                .to.contain("/login-web-analyst.server.cjs")
                .to.contain("Server Mode: production")
                .to.contain("The server [lp12-deploy.test-1] has successfully")
                .to.contain("started");

            expect("./deployment").to.be.a.directory();
        });

        it("should have the default deployment/ directory containing the correct directories", function ()
        {
            shell.exec(`node ${clientPath} deploy`, {silent: false});

            expect("./deployment/").to.be.a.directory().and.include.contents(
                [
                    ".deployed.json",
                    ".genserverc",
                    "fixtures",
                    "lp12-deploy.test-1-sessions.json",
                    "node_modules",
                    "package-lock.json",
                    "package.json",
                    "stats"
                ]
            );
        });

        it("should have the deployment/ directory running a default server", function ()
        {
            shell.cd(joinPath(__dirname, "./deployment/"));
            const {stdout} = shell.exec(`node ${clientPath} show default server`, {silent: false});
            expect(stdout)
                .to.contain("served by [lp12-deploy.test-1]")
                .to.contain("Default server for this directory: [lp12-deploy.test-1]");
        });

        describe("various http requests", function ()
        {
            describe("On the statistic page", function ()
            {
                it("should successfully load default index.html", async function ()
                {
                    await driver.get(`http://localhost:38432/login-web-analyst.server.cjs`);
                    const url = await driver.getCurrentUrl();
                    expect(url).to.equal(`http://localhost:38432/login-web-analyst.server.cjs`);
                });

                it("should successfully load the login page content", async function ()
                {
                    await driver.get(`http://localhost:38432/login-web-analyst.server.cjs`);
                    await driver.sleep(1000);
                    const username = await driver.findElement(By.name("username"));
                    const password = await driver.findElement(By.name("password"));
                    const random = await driver.findElement(By.name("random"));
                    const submitButton = await driver.findElement(By.id("submit-button"));
                    expect(username).to.exist;
                    expect(password).to.exist;
                    expect(random).to.exist;
                    expect(submitButton).to.exist;
                });

                it("should show the login content when going to the statistic page when not logged in", async function ()
                {
                    await driver.get(`http://localhost:38432/login-web-analyst.server.cjs`);
                    await sleep(5000);
                    const username = await driver.findElement(By.name("username"));
                    const password = await driver.findElement(By.name("password"));
                    const random = await driver.findElement(By.name("random"));
                    const submitButton = await driver.findElement(By.id("submit-button"));
                    expect(username).to.exist;
                    expect(password).to.exist;
                    expect(random).to.exist;
                    expect(submitButton).to.exist;
                });

                it("should log in with the correct credentials", async function ()
                {
                    await driver.get(`http://localhost:38432/login-web-analyst.server.cjs`);
                    await sleep(5000);

                    const username = await driver.findElement(By.name("username"));
                    await username.sendKeys("admin");

                    const password = await driver.findElement(By.name("password"));
                    await password.sendKeys("admin");

                    const submitButton = await driver.findElement(By.name("submit-button"));

                    await submitButton.submit();
                    await sleep(1000);

                    const url = await driver.getCurrentUrl();
                    expect(url).to.equal(`http://localhost:38432/lp12-deploy.test-1/index.html`);
                });

                it("should successfully logout", async function ()
                {
                    await driver.get(`http://localhost:38432/lp12-deploy.test-1/index.html`);
                    await sleep(5000);

                    const e1 = await driver.findElement(By.id("logout"));
                    await e1.click();

                    await sleep(1000);
                    const url = await driver.getCurrentUrl();
                    expect(url).to.equal(`http://localhost:38432/login-web-analyst.server.cjs`);
                });

                it("should stay logout after a page refresh", async function ()
                {
                    await driver.get(`http://localhost:38432/login-web-analyst.server.cjs`);
                    await sleep(5000);

                    const username = await driver.findElement(By.name("username"));
                    const password = await driver.findElement(By.name("password"));
                    const random = await driver.findElement(By.name("random"));
                    const submitButton = await driver.findElement(By.id("submit-button"));
                    expect(username).to.exist;
                    expect(password).to.exist;
                    expect(random).to.exist;
                    expect(submitButton).to.exist;
                });
            });
        });


    });

});

