
var SHOCK = require('../lib');
var fs = require('fs');

var url = 'http://140.221.84.236:8000/node';

var un = 'gpuser';
var ps = 'bescdemo';

var file = __dirname + '/test1';
var id = null;

var sendFile = function() {

	var shock = new SHOCK( url, un, ps, file);
	shock.addAttributesSync( 'guru', 'ranjan');
	shock.sendFile(function(err, result) {
		if (err) {
			console.log(err);
		} else {
			id = result.data.id;
			console.dir(result);

		}
	});
};

var getAttrib = function() {
	var id = '2016b977-6a7c-470c-8fec-0c96559bb65c';

	var shock2 = new SHOCK( url, un, ps );
	shock2.getAttributes(id, function(error, attrib) {
		if (error) {
			console.dir(error);
		} else {
			console.dir(attrib);
		}

	});
};

var getFile = function() {

	var id = '2016b977-6a7c-470c-8fec-0c96559bb65c';

	var shock3 = new SHOCK( url, un, ps );
	shock3.getFile(id, function(error, file) {
		if (error) {
			console.dir(error);
		} else {
			console.dir(file);
		}
	});
};

var getIds = function() {
	var key = 'module';
	var value = '89';

	var shock4 = new SHOCK( url, un, ps );
	shock4.query(key, value, function(error, data) {
		if (error) {
			console.dir(error);
		} else {
			console.dir(data);
		}
	});
};

setTimeout( sendFile, 600 );
//setTimeout( getAttrib, 1000 );
//setTimeout( getIds, 1000 );
//setTimeout( getFile, 1000 );
