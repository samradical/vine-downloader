const VINE_DL = require('./index')
const fs = require('fs')
const path = require('path')

const VINE_USER_ID = '947608250487042048'

VINE_DL.downloadTimeline(VINE_USER_ID, __dirname, {maxDownload:Infinity})
.then(final=>{
	fs.writeFileSync(path.join(__dirname, `${VINE_USER_ID}.json`), JSON.stringify(final.rawVineData, null, 4))
	console.log(final);
})
