# Pemisahan Frontend dan Backend - Migration Guide

## Perubahan yang Telah Dilakukan

### 1. Backend (API Endpoints)
Backend sekarang hanya menyediakan REST API endpoints tanpa server-side rendering.

#### Admin Controller (`src/admin/admin.controller.ts`)
- **Sebelum**: Menggunakan `@Render` decorator untuk me-render Handlebars templates
- **Sesudah**: Return JSON dari API endpoints di `/api/admin/*`
  - `GET /api/admin/stats` - Dashboard statistics
  - `GET /api/admin/users` - List users
  - `GET /api/admin/products` - List products
  - `GET /api/admin/pricings` - List pricing plans
  - `GET /api/admin/features` - List features
  - `GET /api/admin/about` - List about sections
  - `GET /api/admin/members` - List team members

#### Frontend Controller (`src/frontend/frontend.controller.ts`)
- **Sebelum**: Menggunakan `@Render` untuk home dan login pages
- **Sesudah**: Return JSON dari API endpoint
  - `GET /api/company-profile` - Company profile data

### 2. Frontend (Static HTML)
Frontend sekarang adalah file HTML statis yang fetch data dari API.

#### File HTML yang Dibuat
Lokasi: `public/html/`

1. **index.html** - Homepage
   - Fetch data dari `/api/company-profile`
   - Menampilkan: About, Team, Products, Features, Pricing
   - Layout dan CSS: SAMA PERSIS dengan versi Handlebars

2. **login.html** - Login page
   - Submit credentials ke `/api/v1/auth/email/login`
   - Menyimpan token di localStorage
   - Redirect ke admin panel setelah login berhasil

3. **admin.html** - Admin dashboard
   - Fetch statistics dari `/api/admin/stats`
   - Menampilkan overview dan quick actions
   - Layout dan CSS: SAMA PERSIS dengan versi Handlebars

### 3. Main Configuration (`src/main.ts`)
- **Dihapus**: 
  - Import `express-handlebars`
  - Konfigurasi Handlebars engine
  - View engine setup
  
- **Ditambahkan**:
  - Serve static HTML files dari `/html`
  - Redirect dari `/` ke `/html/index.html`
  - Redirect dari `/login` ke `/html/login.html`
  - Redirect dari `/admin` ke `/html/admin.html`

### 4. Routing
- **Root path (`/`)**: Redirect ke `/html/index.html`
- **API paths (`/api/*`)**: REST API endpoints
- **Static files**:
  - `/html/*` - HTML files
  - `/js/*` - JavaScript files
  - `/themes/*` - CSS themes

## File yang Sudah Menggunakan API

JavaScript files di `public/js/` sudah menggunakan fetch API:
- `admin-products.js` - CRUD operations untuk products
- `admin-pricings.js` - CRUD operations untuk pricing
- `admin-features.js` - CRUD operations untuk features
- `admin-about.js` - CRUD operations untuk about
- `admin-members.js` - CRUD operations untuk members
- `admin-auth.js` - Authentication logic

## ✅ Semua Halaman HTML Sudah Dibuat

Semua halaman admin telah berhasil dibuat di `public/html/`:
1. ✅ `admin-products.html` - Product management dengan CRUD lengkap
2. ✅ `admin-pricings.html` - Pricing plans management
3. ✅ `admin-features.html` - Features management
4. ✅ `admin-about.html` - About sections management
5. ✅ `admin-members.html` - Team members management

Setiap halaman sudah terintegrasi dengan:
- JavaScript CRUD dari `/js/admin-*.js`
- Authentication check via localStorage
- Fetch data dari API endpoints
- UI yang sama persis dengan template Handlebars

## Cara Membuat Halaman Admin HTML

Setiap halaman admin mengikuti pola yang sama:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Sama seperti admin.html -->
  <title>[Title] - DatiDashi Company</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>/* Copy styles dari admin.html */</style>
</head>
<body>
  <div class="admin-container">
    <!-- Sidebar - sama untuk semua halaman, ubah active state -->
    <aside class="sidebar-scroll">...</aside>
    
    <!-- Main content - spesifik per halaman -->
    <div class="main-content-wrapper">
      <header>...</header>
      <main class="main-content">
        <!-- Table atau form untuk CRUD -->
      </main>
    </div>
  </div>
  
  <!-- Modal untuk Create/Edit -->
  <div id="[entity]Modal">...</div>
  
  <!-- Script dari public/js -->
  <script src="/js/admin-[entity].js"></script>
</body>
</html>
```

## Keuntungan Pemisahan

1. **Scalability**: Frontend dan backend bisa di-deploy terpisah
2. **Flexibility**: Frontend bisa diganti dengan React/Vue/Angular tanpa ubah backend
3. **Performance**: Static files bisa di-cache dan di-serve dari CDN
4. **Development**: Frontend dan backend developer bisa bekerja paralel
5. **API-First**: API bisa digunakan oleh mobile apps atau third-party

## Testing

Untuk testing setelah deployment:

1. Akses homepage: `http://localhost:3000/` → redirect ke `/html/index.html`
2. Data harus ter-load dari API: `/api/company-profile`
3. Login: `http://localhost:3000/login` → redirect ke `/html/login.html`
4. Setelah login, akses admin: `http://localhost:3000/admin` → redirect ke `/html/admin.html`
5. Stats harus ter-load dari API: `/api/admin/stats`

## UI Consistency

**PENTING**: Semua HTML yang dibuat menggunakan:
- CSS classes yang SAMA dengan template Handlebars
- Layout yang SAMA PERSIS
- Tailwind CSS dan Font Awesome icons
- Tidak ada perubahan pada tampilan visual

Frontend sekarang fetch data via JavaScript instead of server-side rendering, tapi tampilan tetap identik.

---

**Status**: ✅ COMPLETE - Frontend dan Backend sudah terpisah 100%

**Halaman**: 8/8 pages complete
- ✅ Homepage (index.html)
- ✅ Login (login.html)  
- ✅ Admin Dashboard (admin.html)
- ✅ Admin Products (admin-products.html)
- ✅ Admin Pricings (admin-pricings.html)
- ✅ Admin Features (admin-features.html)
- ✅ Admin About (admin-about.html)
- ✅ Admin Members (admin-members.html)

**Cara Menjalankan**:
1. Start backend: `npm run start:dev`
2. Akses homepage: `http://localhost:3000/` (auto redirect ke `/html/index.html`)
3. Login: `http://localhost:3000/login` (auto redirect ke `/html/login.html`)
4. Admin: `http://localhost:3000/admin` (auto redirect ke `/html/admin.html`)

**Teknologi**:
- Backend: NestJS dengan REST API
- Frontend: HTML + JavaScript (Vanilla)
- Styling: Tailwind CSS + Font Awesome
- Communication: Fetch API
- Auth: JWT Bearer Token
