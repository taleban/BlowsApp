var publickey;  //la chiave pubblica RSA che viene ricevuta dal server
var blowfish;   //la sessione blowfish inizializzata (una per sessione)
var username;
var password;
var div;
var div_chat;
var destination_id;
var destination;
var destination_encrypted;
var users = [];
var lastMessage = [];
var names = [];
var surnames = [];
var lastOnlines = [];
var timeGaps = [];
var logged;
var scrollbarPosition;
var from_store = [];
var messages_store = [];
var to_store = [];
var seen_store = [];
var date_store = [];
var syncro;
var printed;
var retrieved = [];
var image = [];
var connectedUsers = [];
var socket;
var deauth;
var counter;
var audio;
var audioseen;
var multi;
var alpha;
var seenRight;
var lastInternationale;
var tv;
var lastMessagePrinted;
var textBox;
var lastH = [];
var finalH;
var lastMessageUnseen;
var load;
var nodeCode;
var nodeAddress = "127.0.0.1:3000";
var loginLoaded;
var registrationLoaded;
var changepasswordLoaded;
var photoChangerLoaded;

function generateBlowfishKey(bit) {    //per generare la chiave blowfish da utilizzare per la sessione
    var byte = (bit / 8);
    var rbyte = wxfz.fortuna.generate(byte);    //utilizza l'algoritmo Fortuna

    return rbyte;
}

function hideLoadingMessage(){
    var a = load - 1;
    
    if(a >= 0){
        
    $("#load_"+a).css("display", "none");
    }
}

function showLoadingMessage(){
    div.innerHTML = '<img class="loader" id="load_'+load+'" src="Bootstrap/media/load.svg">' + div.innerHTML;
    load++;
}

function setupConnection() { //1° step ----- chiede la chiave pubblica RSA al server
    tv = 0;
    multi = 0;
    deauth = 0;
    logged = 0;
    seenRight = 0;
    load = 0;
    loginLoaded = 0;
    registrationLoaded = 0;
    changepasswordLoaded = 0;
    photoChangerLoaded = 0;
    lastH.push(0);
    textBox = document.getElementById('chat-textbox');
    getRsaKey();
    div = document.getElementById('chat-container');
    div_chat = document.getElementById('list-container');
    audio = new Audio('audio/mario.wav');
    audioseen = new Audio('audio/seen.wav');
}

function seenAck(){
$.post("seen.php", {to: destination_encrypted});
socket.emit('seen', destination);
}

function set_destinator(d) {
    scrollbarPosition = 1;
    destination_id = d;
    destination = users[d];
    destination_encrypted = encrypt_blowfish(destination);
    refreshName(d);
    counter = 6;
    lastMessagePrinted = 0;
    lastMessageUnseen = 0;
    load = 0;
    
    viewLastLogin(destination_id);
    if (retrieved[d] === undefined) {
        retrieved[d] = 1;
        div.innerHTML = "";
        retrieveMessage(0, destination, 1);
    } else {
        if (multi == 0) {
            printMessages(d, 10, 0);
            retrieveMessage(2, destination, 1);
        } else {
            retrieveMessage(6, destination, 1);
        }
    }
    
    textBox.focus();
}

function getChangePwdData(){
            var last = document.getElementById("lastPWD").value;
            var newp = document.getElementById("newPWD").value;
            var reNewp = document.getElementById("renewPWD").value;
            if(newp == reNewp){
                document.getElementById("newPWD").style.border = "transparent";
                document.getElementById("renewPWD").style.border = "transparent";
                document.getElementById("lastPWD").style.border = "transparent";
                
            $.getJSON("userFunction/changePassword.php", {
                password: cipher_rsa(last),
                newpassword: cipher_rsa(newp)
                }, function (result) {
                    $.each(result, function (i, field) {
                        if(field == "ok"){
                            password = newp;
                            hideModal();
                            dumpMemory();
                            setupConnection2(1);
                        }else{
                            document.getElementById("lastPWD").style.border = "thin solid #E50000";
                        }
                    });
                    });
                    
                
            }else{
                document.getElementById("newPWD").style.border = "thin solid #E50000";
                document.getElementById("renewPWD").style.border = "thin solid #E50000";
            }
            document.getElementById("lastPWD").value = null;
            document.getElementById("newPWD").value = null;
            document.getElementById("renewPWD").value = null;
}

