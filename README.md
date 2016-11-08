##Download a users vines before the shutdown ;_;

You need your userId for this. Not obvious to get it.

Visit your vine.co page in a browser. eg: `vine.co/sam.rad`

![](https://66.media.tumblr.com/4424764a634fb6e5792681647f156860/tumblr_ogcb3ky3p51sw2wh6o1_540.png)

`exmaple.js`

```

const VINE_DL = require('./index')
const fs = require('fs')
const path = require('path')

const VINE_USER_ID = '947608250487042048'

// __dirname (where to download)
VINE_DL.downloadTimeline(VINE_USER_ID, __dirname, {maxDownload:Infinity})
.then(final=>{
	fs.writeFileSync(path.join(__dirname, `${VINE_USER_ID}.json`), JSON.stringify(final.rawVineData, null, 4))
	console.log(final);
})


```
