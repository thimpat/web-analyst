
# Web-Analyst
Web Analyst is a plugin for Genserve

## 1. Installation
   
npm install web-analyst

<br/>

---

## 2. Notes

* **v2** works with Genserve (https://www.npmjs.com/package/genserve)
* **v1** works with Express but is not maintained

<br/>

---

## 3. Usage

##### Install Genserve

```
$> npm install genserve -g
```

<br/>

##### Create a genserve config file and add a plugin section

```json
  "plugins": [
    {
      "./node_modules/web-analyst/index.cjs": {
        "dir": "./stats/",
        "pages": [".*\\.html\\b", "\\/$"],
        "earnings": ["\\?p=(.*)"]
      }
    }],
```

* dir    : Directory where the generated assets will be installed
* pages  : Regex list for taking into account when generating charts
* earning: Pattern to identify earnings
