-- ============================================================
-- Seed data for local development
-- Run AFTER schema.sql
-- ============================================================

-- Counter starting points
USE backcross_admin;

INSERT INTO Counter (requestType, year, currentValue) VALUES ('BC',     2026, 3);
INSERT INTO Counter (requestType, year, currentValue) VALUES ('MABC',   2026, 1);
INSERT INTO Counter (requestType, year, currentValue) VALUES ('EBREED', 2026, 0);

-- Project Requests
DECLARE @req1 UNIQUEIDENTIFIER = NEWID();
DECLARE @req2 UNIQUEIDENTIFIER = NEWID();
DECLARE @req3 UNIQUEIDENTIFIER = NEWID();
DECLARE @req4 UNIQUEIDENTIFIER = NEWID();

INSERT INTO ProjectRequest (id, title, crop, requestType, requestedBy, parentLine, traitOfInterest, status)
VALUES
  (@req1, 'Drought Tolerance BC - Wheat 2026', 'Wheat',  'BC',     'Alice van Berg', 'WT-Parent-A1',   'Drought tolerance',       'Submitted'),
  (@req2, 'Rust Resistance MABC',              'Barley', 'MABC',   'Bob de Vries',   'BAR-Resistant',  'Leaf rust resistance',    'InReview'),
  (@req3, 'Early Flowering EBREED',            'Maize',  'EBREED', 'Carol Jansen',   'MZ-EF-001',      'Days to flowering',       'Draft'),
  (@req4, 'Salt Tolerance BC - Rice',          'Rice',   'BC',     'Alice van Berg', 'RC-Salt-B2',     'Salt stress tolerance',   'Converted');

-- Project (converted from req4)
DECLARE @proj1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO Project (id, projectId, projectRequestId, owner, stage)
VALUES (@proj1, 'NL_BC_0003', @req4, 'Alice van Berg', 'Sowing');

-- Sowing List with 2 items
DECLARE @sl1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO SowingList (id, projectId, name) VALUES (@sl1, @proj1, 'Initial Sowing Batch');

INSERT INTO SowingListItem (sowingListId, material, quantity, location)
VALUES
  (@sl1, 'RC-Salt-B2 seeds',     50, 'GH-01 Bench A'),
  (@sl1, 'RC-Parent control',    20, 'GH-01 Bench B');

-- Crossing List with 1 item
DECLARE @cl1 UNIQUEIDENTIFIER = NEWID();

INSERT INTO CrossingList (id, projectId, name) VALUES (@cl1, @proj1, 'BC1 Crosses');

INSERT INTO CrossingListItem (crossingListId, female, male, plannedCount)
VALUES (@cl1, 'RC-Salt-B2 F1', 'RC-Parent donor', 30);
