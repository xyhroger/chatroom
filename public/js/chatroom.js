/**
 * Created by apple on 1/20/17.
 */
$(document).ready(function() {

    var socket = io.connect();

    $('form').submit(function() {
        socket.emit('chat message', {'time' : timeStamp(), 'msg' :$('#m').val()});
        $('#m').val('');
        return false;
    });

    socket.on('chat record', function(result) {
        for (i = 0; i < result.length; i++) {
            printMsg(result[i].content);
        }
    });

    socket.on('online', function(msg){
        $('#messages').append($('<li class="list-group-item list-group-item-success">').text(msg));
    });

    socket.on('offline', function(msg){
        $('#messages').append($('<li class="list-group-item list-group-item-danger">').text(msg));
    });

    socket.on('chat message', function(msg) {
        printMsg(msg);
    });


    function timeStamp() {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hour = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();
        var tmp = [month, day, year, hour, min, sec];
        for (i = 0; i < tmp.length; i++){
            if (tmp[i] < 10){
                tmp[i] = '0' + tmp[i];
            }
        }
        var time = ' ' + '(' + tmp[3] + ':' + tmp[4] + ':' + tmp[5] + ' ' + tmp[0] + '/' + tmp[1] + '/' + tmp[2] + ')';
        return time;
    }

    function printMsg(msg) {
        $('#messages').append($('<li class="list-group-item list-group-item-info"><div>'
            + msg['user'] + msg['time'] + ":" + '</div><div><span class="content">'
            + msg['msg'] + '</span></div></li>'));
    }

});