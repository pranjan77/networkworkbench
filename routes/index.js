
var fs = require('fs');
var rest = require('restler');
var dateFormat = require('dateformat');

exports.index = function(req, res){
	res.render("index", { title: "Networks Workbench", js: "network/main" });
};

exports.uploadFileAction = function(req, res){

	var url = 'http://140.221.84.236:8000/node';
	var un = 'kbasetest';
	var ps = '@Suite525';

	var session = res.locals.session;
	var experiment = session.data;
	var sessionId = experiment.sessionId;

	var attributes = {};
	attributes.experiment_type = 'coexpression';
	attributes.experiment_id = sessionId;
	attributes.filetype = 'expressionTable';

	var fd = fs.openSync(res.locals.ATTRIB, 'a+', 0666);
	fs.writeSync(fd, JSON.stringify(attributes));
	fs.closeSync(fd);

	rest.post(url, {
		multipart: true,
		username: un,
		password: ps,
		data: {
			'attributes': rest.file(res.locals.ATTRIB),
		'upload': rest.file(res.locals.TARGET)
		}
	}).on('complete', function(data) {
		console.dir(data);
		res.send(200, req.files);
	});

};

exports.nwStep1 = function (req, res) {
	res.render("networkStep", { step: 1 });
};

exports.nwStep2 = function (req, res) {
	res.render("networkStep", { step: 2 });
};

exports.nwStep3 = function (req, res) {
	res.render("networkStep", { step: 3 });
};

exports.nwStep4 = function (req, res) {
	res.render("networkStep", { step: 4 });
};


