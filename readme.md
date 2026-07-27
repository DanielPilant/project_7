# SoundForge 🎛️

**Audio Asset Marketplace - Full-Stack Web Development Final Project**

SoundForge is a full end-to-end digital marketplace designed for audio creators, music producers, and game developers. The system allows creators to upload, price, and share sound packs, sound effects, and presets, while clients can listen to previews, purchase through a shopping cart, and download the files.

---

## 🛠 Technologies & Architecture

The system is built as a complete Full-Stack application based on the following requirements:

### Server-Side (Backend)

- **Runtime Environment:** NodeJS with Express infrastructure.
- **Architecture:** Modular division into classic MVC layers - `Models, Services, Controllers, Routes, Index`.
- **Database:** Relational - MySQL based on well-planned tables.
- **Security & Authentication:** Encrypted password management and JWT (JSON Web Tokens) generation for authentication and authorization.
- **External APIs:**
  - **Stripe API:** To simulate a real credit card clearing and checkout process.
  - **Cloudinary / AWS S3:** For uploading, storing, and retrieving media files (audio and images) outside the local server.

### Client-Side (Frontend)

- **Core Library:** React with an architecture of Components and Pages.
- **Routing:** Defining protected routes using React Router.
- **Server Communication:** Making well-defined REST API requests using Axios.
- **UI/UX:** Responsive and functional design optimized for two main screen sizes (desktop and mobile).

---

## 👥 User Types & Permissions

The system supports 3 types of users with distinct permission mechanisms:

1. **Client:** Can browse the catalog, listen to demos, manage a shopping cart, make a purchase, and access a personal downloads area.
2. **Creator:** In addition to client permissions, receives access to a dedicated dashboard to upload media files, create new products, and track sales data.
3. **Admin:** The supreme supervisor. Has permissions for platform management, blocking users, and deleting products that violate copyright.

---

## 🗄️ Database Schema (MySQL)

- `Users`: (id, name, email, password_hash, role, created_at)
- `Products`: (id, creator_id, title, description, price, cover_image_url, main_demo_url, zip_file_url, created_at)
- `Product_Previews`: (id, product_id, title, demo_audio_url, created_at) — extra demo sounds attached to a product
- `Product_Reviews`: (id, product_id, user_id, rating, comment, created_at) — user ratings & comments on a product
- `Orders`: (id, user_id, total_amount, payment_status, created_at)
- `Order_Items`: (order_id, product_id, price_at_purchase)

---

## 📋 Work Plan & Role Division (Feature-Based / Vertical Slicing)

The work is divided by vertical features, meaning each developer is responsible for the feature end-to-end (both Frontend in React and Backend in NodeJS/MySQL).

### 0. Infrastructure & Skeleton (Pair Programming - Daniel & Shlomo)

- **Backend:** Setting up the Express server, defining the MVC architecture, and connecting to MySQL.
- **Frontend:** Creating the React project, setting up initial routing, and building the design template (Layout, Navbar).

### 1. User System & Authentication (Shlomo)

- **Backend:** DB model for Registration and Login + issuing JWT and Middleware for route protection.
- **Frontend:** Registration and login forms, managing global State (logged in/out user), and saving the token.

### 2. Product Catalog & Search (Daniel)

- **Backend:** Full CRUD for products, building a REST API to fetch products with filtering options.
- **Frontend:** Home page with sound pack cards, and a "Product Details" page displaying extended information.

### 3. Creator Personal Area & Media Upload (Daniel)

- **Backend:** Handling file uploads from the client (Multer) and integrating an External API (Cloudinary/S3) for media storage.
- **Frontend:** Creator dashboard, complex product upload form containing files (FormData), and building an audio player in React to play demos.

### 4. Shopping Cart & Checkout (Shlomo)

- **Backend:** Price validation against the DB and Stripe API integration to create a secure checkout session.
- **Frontend:** Managing the shopping cart State, checkout page, and integrating Stripe UI components for payment simulation.

### 5. Order Management & Downloads (Shlomo)

- **Backend:** Creating order records in the DB after a successful payment. Building a protected and encrypted Endpoint that allows downloading the ZIP file only to those who purchased the product.
- **Frontend:** "My Downloads" page for the user showing purchase history and download buttons for the files.

### 6. Admin Moderation Panel (Daniel)

- **Backend:** Developing routes protected by specific admin permissions, building functions to delete products and block users.
- **Frontend:** Administrative dashboard displaying statistical data tables and central control actions.

---
