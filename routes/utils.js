var express = require('express');
var router = express.Router();
var request = require('request'),
	cheerio = require('cheerio');

router.get('/kuaidi', function(req, res, next) {
	var url = 'http://wap.kuaidi100.com/wap_result.jsp?rand=20120517&fromWeb=null' + '&id=' + req.query.id + '&postid=' + req.query.postid;
	request(url, function(error, response, data){
		if(!error && response.statusCode == 200){
			var $ = cheerio.load(data);
			$('form div.clear').last().next('p').prevAll().remove();
			if(req.query.callback){
				return res.jsonp($('form').html());
			}
			return res.send($('form').html());
		}
		res.send('error');
	});
});

module.exports = router;