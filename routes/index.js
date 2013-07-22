
var fs = require('fs');
var rest = require('restler');
var dateFormat = require('dateformat');
var SHOCK = require('node-shock');
var AWE = require('node-awe');
var _	= require('underscore');
var template = (__dirname + '/template');

// Constants for SHOCK take it from config later
var url = 'http://140.221.84.236:8000/node';
var un = 'gpuser';
var ps = 'bescdemo';

// Constants for AWE take it from config later
var url2 = 'http://140.221.84.236:8001/job';

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
			res.send(500);
		} else {
			experiment.step1[req.body.type].shockId = result.data.id;
			req.session.data = experiment;
			//console.dir(experiment);
			res.send(200, result);
		}
	});

};

exports.updateEmail = function(req, res){

	var session = res.locals.session;
	var experiment = session.data;
	var sessionId = experiment.sessionId;

	experiment.step1.email = req.body.email;
	req.session.data = experiment;
	//console.dir(experiment);
	res.send(200);

};

exports.submitJob = function(req, res) {

	var session = res.locals.session;
	var experiment = session.data;
	var sessionId = experiment.sessionId;

	var outputfile = __dirname + '/../public/AWEInputs/' + _.random(234234) + 'jobInput.json';
	experiment.step2.startTime = new Date();
	experiment.step2.AWEInput.fileName = outputfile;

	prepareAWEInput( experiment, outputfile );

	var shock = new SHOCK( url, un, ps, outputfile);

	shock.addAttributesSync( 'sessionId', sessionId);
	_.extend( experiment.step2.AWEInput.attributes, {'sessionId': sessionId});

	shock.addAttributesSync( 'fileType', 'AWEJobInput');
	_.extend( experiment.step2.AWEInput.attributes, {'fileType': 'AWEJobInput'});

	shock.addAttributesSync( 'experimentType', 'coexpression');
	_.extend( experiment.step2.AWEInput.attributes, {'experimentType': 'coexpression'});

	shock.sendFile(function(error, result2) {
		if (error) {
			console.log(error);
			res.send(500);
		} else {
			experiment.step2.AWEInput.shockId = result2.data.id;
			req.session.data = experiment;
			console.dir(experiment);
			res.send(200, result2);

			var awe = new AWE( url2, outputfile);
			awe.submitJob(function(err, result) {
				if (err) {
					console.log(err);
					res.send(500, null);
				} else {
					console.dir(result);
					experiment.step2.AWEJob = result.data;
					experiment.step2.execurationStarted = true;
					experiment.step2.status = result.data.state;
					experiment.step3.status = result.data.state;
					experiment.step3.visited = true;
					req.session.data = experiment;
					console.dir(experiment);
					res.send(200, result);
				}
			});
		}
	});

}

var prepareAWEInput = function(experiment, outputfile) {
	var contents = fs.readFileSync(template);

	var aweInput = JSON.parse(contents);

	//Variables in the AWE Input

	aweInput.info.sessionId 	= experiment.sessionId;
	aweInput.info.pipeline 		= 'coexPipeline';
	aweInput.info.name 			= 'xyz';


	// Input 1
	var p = '0.05', 
		m = 'anova',
		u = 'n',
		r = 'y',
		sample_index = '@sample_id_csv',
		d = 'y';

	var task0Args = '-i @data_csv --output=data_filtered_csv -m ' + m +
					' -p ' + p  + 
					' --sample_index ' + sample_index  + 
					' -u ' + u + 
					' -r ' + r + 
					' -d ' + d ; 
	aweInput.tasks[0].cmd.args  = task0Args;

	aweInput.tasks[0].inputs.data_csv.node = experiment.step1.expTable.shockId;
	aweInput.tasks[0].inputs.sample_id_csv.node = experiment.step1.sampleId.shockId;

	// End of Input 1


	// Input 2
	var c2 = '0.75', 
		r2 = '0.8',
		k2 = 'n',
		p2 = 'y';

	var task2Args = '-i @data_filtered_csv -o net_edge_csv -m simple -t edge ' + 
					' -c ' + c2  + 
					' -r ' + r2  + 
					' -k ' + k2  + 
					' -p ' + p2;
	aweInput.tasks[1].cmd.args  = task2Args;
	// End of Input 2


	// Input 3

	var s3 = '100', 
		r3 = '0.8',
		k3 = '40',
		p3 = '50',
		d3 = '0.99';

	var task3Args = '--i @data_filtered_csv -o module_csv -c hclust -n simple ' + 
					' -s ' + s3  + 
					' -d ' + d3  + 
					' -r ' + r3  + 
					' -k ' + k3  + 
					' -p ' + p3;
	aweInput.tasks[2].cmd.args  = task3Args;
	// End of Input 3


	// Input 4

	var s4 = experiment.sessionId; //Give sessionId
	var u4 = url; //Give sessionId

	var task4Args = ' -m @module_csv -e @net_edge_csv -a @annotation_csv -o merged_list_json ' + 
					' -s ' + s4  + 
					' -u ' + u4  ; 
	aweInput.tasks[3].cmd.args  = task4Args;

	// shock Id of Samples.
	aweInput.tasks[3].inputs.annotation_csv.node = experiment.step1.geneAnno.shockId;
	// End of Input 4


	//console.dir(aweInput);

	var fd = fs.openSync(outputfile, 'w', 0666);
	fs.writeSync(fd, JSON.stringify(aweInput) +  '\n');
	fs.closeSync(fd);

	console.log('Job input written');

}

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


