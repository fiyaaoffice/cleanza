# Cleanza - Laundry & Cleaning Store

A highly polished, modern, and interactive laundry and cleaning storefront application built with React, Vite, Tailwind CSS, and Lucide Icons. The application supports full-stack capabilities with an Express backend, and it has been specially optimized with a resilient client-side fallback (using `localStorage` persistence) to run completely as a static Single Page Application (SPA) on **GitHub Pages**.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The server will start, typically on `http://localhost:3000`.

---

## 📦 How to Deploy to GitHub Pages

To deploy this project to GitHub Pages, you will utilize the pre-configured GitHub Actions workflow located at `.github/workflows/deploy.yml`. This workflow automates the build and deployment process every time you push to the `main` or `master` branch.

### Step 1: Initialize Git and Push to GitHub
Since the environment is sandboxed, you can push this project to your own GitHub account. Run the following commands on your local machine after downloading the project files:

```bash
# Initialize a new git repository
git init

# Add all project files
git add .

# Commit changes
git commit -m "feat: initial commit with GitHub Pages configuration"

# Rename default branch to main
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### Step 2: Configure GitHub Repository Permissions
To allow GitHub Actions to successfully deploy the site, you need to grant the appropriate permissions to your workflow:

1. Go to your repository on **GitHub**.
2. Click on **Settings** (tab on the top menu).
3. In the left sidebar, navigate to **Actions** -> **General**.
4. Scroll down to **Workflow permissions**.
5. Select **Read and write permissions**.
6. Click **Save**.

### Step 3: Enable GitHub Pages Source
1. In the left sidebar of your repository settings, navigate to **Pages**.
2. Under **Build and deployment**, look for **Source**.
3. Change the dropdown selection from "Deploy from a branch" to **GitHub Actions**.

Once set up, the GitHub Actions workflow will trigger automatically on your next push, build the production-ready static assets, and deploy them directly to your free GitHub Pages URL (e.g., `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`).

---

## 🛠️ Asset Pathing Configuration (Crucial for GitHub Pages)

GitHub Pages websites are typically served from a subdirectory corresponding to your repository name (e.g., `/cleanza-store/`), rather than the root directory (`/`). 

To prevent `404 Not Found` errors for your styles, scripts, and images, we have configured **relative pathing**:

1. **Vite Configuration (`vite.config.ts`)**:
   We added `base: './'` to force Vite to generate relative URLs for all compiled assets in the final build.
   ```typescript
   export default defineConfig(() => {
     return {
       base: './', // Ensures assets are loaded relatively
       plugins: [react(), tailwindcss()],
       // ...
     }
   });
   ```

2. **Main Entry File (`index.html`)**:
   All local resource links have been updated to use relative `./` prefixes:
   * Favicon: `<link rel="icon" type="image/png" href="./favicon.png" />`
   * Entry Script: `<script type="module" src="./src/main.tsx"></script>`

When adding any future assets, stylesheets, or scripts to `index.html`, always make sure to prefix their paths with `./` rather than `/` to ensure compatibility.

---

## 💾 Resilient Local/Offline Engine

To enable a fully interactive client experience on static web hosts like GitHub Pages (where no active Node.js/Express server is running), we implemented a **Local Fallback Engine**:

* **State Synchronization**: All critical data (products, orders, shopping carts, and admin settings) is initially hydrated from mock data and synchronized directly to the user's browser `localStorage`.
* **Database & Auth Simulation**: If any server-side API endpoint (`/api/*`) is unreachable or returns an error, the application seamlessly falls back to local simulation without interrupting the user. This means customers can still place test orders, register demo accounts, log in as admins, and manage products on GitHub Pages.
