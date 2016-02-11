<?php
session_start();
error_reporting(0);

$conn;

function initialize(){

$servername = "localhost";
$username = "root";
$password_sql = "sapphire";

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
$login = select_user($id, $password, null, null);
    if($login == "ok"){
$sql = "UPDATE user SET Password = '$newpassword', Session = '' WHERE (Nickname = '$id');";
global $conn;
    
if ($conn->query($sql) === TRUE) {
    return "ok";
} else {
    return "ko";
}
    }else{
        return "ko";
    }
}
//-------------------------------------------------------------------------------------
function select_user($username_user, $password_user, $key_blowfish, $session){
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
    }else if($password_user == null){
    $sql_update_last = "Update session SET Last=now() WHERE Session = '$session' AND UserID = '$username_user';";
    $ro = mysqli_query($conn, $sql_update_last);
    }
    
    return "ok";
}else{
    return "ko";
}
}
//-------------------------------------------------------------------------------------
function users(){
initialize();
$toDelete = $_SESSION["id"];

$sql = "SELECT Nickname, Name, Surname, Image FROM `user` ORDER BY user.Surname ASC;";
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
    }
    return $data;
}else{
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
}
//-----------------------------------------------------------------------------------------
function receive($c, $to){
$id = $_SESSION["id"];
initialize();
global $conn;
    
    $mID = $_SESSION[$to];
    $sql_update;
    
    if($c==1){
        $sql = "SELECT MessageID, Message, Receiver, Sender FROM message WHERE (Sender = '$id' AND Receiver = '$to') OR (Sender = '$to' AND Receiver = '$id') ORDER BY MessageId DESC LIMIT 1;";        
        $sql_update = "fuck";
    }else if($c==0){
        $sql = "SELECT MessageID, Message, Receiver, Sender FROM message WHERE (Sender = '$id' AND Receiver = '$to') OR (Sender = '$to' AND Receiver = '$id') ORDER BY MessageId DESC LIMIT 10;";
        $sql_update = "UPDATE message SET seen = 1 WHERE ((seen = 0) AND (Sender = '$to' AND Receiver = '$id'));";
    }else if($c==2){
        $sql = "SELECT MessageID, Message, Receiver, Sender FROM message WHERE (Sender = '$to' AND Receiver = '$id') AND Seen = 0;";
        $sql_update = "UPDATE message SET seen = 1 WHERE ((seen = 0) AND (Sender = '$to' AND Receiver = '$id'));";
    }else if($c==5){
        $sql = "SELECT DISTINCT Sender FROM `message` WHERE `Receiver` = '$id' AND `Seen` = 0";
        $sql_update = "fuck";
    }else if($c==6){
        $sql = "SELECT MessageID, Message, Receiver, Sender FROM message WHERE (Sender = '$to' AND Receiver = '$id') AND (MessageID > $mID);";
         $sql_update = "UPDATE message SET seen = 1 WHERE ((seen = 0) AND (Sender = '$to' AND Receiver = '$id'));";
    }

$result = mysqli_query($conn, $sql);
    
if($sql_update != "fuck"){
mysqli_query($conn, $sql_update);
}
    
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
    $MessageID = $row["MessageID"];
}
    
if($c != 1){
    $_SESSION[$to] = $MessageID;
}
    $last = -1;
    $reversed;
    
    if($c==0 || $c == 6){
    
    do{
    if($last == -1){
    $last = count($data) - 1;
    }
        
    $reversed[] = $data[$last-2];
    $reversed[] = $data[$last-1];
    $reversed[] = $data[$last];
    $last -= 3;
    
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
    
if ($result){
return "ok";
}else{
return "ko";
}
}
//---------------------------------------------------------------------------------
function registration($nickname, $name, $surname, $password){
initialize();
$sql = "INSERT INTO user(Nickname, Name, Surname, Password) values ('$nickname', '$name', '$surname', '$password');";

global $conn;
    
$result = mysqli_query($conn, $sql);
    
if ($result){
return "ok";
}else{
return "ko";
}
}
?>
