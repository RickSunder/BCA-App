// ============================================================
// BCA Admin — Azure Infrastructure
// Deploys: App Service Plan + Web App + Azure SQL Server + DB
// ============================================================

@description('Short environment label (dev, staging, prod)')
@allowed(['dev', 'staging', 'prod'])
param environment string = 'dev'

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Base name used to derive all resource names')
param appName string = 'bca-admin'

@description('SQL Server administrator login')
param sqlAdminLogin string = 'sqladmin'

@description('SQL Server administrator password')
@secure()
param sqlAdminPassword string

@description('App Service Plan SKU (B1 = Basic, P1v3 = Premium)')
@allowed(['F1', 'B1', 'B2', 'P1v3', 'P2v3'])
param appServiceSku string = 'F1'

@description('Azure SQL Database SKU')
@allowed(['Basic', 'S0', 'S1', 'S2'])
param sqlDatabaseSku string = 'Basic'

// ── Derived names ─────────────────────────────────────────────
var suffix        = '${appName}-${environment}'
var planName      = 'plan-${suffix}'
var webAppName    = 'app-${suffix}'
var sqlServerName = 'sql-${suffix}'
var sqlDbName     = 'sqldb-${suffix}'

// ── App Service Plan ──────────────────────────────────────────
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: planName
  location: location
  sku: {
    name: appServiceSku
  }
  kind: 'linux'
  properties: {
    reserved: true  // required for Linux
  }
}

// ── Azure SQL Server ──────────────────────────────────────────
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    publicNetworkAccess: 'Enabled'
  }
}

// Allow Azure services to reach the SQL server
resource sqlFirewallAzureServices 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ── Azure SQL Database ────────────────────────────────────────
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: sqlDbName
  location: location
  sku: {
    name: sqlDatabaseSku
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

// ── Web App (Next.js) ─────────────────────────────────────────
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|20-lts'
      appCommandLine: 'npm start'
      alwaysOn: appServiceSku != 'F1' && appServiceSku != 'B1'  // AlwaysOn not available on Free/Basic tiers
      nodeVersion: '20-lts'
      appSettings: [
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        // SQL connection — matches the env vars in src/lib/db.ts
        {
          name: 'SQL_SERVER'
          value: sqlServer.properties.fullyQualifiedDomainName
        }
        {
          name: 'SQL_DATABASE'
          value: sqlDbName
        }
        {
          name: 'SQL_USER'
          value: sqlAdminLogin
        }
        {
          name: 'SQL_PASSWORD'
          value: sqlAdminPassword
        }
        {
          name: 'SQL_PORT'
          value: '1433'
        }
        {
          name: 'SQL_ENCRYPT'
          value: 'true'
        }
        {
          name: 'SQL_TRUST_SERVER_CERT'
          value: 'false'
        }
        // Disable server-side build — app is pre-built and node_modules are bundled in the zip
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
      ]
    }
    httpsOnly: true
  }
}

// ── Outputs ───────────────────────────────────────────────────
output webAppUrl string      = 'https://${webApp.properties.defaultHostName}'
output webAppName string     = webApp.name
output sqlServerFqdn string  = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output resourceGroupName string = resourceGroup().name
