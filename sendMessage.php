<?php
session_start();
error_reporting(0);

include "cipher/php/blowfish_provider.php";
include "cipher/php/database_encrypter.php";
include "sql.php";

if($_SESSION["authorized"]==1){
$message = $_POST["message"];
$destination = $_POST["destination"];

$deciphred_message = blowfish_decrypt($message);
$deciphred_destination = blowfish_decrypt($destination);

send($deciphred_destination, base64_encode(blowfish_encrypt_db($deciphred_message)));
}else{
echo json_encode(array("fuck off"));
}
?>