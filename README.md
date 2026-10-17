# Mr. Sarfo Animal Farm

Files: index.html, admin.html, style.css, app.js (frontend) · api.php, config.php (backend) · schema.sql (PostgreSQL)

## Setup
1. Install PHP 8+ and enable `pdo_pgsql` (in php.ini: `extension=pdo_pgsql`).
2. In pgAdmin create database `sarfo_farm`, open Query Tool, and run `schema.sql`.
3. Edit `config.php`: DB password and `ADMIN_API_KEY`.
4. Edit `app.js` CONFIG: phone, WhatsApp, map coordinates, optional `tileKey`.
5. In the VS Code terminal: `php -S localhost:8000`, then open http://localhost:8000
6. Admin: http://localhost:8000/admin.html (enter your API key).

For production: serve over HTTPS and block PHP execution inside /uploads.
