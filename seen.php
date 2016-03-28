<?php
session_start();
error_reporting(0);

include "cipher/php/blowfish_provider.php";
include "cipher/php/database_encrypter.php";
include "sql.php";

if($_SESSION["authorized"]==1){
$to = $_POST["to"];

$to = blowfish_decrypt($to);

seen($to);
}else{
echo json_encode(array("fuck off"));
}
?>