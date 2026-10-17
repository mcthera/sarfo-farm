<?php
// Single-file REST backend. Usage: api.php?action=animals|inquiry|add|delete|inquiries
require 'config.php';
header('Content-Type: application/json');

function out($data, int $code = 200) { http_response_code($code); echo json_encode($data); exit; }
function admin() {
  $key = $_SERVER['HTTP_X_API_KEY'] ?? '';
  if (!hash_equals(ADMIN_API_KEY, $key)) out(['error' => 'Invalid API key'], 401);
}

try {
  $db = new PDO('pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME, DB_USER, DB_PASS,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
} catch (PDOException $e) { out(['error' => 'Database connection failed'], 500); }

$action = $_GET['action'] ?? '';
$in = $_POST;

switch ($action) {
  case 'animals': // public
    out($db->query('SELECT * FROM animals ORDER BY created_at DESC')->fetchAll());

  case 'inquiry': // public contact form
    $name = trim($in['name'] ?? ''); $phone = trim($in['phone'] ?? ''); $msg = trim($in['message'] ?? '');
    if (!$name || !$phone || !$msg) out(['error' => 'All fields are required'], 422);
    $db->prepare('INSERT INTO inquiries(name,phone,message) VALUES(?,?,?)')->execute([$name, $phone, $msg]);
    out(['ok' => true], 201);

  case 'add': // admin: multipart form with optional image
    admin();
    if (empty(trim($in['name'] ?? '')) || empty($in['category'])) out(['error' => 'Name and category are required'], 422);
    $file = null;
    if (!empty($_FILES['image']['tmp_name'])) {
      $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][mime_content_type($_FILES['image']['tmp_name'])] ?? null;
      if (!$ext || $_FILES['image']['size'] > 5 * 1024 * 1024) out(['error' => 'Image must be JPG, PNG or WebP under 5MB'], 422);
      $file = bin2hex(random_bytes(8)) . ".$ext";
      move_uploaded_file($_FILES['image']['tmp_name'], __DIR__ . "/uploads/$file");
    }
    $db->prepare('INSERT INTO animals(name,category,breed,price,description,image,available) VALUES(?,?,?,?,?,?,?)')
       ->execute([trim($in['name']), $in['category'], $in['breed'] ?? null, $in['price'] !== '' ? $in['price'] : null,
                  $in['description'] ?? null, $file, ($in['available'] ?? '1') === '1' ? 'true' : 'false']);
    out(['ok' => true], 201);

  case 'delete': // admin
    admin();
    $id = (int)($in['id'] ?? 0);
    $img = $db->prepare('SELECT image FROM animals WHERE id=?'); $img->execute([$id]);
    if ($f = $img->fetchColumn()) @unlink(__DIR__ . '/uploads/' . basename($f));
    $db->prepare('DELETE FROM animals WHERE id=?')->execute([$id]);
    out(['ok' => true]);

  case 'inquiries': // admin
    admin();
    out($db->query('SELECT * FROM inquiries ORDER BY created_at DESC')->fetchAll());

  default: out(['error' => 'Unknown action'], 404);
}
