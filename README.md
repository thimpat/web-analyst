# Web-Analyst

Web Analyst is a plugin for Genserve.

## 1. Installation

npm install web-analyst

<br/>

---

## 2. Notes

* **v3** works with Genserve v5 (Recommended)
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

##### Install Web-analyst

```
$> npm install web-analyst
```

<br/>

##### Create a genserve config file and add a plugin section

```json
{
  "plugins": [
    {
      "name": "web-analyst",
      "modulename": "web-analyst@latest",
      "pages": [
        ".*\\.html\\b",
        "\\/$"
      ],
      "earnings": [
        "\\?p=(.*)"
      ],
      "ignore": [
        "something.html"
      ],
      "users": {
        "admin": {
          "password": "admin"
        },
        "some-email@example.com": {
          "password": "secret"
        }
      }
    }
  ]
}
```

All values are optional (name or modulename must be at least defined)

* name       : Plugin name
* modulename : Plugin version to install
* pages      : Regex list for defining which pages need to be taken into account in the statistics
* earning    : Pattern to identify earnings
* ignore     : Pattern to identify pages to ignore
* users      : Users allowed to the statistic area. Default => user:admin password:admin
* credentials: Path to a .cjs file containing allowed user list .i.e "/path/to/credentials.cjs" (The above field has 
  precedence over this one) 
 

<br/>

##### Content Example for "credentials.cjs" 
```javascript
module.exports = {
  "admin": {
    "password": "admin"
  }
};
```

<br/>

---

## 4. Preview

![Screenshot](https://github.com/thimpat/demos/blob/main/web-analyst/images/stats-plugin-3.png)



