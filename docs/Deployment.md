# 🚀 Production Deployment Manual

This manual guides you through deploying the **Sankalp Sports Fest Live Scoreboard** to production environments. It covers MongoDB Atlas, Render (backend), Vercel (frontend), and environment variables.

---

## 1. Prerequisites Checklist
*   An account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
*   An account on [Render](https://render.com/) or another Node host.
*   An account on [Vercel](https://vercel.com/) or another static website host.
*   Production domain parameters or active subdomains.

---

## 2. Step 1: Set Up MongoDB Atlas

1.  **Create a Cluster**: Log in to MongoDB Atlas and create a new free tier (M0) shared database cluster. Select a region close to your target audience.
2.  **Network Access Settings**:
    *   Navigate to **Network Access** under Security.
    *   Click **Add IP Address**.
    *   Select **Allow Access from Anywhere** (`0.0.0.0/0`) to accommodate Render's dynamic backend IP nodes, or configure specific security filters.
3.  **Database User Settings**:
    *   Navigate to **Database Access** under Security.
    *   Click **Add New Database User**.
    *   Configure authentication as Password, create a username/password, and grant **Read and Write to Any Database** permissions.
4.  **Fetch Connection String**:
    *   Navigate to **Database** under Deployment.
    *   Click **Connect** -> **Drivers**.
    *   Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`). Replace `<password>` with your database user password.

---

## 3. Step 2: Deploy Backend on Render

1.  **Link your GitHub Repository**:
    *   Log in to Render and click **New** -> **Web Service**.
    *   Connect your GitHub account and select the repository.
2.  **Configure Web Service Settings**:
    *   **Name**: `sankalp-scoreboard-backend`
    *   **Language**: `Node`
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
3.  **Configure Environment Variables**:
    *   Click **Advanced** and add the following keys:
        *   `MONGO_URI` = *Your MongoDB Atlas connection URI.*
        *   `JWT_SECRET` = *Configure a secure, randomized key string.*
        *   `CLIENT_URL` = *Your target frontend URL (e.g., `https://sankalp-sports.vercel.app`).*
        *   `PORT` = `10000` (Render will automatically bind this parameter, but manual configuration ensures local consistency).
4.  **Start Deploying**: Click **Create Web Service**. Record your web service URL once compilation finishes (e.g., `https://sankalp-scoreboard-backend.onrender.com`).

---

## 4. Step 3: Deploy Frontend on Vercel

1.  **Configure local redirect rules**:
    Verify that `frontend/vercel.json` exists with the following rewrites to handle SPA routing paths correctly:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
2.  **Import to Vercel**:
    *   Log in to Vercel and click **Add New** -> **Project**.
    *   Select your GitHub repository.
3.  **Project Framework Parameters**:
    *   **Framework Preset**: `Other` (Vite will be resolved automatically from configurations).
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
4.  **Configure Environment Variables**:
    *   Add the following variables:
        *   `VITE_API_URL` = *Your deployed Render backend API URL (e.g. `https://sankalp-scoreboard-backend.onrender.com/api`).*
5.  **Build**: Click **Deploy**. Vercel will build the React bundles and host them on a secure CDN.

---

## 5. Production Environment Variables Reference

### Backend Settings
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGO_URI` | `mongodb+srv://dbUser:strongPassword@cluster0.mongodb.net/prodDB` | Connection URI targeting MongoDB Atlas. |
| `JWT_SECRET` | `4f82c...9b83` (Use a strong random hash) | Encryption secret to sign and verify JSON Web Tokens. |
| `CLIENT_URL` | `https://sankalp-sports.vercel.app` | Restricts CORS requests to your frontend domain. |
| `PORT` | `10000` | Deployed server listener port. |

### Frontend Settings
| Key | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://sankalp-scoreboard-backend.onrender.com/api` | Target API gateway endpoint URL. |

---

## 6. Post-Deployment Database Initialization

Once the services are live:
1.  Connect to your deployed backend using a terminal, or run the seeder script locally while pointing to the production MongoDB Atlas URI:
    ```bash
    # From backend directory
    MONGO_URI="mongodb+srv://..." npm run seed
    ```
2.  Log in to the admin dashboard using the default credentials (`admin` / `password123`).
3.  **IMPORTANT SECURITY ACTION**: Update the default admin credentials inside MongoDB immediately to secure dashboard operations.
