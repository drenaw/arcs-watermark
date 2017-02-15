var express = require('express');
var app = express();
var handlebars = require('express3-handlebars')
  .create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
var multer = require('multer');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
var gm = require('gm');
var fs = require('fs');
var filenameFinal='';

app.set('port', (process.env.PORT || 5000));

var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null,__dirname + '/public/check/uploads/');
  },
  filename: function (request, file, callback) {
    console.log(file);
    filenameFinal = file.originalname;
    callback(null, "img.jpeg");
  }
});

app.use(express.static(__dirname + '/public'));
var upload = multer({storage: storage}).array('photo', 1);

app.get('/', function (req, res){
  res.render('home');
});

app.post('/upload',function(request, response) {
  upload(request, response, function(err) {
    if(err) {
    	console.log('Error Occured' + err);
        return;
    }
    console.log(request.files);
		//>>>>>>> Operation First
		gm(__dirname + '/public/check/uploads/img.jpeg')
		.resize('1024','1024','^')
		.gravity('Center')
		.crop('1024','1024')
		.write(__dirname + '/public/check/uploads/resized.jpeg', function(err){
			if(err)console.log(err);
			fs.stat(__dirname + '/fnal.jpg', function (err, stats) {
   			if (err) {return console.error(err);}
   			fs.unlink(__dirname + '/fnal.jpg',function(err){
        	if(err) return console.log(err);
        	console.log('file deleted successfully');
   			}); 
			});
			var writeStream = fs.createWriteStream(__dirname + '/fnal.jpg')
				gm()
					.in('-page','+0+0')
					.in(__dirname + '/public/check/uploads/resized.jpeg')
					.in('-page','+0+0')
					.in(__dirname + '/public/check/uploads/dp.png')
					.mosaic()
					.write('fnal.jpg',function(err){if(err)console.log(err);response.redirect('/done');}
					);
    		console.log('Photo Editing');
		});
		//>>>>>>> Function To calculate width
		/*function processImage(url, callback) {
	 		var img = gm(url);
			var width, height;
			img.size(function(err, val) {
    		width = val.width;
		    height = val.height;
				callback(err, width, height);
  		});
		};*/
		//>>>>>>>> Functions on Callback 
		/*processImage(__dirname + '/public/check/uploads/resized.jpeg', function(err, width, height) {
			fs.stat(__dirname + '/fnal.jpg', function (err, stats) {
   			if (err) {return console.error(err);}
   			fs.unlink(__dirname + '/fnal.jpg',function(err){
        	if(err) return console.log(err);
        	console.log('file deleted successfully');
   			});
			});
			var writeStream = fs.createWriteStream(__dirname + '/fnal.jpg')
			if (width == 1024){
				gm()
					.in('-page','+0+0')
					.in(__dirname + '/public/check/uploads/resized.jpeg')
					.in('-page','+0+0')
					.in(__dirname + '/public/check/uploads/dp.png')
					.mosaic()
					.write('fnal.jpg',function(err){if(err)console.log(err);response.redirect('/done');}
					);
    		console.log('Photo Editing');
			}
		});*/
  });
});

app.get('/done',function(req,res){
	var stat = fs.statSync(__dirname + '/fnal.jpg',function(err,status){
		var readStream = fs.createReadStream(__dirname + '/fnal.jpg');
	fs.stat(__dirname + '/fnal.jpg', function (err, stats) {
   	if (err) {return console.error(err);}
			 readStream.pipe(res);
		});
	});
	res.writeHead(200, {
        'Content-Type': 'image/jpg',
        'Content-Length': stat.size
  });
  var readStream = fs.createReadStream(__dirname + '/fnal.jpg');
	fs.stat(__dirname + '/fnal.jpg', function (err, stats) {
   	if (err) {return console.error(err);}
			 readStream.pipe(res);
		})
});

// 404 catch-all handler (middleware)
app.use(function(req, res, next){
  res.status(404);
  res.render('404');
});
// 500 error handler (middleware)
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