function getLoginData(){
            username = document.getElementById("nome_utente_l").value;
            password = document.getElementById("pswrd_l").value;

            document.getElementById("nome_utente_l").value = null;
            document.getElementById("pswrd_l").value = null;
    
            return setupConnection2(1);
}

function getRegistrationData(){
            var nick = document.getElementById("nickname").value;
            var nome_utente = document.getElementById("nome_utente").value;
            var cognome_utente = document.getElementById("cognome_utente").value;
            var pswrd = document.getElementById("pswrd").value;
            var repswrd = document.getElementById("repswrd").value;
            var s1 = generateBlowfishKey(250);
    
            if(pswrd == repswrd){
            var session = generateBlowfishKey(250);

                $.getJSON("registration/registration.php", {nickname: cipher_rsa(nick),
                    name: cipher_rsa(nome_utente),
                    surname: cipher_rsa(cognome_utente),
                    password: cipher_rsa(pswrd),
                    session: cipher_rsa(s1)
                },
                function (result) {
                    $.each(result, function (i, field) {
                        if (field == "ok") {
                            dumpMemory();
                            savecookie(nick, s1);
                            hideModal();
                            setupConnection2(0);
                        } else if (field == "ko") {
                            deauthentication();
                        }

                    });

                });
                
            }else{
                
            }
            document.getElementById("nickname").value = null;
            document.getElementById("nome_utente").value = null;
            document.getElementById("cognome_utente").value = null;
            document.getElementById("pswrd").value = null;
            document.getElementById("repswrd").value = null;
}

function changepassword() {
    hideModal();
    if(users.length>0){
    if(registrationLoaded == 0){
        $.ajax({
        url:'userFunction/changePassword.html',
        success: function (data){
            document.getElementById("popChangePassword").innerHTML = data;
            $("#modalChangePassword").modal('show');
        }
      });
        registrationLoaded = 1;
    }else{
        $("#modalChangePassword").modal('show');
    }
    }
}

function changePhoto(){
    
    hideModal();
    if(users.length>0){
        $("#modalChangePhoto").modal('show');
    }
}

function modalOpened(){
    if($("#modalRegistration").hasClass('in')){
        return "registration";
    }else if($("#modalLogin").hasClass('in')){
        return "login";
    }else if($("#modalChangePassword").hasClass('in')){
        return "password";
    }else if($("#modalChangePhoto").hasClass('in')){
        return "photo";
    }else{
    return null;
    }
}

function hideModal(){
    if($("#modalRegistration").hasClass('in')){
        $("#modalRegistration").modal('hide');
    }
    if($("#modalLogin").hasClass('in')){
        $("#modalLogin").modal('hide');
    }
    if($("#modalChangePassword").hasClass('in')){
        $("#modalChangePassword").modal('hide');
    }
    if($("#modalChangePhoto").hasClass('in')){
        $("#modalChangePhoto").modal('hide');
    }
}

function registration() {
    hideModal();
    if(registrationLoaded == 0){
        $.ajax({
        url:'registration/Sign-Up.html',
        success: function (data){
            document.getElementById("popRegistration").innerHTML = data;
            $("#modalRegistration").modal('show');
        }
      });
        registrationLoaded = 1;
    }else{
        $("#modalRegistration").modal('show');
    }
}

function dumpMemory() {
    div_chat.innerHTML = "";
    users = [];
    lastMessage = [];
    names = [];
    surnames = [];
    lastOnlines = [];
    timeGaps = [];
    from_store = [];
    messages_store = [];
    to_store = [];
    retrieved = [];
    image = [];
    connectedUsers = [];
    counter = null;
    multi = 0;
    alpha = 0;
    c = [];

    if (typeof socket != 'undefined') {
        socket.disconnect();
    }
}

function deauthentication() {
    deauth = 1;

    div.innerHTML = "";
    div_chat.innerHTML = "";

    username = null;
    password = null;

    dumpMemory();

    savecookie(null, null);

    if (typeof socket != 'undefined') {
        socket.disconnect();
    }

    login();
}

