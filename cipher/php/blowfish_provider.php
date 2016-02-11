<?php
session_start();
error_reporting(0);
require_once 'PHP-Blowfish-master/blowfish.php';

function getInstance($key_blowfish){
$_SESSION["blowfish"] = serialize(new Blowfish($key_blowfish,
                                     Blowfish::BLOWFISH_MODE_EBC,
                                     Blowfish::BLOWFISH_PADDING_RFC, 
                                     file_get_contents("cipher/php/PHP-Blowfish-master/tests/vectors_ecb.txt")));
}

function blowfish_decrypt($ciphertext){ 
$ciphertext = base64_decode($ciphertext);
    
$blowfish = unserialize($_SESSION['blowfish']);

$decrypted = $blowfish->decrypt($ciphertext); 
    
for($a = strlen($decrypted); $a>=0; $a--){
if($decrypted{$a} == "/"){
   $decrypted = substr($decrypted, 0, $a);
}
}
    
return $decrypted;    
}

function blowfish_encrypt($plaintext){   

$plaintext .= "/";
    
$blowfish = unserialize($_SESSION['blowfish']);
    
return $blowfish->encrypt($plaintext);
}

?>