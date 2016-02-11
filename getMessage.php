<?php
session_start();
error_reporting(0);

include "cipher/php/blowfish_provider.php";
include "cipher/php/database_encrypter.php";
include "sql.php";

if($_SESSION["authorized"]==1){
$c = blowfish_decrypt($_GET["type"]);
$to = blowfish_decrypt($_GET["to"]);
$data = receive($c, $to);
$a=0;
$encrypted;
    
if($c == 5 && $data != "ko"){
while(sizeof($data)>$a){
    $encrypted[]=blowfish_encrypt($data[$a]);
    $encrypted[$a] = base64_encode($encrypted[$a]); //sender
    $a++;
}
    echo json_encode($encrypted);
}else{
if($data != "ko"){
while(sizeof($data)>$a){
    $encrypted[]=blowfish_encrypt($data[$a]);
    $encrypted[$a] = base64_encode($encrypted[$a]); //sender
    $a++;
    $encrypted[]=blowfish_encrypt($data[$a]);       //receiver
    $encrypted[$a] = base64_encode($encrypted[$a]);
    $a++;
    $encrypted[]=blowfish_encrypt($data[$a]);       //message
    $encrypted[$a] = base64_encode($encrypted[$a]);
    $a++;
}
    echo json_encode($encrypted);
}else{
    echo json_encode(array("ko"));
}
}
}else{
echo json_encode(array("fuck off"));
}
?>