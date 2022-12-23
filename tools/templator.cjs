const {existsSync, readFileSync, writeFileSync, mkdirSync, statSync} = require("fs");

const glob = require("glob");

const {joinPath} = require("@thimpat/libutils");


const rootDir = joinPath(__dirname, "..");
process.chdir(rootDir);

const packageJsonPath = joinPath(rootDir, "package.json");
const packageJson = require(packageJsonPath);

const templatesDir = joinPath(rootDir, "templates");
mkdirSync(templatesDir, {recursive: true});

const outputDir = joinPath(rootDir, "web");
mkdirSync(outputDir, {recursive: true});

// options is optional
const files = glob.sync(`**/*`, {
    cwd   : templatesDir
});

for (let i = 0; i < files.length; ++i)
{
    const originalFile = joinPath(templatesDir, files[i]);
    const targetFile = joinPath(outputDir, files[i]);

    if (statSync(originalFile).isDirectory())
    {
        if (!existsSync(targetFile))
        {
            mkdirSync(targetFile, {recursive: true});
        }
        continue;
    }


    const initialContent = readFileSync(originalFile, {encoding: "utf-8"});

    const finalContent = initialContent.replace(/\{\{([^}]+)}}/g, (match, offset) =>
    {
        const val = packageJson[offset];
        if (!val)
        {
            return match;
        }
        return val;
    });

    if (initialContent === finalContent)
    {
        if (!existsSync(targetFile))
        {
            writeFileSync(targetFile, finalContent, {encoding: "utf8"});
            console.log(`Generated: [${targetFile}]`);
        }
    }
    else
    {
        writeFileSync(targetFile, finalContent, {encoding: "utf8"});
        console.log(`Updated: [${originalFile}]`);
    }

}