function login(){
   hideModal();
   if(loginLoaded == 0){
        $.ajax({
        url:'userFunction/LogIn.html',
        success: function (data){
            document.getElementById("popLogin").innerHTML = data;
            $("#modalLogin").modal('show');
                $(function() {
                $("document").keypress(function (e) {
                    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
                        alert();
                        return false;
                    } else {
                        return true;
                    }
                });
            });
        }
      });
        loginLoaded = 1;
    }else{
        $("#modalLogin").modal('show');
    }
}

function makeNodeCode()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 32; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function setupConnection2(m) {    //ultima parte della preparazione della sessione
    
    nodeCode = makeNodeCode(); //generateBlowfishKey(32);
    var blowfish_key = generateBlowfishKey(255);   //crea la chiave blowfish
    var cipherkey = cipher_rsa(blowfish_key);   //cripta la chiave con l'rsa

    blowfish = new Blowfish(blowfish_key);      //creo la sessione con la chiave blowfish
    
    var c = [];
    var toSave = 0;
    if (deauth == 0) {
        if(m != 1){
            c = loadCredentials();
            
            if(c[0] == "null" || c[2] == "null"){
                login();
                toSave = 1;
                return;
            }
        }
    } else if(m == 0 && deauth == 1){
        login();
        toSave = 1;
        return;
    }
    
    if(m == 1){
            c[0] = username;
            c[1] = password;
            c[2] = generateBlowfishKey(250);
            c[3] = nodeCode;
            toSave = 1;
        }
    
    $.getJSON("handshake.php", {key: cipherkey,
        user: cipher_rsa(c[0]),
        password: cipher_rsa(c[1]),
        session: cipher_rsa(c[2]), 
        node: cipher_rsa(nodeCode)                                
    },
    function (result) {
        $.each(result, function (i, field) {
            if (field == "ok") {
                logged = 1;
                socketRealTime();
                if (toSave == 1) {
                    savecookie(c[0], c[2]);
                }
                hideModal();
                retrieveUsers();
                return true;
            } else if (field == "ko") {
                logged = -1;
                deauthentication();
                return false;
            }

        });

    });


}

function savecookie(username, session) {        //save the username and the password in a cookie
    document.cookie = "username=" + username + "; expires=01 Oct 2050 08:50:17 GMT";
    document.cookie = "password=" + btoa(session) + "; expires=01 Oct 2050 08:50:17 GMT";
}

function getcookie(cname) {  //automatic retriever of cookies by name
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }
    return null;
}

function getRsaKey() {          //write the publickey variable whit the publickey from server or cookie

    /*$.getJSON("getkey.php", null, function(result){
     $.each(result, function(i, field){  
     setPublicKey(field);       //sets the private key 
     });
     });*/

    setPublicKey("-----BEGIN PUBLIC KEY-----\n\MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALVKfitzSsZ7sFnMMI+FlXvVHiTYjvSC\n\h/tTHYtoL0XWLAZWJNfXXHeFotrn8tY9AJkjH/Ng06JvUDQWrNawIm0CAwEAAQ==\n\-----END PUBLIC KEY-----");

}

function setPublicKey(key) {    //sets the key
    publickey = key;
    setupConnection2(0);             //call second part of the setup connection
}

function loadCredentials() { //loads username and password from cookies (if exist)
    var value = [];
    value.push(getcookie("username"));
    value.push(null);
    value.push(atob(getcookie("password")));
    username = value[0];
    if (value[0] === null) {
        var v = [];
        v.push(null);

        return v;
    }
    return value;
}

function encrypt_blowfish(plaintext) {   //encrypt a message with blowfish
    // Encrypt and encode to base64
    plaintext += "/";
    var encrypted = blowfish.base64Encode(blowfish.encrypt(plaintext));
    return encrypted;
}

function decrypt_blowfish(encrypted1) {  //decrypt a message with blowfish
    var e1 = blowfish.base64Decode(encrypted1);
    var decrypted = blowfish.decrypt(e1);
    var a = 0;

    for (a = decrypted.length; a >= 0; a--) {   //split the message until "/" beacause the last values are nulls
        if (decrypted.charAt(a) == "/") {
            decrypted = decrypted.substring(0, a);
        }
    }

    return decrypted;
}

