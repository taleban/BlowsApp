<?php
session_start();
//error_reporting(E_ERROR);
error_reporting(0);

include 'sql.php';
include 'cipher/php/rsa_provider.php';
include 'cipher/php/blowfish_provider.php';
include 'cipher/php/database_encrypter.php';

$_SESSION["authorized"]=0;
$raw_key_blowfish = $_GET['key']; 
$raw_username = $_GET['user'];
$raw_password = $_GET['password'];
$raw_session = $_GET['session'];
$raw_node = $_GET['node'];

$_SESSION["first"] = array();
$_SESSION["leftM"] = 13;
$_SESSION["leftMP"] = 1;

$node = md5(decrypt($raw_node));
$key_blowfish = decrypt($raw_key_blowfish);
$username_user = decrypt($raw_username);
$d = decrypt($raw_password);

if($d != null){
$password_user = md5($d);
}

$session = md5(decrypt($raw_session));

initialize();

echo json_encode(array(select_user($username_user, $password_user, $key_blowfish, $session, $node)));
?>