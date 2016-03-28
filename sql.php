<?php
session_start();
error_reporting(0);

$conn;

function initialize(){

$servername = "localhost";
$username = "root";
$password_sql = null;

global $conn;

$conn = mysqli_connect($servername, $username, $password_sql, "chat");
// Check connection
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
}
//-------------------------------------------------------------------------------------
function changePassword($password, $newpassword){
initialize();
$id = $_SESSION["id"];

$sql = "UPDATE user SET Password = '$newpassword' WHERE Nickname = '$id' AND Password = '$password';";

$sql1 = "DELETE FROM session WHERE UserID = '$id';";
global $conn;
    
if (mysqli_query($conn, $sql)) {
    if (mysqli_query($conn, $sql1)) {
    mysqli_close($conn);
    return "ok";
    } else {
    mysqli_close($conn);
    return "ko";
    }
} else {
    mysqli_close($conn);
    return "ko";
}
        mysqli_close($conn);
        return "ko";
}
//-------------------------------------------------------------------------------------
function select_user($username_user, $password_user, $key_blowfish, $session, $nodeCode){
$sql = "SELECT user.Name FROM `user` LEFT JOIN session ON user.Nickname = session.UserID WHERE (user.Nickname = '$username_user') AND (user.Password = '$password_user' OR session.Session = '$session');";
global $conn;
    
$result = mysqli_query($conn, $sql);
    
if (mysqli_num_rows($result) > 0) {
    
    if($key_blowfish!='0001'){
    $_SESSION["id"]=$username_user;
    $_SESSION["authorized"]=1;
    getInstance($key_blowfish);
    getInstance_db("a me piace a nutell'");
    }
    
    if($password_user != null){
    $sql_update = "Insert into session (Session, UserID) values ('$session', '$username_user');";
    $r = mysqli_query($conn, $sql_update);
    }else{
    $sql_update_last = "Update session SET Last = now() WHERE Session = '$session' AND UserID = '$username_user';";
    $ro = mysqli_query($conn, $sql_update_last);
    }
    $sql_update_node = "Update user Set NodeCode = '$nodeCode' WHERE Nickname = '$username_user';";
    $ra = mysqli_query($conn, $sql_update_node);
    
    $sql_update_b = "Update user SET LastAccess = now() WHERE Nickname = '$username_user';";
    $rb = mysqli_query($conn, $sql_update_b);
    
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER => 0,
        CURLOPT_URL => 'localhost/blowfish/node/php/nodeCodeReseter.php?id='.$username_user,
        CURLOPT_USERAGENT => 'Gigi'
    ));
    
    curl_exec($curl);
    
    curl_close($curl);
    
    mysqli_close($conn);
    
    return "ok";
}else{
    mysqli_close($conn);
    return "ko";
}
}
//-------------------------------------------------------------------------------------
function users(){
initialize();
$toDelete = $_SESSION["id"];

$sql = "SELECT Nickname, Name, Surname, Image, LastAccess FROM `user` ORDER BY user.Surname ASC;";
global $conn;
    
$result = mysqli_query($conn, $sql);
    
if (mysqli_num_rows($result) > 0) {
        while ($row = $result->fetch_assoc()) {
        $a = $row["Nickname"];
        $data[] = $a; 
        $_SESSION[$a]=0;
            
        $data[] = $row["Name"];
        $data[] = $row["Surname"];
        $data[] = $row["Image"];
        $data[] = $row["LastAccess"];
    }
    mysqli_close($conn);
    return $data;
}else{
    mysqli_close($conn);
    return "ko";
}
}
//-------------------------------------------------------------------------------------
function send($to, $message){
initialize();
    
global $conn;

$id = $_SESSION["id"];
    
$sql = "INSERT INTO message(Sender, Receiver, Message) values ('$id', '$to', '$message');";

$result = mysqli_query($conn, $sql);

do{
if (!$result) {
    $result = mysqli_query($conn, $sql);
    $a++;
}else{
break;
}
}while(a<20);
    mysqli_close($conn);
}
//-----------------------------------------------------------------------------------------
function receive($c, $to){
$id = $_SESSION["id"];
initialize();
global $conn;
    
    $mID = $_SESSION[$to];
    $sql_update;
    
    if($c==1){      //per prendere l'ultimo messaggio quando si crea la sessione e si scaricano gli utenti
        $sql = "SELECT MessageID, Message, Receiver, Sender, Time, SeenByUser FROM message WHERE (Sender = '$id' AND Receiver = '$to') OR (Sender = '$to' AND Receiver = '$id') ORDER BY MessageId DESC LIMIT 1;";        
        $sql_update = "fuck";
    }else if($c==0){ // per prendere i 10 messaggi più recenti
        $sql = "SELECT MessageID, Message, Receiver, Sender, Time, SeenByUser FROM message WHERE (Sender = '$id' AND Receiver = '$to') OR (Sender = '$to' AND Receiver = '$id') ORDER BY MessageId DESC LIMIT 10;";
        $sql_update = "UPDATE message SET seen = 1 WHERE ((seen = 0) AND (Sender = '$to' AND Receiver = '$id'));";
        $_SESSION["first"][$to] = -1;
    }else if($c==2){    // modalità normale per scaricare tutti i messaggi nuovi
        $sql = "SELECT MessageID, Message, Receiver, Sender, Time, SeenByUser FROM message WHERE (Sender = '$to' AND Receiver = '$id') AND Seen = 0;";
        $sql_update = "UPDATE message SET seen = 1 WHERE ((seen = 0) AND (Sender = '$to' AND Receiver = '$id'));";
    }else if($c==5){    //serve a vedere se ci sono nuovi messaggi e prende una volta sola chi lo ha inviato
        $sql = "SELECT DISTINCT Sender FROM `message` WHERE `Receiver` = '$id' AND `Seen` = 0";
        $sql_update = "fuck";
    }else if($c==6){ //prende tutti i messaggi nuovi in modalità multimode
        $sql = "SELECT MessageID, Message, Receiver, Sender, Time, SeenByUser FROM message WHERE ((Sender = '$to' AND Receiver = '$id') OR (Sender = '$id' AND Receiver = '$to')) AND (MessageID > $mID);";
         $sql_update = "UPDATE message SET seen = 1 WHERE ((seen = 0) AND (Sender = '$to' AND Receiver = '$id'));";
    }else if($c==7){    //prende 10 messaggi vecchi
        $f = $_SESSION["first"][$to];
         $sql = "SELECT MessageID, Message, Receiver, Sender, Time, SeenByUser FROM message WHERE ((Sender = '$id' AND Receiver = '$to') OR (Sender = '$to' AND Receiver = '$id')) AND (MessageID < $f) ORDER BY MessageId DESC LIMIT 10;";
        $sql_update = "fuck";
    }

$result = mysqli_query($conn, $sql);
    
if($sql_update != "fuck"){
mysqli_query($conn, $sql_update);
}
mysqli_close($conn);
    
if($c == 5){
if (mysqli_num_rows($result) > 0) {
while ($row = $result->fetch_assoc()) {
    $data[] = $row["Sender"];
}
    return $data;
}else{
return "ko";
}
}else{
    $MessageID = 0;
if (mysqli_num_rows($result) > 0) {
while ($row = $result->fetch_assoc()) {
    $data[] = $row["Sender"];
    $data[] = $row["Receiver"];
    $data[] = blowfish_decrypt_db($row["Message"]);
    $data[] = $row["Time"];
    $data[] = $row["SeenByUser"];
    $MessageID = $row["MessageID"];
    
    if($_SESSION["first"][$to] > $MessageID || $c == 0){
       $_SESSION["first"][$to] = $MessageID;
       $c == -1;
    }
}
    if($c == -1){
       $c = 0;
    }
    
if($c != 1){
    $_SESSION[$to] = $MessageID;
}
    $last = -1;
    $reversed;
    
    if($c==0 || $c == 6 || $c == 7){
    
    do{
    if($last == -1){
    $last = count($data) - 1;
    }
        
    $reversed[] = $data[$last-4];
    $reversed[] = $data[$last-3];
    $reversed[] = $data[$last-2];
    $reversed[] = $data[$last-1];
    $reversed[] = $data[$last];
    $last -= 5;
    
    //$data = $reversed;
    }while($last>0);
    return $reversed;
    }else{
    return $data;
    }
}else{
    return "ko";
}
}
}
//---------------------------------------------------------------------------------
function modifyPhoto($extension){
initialize();
$id = $_SESSION["id"];

$sql = "UPDATE user SET Image='photos/$id.$extension' WHERE Nickname='$id';";
global $conn;
    
$result = mysqli_query($conn, $sql);
mysqli_close($conn);
if ($result){
return "ok";
}else{
return "ko";
}
}
//---------------------------------------------------------------------------------
function registration($nickname, $name, $surname, $password, $session){
initialize();
$sql = "INSERT INTO user(Nickname, Name, Surname, Password) values ('$nickname', '$name', '$surname', '$password');";
$sql1 = "INSERT INTO session (UserID, Session) values ('$nickname', '$session');";

global $conn;
    
$result = mysqli_query($conn, $sql);
$result1 = mysqli_query($conn, $sql1);
    
mysqli_close($conn);
if ($result){
    if ($result1){
        return "ok";
    }
    return "ko";
}else{
return "ko";
}
}
//---------------------------------------------------------------------------------
function seen($to){
initialize();
$id = $_SESSION["id"];

$sql = "UPDATE message SET SeenByUser=1 WHERE Sender='$to' AND Receiver='$id';";
global $conn;
    
$result = mysqli_query($conn, $sql);
mysqli_close($conn);

}
//---------------------------------------------------------------------------------
function updateLast(){
initialize();
$id = $_SESSION["id"];

$sql = "Update user SET LastAccess = now() WHERE Nickname = '$id';";

global $conn;
    
$result = mysqli_query($conn, $sql);
mysqli_close($conn);

}
//---------------------------------------------------------------------------------
function loadLast($to){
initialize();
$id = $_SESSION["id"];

$sql = "Select LastAccess from user WHERE Nickname = '$to';";

global $conn;
    
$result = mysqli_query($conn, $sql);
mysqli_close($conn);
    
if (mysqli_num_rows($result) > 0) {
while ($row = $result->fetch_assoc()) {
    $data[] = $row["LastAccess"];
}
}
    return $data;

}
//---------------------------------------------------------------------------------
function defaulter($id){
initialize();

$sql = "UPDATE user SET NodeCode = NULL WHERE Nickname = '$id';";

global $conn;
    
$result = mysqli_query($conn, $sql);
mysqli_close($conn);
}
//---------------------------------------------------------------------------------
function NodeLogin($id, $code){
initialize();

$sql = "SELECT * Nickname FROM user WHERE Nickname='$id' AND NodeCode='$code';";

global $conn;
    
$result = mysqli_query($conn, $sql);
    
if (mysqli_num_rows($result) > 0) {
    return "ok";
}
    else{
        return "ko";
    }
    
mysqli_close($conn);
}
?>