function cipher_rsa(plaintext) { //the rsa cipher that use the global publickey

    var params = certParser(publickey);
    var key = pidCryptUtil.decodeBase64(params.b64);

    // new RSA instance  
    var rsa = new pidCrypt.RSA();

    // ASN1 parsing  
    var asn = pidCrypt.ASN1.decode(pidCryptUtil.toByteArray(key));
    var tree = asn.toHexTree();

    // setting the public key for encryption with retrieved ASN.1 tree  
    rsa.setPublicKeyFromASN(tree);

    /*** encrypt */
    var crypted = rsa.encrypt(plaintext);
    var fromHex = pidCryptUtil.encodeBase64(pidCryptUtil.convertFromHex(crypted));
    var ciphertext = pidCryptUtil.fragment(fromHex, 64);
    return ciphertext;
    
}

function retrieveUsers() {
    var b = 0;

    $.getJSON("getUsers.php").success(function (result) {
        $.each(result, function (i, data) {    //get the message and who sent it to me
            var a = 0;
            if (b == 0) {
                a = 0;
                do {
                    users.push(decrypt_blowfish(data[a]));
                    a++;
                } while (data.length > a);
            } else if (b == 1) {
                a = 0;
                do {
                    names.push(decrypt_blowfish(data[a]));
                    a++;
                } while (data.length > a);
            } else if (b == 2) {
                a = 0;
                do {
                    surnames.push(decrypt_blowfish(data[a]));
                    a++;
                } while (data.length > a);
            } else if (b == 3) {
                a = 0;
                do {
                    image.push(data[a]);
                    a++;
                } while (data.length > a);
            }else if (b == 4) {
                a = 0;
                var l1;
                do {
                    l1 = decrypt_blowfish(data[a]);
                    l1 = l1.replace(" ", "T");
                    l1 = new Date(l1);
                    
                    lastOnlines.push(l1);
                    a++;
                } while (data.length > a);
            } else if (b == 5) {
                a = 0;
                do {
                    lastMessage.push(decrypt_blowfish(data[a]));
                    a++;
                } while (data.length > a);
            }
            
            b++;
        }
        );
        write_user();
    }).error(function (error) {
        console.log(error);
    });
}

function findInterlocutor(from, to) {
    if (from != username) {
        return from;
    } else {
        return to;
    }
}

function converter(id) {
    var a = 0;
    while (a < users.length) {
        if (id == users[a]) {
            return a;
        }
        a++;
    }
}

