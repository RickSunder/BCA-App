# Deployment Guide

Deploys the BCA Admin app to **Azure App Service** + **Azure SQL Database**
using a GitHub Actions pipeline and Bicep infrastructure templates.

---

## What Gets Created in Azure

| Resource | Name pattern | Purpose |
|---|---|---|
| Resource Group | `rg-bca-admin-dev` | Container for all resources |
| App Service Plan | `plan-bca-admin-dev` | Linux B1 host |
| App Service (Web App) | `app-bca-admin-dev` | Runs Next.js |
| SQL Server (logical) | `sql-bca-admin-dev` | Azure SQL Server instance |
| SQL Database | `sqldb-bca-admin-dev` | The actual database |

---

## One-Time Setup (do this once per Azure subscription)

### Step 1 — Install Azure CLI
```bash
# Windows (winget)
winget install Microsoft.AzureCLI

# or download from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
```

### Step 2 — Log in and create a service principal
```bash
az login

# Get your subscription ID
az account show --query id -o tsv

# Create a service principal with contributor access
az ad sp create-for-rbac \
  --name "bca-admin-github" \
  --role contributor \
  --scopes /subscriptions/32078d25-2251-4e7b-b726-3e0c0cec8805 \
  --sdk-auth
```

Copy the entire JSON output — you'll need it in the next step.

### Step 3 — Add GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Value |
|---|---|
| `AZURE_CREDENTIALS` | The entire JSON from Step 2 |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID (a UUID) |
| `SQL_ADMIN_PASSWORD` | A strong password (min 8 chars, mixed case + number + symbol) |

---

## Deploy

### Automatic deploy
Push to `main` — the pipeline runs automatically.

### Manual deploy (choose environment)
1. Go to your GitHub repo → **Actions**
2. Select **Deploy BCA Admin**
3. Click **Run workflow**
4. Choose environment: `dev`, `staging`, or `prod`
5. Click **Run workflow**

---

## Pipeline Stages

```
build → deploy-infra → deploy-schema → deploy-app
```

| Stage | What it does |
|---|---|
| **build** | `npm ci` + `npm run build`, zips the output |
| **deploy-infra** | Creates/updates Azure resources via Bicep |
| **deploy-schema** | Runs `db/schema.sql` against Azure SQL (safe to re-run) |
| **deploy-app** | Deploys the zip to App Service |

---

## Scaling Up

Edit `infra/main.bicep` parameters at the top:

```bicep
// App Service tiers
// B1  = Basic (~$13/mo)   — fine for dev/staging
// P1v3 = Premium (~$68/mo) — recommended for prod (enables AlwaysOn)

param appServiceSku string = 'B1'   // change to 'P1v3' for prod

// SQL Database tiers
// Basic = ~$5/mo   — dev only
// S0    = ~$15/mo  — light prod
// S1    = ~$30/mo  — medium prod

param sqlDatabaseSku string = 'Basic'  // change to 'S0' or 'S1' for prod
```

---

## Tear Down

To delete all Azure resources (avoids charges):
```bash
az group delete --name rg-bca-admin-dev --yes --no-wait
```
