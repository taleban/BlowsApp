<?php
session_start();
error_reporting(0);
include "cipher/php/blowfish_provider.php";
include "cipher/php/database_encrypter.php";
include "sql.php";

if($_SESSION["authorized"]==1){
$d = users();
$a=0;
$b=0;
$c = 0;
$e = 0;
    //da finire
$data["user"];
$data["last"];
$data["name"];
$data["surname"];
$data["image"];    
    
while(sizeof($d)>$c){
    $data["user"][] = $d[$c];
    $c++;
    $data["name"][] = $d[$c];
    $c++;
    $data["surname"][] = $d[$c];
    $c++;
    $data["image"][] = $d[$c];
    $c++;
}   

$last_message;
$encrypted;

while(sizeof($data["user"])>$b){
    $last = receive(1, $data["user"][$b], 0);
    $e = 0;
    while($e<2){
    $e++;
    $e++;
    $data["last"][$b] = $last[$e];
    $e++;
    }
    $b++;
}
    
while(sizeof($data["user"])>$a){
    $encrypted[]=blowfish_encrypt($data["user"][$a]);
    $encrypted[$a] = base64_encode($encrypted[$a]); //sender
    $data["user"][$a] = $encrypted[$a];
    //-------------------------------------
    $encrypted1[]=blowfish_encrypt($data["name"][$a]);
    $encrypted1[$a] = base64_encode($encrypted1[$a]); //sender
    $data["name"][$a] = $encrypted1[$a];
    //-------------------------------------
    $encrypted2[]=blowfish_encrypt($data["surname"][$a]);
    $encrypted2[$a] = base64_encode($encrypted2[$a]); //sender
    $data["surname"][$a] = $encrypted2[$a];
    //-------------------------------------
    $encrypted3[]=blowfish_encrypt($data["last"][$a]);
    $encrypted3[$a] = base64_encode($encrypted3[$a]); //sender
    $data["last"][$a] = $encrypted3[$a];
    //-------------------------------------
    $a++;
}

echo json_encode($data);
}else{
echo json_encode(array("fuck off"));
}

?>