function retrieveMessage(c1, to1, refresh) { //get messagges from the server
    var a = -1;
    var from = [];
    var to = [];
    var message = [];
    var time = [];
    var seen = [];
    var toUpdate = [];
    var to1_id = destination_id;

    $.getJSON("getMessage.php", {type: encrypt_blowfish(c1), to: encrypt_blowfish(to1)}).success(function (result) {
        $.each(result, function (i, data) {    //get the message and who sent it to me
            if (data == "ko") {
                if(c1 == 7 && messages_store[to1_id][0] != null){
                    messages_store[to1_id].unshift(null);
                   }
            } else {
                if (c1 == 5) {
                    toUpdate.push(decrypt_blowfish(data));
                } else {
                    seenRight = 1;
                    a++;
                    if (a == 0) {
                        from.push(decrypt_blowfish(data));
                    } else if (a == 1) {
                        to.push(decrypt_blowfish(data));
                    } else if (a == 2) {
                        message.push(decrypt_blowfish(data));
                    } else if (a == 3) {
                         var l1 = decrypt_blowfish(data);
                         l1 = l1.replace(" ", "T");
                         l1 = new Date(l1);
                         time.push(l1);
                    } else if (a == 4) {
                        seen.push(decrypt_blowfish(data));
                        a = -1;
                    }
                }
            }
        });
        if ((c1 == 2)) {//da mettere
            var toAck = 0;
            if (message.length > 0 && message[0] != "") {
                var b = 0;
                do {
                    if(seen[b]==0 && from[b] != username){
                     toAck = 1;   
                    }
                    from_store[to1_id].push(from[b]);
                    to_store[to1_id].push(to[b]);
                    messages_store[to1_id].push(message[b]);
                    seen_store[to1_id].push(seen[b]);
                    date_store[to1_id].push(time[b]);
                    b++;
                } while (from.length > b);
                if (messages_store[to1_id][messages_store[to1_id].length - 1]) {
                    refreshLastMessage(messages_store[to1_id][messages_store[to1_id].length - 1], to1_id, 1);
                }
            }
            
            var a1 = 0;
            do{
                write_message(from[a1], to[a1], message[a1], seen[a1], time[a1], 0);
                a1++;
            }while(a1<from.length);
            
            if(toAck == 1){
             seenAck();   
            }
        } else if (c1 == 1) {
            from_store[to1_id] = from;
            to_store[to1_id] = to;
            messages_store[to1_id] = message
            seen_store[to1_id] = seen;
            date_store[to1_id] = time;
        } else if (c1 == 5 && toUpdate.length > 0) {
            update(toUpdate);
        } else if (c1 == 0) {//da mettere
            var toAck = 0;
            var b = 0;
            do {
                if(seen[b]==0 && from[b] != username){
                     toAck = 1;   
                    }
                from_store[to1_id].push(from[b]);
                to_store[to1_id].push(to[b]);
                messages_store[to1_id].push(message[b]);
                seen_store[to1_id].push(seen[b]);
                date_store[to1_id].push(time[b]);
                b++;
            } while (from.length > b);
            printMessages(to1_id, 10, 0);
            if (messages_store[to1_id][messages_store[to1_id].length - 1]) {
                refreshLastMessage(messages_store[to1_id][messages_store[to1_id].length - 1], to1_id, 0);
            }
            if(toAck == 1){
             seenAck();   
            }
        } else if (c1 == 6) {//da mettere
            var toAck = 0;
            if (message.length > 0 && message[0] != "") {
                var b = 0;
                do {
                    if(seen[b]==0 && from[b] != username){
                     toAck = 1;   
                    }
                    from_store[to1_id].push(from[b]);
                    to_store[to1_id].push(to[b]);
                    messages_store[to1_id].push(message[b]);
                    seen_store[to1_id].push(seen[b]);
                    date_store[to1_id].push(time[b]);
                    b++;
                } while (from.length > b);
                if (messages_store[to1_id][messages_store[to1_id].length - 1]) {
                    refreshLastMessage(messages_store[to1_id][messages_store[to1_id].length - 1], to1_id, 1);
                }
            }
            
            var a1 = 0;
            do{
                write_message(from[a1], to[a1], message[a1], seen[a1], time[a1], 0);
                a1++;
            }while(a1<from.length);
            if(toAck == 1){
             seenAck();   
            }
        }else if(c1 == 7){//da mettere
            var toAck = 0;
            var b = 0;
                do {
                    if(seen[b]==0 && from[b] != username){
                     toAck = 1;   
                    }
                    from_store[to1_id].unshift(from[b]);
                    to_store[to1_id].unshift(to[b]);
                    messages_store[to1_id].unshift(message[b]);
                    seen_store[to1_id].unshift(seen[b]);
                    date_store[to1_id].unshift(time[b]);
                    b++;
                } while (from.length > b);
            var a1 = from.length;
            do{
                write_message(from[a1], to[a1], message[a1], seen[a1], time[a1], 1);
                a1--;
            }while(a1>=0);
            if(toAck == 1){
             seenAck();   
            }
        }

    }).error(function (error) {
        console.log(error);
    });

}

function update(toUpdate) {
    var a = 0;
    do {
        retrieveMessage(2, toUpdate[a], 1);
        a++;
    } while (toUpdate.length > a);
}

function printMessages(id, limit, mode) {
    if (id == destination_id) {
        if(mode == 0){
        div.innerHTML = "";
        var b = 0;
        if (from_store[id][0] == destination || to_store[id][0] == destination) {
            div.innerHTML = "";
        }
        clearType();
        for (var a = (messages_store[id].length - limit); a < messages_store[id].length; a++) {
            write_message(from_store[id][a], to_store[id][a], messages_store[id][a], seen_store[id][a], date_store[id][a], 0);
        }
        if(seenRight == 1){
        seenAck();
        seenRight = 0;
        }
        }else{
        for (var a = (messages_store[id].length - limit); a > messages_store[id].length; a--) {
            write_message(from_store[id][a], to_store[id][a], messages_store[id][a], seen_store[id][a], date_store[id][a], 1);
        }
        }
    }
}

