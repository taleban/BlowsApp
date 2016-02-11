<?php
session_start();
error_reporting(0);
include "cipher/php/blowfish_provider.php";
include "sql.php";
include 'cipher/php/rsa_provider.php';

if($_SESSION["authorized"]==1){
$password = $_GET["password"];
$newpassword = $_GET["newpassword"];

$password = md5(decrypt($password));
$newpassword = md5(decrypt($newpassword));
    
echo changePassword($password, $newpassword);
}else{
echo json_encode(array("fuck off"));
}
?>