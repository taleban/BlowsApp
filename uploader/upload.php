<?php
session_start();
error_reporting(E_ALL);
include "../sql.php";

function createThumbnail($new_width, $new_height, $extension)
{
    

    $mime = getimagesize($_FILES['upl']['tmp_name']);

    if($mime['mime']=='image/png'){ $src_img = imagecreatefrompng($_FILES['upl']['tmp_name']); }
    if($mime['mime']=='image/jpg'){ $src_img = imagecreatefromjpeg($_FILES['upl']['tmp_name']); }
    if($mime['mime']=='image/jpeg'){ $src_img = imagecreatefromjpeg($_FILES['upl']['tmp_name']); }
    if($mime['mime']=='image/pjpeg'){ $src_img = imagecreatefromjpeg($_FILES['upl']['tmp_name']); }

    $old_x          =   imageSX($src_img);
    $old_y          =   imageSY($src_img);

    if($old_x > $old_y) 
    {
        $thumb_w    =   $new_width;
        $thumb_h    =   $old_y*($new_height/$old_x);
    }

    if($old_x < $old_y) 
    {
        $thumb_w    =   $old_x*($new_width/$old_y);
        $thumb_h    =   $new_height;
    }

    if($old_x == $old_y) 
    {
        $thumb_w    =   $new_width;
        $thumb_h    =   $new_height;
    }

    $dst_img        =   ImageCreateTrueColor($thumb_w,$thumb_h);

    imagecopyresampled($dst_img,$src_img,0,0,0,0,$thumb_w,$thumb_h,$old_x,$old_y); 

    if($mime['mime']=='image/png'){ $result = imagepng($dst_img,'../photos/'.$_SESSION["id"]."."."png",8); modifyPhoto("png");}
    if($mime['mime']=='image/jpg'){ $result = imagejpeg($dst_img,'../photos/'.$_SESSION["id"]."."."jpg",80); modifyPhoto("jpg");}
    if($mime['mime']=='image/jpeg'){ $result = imagejpeg($dst_img,'../photos/'.$_SESSION["id"]."."."jpeg",80); modifyPhoto("jpeg");}
    if($mime['mime']=='image/pjpeg'){ $result = imagejpeg($dst_img,'../photos/'.$_SESSION["id"]."."."pjpeg",80); modifyPhoto("jpeg");}
    
    
    imagedestroy($dst_img); 
    imagedestroy($src_img);

    return $result;
}

if($_SESSION["authorized"]==1){
$allowed = array('png', 'jpg', 'gif','zip');

if(isset($_FILES['upl']) && $_FILES['upl']['error'] == 0){

	$extension = pathinfo($_FILES['upl']['name'], PATHINFO_EXTENSION);

	if(!in_array(strtolower($extension), $allowed)){
		echo '{"status":"error"}';
		exit;
	}else{
        
    createThumbnail(400, 400, $extension);
    exit;
    }
    
}

echo '{"status":"error"}';
exit;
}
?>