
var fs = require('fs');
var rest = require('restler');
var dateFormat = require('dateformat');
var SHOCK = require('node-shock');
var _	= require('underscore');

// Constants take it from config later
var url = 'http://140.221.84.236:8000/node';
var un = 'gpuser';
var ps = 'bescdemo';

exports.index = function(req, res){
	res.render("index", { title: "Networks Workbench", js: "network/main" });
};

exports.uploadFileAction = function(req, res){

	var session = res.locals.session;
	var experiment = session.data;
	var sessionId = experiment.sessionId;

	experiment.step1[req.body.type].fileName = res.locals.DBNAME;
	var file = res.locals.TARGET;

	var shock = new SHOCK( url, un, ps, file);

	shock.addAttributesSync( 'sessionId', sessionId);
	_.extend( experiment.step1[req.body.type].attributes, {'sessionId': sessionId});

	shock.addAttributesSync( 'fileType', req.body.type);
	_.extend( experiment.step1[req.body.type].attributes, {'fileType': req.body.type});

	shock.addAttributesSync( 'experimentType', 'coexpression');
	_.extend( experiment.step1[req.body.type].attributes, {'experimentType': 'coexpression'});

	shock.sendFile(function(err, result) {
		if (err) {
			console.log(err);
		} else {
			experiment.step1[req.body.type].shockId = result.data.id;
			req.session.data = experiment;
			console.dir(experiment);
			res.send(200, result);
		}
	});

	/*
	if ( req.body.type === 'expTable') {

		experiment.step1.expTable.fileName = res.locals.DBNAME;
		var file = res.locals.TARGET;

		var shock = new SHOCK( url, un, ps, file);

		shock.addAttributesSync( 'sessionId', sessionId);
		_.extend( experiment.step1.expTable.attributes, {'sessionId': sessionId});

		shock.addAttributesSync( 'fileType', req.body.type);
		_.extend( experiment.step1.expTable.attributes, {'fileType': req.body.type});

		shock.addAttributesSync( 'experimentType', 'coexpression');
		_.extend( experiment.step1.expTable.attributes, {'experimentType': 'coexpression'});

		shock.sendFile(function(err, result) {
			if (err) {
				console.log(err);
			} else {
				experiment.step1.expTable.shockId = result.data.id;
				req.session.data = experiment;
				console.dir(experiment);
				res.send(200, result);
			}
		});

	} else if (req.body.type === 'sampleId' ) {
		experiment.step1.sampleId.fileName = res.locals.DBNAME;
		var file = res.locals.TARGET;

		var shock = new SHOCK( url, un, ps, file);
		shock.addAttributesSync( 'sessionId', sessionId);
		_.extend( experiment.step1.expTable.attributes, {'sessionId': sessionId});

		shock.addAttributesSync( 'fileType', req.body.type);
		_.extend( experiment.step1.expTable.attributes, {'fileType': req.body.type});

		shock.addAttributesSync( 'experimentType', 'coexpression');
		_.extend( experiment.step1.expTable.attributes, {'experimentType': 'coexpression'});

		shock.sendFile(function(err, result) {
			if (err) {
				console.log(err);
			} else {
				experiment.step1.sampleId.shockId = result.data.id;
				req.session.data = experiment;
				console.dir(experiment);
				res.send(200, result);
			}
		});

	} else if (req.body.type === 'geneAnno' ) {
		experiment.step1.geneAnno.fileName = res.locals.DBNAME;
		var file = res.locals.TARGET;

		var shock = new SHOCK( url, un, ps, file);
		shock.addAttributesSync( 'sessionId', sessionId);
		shock.addAttributesSync( 'fileType', req.body.type);
		shock.addAttributesSync( 'experimentType', 'coexpression');

		shock.sendFile(function(err, result) {
			if (err) {
				console.log(err);
			} else {
				experiment.step1.geneAnno.shockId = result.data.id;
				req.session.data = experiment;
				console.dir(experiment);
				res.send(200, result);
			}
		});


	}
*/



	/*
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
		if ( req.body.type === 'expTable') {
			experiment.step1.expTable.fileName

		} else if (req.body.type === 'sampleId' ) {

		} else if (req.body.type === 'geneAnno' ) {

		}
		res.send(200, data);
	});
	*/

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