function refreshName(a) {
    var div_name = document.getElementById('name');
    div_name.innerHTML = names[a] + " " + surnames[a];
    document.getElementById("photo").src = image[a];
}

function setUserProfile(a) {
    var div_name = document.getElementById('username');
    div_name.innerHTML = "Ciao " + names[a] + "!";
    document.getElementById("userphoto").src = image[a];
}

function refreshLastMessage(last, a, type) {
    var div_last = document.getElementById('usr_' + a);
    if (last != null) {
        if (last.length > 20) {
            var p = "...";
        } else {
            p = "";
        }
        if (type == 1) {
            div_last.innerHTML = "<i><b>" + last.substr(0, 20) + p + "</b></i>";
            audio.play();

        } else if (type == 0) {
            div_last.innerHTML = last.substr(0, 20) + p;
        }
    }

}

function sendMessage(message1, destination1) { //send message to server

    $.post("sendMessage.php", {message: encrypt_blowfish(message1), destination: destination_encrypted}).done(function () {
        socket.emit('to', destination1);
    }).fail(function (error) {
        alert("messaggio non inviato: " + error);
    });

}

function write_user() {
    var a = 0;
    do {
        from_store[a] = new Array();
        messages_store[a] = new Array();
        to_store[a] = new Array();
        seen_store[a] = new Array();
        date_store[a] = new Array();
        
        if (users[a] == username) {
            setUserProfile(a);
        } else {
            if (lastMessage[a].length > 20) {
                var p = "...";
            } else {
                p = "";
            }
            div_chat.innerHTML = div_chat.innerHTML +
                    '<a href="#" onclick=set_destinator(' + a + '); class="list-group-item">\
                            <img class="profile-pic" src="' + image[a] + '">\
                            <div class="profile-indicator hidden-xs hidden-sm">\
                                <div class="profile-false" id=' + 'isOnline_' + a + '>\
                                </div>\
                            </div>\
                            <div class="profile-text hidden-xs hidden-sm">\
                                <div class="profile-name">' + names[a] + ' ' + surnames[a] + '</div>\
                                <div class="last-message" id=' + 'usr_' + a + '>' + lastMessage[a].substr(0, 20) + p + '</div>\
                            </div>\
                        </a>';
        }
        a++;
    } while (a < users.length);
    set_destinator(0);
    isOnline();
}

jQuery(function ($) {
    
            $('#chat-container').on('scroll', function () {
            
                if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 20) {
                    scrollbarPosition = 1;
                } else {
                    scrollbarPosition = 0;
                }
                
                var l = $(this)[0].scrollHeight;
    
                if(l > lastH[lastH.length-1]){
                lastH.push(l);
                }
                
                if ($(this).scrollTop() == 0 && messages_store[destination_id][0] != null) {
                    
                   if(tv == 0){ 
                   var pr = lastMessagePrinted;
                   showLoadingMessage();
                      
                       if(messages_store[destination_id].length == lastMessagePrinted){
                            retrieveMessage(7, destination, 0);
                       }else{
                            var af = from_store[destination_id].length-1;
                            var a1 = af - lastMessagePrinted - 9;
                            var a2 = 0;
                            do{
write_message(from_store[destination_id][a1], to_store[destination_id][a1], messages_store[destination_id][a1], seen_store[destination_id][a1], date_store[destination_id][a1], 1);
                                a1++;
                                a2++;
                            }while(a1 < af && a2 < 10);
                        }
                       
                            var difference = lastH[lastH.length-1] - lastH[lastH.length-2];
                                    if(difference > $(this).innerHeight()){
                                    $(div).animate({
                                    scrollTop: difference},
                                    'slow');
                                        tv = 1;
                                    }
                        }
                    
                }
                if ($(this).scrollTop() > 20) {
                    tv = 0;
                }
                
            })
        });

