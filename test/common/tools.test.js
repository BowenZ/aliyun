var should = require('should'),
	tools = require('../../common/tools');

describe('test/common/tools.test.js', function() {
    it('should format date', function() {
    	console.log(tools.formatDate(new Date('2014-09-09'), true));
        tools.formatDate(new Date(0)).should.match(/1970\-01\-01 0\d:00/);
    });
    it('should format date friendly', function() {
    	console.log(tools.formatDate(new Date(), true));
        tools.formatDate(new Date(), true).should.equal('几秒前');
    });
});
