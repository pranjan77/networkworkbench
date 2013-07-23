var _			= require('underscore');
var request		= require('request');
var fs			= require('fs');
var 

SHOCK = function( url, user, password, file) {

	if ( typeof(file) == 'undefined' ) file = null;

	this.url = url;
	this.username = user;
	this.password = password;
	this.filename = file;
	this.attribFilename = __dirname + '/attrib' + _.random(123433);
	console.log(this.attribFilename);
	this.shockId = null;
	this.authToken = null;
	this.attributes = {};
};

SHOCK.prototype.sendFile = function( callback ) {
	if ( this.filename == null || 
		 this.url == null ||
		 this.url == undefined ) {

		callback('Error: Required is missing', null);
	}

	var fd = fs.openSync(this.attribFilename, 'w', 0666);
	fs.writeSync(fd, JSON.stringify(this.attributes) );
	fs.closeSync(fd);

	var r = request.post({ 
		'url': this.url /*, 
		'auth': {
		    'user': this.username,
		    'pass': this.password,
		    'sendImmediately': false
		  } */
		},function( error, response, body ) {
			if ( error ) {
				callback( error, null);
			} else {
				if(response.statusCode == 200){
					callback( null, JSON.parse(body));
				} else {
					callback('error: '+ response.statusCode, null)
				}
			}
	
	});

	var form = r.form();
	form.append('upload', fs.createReadStream(this.filename));
	form.append('attributes', fs.createReadStream(this.attribFilename));
	form.timeout = 10000;

}

SHOCK.prototype.getFile = function( id, callback ) {
	var url = this.url + '/' + id + '?download';
	this.shockId = id;

	request.get({
		'url': url /*, 
		'auth': {
		    'user': this.username,
		    'pass': this.password,
		    'sendImmediately': false
		  }
			*/	
		}, function(error, response, body) {
			if (error) {
				callback(error, null);
			} else {
				if(response.statusCode == 200){
					callback( null, JSON.parse(body));
				} else {
					callback('error: '+ response.statusCode, null)
				}
			}
	});

}

SHOCK.prototype.getAttributes = function( id, callback ) {
	var url = this.url + '/' + id;
	this.shockId = id;

	request.get({
		'url': url /*, 
		'auth': {
		    'user': this.username,
		    'pass': this.password,
		    'sendImmediately': false
		  }
			*/	
		}, function(error, response, body) {
			if (error) {
				callback(error, null);
			} else {
				if(response.statusCode == 200){
					callback( null, JSON.parse(body));
				} else {
					callback('error: '+ response.statusCode, null)
				}
			}
	});

}

SHOCK.prototype.setId = function( id, callback ) {
	this.shockId = id;
}

SHOCK.prototype.setFile = function( file, callback ) {
	this.filename = file;
}

SHOCK.prototype.query = function( key, value, callback ) {
	var url = this.url + '/?query&' + key + '=' + value;

	request.get({
		'url': url /*, 
		'auth': {
		    'user': this.username,
		    'pass': this.password,
		    'sendImmediately': false
		  }
		  */
	
		}, function(error, response, body) {
			if (error) {
				callback(error, null);
			} else {
				if(response.statusCode == 200){
					callback( null, JSON.parse(body));
				} else {
					callback('error: '+ response.statusCode, null)
				}
			}
	});
}

SHOCK.prototype.addAttributesSync = function( key, value ) {
	//_.extend(this.attributes, {key:value});
	this.attributes['' + key] = value;
}

SHOCK.prototype.addAttributes = function( key, value, callback) {
	this.attributes['' + key] = value;
	callback();
}

module.exports = module.exports.SHOCK = SHOCK;


