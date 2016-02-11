<?php
error_reporting(0);

function decrypt($ciphertext){
$key = "-----BEGIN RSA PRIVATE KEY-----
MIIBPAIBAAJBALVKfitzSsZ7sFnMMI+FlXvVHiTYjvSCh/tTHYtoL0XWLAZWJNfX
XHeFotrn8tY9AJkjH/Ng06JvUDQWrNawIm0CAwEAAQJBAKahQpiTTr5if7P5vwSb
xsrcFunM9pB8zZnOSlCRQSoQ5FkTqTPz4lMUbKHLGWfGlcWJ8gzzGvELHMSsFviL
PIECIQDqSHz58Sb9G3LgLSmqtSpzoQcJ4zVwsc+mKHMNITnT4QIhAMYYgbd0bSNi
sQBv3+swaQq4+7MYvr0gQZBvxWugzGANAiEAs7EpeiMGfneBIoRBQxd1Gf7WATVt
laQr2guIQvfK/MECIQCEF9FfuKYSA3xN80vYM5bHzKQiP+zohjrSCoYVh8rgfQIg
TRvRC55WLkiEOvh36+G/YHi7nPw5KZWwdjQ9SF/biMk=
-----END RSA PRIVATE KEY-----";
    
$private_key = openssl_pkey_get_private($key);
    
$bin_ciphertext = base64_decode($ciphertext);

$plaintext = null;
    
$deciphred = openssl_private_decrypt($bin_ciphertext, $plaintext, $private_key, OPENSSL_PKCS1_PADDING)
or die("openssl_private_decrypt failed.");

$pt = base64_decode($plaintext);

return $pt;
}


?>