function write_message(from, to, message, seen, time, mode) {  //write on textbox
    time = new Date(time);
    hideLoadingMessage();
    
    if (destination != null && message != undefined) {
        var b1 = lastMessageUnseen+1;
        var gb = 0;
        var a = 0;      
        var seenIcon;
        
        if(mode == 0){            
        if (from == username) {
            //testo inviato
             if(seen == 1){
                seenIcon = '<img class="profile-message-seen  pull-right" src="Bootstrap/media/double-check-true.png"</img>';
            }else{
                seenIcon = '<img class="profile-message-seen  pull-right" id="msg_'+b1+'" src="Bootstrap/media/double-check.png"</img>';
                lastMessageUnseen++;
            }
            
            div.innerHTML = div.innerHTML +
                                '<div class="row">\
                                    <div class="chat-sender-text pull-right">\
                                        <p>'+message+'</p>\
                                        '+seenIcon+'\
                                        <div class=".profile-message-time pull-right">'+time.getHours()+':'+time.getMinutes()+'</div>\
                                    </div>\
                                </div>';
        } else {
            //testo ricevuto
            div.innerHTML = div.innerHTML +
                                '<div class="row">\
                                    <div class="chat-receiver-text pull-left">\
                                        <p>'+message+'</p>\
                                        <div class=".profile-message-time pull-right">'+time.getHours()+':'+time.getMinutes()+'</div>\
                                    </div>\
                                </div>';
        }
        if (scrollbarPosition === 1) {
            div.scrollTop = div.scrollHeight;
        }
        }else{
        if (from == username) {
            //testo inviato
            if(seen == 1){
                seenIcon = '<img class="profile-message-seen  pull-right" src="Bootstrap/media/double-check-true.png"</img>';
            }else{
                seenIcon = '<img class="profile-message-seen  pull-right" id="msg_'+b1+'" src="Bootstrap/media/double-check.png"</img>'; 
                lastMessageUnseen++;
            }
            
            div.innerHTML = '<div class="row">\
                                    <div class="chat-sender-text pull-right">\
                                        <p>'+message+'</p>\
                                        '+seenIcon+'\
                                        <div class=".profile-message-time pull-right">'+time.getHours()+':'+time.getMinutes()+'</div>\
                                    </div>\
                                </div>' + div.innerHTML;
        } else {
            //testo ricevuto
            div.innerHTML = '<div class="row">\
                                    <div class="chat-receiver-text pull-left">\
                                        <p>'+message+'</p>\
                                        <div class=".profile-message-time pull-right">'+time.getHours()+':'+time.getMinutes()+'</div>\
                                    </div>\
                                </div>'+div.innerHTML;
        }
        }
        lastMessagePrinted++; 
    }
}

function isOnline() {
    if(connectedUsers.length>0){
        for (var a = 0; a < connectedUsers.length; a++) {
            if (connectedUsers[a] != username) {
                var id1 = converter(connectedUsers[a]);
                document.getElementById("isOnline_" + id1).className = "profile-true";
            }
        }
    }
}

function now(){
        var t = new Date();
    
        var a = t.getFullYear().toString();
        var m = t.getMonth().toString();
        m = parseInt(m)+1;
        m = m +"";
        var d = t.getDate().toString();
        var h = t.getHours().toString();
        var mi = t.getMinutes().toString();
        var s = t.getSeconds().toString();
    
        if(d.length<2){
        d = "0"+d;
        }
        if(m.length<2){
        m = "0"+m;
        }
        if(h.length<2){
        h = "0"+h;
        }
        if(mi.length<2){
        mi = "0"+mi;
        }
        if(s.length<2){
        s = "0"+s;
        }
    
        var time = a+"-"+m+"-"+d+"T"+h+":"+mi+":"+s;
        var d = new Date(time);
        return d;
}

function read() {    //reads message from textbox
    textBox.focus();
    var messageToSend = document.getElementById("chat-textbox").value.substring(0, 250);

    if (messageToSend != "" && destination != null) {
        var t = now();
        document.getElementById("chat-textbox").value = "";
        write_message(username, destination, messageToSend, 0, t, 0);
        div.scrollTop = div.scrollHeight;

        from_store[destination_id].push(username);
        to_store[destination_id].push(destination);
        messages_store[destination_id].push(messageToSend);
        seen_store[destination_id].push(0);
        date_store[destination_id].push(t);
        
        refreshLastMessage(messageToSend, destination_id, 0);

        var ciphred = encrypt_blowfish(messageToSend);
        sendMessage(messageToSend, destination);
    }
}

function enterPressed(e) {
    if (e.keyCode == 13) {
        var mo = modalOpened();
        console.log(mo);
        if(mo == null){
            read();
            counter = 6;
        }else{
            if(mo == "registration"){
                getRegistrationData();
            }else if(mo == "login"){
                getLoginData();
            }else if(mo == "password"){
                getChangePwdData();
            }else if(mo == "photo"){
                document.location.href="/";
            }  
        }
        
    } else {
        
    }
}

