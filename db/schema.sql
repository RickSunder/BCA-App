-- ============================================================
-- backcross_admin database schema
-- Run against an existing database: USE backcross_admin;
-- ============================================================

-- Counter table for auto-generating projectId
CREATE TABLE Counter (
  requestType  NVARCHAR(10) NOT NULL,
  year         INT          NOT NULL,
  currentValue INT          NOT NULL DEFAULT 0,
  CONSTRAINT PK_Counter PRIMARY KEY (requestType, year)
);

-- Project Requests
CREATE TABLE ProjectRequest (
  id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  title           NVARCHAR(200)    NOT NULL,
  crop            NVARCHAR(100)    NOT NULL,
  requestType     NVARCHAR(10)     NOT NULL CHECK (requestType IN ('BC','MABC','EBREED')),
  requestedBy     NVARCHAR(150)    NOT NULL,
  parentLine      NVARCHAR(200)    NOT NULL DEFAULT '',
  traitOfInterest NVARCHAR(300)    NOT NULL DEFAULT '',
  status          NVARCHAR(20)     NOT NULL DEFAULT 'Draft'
                    CHECK (status IN ('Draft','Submitted','InReview','Converted','Rejected')),
  createdAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  updatedAt       DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT PK_ProjectRequest PRIMARY KEY (id)
);

-- Projects
CREATE TABLE Project (
  id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  projectId        NVARCHAR(20)     NOT NULL UNIQUE,
  projectRequestId UNIQUEIDENTIFIER NOT NULL,
  owner            NVARCHAR(150)    NOT NULL DEFAULT '',
  stage            NVARCHAR(20)     NOT NULL DEFAULT 'Initiated'
                     CHECK (stage IN ('Initiated','Sowing','Crossing','Transplant','Selfing','Completed')),
  createdAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  updatedAt        DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT PK_Project PRIMARY KEY (id),
  CONSTRAINT FK_Project_ProjectRequest
    FOREIGN KEY (projectRequestId) REFERENCES ProjectRequest(id)
);

-- Sowing Lists
CREATE TABLE SowingList (
  id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  projectId UNIQUEIDENTIFIER NOT NULL,
  name      NVARCHAR(200)    NOT NULL DEFAULT '',
  createdAt DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT PK_SowingList PRIMARY KEY (id),
  CONSTRAINT FK_SowingList_Project
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE SowingListItem (
  id           UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  sowingListId UNIQUEIDENTIFIER NOT NULL,
  material     NVARCHAR(200)    NOT NULL,
  quantity     INT              NOT NULL DEFAULT 0,
  location     NVARCHAR(200)    NOT NULL DEFAULT '',
  CONSTRAINT PK_SowingListItem PRIMARY KEY (id),
  CONSTRAINT FK_SowingListItem_SowingList
    FOREIGN KEY (sowingListId) REFERENCES SowingList(id) ON DELETE CASCADE
);

-- Crossing Lists
CREATE TABLE CrossingList (
  id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  projectId UNIQUEIDENTIFIER NOT NULL,
  name      NVARCHAR(200)    NOT NULL DEFAULT '',
  createdAt DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT PK_CrossingList PRIMARY KEY (id),
  CONSTRAINT FK_CrossingList_Project
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE CrossingListItem (
  id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  crossingListId UNIQUEIDENTIFIER NOT NULL,
  female         NVARCHAR(200)    NOT NULL,
  male           NVARCHAR(200)    NOT NULL,
  plannedCount   INT              NOT NULL DEFAULT 0,
  CONSTRAINT PK_CrossingListItem PRIMARY KEY (id),
  CONSTRAINT FK_CrossingListItem_CrossingList
    FOREIGN KEY (crossingListId) REFERENCES CrossingList(id) ON DELETE CASCADE
);

-- Transplant Lists
CREATE TABLE TransplantList (
  id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  projectId UNIQUEIDENTIFIER NOT NULL,
  name      NVARCHAR(200)    NOT NULL DEFAULT '',
  createdAt DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT PK_TransplantList PRIMARY KEY (id),
  CONSTRAINT FK_TransplantList_Project
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE TransplantListItem (
  id               UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  transplantListId UNIQUEIDENTIFIER NOT NULL,
  fromLocation     NVARCHAR(200)    NOT NULL,
  toLocation       NVARCHAR(200)    NOT NULL,
  count            INT              NOT NULL DEFAULT 0,
  CONSTRAINT PK_TransplantListItem PRIMARY KEY (id),
  CONSTRAINT FK_TransplantListItem_TransplantList
    FOREIGN KEY (transplantListId) REFERENCES TransplantList(id) ON DELETE CASCADE
);

-- Selfing Lists
CREATE TABLE SelfingList (
  id        UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  projectId UNIQUEIDENTIFIER NOT NULL,
  name      NVARCHAR(200)    NOT NULL DEFAULT '',
  createdAt DATETIME2        NOT NULL DEFAULT GETUTCDATE(),
  CONSTRAINT PK_SelfingList PRIMARY KEY (id),
  CONSTRAINT FK_SelfingList_Project
    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE
);

CREATE TABLE SelfingListItem (
  id            UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
  selfingListId UNIQUEIDENTIFIER NOT NULL,
  plant         NVARCHAR(200)    NOT NULL,
  plannedCount  INT              NOT NULL DEFAULT 0,
  CONSTRAINT PK_SelfingListItem PRIMARY KEY (id),
  CONSTRAINT FK_SelfingListItem_SelfingList
    FOREIGN KEY (selfingListId) REFERENCES SelfingList(id) ON DELETE CASCADE
);
