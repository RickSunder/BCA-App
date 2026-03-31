# Azure Setup Guide — Container Apps

Step-by-step guide to deploy the BCA Admin app using Azure Container Apps.
No CLI needed — everything through the Azure Portal.

---

## Architecture

```
GitHub Actions
  → builds Docker image
  → pushes to Azure Container Registry (ACR)
  → updates Container App

Azure Container App  ←→  Azure SQL Database
```

---

## What You Need to Create

| Resource | Name |
|---|---|
| Resource Group | `rg-bca-admin-dev` |
| Azure Container Registry | `acrbcaadmindev` *(globally unique — change if taken)* |
| SQL Server | `sql-bca-admin-dev` *(globally unique — change if taken)* |
| SQL Database | `sqldb-bca-admin-dev` |
| Container Apps Environment | `cae-bca-admin-dev` |
| Container App | `ca-bca-admin-dev` |

---

## Step 1 — Resource Group

1. Search **"Resource groups"** → click **Create**
2. Fill in:
   - **Subscription:** your subscription
   - **Resource group name:** `rg-bca-admin-dev`
   - **Region:** West Europe
3. Click **Review + create** → **Create**

---

## Step 2 — SQL Server

1. Search **"SQL servers"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Server name:** `sql-bca-admin-dev` *(change if taken)*
   - **Region:** West Europe
   - **Authentication method:** Use SQL authentication
   - **Server admin login:** `sqladmin`
   - **Password:** create a strong password and save it
     *(min 8 chars, uppercase + lowercase + number + symbol)*
3. Click **Review + create** → **Create**

---

## Step 3 — SQL Database

1. Search **"SQL databases"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Database name:** `sqldb-bca-admin-dev`
   - **Server:** `sql-bca-admin-dev`
3. Click **Configure database** → select **Basic** tier → **Apply**
4. Click **Review + create** → **Create**

---

## Step 4 — SQL Firewall

Allow Azure services (including Container Apps) to reach the database.

1. Go to your SQL Server (`sql-bca-admin-dev`)
2. In the left menu click **Networking**
3. Under **Firewall rules**, enable:
   - ✅ **Allow Azure services and resources to access this server**
4. Click **Save**

---

## Step 5 — Run the Database Schema

1. Go to your SQL Database (`sqldb-bca-admin-dev`)
2. In the left menu click **Query editor (preview)**
3. Log in with `sqladmin` and your password
4. Open `db/schema.sql` from this project in VS Code
5. Copy the entire contents → paste into the Query editor → click **Run**

---

## Step 6 — Azure Container Registry

1. Search **"Container registries"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Registry name:** `acrbcaadmindev` *(alphanumeric only, globally unique)*
   - **Region:** West Europe
   - **Pricing plan:** Basic
3. Click **Review + create** → **Create**
4. After creation, go to the registry → **Access keys** in the left menu
5. Toggle **Admin user** to **Enabled**
6. Note the **Username** and either **password** — you'll need these for GitHub secrets

---

## Step 7 — Container Apps Environment

1. Search **"Container Apps Environments"** → click **Create**
2. Fill in:
   - **Resource group:** `rg-bca-admin-dev`
   - **Name:** `cae-bca-admin-dev`
   - **Region:** West Europe
3. Click **Review + create** → **Create**

---

## Step 8 — Container App

1. Search **"Container Apps"** → click **Create**
2. **Basics** tab:
   - **Resource group:** `rg-bca-admin-dev`
   - **Container app name:** `ca-bca-admin-dev`
   - **Region:** West Europe
   - **Container Apps Environment:** `cae-bca-admin-dev`
3. Click **Next: Container**
4. **Container** tab:
   - Uncheck **Use quickstart image**
   - **Image source:** Azure Container Registry
   - **Registry:** `acrbcaadmindev`
   - **Image:** `bca-admin` *(type this — the image will be pushed by GitHub Actions shortly)*
   - **Image tag:** `latest`
   - Under **Environment variables**, click **+ Add** for each:

   | Name | Value |
   |---|---|
   | `SQL_SERVER` | `sql-bca-admin-dev.database.windows.net` |
   | `SQL_DATABASE` | `sqldb-bca-admin-dev` |
   | `SQL_USER` | `sqladmin` |
   | `SQL_PASSWORD` | your SQL password from Step 2 |
   | `SQL_PORT` | `1433` |
   | `SQL_ENCRYPT` | `true` |
   | `SQL_TRUST_SERVER_CERT` | `false` |
   | `NODE_ENV` | `production` |

5. Click **Next: Ingress**
6. **Ingress** tab:
   - Toggle **Ingress** to **Enabled**
   - **Ingress traffic:** Accepting traffic from anywhere
   - **Target port:** `3000`
7. Click **Review + create** → **Create**

> **Note:** The initial creation may fail because the `bca-admin` image doesn't exist in ACR yet.
> If it fails, complete Step 9 first (push the first image), then come back and create the Container App.

---

## Step 9 — GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `AZURE_CREDENTIALS` | JSON from `az ad sp create-for-rbac` (see below) |
| `ACR_USERNAME` | ACR admin username from Step 6 (same as the registry name) |
| `ACR_PASSWORD` | ACR admin password from Step 6 |

### Getting AZURE_CREDENTIALS

Run in your terminal:
```
az login
az ad sp create-for-rbac --name "bca-admin-github" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID --sdk-auth
```
Copy the entire JSON output as the secret value.

To find your subscription ID: in Azure Portal search **"Subscriptions"** and copy the ID.

---

## Step 10 — Deploy

Push to the `main` branch (or trigger manually from GitHub Actions → **Run workflow**).

GitHub Actions will:
1. Build the Docker image
2. Push it to `acrbcaadmindev.azurecr.io/bca-admin:<commit-sha>`
3. Update the Container App to run the new image

Your app will be live at the URL shown on the Container App overview page
(format: `https://ca-bca-admin-dev.<random>.westeurope.azurecontainerapps.io`).

---

## What You End Up With

```
rg-bca-admin-dev/
├── acrbcaadmindev          (Container Registry — stores Docker images)
├── cae-bca-admin-dev       (Container Apps Environment)
├── ca-bca-admin-dev        (Container App — your running app)
├── sql-bca-admin-dev       (SQL Server)
└── sqldb-bca-admin-dev     (SQL Database — Basic ~€5/mo)
```

Push to `main` → GitHub Actions builds and deploys automatically.

---

## Troubleshooting

**Container App shows an error page**
→ Go to Container App → **Log stream** in the left menu to see live logs

**"Cannot connect to database"**
→ Check the `SQL_SERVER` env var ends in `.database.windows.net`
→ Make sure "Allow Azure services" is enabled on the SQL Server firewall (Step 4)

**GitHub Actions fails at "Deploy to Container Apps"**
→ Make sure the Container App already exists (Step 8)
→ Check the `CONTAINER_APP_NAME` and `RESOURCE_GROUP` in `deploy.yml` match exactly

**GitHub Actions fails at "Login to ACR"**
→ Check that `ACR_USERNAME` and `ACR_PASSWORD` secrets are set correctly
→ Confirm admin user is enabled on the ACR (Step 6)

**ACR_NAME in deploy.yml doesn't match your registry**
→ If you chose a different registry name, update `ACR_NAME` in `.github/workflows/deploy.yml`