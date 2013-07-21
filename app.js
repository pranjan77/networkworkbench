
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/index')
  , http = require('http')
  , path = require('path');

var app = express();

// Upload related stuff

var fs = require('fs'),
    mkdirp = require('mkdirp');

// Directories for uploaded files
var publicFolder = '/public/';
var uploadFolder = 'uploads';
if (!fs.existsSync(__dirname + publicFolder + uploadFolder )) mkdirp.sync(__dirname + publicFolder + uploadFolder);

var tmpUpload = '/public/uploads/tmp/';
if (!fs.existsSync(__dirname + tmpUpload)) mkdirp.sync(__dirname + tmpUpload);

var uploadDirBase = '/public/uploads/actual/';
if (!fs.existsSync(__dirname + uploadDirBase)) mkdirp.sync(__dirname + uploadDirBase);

var aweInput = '/public/AWEInputs/';
if (!fs.existsSync(__dirname + aweInput)) mkdirp.sync(__dirname + aweInput);

// all environments
app.set('port', process.env.PORT || 80);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('your secret here'));
app.use(express.session({key: 'express.sid'}));
app.use(express.bodyParser({
	uploadDir: __dirname + tmpUpload,
	keepExtensions: true
}));
app.use(express.methodOverride());
app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

uploadHandler = function( req, res, next ) {
  var fileObj = req.files.file;
  var tmpPath = fileObj.path;
  var targetPath = __dirname + uploadDirBase + req.sessionID;

  if (!fs.existsSync(targetPath)) {
    mkdirp.sync(targetPath);
  }
  var targetFile = __dirname + uploadDirBase + req.sessionID + '/' + fileObj.name;
  var attributeFile = __dirname + uploadDirBase + req.sessionID + '/' + fileObj.name + '.attrib';
  var DBPATH = '/' + uploadFolder + '/actual/' + req.sessionID + '/' + fileObj.name;
  var DBNAME = fileObj.name;
  res.locals.DBPATH = DBPATH;
  res.locals.DBNAME = DBNAME;
  res.locals.ATTRIB = attributeFile;
  res.locals.TARGET = targetFile;

  fs.rename(tmpPath, targetFile, function(err) {
    if (err) next(err);
    fs.unlink(tmpPath, function() {
      if (err) throw err;
        next();
    });
  });
};

auth = function(req, res, next) {

	if (req.session.authenticated == null ||  
			req.session.authenticated == undefined ||  
			req.session.authenticated == false ) { 

		req.session.authenticated = true;
		var now = new Date();

		var experiment = {
			sessionId : req.sessionID,
			userName : '',
			userGlobusToken: '',
			startTime : now,
			step1 : {
				email : '',
				expTable: {
					fileName: '',
					attributes:{},
					shockId: ''
				},
				sampleId: {
					fileName: '',
					attributes:{},
					shockId: ''
				},
				geneAnno: {
					fileName: '',
					attributes:{},
					shockId: ''
				}
			},
			step2 : {
				execurationStarted: false,
				startTime : null,
				status: '',
				notificationSent : false,
				AWEJob: null,
				AWEInput: {
					fileName: '',
					attributes:{},
					shockId: ''
				},
				visited: false
			},
			step3 : {
				status: 'not started',
				visited: false,
				refreshCount: 0,
				sessionId: req.sessionID
			},
			step4 : {
				execurationResult: false,
				notificationSent : false,
				endTime : null,
				visited: false
			},
			step5 : {
				downloadFile: '',
				downloadFileURL: '',
				visited: false
			}
		};
		req.session.data = experiment;
		res.locals.session = req.session;
		next();
	} else {
		res.locals.session = req.session;
		next();
	}

};

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/nw/step1', auth,  routes.nwStep1);
app.get('/nw/step2',  routes.nwStep2);
app.get('/nw/step3',  routes.nwStep3);
app.get('/nw/step4',  routes.nwStep4);

app.post('/uploadFileAction', auth, uploadHandler, routes.uploadFileAction);
app.post('/updateEmail', auth, routes.updateEmail);
app.post('/submitJob', auth, routes.submitJob);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
