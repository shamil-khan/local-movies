# 🎬 CineVault

### _The Ultimate Effortless Local-First Cinematic Intelligence Movie Management & Discovery_

[![GitHub license](https://img.shields.io)](https://www.gnu.org)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb?logo=react&style=for-the-badge)
](https://react.dev)
[![Powered by Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

**#CineVault** CineVault is a cutting-edge Progressive Web App (PWA) designed to empower movie enthusiasts with seamless management of their personal film collections. By intelligently parsing local movie files, fetching enriched metadata from premier sources like IMDb and TMDB, and offering advanced categorization and filtering, CineVault transforms scattered downloads into a curated, offline-accessible cinematic repository. Whether you're archiving classics or discovering hidden gems, this app delivers a mind-blowing experience that blends local storage efficiency with global database insights—ensuring your library is always at your fingertips, even without an internet connection.Built for cross-platform compatibility. CineVault supports iOS and Android devices, allowing effortless installation as a native-like app directly from your browser.

---

## 🚀 Key Innovations

### 🧠 Intelligent Parsing & Ingestion

- **Deep Folder Scanning:** Upload entire directories or nested folders. CineStack recursively hunts for media.

- **Precision Filtering:** Automatically ignores system junk, keeping only mp4, mkv, avi, and other high-quality formats.

- **Regex-Powered Titling:** Smartly extracts Title + Year from messy filenames for 99% metadata accuracy.

### 🔍 Metadata Orchestration

- **Hybrid Fetching:** Pulls exhaustive details (Genre, Rating, Language, Country) from IMDB.

- **Visual Fallbacks:** If IMDB lacks high-res posters, CineStack automatically hot-swaps to TMDB to ensure your library looks stunning.

- **Status Tracking:** Real-time visual feedback with color-coded flags:
  - 🟢 Success: Metadata & Poster secured.
  - 🔴 Failure: Action required.
  - 🔵 Duplicate: Already in your vault.

### 🎭 Deep Library Management

- **Dynamic Accumulation:** Filters aren't hardcoded; they adapt to your library. Ratings are grouped (e.g., 7.5-7.9) and years are stacked in 5-year spans for ergonomic browsing.

- **Custom Taxonomy:** Create, rename, and link movies to unlimited custom categories.

- **Watch Status:** One-click toggles for Watched (👁️) and Favorites (❤️) with integrated global filtering.

---

## ⭐ Key Features

- ✅ **Centralized Library:** Upload local movie files & folders (including nested folders) with smart file-title parsing.
- ✅ **Dynamic Categorization:** Automatic 'Uploaded' and 'Searched' categories, plus unlimited custom user-managed categories.
- ✅ **Intelligent Metadata Fetching:** Enrich your local titles with details, posters, and trailers from IMDB and TMDB.
- ✅ **Visual Status Flags:** Green (success), Red (failure), Blue (already in library) for processing results.
- ✅ **Advanced Filtering:** Sort by genre, year, rating spans (e.g., `7.0-7.4`), languages, favorites, and watch status.
- ✅ **Offline Access:** Enjoy your entire aggregation group without internet access once data is fetched.
- ✅ **Deep Search:** Local library search with fallback to YouTube trailer integration and TMDB exploration for new discoveries.
- ✅ **Flexible Management:** Link/unlink movies to categories, mark as favorite or watched, and remove entries.

---

## 🛠️ Technologies

| Category      | Technology                                                                                     | Purpose                                  |
| :------------ | :--------------------------------------------------------------------------------------------- | :--------------------------------------- |
| **Core**      | ![Vite](https://img.shields.io) ![React](https://img.shields.io) ![TS](https://img.shields.io) | Modern build setup and type safety.      |
| **Styling**   | ![Tailwind](https://img.shields.io) ![Shadcn](https://img.shields.io)                          | Utility-first CSS and component library. |
| **State**     | ![Zustand](https://img.shields.io) ![Immer](https://img.shields.io)                            | Optimized state management.              |
| **Data**      | ![Dexie](https://img.shields.io)                                                               | IndexedDB wrapper for offline storage.   |
| **Network**   | ![Axios](https://img.shields.io)                                                               | HTTP client for data fetching.           |
| **Dev Tools** | ![ESLint](https://img.shields.io) ![Prettier](https://img.shields.io)                          | Code quality and formatting standards.   |
| **Logging**   | ![Consola](https://img.shields.io) ![Chalk](https://img.shields.io)                            | Terminal logging utilities.              |

---

## ⚙️ Installation & Local Setup

To get #CineVault running on your local machine for development or self-hosting, follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone git@github.com:shamil-khan/local-movies.git
    cd local-movies
    ```

    or

    ```bash
    git clone https://github.com/shamil-khan/local-movies.git
    cd local-movies
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

    or

    ```bash
    pnpm install
    ```

3.  **Run Locally:**
    After running following. Open your browser to `http://localhost:6601`.

    ```bash
    npm run dev
    ```

    or

    ```bash
    pnpm run dev
    ```

4.  **Deploy Locally:**

    ```bash
    npm run build
    ```

    or

    ```bash
    pnpm run build
    ```

5.  **Preview Locally:**
    After running following Open your browser to `http://localhost:6602`.

    ```bash
    npm run preview
    ```

    or

    ```bash
    pnpm run preview
    ```

## Deployment

Deploy to any static hosting service like Vercel, Netlify, or GitHub Pages. For - PWA features:Ensure HTTPS is enabled on your host.

- The app includes a manifest.json with icons for installation.

## 📱 PWA (Progressive Web App) Installation

#CineVault is a fully functional **PWA**, installable on your mobile devices just like a native app!

### Installing on Mobile Devices

| Platform         | Instructions                                                                                                                                                                                                                                            | Icon                                    |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------- |
| **iPhone (iOS)** | 1. Open Safari and navigate to the live URL.<br>2. Tap the **Share** icon.<br>3. Select **"Add to Home Screen"**.<br>4. Tap **"Add"** in the top right corner.                                                                                          | ![iOS Icon](https://img.shields.io)     |
| **Android**      | 1. Open Chrome and navigate to the live URL.<br>2. Tap the **three-dots menu** (⋮).<br>3. Select **"Install app"** or **"Add to Home screen"**.<br>4. Tap **"Install"**.<br>(_Ensure you have PWA support enabled in your browser settings if needed._) | ![Android Icon](https://img.shields.io) |

---

## ⚖️ License & Contributing

We welcome contributions! Please see `CONTRIBUTING.md` for details. Please fork the repository and submit a pull request. Ensure code adheres to ESLint and Prettier standards.
This project is licensed under the **GNU Affero General Public License v3** (AGPL-3.0-or-later).

**Copyright © 2026 Shamil Ahmed (aka Shamil Khan) <shamil.ahmed@gmail.com>**

---
