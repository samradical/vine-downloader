const request = require('request');
const Prom = require('bluebird');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const colors = require('colors');
const BASE = "https://api.vineapp.com/";
const HEADERS = {
	referer: 'https://vine.co/',
	'user-agent': 'com.vine.iphone/1.0.3 (unknown, iPhone OS 8.1.0, iPhone, Scale/2.000000)'
};

const DEFAULTS = {
	maxDownload: Infinity
}

var DL = (function() {

	function _getVineData(url, options = {}) {
		return new Prom(function(resolve, reject) {
			var results = [];

			function __doUserRequest(page) {
				request({
					url: url,
					qs: {
						page: page,
						size: 100
					},
					headers: {
						referer: 'https://vine.co/',
						'user-agent': 'com.vine.iphone/1.0.3 (unknown, iPhone OS 6.1.0, iPhone, Scale/2.000000)'
					}
				}, function(err, res, body) {
					var j = JSON.parse(body);
					results = [...results, ...j['data']['records']]
					console.log(colors.green(`Got timeline page, at ${results.length} items`));
					if (results.length > options.maxDownload) {
						resolve(results.slice(0, options.maxDownload));
					} else {
						if (j['data']['nextPage']) {
							__doUserRequest(j['data']['nextPage'])
						} else {
							resolve(results);
						}
					}
				});
			}
			__doUserRequest(1);
		});
	}

	function _writeFile(url, savePath) {
		return new Prom((yes, no) => {
			if (!fs.existsSync(savePath)) {
				console.log(colors.yellow(`Starting ${url} -> ${savePath}`));
				var stream = fs.createWriteStream(savePath);
				stream.on('finish', () => {
					console.log(colors.green(`\t Success! ${savePath}`));
					yes(savePath)
				});
				request({ url: url, header: HEADERS }).pipe(stream);
			}else{
				yes(savePath)
			}
		})
	}

	function downloadTimeline(userId, downloadDir = __dirname, options = {}) {
		options = Object.assign({},DEFAULTS, options)
		var vineUrl = BASE + 'timelines/users/' + userId;
		return _getVineData(vineUrl, options)
			.then((rawVineData) => {
				console.log(colors.green(`Got timeline of ${rawVineData.length} posts`));
				return Prom.map(rawVineData, (vinePost => {
						let { videoUrl, created } = vinePost
						created = moment(created).unix()
						console.log(created);
						let postId = vinePost.postId.toString()
						let savePath = path.join(downloadDir, `${created}_${postId}.mp4`)
						return _writeFile(videoUrl, savePath)
					}), { concurrency: 1 })
					.then(downlaodedPaths => {
						return { rawVineData: rawVineData, downlaodedPaths: downlaodedPaths }
					})
			});
	}

	return {
		downloadTimeline: downloadTimeline
	}
})();

module.exports = DL;
