<?php
session_start();
error_reporting(0);
include '../sql.php';
include '../cipher/php/rsa_provider.php';
include '../cipher/php/blowfish_provider.php';
include '../cipher/php/database_encrypter.php';

$_SESSION["authorized"]=0;
$nickname = $_GET['nickname']; 
$name = $_GET['name'];
$surname = $_GET['surname'];
$password = $_GET['password'];
$session = $_GET['session'];

$nickname = decrypt($nickname);
$name = ucfirst(decrypt($name));
$surname = ucfirst(decrypt($surname));
$password = md5(decrypt($password));
$session = md5(decrypt($session));

$risultato = registration($nickname, $name, $surname, $password);

if($risultato == "ok"){
select_user($nickname, $password, '0001', $session);
}
echo json_encode(array($risultato));
?>