function type1() {
    if (counter > 5) {
        socket.emit('typing', destination);
        counter = 0;
    }
    counter++;
}

function refreshSeen(from, fromN){
    audioseen.play();
    var a = from_store[from].length-1;
    
    do{
    if(seen_store[from][a] == 0){
        seen_store[from][a] = 1;
    }else{
        break;
    }
    a--;
    }while(a<from_store.length);
    
    var b = 1;
    if(lastMessageUnseen>0){
    do{
        document.getElementById("msg_"+b).src = "Bootstrap/media/double-check-true.png";
        b++;
    }while(b<lastMessageUnseen);
    }
}

function clearType() {
    var a = $("isTyping").html();
    if (a != "") {
        viewLastLogin(destination_id);
    }
}

function clearType2() {
    if (messages_store[alpha][messages_store[alpha].lastIndexOf] == null) {
        refreshLastMessage(lastMessage[alpha], alpha, 0);
    } else {
        refreshLastMessage(messages_store[alpha][messages_store[alpha].lastIndexOf], alpha, 0);
    }
}

window.addEventListener("beforeunload", function (e) {
  $.post("lastLogin.php");
});

function timeGapCalculator(date1, time){ 
    var diff = (time - date1)/1000/60; //minuti
    if(diff>60){
    diff = diff/60; // ore
        if(diff>24){
            diff = diff/24; // giorni
                if(diff > 30){
                    return "";
                }else{
                    var c0 = Math.floor(diff);
                    var tx = c0;
                        if(c0 > 1){
                            tx = tx + " giorni";
                        }else{
                            tx = tx + " giorno";
                        }
                    return tx;
                }
        }else{
                var c0 = Math.floor(diff);
                var tx = c0;
                        if(c0 > 1){
                            tx = tx + " ore";
                        }else{
                            tx = tx + " ora";
                        }
                return tx;
        }
    }else{
    return Math.floor(diff)+" min";
    }
}

function viewLastLogin(id){
    if(document.getElementById("isOnline_" + id).classList == "profile-false"){
    document.getElementById("isTyping").innerHTML = timeGapCalculator(lastOnlines[id], now());
    }else{
    document.getElementById("isTyping").innerHTML = "<a color='green'>Online</a>";
    }
}

function socketRealTime() {
    
    socket = io(nodeAddress, {query: "name=" + username+"&"+"code="+ nodeCode });

    socket.on('from', function (from) {
        if (multi == 0) {
            retrieveMessage(2, from, 0);
        } else {
            retrieveMessage(6, from, 0);
        }
    });

    socket.on('response', function (f) {
        if (f == "scollegato") {
        }
    });

    socket.on('connectedUsers', function (from) {
        $.each(from, function (i, user) {
            if (user != username) {
                connectedUsers.push(user);
            }
        });
        isOnline();
    });

    socket.on('connected', function (from) {
        if (from != username) {
            var a = converter(from);
            connectedUsers.push(from);
            document.getElementById("isOnline_" + a).className = "profile-true";
        }
    });

    socket.on('typing', function (from) {
        var a = converter(from);
        alpha = a;

        if (from == destination) {
            document.getElementById("isTyping").innerHTML = "Sta scrivendo...";
            setTimeout(clearType, 3500);
        } else {
            document.getElementById("usr_" + a).innerHTML = '<i><b><font color="green">Sta scrivendo...</font></b></i>';
            setTimeout(clearType2, 3500);
        }
    });
    
    socket.on('seen', function (from) {
        var a = converter(from);
        refreshSeen(a, from);
    });
    
    socket.on('status', function (r) {
        
    });

    socket.on('disconnected', function (from) {
        var index = connectedUsers.indexOf(from);
        var id = converter(from);
        if (index > -1) {
            connectedUsers.splice(index, 1);
        }
        if (from != username) {
            document.getElementById("isOnline_" + id).className = "profile-false";
        }
                                    
        lastOnlines[id] =  now();
    });

    socket.on('multimode', function (t) {
        if (t == 1) {
            multi = 1;
        }
    });
}        