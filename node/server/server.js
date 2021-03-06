var crypto = require('crypto');
var md5 = require('MD5');
var mysql = require('mysql');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = [];
var names = [];

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : null,
  database : 'chat'
});

connection.connect();

app.get('/', function(req, res){
  res.sendfile('index.html');
});

function get(name){
    var cc = [];
    var a = 0;
    do{
    if(name == names[a]){
    cc.push(a);
    }
    a++;
    }while(a<names.length);
    
    return cc;
}

function getNames(){
var uniqueNames = {};
    var a = 0;
    var nn = [];
    
    do{
    if(uniqueNames[names[a]] == null){
    uniqueNames[names[a]] = 1;
    nn.push(names[a]);    
    }
    a++;
    }while(a<names.length);
    
    return nn;
}

function sameUsers(n){
    var a = 0;
    var b = 0;
    
    do{
    if(n==names[b]){
        a++;
    }
        b++;
    }while(b<names.length);
    
    return a;
}

function deleteSoc(soc, n){
    var a = 0;
    do{
        if(soc == clients[a]){
            names.splice(a, 1);
            clients.splice(a, 1); 
            break;
        }
        a++;
    }while(a<clients.length);
    
    if(sameUsers(n) == 0){
    io.emit("disconnected", n);
    }
}

io.on('connection', function(socket, name){
    
    var handshakeData = socket.request;
    name = handshakeData._query['name'];
    var code = handshakeData._query['code'];
    
    var hash = md5(code);
    
    connection.query('SELECT Nickname, NodeCode FROM user WHERE Nickname = \''+name+'\' AND NodeCode = \''+hash+'\';', function(err, rows, fields) {
    if (!err){
        if(rows.length > 0){
            if(name == rows[0].Nickname && rows[0].NodeCode.length > 2){
                socket.emit("status", "connected");
            }else{
                socket.disconnect();
            }
        }else{
            socket.disconnect();
        }
    }else{
        socket.disconnect();
    }
    });
    
    clients.push(socket);
    names.push(name);
            
    if(get(name).length==1){
        io.emit("connected", name);
    }else{
        socket.emit("multimode", 1);
    }
    
    socket.emit("connectedUsers", getNames());
        
    socket.on('disconnect', function(){ 
    deleteSoc(socket, name);      
    });
    
    socket.on('seen', function(to){ 
    if(sameUsers(to) > 0){
            var gd = get(to);
            var a = 0;
                do{
                    clients[gd[a]].emit("seen", name);
                    a++;
                }while(a<gd.length);
        }else{
            socket.emit("response", "scollegato");
        }
    });
    
    socket.on('to', function(to){
          if(sameUsers(to) > 0){
            var gd = get(to);
            var a = 0;
                do{
                    clients[gd[a]].emit("from", name);
                    a++;
                }while(a<gd.length);
        }else{
            socket.emit("response", "scollegato");
        }
    });
    
    socket.on('typing', function(to){
        if(sameUsers(to) > 0){
            var gd = get(to);
            var a = 0;
                do{
                    clients[gd[a]].emit("typing", name);
                    a++;
                }while(a<gd.length);
        }else{
            socket.emit("response", "scollegato");
        }
    });
    
});

http.listen(3000, function(){
console.log("listening");
});
