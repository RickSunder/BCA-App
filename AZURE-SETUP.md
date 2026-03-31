# Azure Manual Setup Guide

Step-by-step guide to create all Azure resources and deploy the BCA Admin app
through the Azure Portal — no CLI or scripts needed.

---

## Before You Start — Upgrade Your Subscription

Your free account has 0 quota for App Service. You must upgrade to **Pay-As-You-Go**
first. Your $200 free credit stays. The F1 (Free) App Service tier costs nothing.

1. Go to [portal.azure.com](https://portal.azure.com)
2. Search **"Subscriptions"** in the top bar → click your subscription
3. Click **Upgrade** in the left menu
4. Follow the steps (requires a credit card on file — you won't be charged for F1)

---

## Step 1 — Create a Resource Group

A resource group is a folder that holds all your Azure resources together.

1. In the portal, search **"Resource groups"** → click **Create**
2. Fill in:
   - **Subscription:** Azure subscription 1
   - **Resource group name:** `rg-bca-admin-dev`
   - **Region:** West Europe
3. Click **Review + create** → **Create**

---

## Step 2 — Create a SQL Server

The SQL Server is the logical server that hosts your database.

> **Important:** The server name must be globally unique across all of Azure.
> Use something like `sql-bca-admin-yourname` to avoid conflicts.

1. Search **"SQL servers"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Server name:** `sql-bca-admin-dev` *(change if taken)*
   - **Region:** West Europe
   - **Authentication method:** Use SQL authentication
   - **Server admin login:** `sqladmin`
   - **Password:** create a strong password and save it somewhere safe
     *(min 8 chars, uppercase + lowercase + number + symbol, e.g. `MyP@ss2024!`)*
3. Click **Review + create** → **Create**

---

## Step 3 — Create a SQL Database

1. Search **"SQL databases"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Database name:** `sqldb-bca-admin-dev`
   - **Server:** select `sql-bca-admin-dev` (the one you just created)
3. Click **Configure database** (under Compute + storage):
   - Select **Basic** tier (~€5/month) — enough for a test app
   - Click **Apply**
4. Click **Review + create** → **Create**

---

## Step 4 — Configure the SQL Firewall

The database is locked down by default. You need to allow access from Azure services
(so your Web App can reach the database).

1. Go to your SQL Server (`sql-bca-admin-dev`)
2. In the left menu click **Networking**
3. Under **Firewall rules**, turn on:
   - ✅ **Allow Azure services and resources to access this server**
4. Click **Save**

---

## Step 5 — Run the Database Schema

You need to create the tables before the app can run.

1. In the portal, go to your SQL Database (`sqldb-bca-admin-dev`)
2. In the left menu click **Query editor (preview)**
3. Log in with:
   - **Login:** `sqladmin`
   - **Password:** the password you set in Step 2
4. Open the file `db/schema.sql` from this project in VS Code
5. Copy the entire contents → paste into the Query editor → click **Run**

You should see "Query succeeded" for each statement.

---

## Step 6 — Create an App Service Plan

The App Service Plan defines the hardware tier your Web App runs on.

1. Search **"App Service plans"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Name:** `plan-bca-admin-dev`
   - **Operating System:** Linux
   - **Region:** West Europe
   - **Pricing tier:** Click **Explore pricing tiers** → select **F1** (Free)
3. Click **Review + create** → **Create**

---

## Step 7 — Create the Web App

> **Important:** The app name must be globally unique — it becomes your URL:
> `https://app-bca-admin-dev.azurewebsites.net`
> Add your name if needed: `app-bca-admin-rickdev`

1. Search **"App Services"** → click **Create** → **Web App**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Name:** `app-bca-admin-dev` *(change if taken)*
   - **Publish:** Code
   - **Runtime stack:** Node 20 LTS
   - **Operating System:** Linux
   - **Region:** West Europe
   - **App Service Plan:** `plan-bca-admin-dev`
3. Click **Review + create** → **Create**

---

## Step 8 — Configure Web App Environment Variables

Your app reads database credentials from environment variables. Set them here.

1. Go to your Web App (`app-bca-admin-dev`)
2. In the left menu click **Environment variables**
3. Click **+ Add** for each variable below:

| Name | Value |
|---|---|
| `SQL_SERVER` | `sql-bca-admin-dev.database.windows.net` *(replace with your server name)* |
| `SQL_DATABASE` | `sqldb-bca-admin-dev` |
| `SQL_USER` | `sqladmin` |
| `SQL_PASSWORD` | your SQL password from Step 2 |
| `SQL_PORT` | `1433` |
| `SQL_ENCRYPT` | `true` |
| `SQL_TRUST_SERVER_CERT` | `false` |
| `NODE_ENV` | `production` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` |

4. Click **Apply** → **Confirm**

---

## Step 9 — Configure Startup Command

1. Still on your Web App, go to **Configuration** in the left menu
2. Click the **General settings** tab
3. Set **Startup Command** to: `npm start`
4. Click **Save**

---

## Step 10 — Deploy Your Code via GitHub Actions

Your GitHub Actions workflow (`deploy.yml`) is currently set up for Vercel.
Replace it with this App Service version:

Update `.github/workflows/deploy.yml` — change the `jobs` section to:

```yaml
jobs:
  deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          SQL_SERVER: build-placeholder
          SQL_DATABASE: build-placeholder
          SQL_USER: build-placeholder
          SQL_PASSWORD: build-placeholder
          SQL_PORT: '1433'
          SQL_ENCRYPT: 'true'
          SQL_TRUST_SERVER_CERT: 'false'

      - name: Install production dependencies
        run: npm ci --omit=dev

      - name: Package app
        run: |
          zip -r app.zip .next public package.json package-lock.json next.config.mjs node_modules

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy to App Service
        uses: azure/webapps-deploy@v3
        with:
          app-name: app-bca-admin-dev
          package: app.zip
```

### Required GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `AZURE_CREDENTIALS` | The JSON from `az ad sp create-for-rbac` (see below) |

To get the credentials JSON, run in your terminal:
```
az login
az ad sp create-for-rbac --name "bca-admin-github" --role contributor --scopes /subscriptions/32078d25-2251-4e7b-b726-3e0c0cec8805 --sdk-auth
```
Copy the entire JSON output as the secret value.

---

## What You End Up With

```
rg-bca-admin-dev/
├── plan-bca-admin-dev     (App Service Plan — F1 Free)
├── app-bca-admin-dev      (Web App — https://app-bca-admin-dev.azurewebsites.net)
├── sql-bca-admin-dev      (SQL Server)
└── sqldb-bca-admin-dev    (SQL Database — Basic ~€5/mo)
```

Push to `main` → GitHub Actions builds and deploys automatically.

---

## Troubleshooting

**App shows "Application Error"**
→ Go to Web App → **Log stream** in the left menu to see the live error

**"Cannot connect to database"**
→ Double-check the `SQL_SERVER` environment variable ends in `.database.windows.net`
→ Make sure "Allow Azure services" is enabled on the SQL Server firewall (Step 4)

**Deployment failed in GitHub Actions**
→ Check that `AZURE_CREDENTIALS` secret is the complete JSON (including `{` and `}`)
→ Check the `app-name` in the workflow matches your actual Web App name exactly
