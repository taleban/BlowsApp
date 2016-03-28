<?php
session_start();
error_reporting(0);
include 'sql.php';

if($_SESSION["authorized"] == 1){
updateLast();
}
?>