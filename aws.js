const AWS = require('aws-sdk');
var fs =  require('fs');

const aws = async () => {
	try {
		await AWS.config.update({
			accessKeyId: 'AKIAILH5LVLLYIKPBKUQ',
			secretAccessKey: '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',
			region: 'ap-south-1'
		});
		var s3 = new AWS.S3();
		var myBucket = 'chatbucket007';
		var myKey = 'kerala';
		params = { Bucket: myBucket, Key: myKey, Body: 'Valueeee or some data', ACL: 'public-read' };
		s3.putObject(params, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				console.log('Successfully uploaded data to myBucket/myKey');
			}
		});
	} catch (error) {
		console.log(error);
	}
};




aws();
