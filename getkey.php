<?php
session_start();

$publickey = "-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA12wTWd6dnaf7GlcjV1uO
IXh8U9Hpa/iKFdbni1vHr/YZYjg7nLMHx34mClQvJVgDvDNOMlYsqnnjn1724y2t
TQSU+yR4gvpXBOHTN2j9nDDH4PcBi+xChwsrLRFogB9/3Vb32io4AQDb/LzqHRLI
Bz2IsiRtn8f8pFZQU3nTGOyWLhpTD29IepBNmY1L1HGbUcQjMHozKP2ks7IBzXI7
3UsGS1mto9hMLZuO1HS77XJCT770fIydGF8rfL/GEU8Z6iXID6KtNO9+IwNHAk7+
lp7oBBR4gmKbhsR+NX1gVqqtlLWuJNo+XJ7TgMsc/sDaNJFqJ+JdtDwusK6vRem/
RSuHiiL8P98TGfw7zXx2ihetT0qyyswrAv06FzCno0rp5DBR4GG37s3pTGLoK3u/
XgiTwvB+VxH0RXdmWcmuL82/sHy4Ubz3p5aHVyHJje2eOCLTPlIq6FIWe+EqRS6W
m0hAllFaSBrXYkiXA2DNspLKnV1ZNYYAdH8hhEoAoV0dgkomGwQn/vY+wvNeaAjy
+pf2dMknLNshgdAR2pofTXYZtwhKbpniejy6/zBYVW8F8Muqtf2nfL5Nn4X2Mf8a
PDEwyo6Z7wgo6qUy/UEKFHGS2zNVeM1GNkUmailyljC1GtUqOP4xdleYv3kU90qi
b0zspOXC1YjCS+BFOVw6aT8CAwEAAQ==
-----END PUBLIC KEY-----";

echo json_encode(array($publickey));
?>