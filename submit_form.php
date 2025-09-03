<?php
session_start();
header('Content-Type: application/json');

// Configuration
define('ADMIN_EMAIL', 'mohammedalhajimohammed111@gmail.com'); // Replace with your email
define('SMTP_HOST', 'smtp-relay.brevo.com'); // Replace with your SMTP host
define('SMTP_PORT', 587); // Replace with your SMTP port
define('SMTP_USERNAME', '891493001@smtp-brevo.com'); // Replace with your SMTP username
define('SMTP_PASSWORD', '31WzHn4PhDFxGyRs'); // Replace with your SMTP password
define('MAX_SUBMISSIONS_PER_HOUR', 5); // Maximum form submissions per hour
define('ERROR_LOG_FILE', 'error_log.txt');

// Function to sanitize input
function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Function to validate email
function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate phone number
function is_valid_phone($phone) {
    return preg_match('/^[0-9]{10,15}$/', $phone);
}

// Function to log errors
function log_error($message) {
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message\n";
    error_log($log_message, 3, ERROR_LOG_FILE);
}

// Function to check rate limiting
function check_rate_limit() {
    if (!isset($_SESSION['submission_count'])) {
        $_SESSION['submission_count'] = 0;
        $_SESSION['submission_time'] = time();
    }

    // Reset counter if an hour has passed
    if (time() - $_SESSION['submission_time'] > 3600) {
        $_SESSION['submission_count'] = 0;
        $_SESSION['submission_time'] = time();
    }

    if ($_SESSION['submission_count'] >= MAX_SUBMISSIONS_PER_HOUR) {
        return false;
    }

    $_SESSION['submission_count']++;
    return true;
}

// Function to send email using PHPMailer
function send_email($name, $email, $phone, $message) {
    require 'vendor/autoload.php'; // Make sure to install PHPMailer via Composer

    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;

        // Recipients
        $mail->setFrom($email, $name);
        $mail->addAddress(ADMIN_EMAIL);
        $mail->addReplyTo($email, $name);

        // Content
        $mail->isHTML(true);
        $mail->Subject = "New Contact Form Submission from $name";
        
        // Email template
        $emailBody = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #391b52; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; color: #666; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h2>New Contact Form Submission</h2>
                    </div>
                    <div class='content'>
                        <p><strong>Name:</strong> {$name}</p>
                        <p><strong>Email:</strong> {$email}</p>
                        <p><strong>Phone:</strong> {$phone}</p>
                        <p><strong>Message:</strong></p>
                        <p>" . nl2br(htmlspecialchars($message)) . "</p>
                    </div>
                    <div class='footer'>
                        <p>This email was sent from the contact form on your website.</p>
                    </div>
                </div>
            </body>
            </html>
        ";
        
        $mail->Body = $emailBody;
        $mail->AltBody = "Name: $name\nEmail: $email\nPhone: $phone\n\nMessage:\n$message";

        $mail->send();
        return true;
    } catch (Exception $e) {
        log_error("Email sending failed: {$mail->ErrorInfo}");
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $response = array();
    
    // Validate CSRF token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $response['status'] = 'error';
        $response['message'] = 'Invalid request';
        echo json_encode($response);
        exit;
    }

    // Check rate limiting
    if (!check_rate_limit()) {
        $response['status'] = 'error';
        $response['message'] = 'Too many submissions. Please try again later.';
        echo json_encode($response);
        exit;
    }

    // Get and sanitize form data
    $name = sanitize_input($_POST['name']);
    $email = sanitize_input($_POST['email']);
    $phone = isset($_POST['phone']) ? sanitize_input($_POST['phone']) : '';
    $message = sanitize_input($_POST['message']);

    // Validate inputs
    $errors = array();
    
    if (empty($name)) {
        $errors[] = 'Name is required';
    }
    
    if (empty($email) || !is_valid_email($email)) {
        $errors[] = 'Valid email is required';
    }
    
    if (!empty($phone) && !is_valid_phone($phone)) {
        $errors[] = 'Invalid phone number format';
    }
    
    if (empty($message)) {
        $errors[] = 'Message is required';
    }

    if (!empty($errors)) {
        $response['status'] = 'error';
        $response['message'] = implode(', ', $errors);
        echo json_encode($response);
        exit;
    }

    // Send email
    if (send_email($name, $email, $phone, $message)) {
        $response['status'] = 'success';
        $response['message'] = 'Thank you for your message. We will get back to you soon!';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Sorry, there was an error sending your message. Please try again later.';
    }

    echo json_encode($response);
    exit;
}
?>
