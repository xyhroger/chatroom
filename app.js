/**
 * Created by apple on 1/15/17.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userList = {};
var userName;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

http.listen(3000, function() {
    console.log('listening on *:3000');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/views/chatroom.html');
});

app.post('/', function (req, res) {
    userName =  req.body.name;
    res.redirect('/login');
});

var mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://localhost:27017/chatRecord3', function (err, db) {
    if (err) {
        console.log('Error:' + err);
    }
    io.on('connection', function(socket){
        userList[socket.id] = userName;
        console.log(userList[socket.id] + ' connected');
        io.emit('online', userList[socket.id] + ' is online.');

        var collection = db.collection('chatRecord');
        collection.find().toArray(function(err, result) {
            if (err) {
                console.log('error:' + err);
            } else {
                socket.emit('chat record', result);
            }
        });

        socket.on('chat message', function(msg){
            msg['user'] = userList[socket.id];
            collection.insert({ content:  msg }, function(err) {
                if (err) {
                    console.warn(err.message);
                }
                else {
                    console.log("chat message inserted into db: " + JSON.stringify(msg));
                }
            });
            io.emit('chat message', msg);

        });
        socket.on('disconnect', function(){
            console.log(userList[socket.id] + ' disconnected');
            io.emit('offline', userList[socket.id] + ' is offline.');
        });

    });
});


// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;


