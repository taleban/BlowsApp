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
            var logged;
            var scrollbarPosition;
            var from_store = [];
            var messages_store = [];
            var to_store = [];
            var syncro;
            var printed;
            var retrieved = [];
            var image = [];
			var connectedUsers = [];
            var socket;
            var deauth;
            var counter;
            var audio;
            var multi;
            var alpha;
			
            function generateBlowfishKey(bit) {    //per generare la chiave blowfish da utilizzare per la sessione
                var byte = (bit/8);
                var rbyte = wxfz.fortuna.generate(byte);    //utilizza l'algoritmo Fortuna
                
                return rbyte;
            }
             
            function setupConnection(){ //1° step ----- chiede la chiave pubblica RSA al server
                multi = 0;
                deauth = 0;
                logged = 0;
                getRsaKey();
                div = document.getElementById('chat-container');
                div_chat = document.getElementById('list-container');
                audio = new Audio('audio/mario.wav');
            }
            
            function set_destinator(d){
            scrollbarPosition = 1;
            destination_id=d;
            destination=users[d];
            destination_encrypted=encrypt_blowfish(destination);
            refreshName(d);
            counter = 6;
                
              
                if(retrieved[d] === undefined){   
                retrieved[d] = 1;
                div.innerHTML = "";
                    retrieveMessage(0, destination);  
                }else{
                if(multi==0){
                    printMessages(d, 10); 
                    retrieveMessage(2, destination);
                         }else{
                        retrieveMessage(6, destination);
                    }
                }
                
                
                document.getElementById("chat-textbox").focus();
            }
    
            function login(){
                var c = [];
                var n1 = prompt("nome: ");
                if(n1 != null){
                c.push(n1);
                c.push(prompt("password", ""));
                c.push(generateBlowfishKey(250));
                username = c[0];
                password = c[2];
                }else{
                registration();
                }
            return c;
            }

            function changepassword(){
                
            var passwrd = prompt("inserire password: ", "");
            var newpassword;
            var newpassword2;
                
            do{
            newpassword = prompt("inserire nuova password: ", "");
            newpassword2 = prompt("inserire nuova password: ", "");
            if(newpassword != newpassword2){
            alert("le password non coincidono, riprovare");
            }
            }while(newpassword != newpassword2);
                
            $.getJSON("changePassword.php", {
                                             password: cipher_rsa(passwrd), 
                                             newpassword: cipher_rsa(newpassword)
                                            
                                            });
                savecookie("fuck", "fuck");
            
            }

            function registration(){
                var nickname;
                var name;
                var surname;
                var password;
                
                do{
                    nickname = prompt("--- Registrazione ---\n\Nickname");
                }while(nickname == null || nickname == "");
                do{
                    name = prompt("Name");
                }while(name == null || name == "");
                do{
                    surname = prompt("Surname");
                }while(surname == null || surname == "");
                var err = "";
                do{
                    password = prompt(err+" Password");
                    var p2 = prompt("Re-Password");
                    if(password != p2){
                    password = null;
                    err = "fallito, reinserisci la";
                    }
                }while(password == null || password == "");
                
                var session = generateBlowfishKey(250);
                
                $.getJSON("registration/registration.php", {nickname: cipher_rsa(nickname),      
                                                            name: cipher_rsa(name),
                                                            surname: cipher_rsa(surname), 
                                                            password: cipher_rsa(password),
                                                            session: cipher_rsa(session)
                                                            },    
                         function(result){
                         $.each(result, function(i, field){ 
                                if(field == "ok"){
                                    dumpMemory();
                                    savecookie(nickname, session);
                                    setupConnection2();
                                }else if(field == "ko"){
                                    alert("Registrazione fallita ... ricarica la pagina");
                                    deauthentication();
                                }
                          
                         });
                        
                    });
            }

            function dumpMemory(){
                div_chat.innerHTML = "";
                users = [];
                lastMessage = [];
                names = [];
                surnames = [];
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

            function deauthentication(){
                deauth = 1;
                
                div.innerHTML = "";
                div_chat.innerHTML = "";
                           
                username=null;
                password=null;

                dumpMemory();
                
                savecookie(null, null);
                
                if (typeof socket != 'undefined') {
                    socket.disconnect();
                }
                
                setupConnection2();
            }

            function setupConnection2(){    //ultima parte della preparazione della sessione
                
                var blowfish_key = generateBlowfishKey(255);   //crea la chiave blowfish
                var cipherkey = cipher_rsa(blowfish_key);   //cripta la chiave con l'rsa
              
                blowfish = new Blowfish(blowfish_key);      //creo la sessione con la chiave blowfish
                
                var c;
                var toSave = 0;
                
                if(deauth == 0){
                c = loadCredentials();
                    
                if(c[0] == "fuck" || c[0] == null){
                c = login();
                toSave = 1;
                }
                }else{
                c = login();
                toSave = 1;
                }
                
                console.log("nick: "+c[0]+" session: "+c[1]);
                
                $.getJSON("handshake.php", { key: cipherkey,      
                                             user: cipher_rsa(c[0]),
                                             password: cipher_rsa(c[1]), 
                                             session: cipher_rsa(c[2])
                                           },    
                         function(result){
                         $.each(result, function(i, field){ 
                                if(field == "ok"){
                                logged = 1;
                                    if(toSave == 1){
                                    savecookie(c[0], c[2]);
                                    }
                                retrieveUsers();
                                }else if(field == "ko"){
                                    logged = -1;
                                    alert("Accesso Fallito ... ricarica la pagina");
                                    deauthentication();
                                }
                          
                         });
                        
                    });
                
                
            }
            
            function savecookie(username, session){        //save the username and the password in a cookie
                    document.cookie="username="+username+"; expires=01 Oct 2050 08:50:17 GMT";
                    document.cookie="password="+btoa(session)+"; expires=01 Oct 2050 08:50:17 GMT";
            }
            
            function getcookie(cname){  //automatic retriever of cookies by name
                    var name = cname + "=";
                    var ca = document.cookie.split(';');
                    for(var i=0; i<ca.length; i++) {
                        var c = ca[i];
                        
                        while (c.charAt(0)==' ') c = c.substring(1);
                            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
                    }
                return null;
            }
            
            function getRsaKey(){          //write the publickey variable whit the publickey from server or cookie
               
                    /*$.getJSON("getkey.php", null, function(result){
                         $.each(result, function(i, field){  
                            setPublicKey(field);       //sets the private key 
                         });
                    });*/
                
                setPublicKey("-----BEGIN PUBLIC KEY-----\n\MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALVKfitzSsZ7sFnMMI+FlXvVHiTYjvSC\n\h/tTHYtoL0XWLAZWJNfXXHeFotrn8tY9AJkjH/Ng06JvUDQWrNawIm0CAwEAAQ==\n\-----END PUBLIC KEY-----");
                    
            }
             
            function setPublicKey(key){    //sets the key
            publickey=key;
            setupConnection2();             //call second part of the setup connection
            }
             
            function loadCredentials(){ //loads username and password from cookies (if exist)
                var value = [];
                value.push(getcookie("username"));
                value.push(null);
                value.push(atob(getcookie("password")));
                username = value[0];
                if(value[0] === null){
                    var v = [];
                    v.push("fuck");
                    
                    return v;
                }
                return value;
            }
            
            function encrypt_blowfish(plaintext){   //encrypt a message with blowfish
                // Encrypt and encode to base64
                plaintext += "/";
                var encrypted = blowfish.base64Encode(blowfish.encrypt(plaintext));
                return encrypted;
            }
            
            function decrypt_blowfish(encrypted1){  //decrypt a message with blowfish
                var e1 = blowfish.base64Decode(encrypted1);
                var decrypted = blowfish.decrypt(e1);
                var a=0;
        
                for(a = decrypted.length; a>=0; a--){   //split the message until "/" beacause the last values are nulls
                    if(decrypted.charAt(a) == "/"){
                        decrypted = decrypted.substring(0, a);
                    }   
                }
                
                return decrypted;
            }
             
            function cipher_rsa(plaintext){ //the rsa cipher that use the global publickey

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
                var ciphertext = pidCryptUtil.fragment(fromHex,64);
                
                //var decripted = rsa.decrypt(ciphertext);
                //ciphertext = pidCryptUtil.encodeBase64(ciphertext);
                //console.log(ciphertext);
                
                return ciphertext;
            }

            function retrieveUsers(){
            var b=0;
            
            $.getJSON("getUsers.php").success(function(result) {
                    $.each(result, function(i, data) {    //get the message and who sent it to me
                    var a=0;
                        if(b==0){
                            a=0;
                            do{
                                users.push(decrypt_blowfish(data[a]));
                                a++;
                            }while(data.length>a);
                        }else if(b==1){
                            a=0;
                            do{
                                names.push(decrypt_blowfish(data[a]));
                                a++;
                            }while(data.length>a);
                        }else if (b==2){
                            a=0;
                            do{
                                surnames.push(decrypt_blowfish(data[a]));
                                a++;
                            }while(data.length>a);
                        }else if(b==3){
                            a=0;
                            do{
                                image.push(data[a]);
                                a++;
                            }while(data.length>a);
                        }else if(b==4){
                            a=0;
                            do{
                                lastMessage.push(decrypt_blowfish(data[a]));
                                a++;
                            }while(data.length>a);
                        }
                        b++;
                    }
                    );
                   write_user();
                }).error(function(error){console.log(error);});   
            }

            function findInterlocutor(from, to){
                if(from != username){
                return from;
                }else{
                    return to;
                }
            }

            function converter(id){
                var a = 0;
                while(a<users.length){
                if(id == users[a]){
                return a;
                }
                a++;
                }
            }

            function retrieveMessage(c1, to1){ //get messagges from the server
                var a=-1;
                var from = [];
                var to = [];
                var message = [];
                var toUpdate = [];
                var to1_id = converter(to1);
                
                 $.getJSON("getMessage.php", {type: encrypt_blowfish(c1), to: encrypt_blowfish(to1)}).success(function(result) {
                    $.each(result, function(i, data) {    //get the message and who sent it to me
                        if(data=="ko"){
                            //console.log("messaggio non ricevuto");
                        }else{
                        if(c1 == 5){
                            toUpdate.push(decrypt_blowfish(data));
                        }else{
                        a++;
                        if(a==0){
                        from.push(decrypt_blowfish(data));
                        }else if(a==1){
                        to.push(decrypt_blowfish(data));
                        }else if(a==2){
                        message.push(decrypt_blowfish(data));
                        a=-1;
                        }
                        }
                        }
                    });
                    if((c1 == 2)){
                        if(message.length>0 && message[0] != ""){
                        var b=0;
                        do{  
                        from_store[to1_id].push(from[b]);
                        to_store[to1_id].push(to[b]);
                        messages_store[to1_id].push(message[b]);
                        b++;
                        }while(from.length>b);
                        if(messages_store[to1_id][messages_store[to1_id].length-1]){
                            refreshLastMessage(messages_store[to1_id][messages_store[to1_id].length-1], to1_id, 1);
                        }    
                        }
                        printMessages(to1_id, 10);
                    }else if(c1==1){
                        from_store[to1_id] = from;
                        to_store[to1_id] = to;
                        messages_store[to1_id] = message
                    }else if(c1 == 5 && toUpdate.length > 0){
                        update(toUpdate);        
                    }else if(c1 == 0){
                        var b=0;
                        do{  
                        from_store[to1_id].push(from[b]);
                        to_store[to1_id].push(to[b]);
                        messages_store[to1_id].push(message[b]);
                        b++;
                        }while(from.length>b);
                        printMessages(to1_id, 10);
                        if(messages_store[to1_id][messages_store[to1_id].length-1]){
                        refreshLastMessage(messages_store[to1_id][messages_store[to1_id].length-1], to1_id, 0);
                        }
                    }else if(c1 == 6){
                        if(message.length>0 && message[0] != ""){
                        var b=0;
                        do{  
                        from_store[to1_id].push(from[b]);
                        to_store[to1_id].push(to[b]);
                        messages_store[to1_id].push(message[b]);
                        b++;
                        }while(from.length>b);
                        if(messages_store[to1_id][messages_store[to1_id].length-1]){
                            refreshLastMessage(messages_store[to1_id][messages_store[to1_id].length-1], to1_id, 1);
                        }    
                        }
                        printMessages(to1_id, 10);
                    }
                        
                }).error(function(error){console.log(error);});     
                 
            }
            
            function update(toUpdate){
            var a = 0;
                do{
                    retrieveMessage(2, toUpdate[a]);
                    a++;
                }while(toUpdate.length > a);
            }
            
            function printMessages(id, limit){
                if(id == destination_id){
                div.innerHTML = "";
                var b = 0;
                if(from_store[id][0] == destination || to_store[id][0] == destination){
                    div.innerHTML = "";
                }
                clearType();
                for(var a=(messages_store[id].length-limit); a<messages_store[id].length; a++){
                    write_message(from_store[id][a], to_store[id][a], messages_store[id][a]);
                }   
                }
            }
            
            function refreshName(a){
                var div_name = document.getElementById('name');
                div_name.innerHTML = names[a]+" "+surnames[a];
                document.getElementById("photo").src=image[a];
            }

            function setUserProfile(a){
                var div_name = document.getElementById('username');
                div_name.innerHTML = "Ciao " + names[a] + "!";
                document.getElementById("userphoto").src=image[a];
            }

            function refreshLastMessage(last, a, type){
                var div_last = document.getElementById('usr_'+a);
                if(last != null){
                if(last.length>20){
                        var p = "...";
                        }else{
                            p = "";
                        }
                if(type == 1){
                div_last.innerHTML = "<i><b>"+last.substr(0, 20)+p+"</b></i>";
                audio.play();
                
                }else if(type == 0){
                div_last.innerHTML = last.substr(0, 20)+p;
                }
                }
                
            }

            function sendMessage(message1, destination1){ //send message to server
           
                $.post("sendMessage.php", { message: encrypt_blowfish(message1), destination: destination_encrypted }).done(function() {
                    socket.emit('to', destination1);
                }).fail(function(error) {
                    alert( "messaggio non inviato: "+error );
                });
            
            }

            function write_user(){
                var a = 0;
                do{
                    from_store[a] = new Array();
                    messages_store[a] = new Array();
                    to_store[a] = new Array();
                        
                        if(users[a]==username){
                        setUserProfile(a);
                        }else{  
                        if(lastMessage[a].length>20){
                        var p = "...";
                        }else{
                            p = "";
                        }                            
                        div_chat.innerHTML = div_chat.innerHTML +
                        '<a href="#" onclick=set_destinator('+a+'); class="list-group-item">\
                            <img class="profile-pic" src="'+image[a]+'">\
                            <div class="profile-indicator hidden-xs hidden-sm">\
                                <div class="profile-false" id='+'isOnline_'+a+'>\
                                </div>\
                            </div>\
                            <div class="profile-text hidden-xs hidden-sm">\
                                <div class="profile-name">'+names[a]+' '+surnames[a]+'</div>\
                                <div class="last-message" id='+'usr_'+a+'>'+lastMessage[a].substr(0, 20)+p+'</div>\
                            </div>\
                        </a>';
                        }
                    a++;
                }while(a < users.length);
                set_destinator(0);
                socketRealTime();
                isOnline();
            }
            function write_message(from, to, message){  //write on textbox
                    if(destination != null && message != undefined){
                        jQuery(function($){
                            $('#chat-container').on('scroll', function() {
                                if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight-20) {
                                scrollbarPosition = 1;
                                }else{
                                scrollbarPosition = 0;
                                }
                            })
                        });
                    
                        
                    if(from == username){
                            //testo inviato
                            div.innerHTML = div.innerHTML + 
                                '<div class="row">\
                                    <p class="chat-sender-text pull-right">'+message+'</p>\
                                </div>';
                    }else{
                           //testo ricevuto
                            div.innerHTML = div.innerHTML + 
                                '<div class="row">\
                                    <p class="chat-sender-text pull-left">'+message+'</p>\
                                </div>';
                    }
                    if(scrollbarPosition === 1){
                        div.scrollTop = div.scrollHeight;
                    }                        
                    }
            }

            function isOnline(){
                for(var a = 0; a<connectedUsers.length; a++){
                if(connectedUsers[a]!=username){
                var id1 = converter(connectedUsers[a]);
                document.getElementById("isOnline_"+id1).className = "profile-true";
                }
                }
            }

            function read(){    //reads message from textbox
                var messageToSend = document.getElementById("chat-textbox").value.substring(0, 250);
                
                if(messageToSend != "" && destination != null){
                document.getElementById("chat-textbox").value = "";
                    
                write_message(username, destination, messageToSend);
                        div.scrollTop = div.scrollHeight;
                    
                        from_store[destination_id].push(username);
                        to_store[destination_id].push(destination);
                        messages_store[destination_id].push(messageToSend);
                    
                refreshLastMessage(messageToSend, destination_id, 0);
                    
                var ciphred = encrypt_blowfish(messageToSend);
                sendMessage(messageToSend, destination);
                }
            }

            function enterPressed(e){
                if (e.keyCode == 13) {
                read();
                counter = 6;
                }
            }

        function type1(){
            if(counter>5){
            socket.emit('typing', destination);
            counter = 0;
            }
            counter++;
        }
        
        function clearType(){
        var a = $( "isTyping" ).html();
            if(a!=""){
            document.getElementById("isTyping").innerHTML = "";
            }
        }

        function clearType2(){
        if(messages_store[alpha][messages_store[alpha].lastIndexOf] == null){
        refreshLastMessage(lastMessage[alpha], alpha, 0);
        }else{
        refreshLastMessage(messages_store[alpha][messages_store[alpha].lastIndexOf], alpha, 0);
        }
        }
        
		function socketRealTime(){
                
            socket = io("127.0.0.1:3000", { query: "name="+username });

                socket.on('from', function(from){
                    if(multi == 0){
                    retrieveMessage(2, from);
                    }else{
                    retrieveMessage(6, from);
                    }
                });
            
                socket.on('response', function(f){
                    if(f=="scollegato"){
                    }
                });

                socket.on('connectedUsers', function(from){
                $.each(from, function(i, user){
                    if(user != username){
                        connectedUsers.push(user);
                    }
                });  
                    isOnline();
                });

                socket.on('connected', function(from){
                    if(from != username){
                    connectedUsers.push(from);
                    document.getElementById("isOnline_"+converter(from)).className = "profile-true";
                    }
                });
            
                socket.on('typing', function(from){
                    var a = converter(from);
                    alpha = a;
                    
                    if(from == destination){    
                        document.getElementById("isTyping").innerHTML = "Sta scrivendo...";
                        setTimeout(clearType, 3500);
                    }else{
                        document.getElementById("usr_"+a).innerHTML = '<i><b><font color="green">Sta scrivendo...</font></b></i>';
                        setTimeout(clearType2, 3500);
                    }
                });

                socket.on('disconnected', function(from){
                    var index = connectedUsers.indexOf(from);
                    if (index > -1) {
                    connectedUsers.splice(index, 1);  
                    }
                    if(from != username){
                    document.getElementById("isOnline_"+converter(from)).className = "profile-false";
                    }
                });
            
                socket.on('multimode', function(t){
                    if(t==1){
                        multi = 1;
                    }
                });
            }
            