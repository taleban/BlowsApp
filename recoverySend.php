<?php
session_start();

error_reporting(E_ALL);
include "cipher/php/blowfish_provider.php";
include 'sql.php';

$servername = "localhost";
$username = "root";
$password_sql = "sapphire";


$conn = mysqli_connect($servername, $username, $password_sql, "chat");

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

$session;
$from;
$message;
$destination;
$sql;

$session = md5(blowfish_decrypt($_POST["login"]));
$from = blowfish_decrypt($_POST["sender"]);
$message = blowfish_decrypt($_POST["message"]);
$destination = blowfish_decrypt($_POST["destination"]);

$sql = "SELECT Name FROM `user` WHERE Nickname = '$from' AND Session = '$session');";
    
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
$sql = "INSERT INTO message(Sender, Receiver, Message) values ('$from', '$destination', '$message');";

$r = mysqli_query($conn, $sql);
    
    if (!$r) {
    echo "non inviato";
    };
    
}

?>