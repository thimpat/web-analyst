
# Web-Analyst
Web Analyst is a plugin for Genserve

## 1. Installation
   
npm install web-analyst

<br/>

---

## 2. Notes

* **v3** works with Genserve v5 only (Recommended)
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
$> npm install web-analyst -g
```

<br/>

##### Create a genserve config file and add a plugin section

```json
"plugins" : [
    {
    	"name": "web-analyst",
		"pages" : [ ".*\\.html\\b", "\\/$" ],
		"earnings" : [ "\\?p=(.*)" ]
	}
]
```

* name   : Plugin name
* pages  : Regex list for defining which pages need to be taken into account in the statistics
* earning: Pattern to identify earnings

<br/>

---

## 4. Preview

![Screenshot](https://github.com/thimpat/demos/blob/main/web-analyst/images/stats-plugin-3.png)



