<?php
// Файлы phpmailer
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';
require 'phpmailer/Exception.php';

$title = "Тема письма";
$file = $_FILES['file'];

$c = true;
// Формирование самого письма
$title = "Заголовок письма";
foreach ( $_POST as $key => $value ) {
  if ( $value != "" && $key != "project_name" && $key != "admin_email" && $key != "form_subject" && $key != 'recaptcha') {
    $body .= "
    " . ( ($c = !$c) ? '<tr>':'<tr style="background-color: #f8f8f8;">' ) . "
      <td style='padding: 10px; border: #e9e9e9 1px solid;'><b>$key</b></td>
      <td style='padding: 10px; border: #e9e9e9 1px solid;'>$value</td>
    </tr>
    ";
  }
}

$body = "<table style='width: 100%;'>$body</table>";

// Настройки PHPMailer
$mail = new PHPMailer\PHPMailer\PHPMailer();


$GOOGLE_RECAPTHCA_V_3_SECRET_KEY = "6LdpMdwpAAAAAJO3_3kUfvcOmE19FooNOwrBhDWn";
$GOOGLE_RECAPTHCA_V_3_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

$recaptcha_params = array(
  'secret' => $GOOGLE_RECAPTHCA_V_3_SECRET_KEY,
  'response' => $_POST['recaptcha'],
);

$ch = curl_init($GOOGLE_RECAPTHCA_V_3_VERIFY_URL);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $recaptcha_params);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);

if (!empty($response)) {
  $decoded_response = json_decode($response);
}

if ($decoded_response && $decoded_response->score > 0.5) {
  try {
    $mail->isSMTP();
    $mail->CharSet = "UTF-8";
    $mail->SMTPAuth   = true;
    $mail->SMTPDebug = 2;

    // Настройки вашей почты
    $mail->Host       = 'smtp.spaceweb.ru'; // SMTP сервера вашей почты
    $mail->Username   = ''; // Логин на почте
    $mail->Password   = ''; // Пароль на почте
    // $mail->SMTPSecure = 'ssl';
    $mail->Port       = 25;

    $mail->setFrom('sale@pogdveri.ru',); // Адрес самой почты и имя отправителя

    // Получатель письма
    $mail->addAddress('');

    // Прикрипление файлов к письму
    if (!empty($file['name'][0])) {
      for ($ct = 0; $ct < count($file['tmp_name']); $ct++) {
        $uploadfile = tempnam(sys_get_temp_dir(), sha1($file['name'][$ct]));
        $filename = $file['name'][$ct];
        if (move_uploaded_file($file['tmp_name'][$ct], $uploadfile)) {
            $mail->addAttachment($uploadfile, $filename);
            $rfile[] = "Файл $filename прикреплён";
        } else {
            $rfile[] = "Не удалось прикрепить файл $filename";
        }
      }
    }

    // Отправка сообщения
    $mail->isHTML(true);
    $mail->Subject = $title;
    $mail->Body = $body;

    $mail->send();

  } catch (Exception $e) {
    $status = "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
  }
} else {
      echo json_encode(['STATUS'=>'ERROR', 'MESSAGE' => 'Проверка капчи не пройдена']);
}
