/**
 * Standard Test Case Excel Template
 * Generates a comprehensive Excel workbook for test case management
 * Compatible with: ExcelJS, openpyxl, pandas
 */

const ExcelJS = require('exceljs');

/**
 * Column definitions for the standard test case template
 * Each column: { key, header, width, style, validation, required }
 */
const STANDARD_COLUMNS = [
  // Identification & Traceability
  { key: 'testCaseId', header: 'Test Case ID', width: 18, required: true,
    pattern: '^TC-[A-Z]{3,4}-\\d{3,4}$',
    description: 'Unique identifier: TC-<MODULE>-<SEQUENCE>' },

  { key: 'requirementIds', header: 'Requirement ID(s)', width: 22, required: true,
    description: 'Comma-separated requirement IDs (REQ-XXX)' },

  { key: 'userStoryIds', header: 'User Story ID(s)', width: 20,
    description: 'Related user story IDs (US-XXX)' },

  { key: 'epicId', header: 'Epic ID', width: 15,
    description: 'Parent epic identifier' },

  // Test Case Details
  { key: 'title', header: 'Test Case Title', width: 45, required: true,
    description: 'Concise, descriptive title' },

  { key: 'description', header: 'Description', width: 50,
    description: 'Detailed description of what is being tested' },

  { key: 'testType', header: 'Test Type', width: 18, required: true,
    validation: ['Functional', 'Negative', 'Boundary', 'Security', 'Performance', 'Accessibility', 'Usability', 'Compatibility', 'Regression', 'Smoke', 'Sanity', 'Integration', 'API', 'UI', 'Contract', 'Chaos'],
    description: 'Category of test' },

  { key: 'testLevel', header: 'Test Level', width: 16, required: true,
    validation: ['Unit', 'Integration', 'System', 'Acceptance', 'Component', 'Contract', 'E2E'],
    description: 'Testing level in pyramid' },

  { key: 'priority', header: 'Priority', width: 12, required: true,
    validation: ['Critical', 'High', 'Medium', 'Low'],
    description: 'Business priority' },

  { key: 'severity', header: 'Severity', width: 12,
    validation: ['Blocker', 'Critical', 'Major', 'Minor', 'Cosmetic'],
    description: 'Impact if test fails' },

  // Preconditions & Setup
  { key: 'preconditions', header: 'Preconditions', width: 50, required: true,
    description: 'System state, data, configuration required before test' },

  { key: 'testData', header: 'Test Data', width: 40,
    description: 'Specific data values, files, or references to data sets' },

  { key: 'environment', header: 'Environment', width: 18,
    validation: ['Dev', 'QA', 'Staging', 'Production', 'Local', 'Any'],
    description: 'Target execution environment' },

  { key: 'browser', header: 'Browser(s)', width: 20,
    description: 'Chrome, Firefox, Safari, Edge, Mobile Chrome, Mobile Safari' },

  { key: 'device', header: 'Device/OS', width: 20,
    description: 'Desktop, iPhone 15, Samsung S24, iPad, etc.' },

  // Test Steps (structured as JSON or delimited)
  { key: 'steps', header: 'Test Steps', width: 60, required: true,
    description: 'Numbered steps with action and expected result per step' },

  { key: 'expectedResult', header: 'Expected Result', width: 50, required: true,
    description: 'Final expected outcome after all steps' },

  { key: 'postConditions', header: 'Post Conditions', width: 40,
    description: 'Cleanup, state restoration after test' },

  // Automation
  { key: 'automationStatus', header: 'Automation Status', width: 20, required: true,
    validation: ['Not Planned', 'Planned', 'In Progress', 'Automated', 'Deprecated', 'Manual Only'],
    description: 'Current automation state' },

  { key: 'automationId', header: 'Automation ID', width: 22,
    description: 'Link to automation code (file:method or test ID)' },

  { key: 'automationFramework', header: 'Framework', width: 18,
    validation: ['Playwright', 'Cypress', 'Appium', 'Detox', 'Pactum', 'k6', 'JMeter', 'Postman', 'REST Assured', 'Selenium', 'Puppeteer', 'TestCafe', 'WebdriverIO'],
    description: 'Automation framework used' },

  { key: 'automationPattern', header: 'Pattern', width: 16,
    validation: ['POM', 'Screenplay', 'Functional', 'Data-Driven', 'Keyword-Driven', 'BDD', 'Hybrid'],
    description: 'Code pattern/architecture' },

  { key: 'executionTime', header: 'Est. Exec Time (min)', width: 18,
    type: 'number',
    description: 'Estimated manual execution time in minutes' },

  // Execution Tracking
  { key: 'status', header: 'Status', width: 16,
    validation: ['Not Run', 'Passed', 'Failed', 'Blocked', 'Skipped', 'In Progress', 'Deferred'],
    description: 'Current execution status' },

  { key: 'actualResult', header: 'Actual Result', width: 50,
    description: 'Observed result during execution' },

  { key: 'executedBy', header: 'Executed By', width: 18,
    description: 'Tester name or automation run ID' },

  { key: 'executedAt', header: 'Executed At', width: 20,
    type: 'date',
    description: 'Date/time of execution' },

  { key: 'duration', header: 'Duration (sec)', width: 16,
    type: 'number',
    description: 'Actual execution duration in seconds' },

  { key: 'buildVersion', header: 'Build Version', width: 18,
    description: 'Application build/version tested' },

  { key: 'defectIds', header: 'Defect ID(s)', width: 22,
    description: 'Linked defect IDs (BUG-XXX, JIRA-XXX)' },

  // Risk & Classification
  { key: 'riskLevel', header: 'Risk Level', width: 14,
    validation: ['Critical', 'High', 'Medium', 'Low'],
    description: 'Business risk if this functionality fails' },

  { key: 'tags', header: 'Tags', width: 30,
    description: 'Comma-separated: smoke, regression, p0, api, mobile, a11y, security, performance' },

  { key: 'testCategory', header: 'Test Category', width: 18,
    validation: ['Happy Path', 'Negative', 'Boundary', 'Error Handling', 'Security', 'Performance', 'Accessibility', 'Localization', 'Data Integrity', 'Workflow', 'Integration', 'Migration'],
    description: 'Test design technique category' },

  { key: 'dataDriven', header: 'Data Driven', width: 14,
    validation: ['Yes', 'No'],
    description: 'Whether test uses external data sets' },

  { key: 'dataSetRef', header: 'Data Set Reference', width: 22,
    description: 'Reference to test data file (CSV, JSON, DB)' },

  // Maintenance
  { key: 'createdBy', header: 'Created By', width: 18, required: true },
  { key: 'createdAt', header: 'Created At', width: 20, type: 'date', required: true },
  { key: 'updatedBy', header: 'Updated By', width: 18 },
  { key: 'updatedAt', header: 'Updated At', width: 20, type: 'date' },
  { key: 'version', header: 'Version', width: 10, type: 'number', default: 1 },
  { key: 'reviewStatus', header: 'Review Status', width: 16,
    validation: ['Pending', 'Approved', 'Changes Requested', 'Rejected'],
    description: 'Peer review status' },
  { key: 'reviewedBy', header: 'Reviewed By', width: 18 },
  { key: 'reviewedAt', header: 'Reviewed At', width: 20, type: 'date' },
  { key: 'approvalRequired', header: 'Approval Required', width: 18,
    validation: ['Yes', 'No'], default: 'Yes' },

  // CI/CD Integration
  { key: 'ciJobName', header: 'CI Job Name', width: 25,
    description: 'Jenkins/GitHub Actions/GitLab job name' },
  { key: 'ciPipelineUrl', header: 'CI Pipeline URL', width: 35 },
  { key: 'flaky', header: 'Flaky', width: 10,
    validation: ['Yes', 'No', 'Quarantined'],
    description: 'Known flaky test indicator' },
  { key: 'retryCount', header: 'Retry Count', width: 12, type: 'number', default: 0 },
];

/**
 * Sheet configurations for different test case types
 */
const SHEET_CONFIGS = {
  standard: {
    name: 'Test Cases',
    columns: STANDARD_COLUMNS,
    freezePane: { x: 1, y: 1 },
    autoFilter: true,
  },
  summary: {
    name: 'Summary',
    columns: [
      { key: 'metric', header: 'Metric', width: 30 },
      { key: 'value', header: 'Value', width: 20 },
      { key: 'target', header: 'Target', width: 20 },
      { key: 'status', header: 'Status', width: 15 },
    ],
    data: [
      { metric: 'Total Test Cases', value: 0, target: '> 0', status: '' },
      { metric: 'Automated', value: 0, target: '> 80%', status: '' },
      { metric: 'Manual', value: 0, target: '< 20%', status: '' },
      { metric: 'Critical Priority', value: 0, target: '100% Covered', status: '' },
      { metric: 'High Priority', value: 0, target: '100% Covered', status: '' },
      { metric: 'Requirements Covered', value: 0, target: '100%', status: '' },
      { metric: 'Requirements Uncovered', value: 0, target: '0', status: '' },
      { metric: 'Pass Rate (Latest)', value: '0%', target: '> 95%', status: '' },
      { metric: 'Flaky Tests', value: 0, target: '0', status: '' },
      { metric: 'Avg Execution Time (min)', value: 0, target: '< 10', status: '' },
    ],
  },
  traceability: {
    name: 'Traceability Matrix',
    columns: [
      { key: 'requirementId', header: 'Requirement ID', width: 18 },
      { key: 'requirementTitle', header: 'Requirement Title', width: 40 },
      { key: 'testCaseIds', header: 'Test Case IDs', width: 30 },
      { key: 'testCaseCount', header: 'Count', width: 10, type: 'number' },
      { key: 'automatedCount', header: 'Automated', width: 12, type: 'number' },
      { key: 'coverage', header: 'Coverage %', width: 14, type: 'number' },
      { key: 'status', header: 'Coverage Status', width: 18,
        validation: ['Full', 'Partial', 'None'] },
    ],
  },
  defects: {
    name: 'Defect Tracking',
    columns: [
      { key: 'defectId', header: 'Defect ID', width: 18 },
      { key: 'testCaseId', header: 'Test Case ID', width: 18 },
      { key: 'requirementId', header: 'Requirement ID', width: 18 },
      { key: 'summary', header: 'Summary', width: 50 },
      { key: 'severity', header: 'Severity', width: 14,
        validation: ['Blocker', 'Critical', 'Major', 'Minor', 'Cosmetic'] },
      { key: 'priority', header: 'Priority', width: 12,
        validation: ['Critical', 'High', 'Medium', 'Low'] },
      { key: 'status', header: 'Status', width: 16,
        validation: ['New', 'Assigned', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Reopened', 'Deferred', 'Duplicate'] },
      { key: 'assignedTo', header: 'Assigned To', width: 18 },
      { key: 'createdAt', header: 'Created At', width: 20, type: 'date' },
      { key: 'resolvedAt', header: 'Resolved At', width: 20, type: 'date' },
      { key: 'rootCause', header: 'Root Cause', width: 40 },
      { key: 'fixVersion', header: 'Fix Version', width: 16 },
    ],
  },
  executionLog: {
    name: 'Execution Log',
    columns: [
      { key: 'runId', header: 'Run ID', width: 22 },
      { key: 'testCaseId', header: 'Test Case ID', width: 18 },
      { key: 'status', header: 'Status', width: 14 },
      { key: 'executedBy', header: 'Executed By', width: 18 },
      { key: 'executedAt', header: 'Executed At', width: 20, type: 'date' },
      { key: 'duration', header: 'Duration (sec)', width: 16, type: 'number' },
      { key: 'buildVersion', header: 'Build Version', width: 18 },
      { key: 'environment', header: 'Environment', width: 14 },
      { key: 'notes', header: 'Notes', width: 50 },
    ],
  },
};

/**
 * Style definitions for consistent formatting
 */
const STYLES = {
  header: {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  },
  headerRequired: {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC00000' } },
    alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    },
  },
  cell: {
    font: { size: 10 },
    alignment: { vertical: 'top', wrapText: true },
    border: {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    },
  },
  cellRequired: {
    font: { size: 10 },
    alignment: { vertical: 'top', wrapText: true },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } },
    border: {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    },
  },
  statusPassed: {
    font: { size: 10, color: { argb: 'FF006100' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } },
  },
  statusFailed: {
    font: { size: 10, color: { argb: 'FF9C0006' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } },
  },
  statusBlocked: {
    font: { size: 10, color: { argb: 'FF9C6500' } },
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } },
  },
  priorityCritical: {
    font: { bold: true, color: { argb: 'FF9C0006' } },
  },
  priorityHigh: {
    font: { bold: true, color: { argb: 'FFC00000' } },
  },
};

/**
 * Generate the Excel workbook
 */
async function generateStandardTemplate(options = {}) {
  const {
    includeSampleData = true,
    projectName = 'Test Project',
    version = '1.0',
    author = 'SDET Team',
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = author;
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.lastModifiedBy = author;
  workbook.properties.company = 'SDET Agent Skill Pack';
  workbook.properties.subject = 'Test Case Repository';
  workbook.properties.keywords = 'test cases, traceability, automation, quality';

  // Create sheets
  for (const [key, config] of Object.entries(SHEET_CONFIGS)) {
    const sheet = workbook.addWorksheet(config.name, {
      properties: { tabColor: { argb: key === 'standard' ? 'FF2F5496' : 'FF548235' } },
    });

    // Add header row
    const headerRow = sheet.addRow(config.columns.map(c => c.header));
    config.columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.style = col.required ? STYLES.headerRequired : STYLES.header;
    });

    // Set column widths
    config.columns.forEach((col, idx) => {
      sheet.getColumn(idx + 1).width = col.width;
    });

    // Freeze panes
    if (config.freezePane) {
      sheet.views = [{ state: 'frozen', xSplit: config.freezePane.x, ySplit: config.freezePane.y }];
    }

    // Auto filter
    if (config.autoFilter) {
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: config.columns.length },
      };
    }

    // Add data validation for columns with validation array
    config.columns.forEach((col, idx) => {
      if (col.validation && col.validation.length > 0) {
        const colLetter = String.fromCharCode(65 + idx);
        sheet.dataValidations.add(`${colLetter}2:${colLetter}10000`, {
          type: 'list',
          allowBlank: true,
          formulae: [col.validation.join(',')],
          showErrorMessage: true,
          errorStyle: 'warning',
          errorTitle: 'Invalid Value',
          error: `Please select from: ${col.validation.join(', ')}`,
        });
      }
    });

    // Add sample data for standard sheet
    if (key === 'standard' && includeSampleData) {
      addSampleData(sheet, config.columns);
    } else if (key !== 'standard' && config.data) {
      config.data.forEach(row => sheet.addRow(row));
    }

    // Conditional formatting for status column
    if (key === 'standard') {
      const statusColIdx = config.columns.findIndex(c => c.key === 'status') + 1;
      if (statusColIdx > 0) {
        const colLetter = String.fromCharCode(64 + statusColIdx);
        sheet.addConditionalFormatting({
          ref: `${colLetter}2:${colLetter}10000`,
          rules: [
            { type: 'cellIs', operator: 'equal', value: '"Passed"', style: STYLES.statusPassed },
            { type: 'cellIs', operator: 'equal', value: '"Failed"', style: STYLES.statusFailed },
            { type: 'cellIs', operator: 'equal', value: '"Blocked"', style: STYLES.statusBlocked },
          ],
        });
      }

      // Priority conditional formatting
      const priorityColIdx = config.columns.findIndex(c => c.key === 'priority') + 1;
      if (priorityColIdx > 0) {
        const colLetter = String.fromCharCode(64 + priorityColIdx);
        sheet.addConditionalFormatting({
          ref: `${colLetter}2:${colLetter}10000`,
          rules: [
            { type: 'cellIs', operator: 'equal', value: '"Critical"', style: STYLES.priorityCritical },
            { type: 'cellIs', operator: 'equal', value: '"High"', style: STYLES.priorityHigh },
          ],
        });
      }
    }
  }

  // Add metadata sheet
  const metaSheet = workbook.addWorksheet('Metadata');
  metaSheet.addRow(['Property', 'Value']);
  metaSheet.addRow(['Project', projectName]);
  metaSheet.addRow(['Template Version', version]);
  metaSheet.addRow(['Generated At', new Date().toISOString()]);
  metaSheet.addRow(['Generated By', 'SDET Agent Skill Pack']);
  metaSheet.addRow(['Schema Version', '2.0']);
  metaSheet.getColumn(1).width = 25;
  metaSheet.getColumn(2).width = 50;
  metaSheet.getRow(1).font = { bold: true };

  // Add instructions sheet
  const instructionsSheet = workbook.addWorksheet('Instructions');
  const instructions = [
    ['SDET Standard Test Case Template - Instructions'],
    [''],
    ['COLUMN GUIDELINES:'],
    ['Test Case ID', 'Format: TC-<MODULE>-<NNN> (e.g., TC-AUTH-001)'],
    ['Requirement ID(s)', 'Comma-separated REQ-XXX IDs for traceability'],
    ['Test Type', 'Select from dropdown: Functional, Negative, Boundary, Security, Performance, etc.'],
    ['Priority', 'Critical/High/Medium/Low - drives execution order'],
    ['Steps', 'Numbered format: 1. Action -> Expected. 2. Action -> Expected'],
    ['Automation Status', 'Track: Not Planned -> Planned -> In Progress -> Automated'],
    ['Automation ID', 'Format: filepath:methodName or test file path'],
    ['Tags', 'Comma-separated: smoke, regression, p0, api, mobile, a11y, security'],
    [''],
    ['BEST PRACTICES:'],
    ['1.', 'One test case = one verifiable outcome'],
    ['2.', 'Steps must be atomic and reproducible'],
    ['3.', 'Expected results must be specific and measurable'],
    ['4.', 'Link every test case to at least one requirement'],
    ['5.', 'Update automation status when code changes'],
    ['5.', 'Use tags for test suite filtering (smoke, regression, etc.)'],
    [''],
    ['KEYBOARD SHORTCUTS:'],
    ['Alt+Down', 'Open dropdown for validated columns'],
    ['Ctrl+;', 'Insert current date'],
    ['Ctrl+Shift+:', 'Insert current time'],
    ['', ''],
  ];
  instructions.forEach(row => instructionsSheet.addRow(row));
  instructionsSheet.getColumn(1).width = 25;
  instructionsSheet.getColumn(2).width = 80;
  instructionsSheet.getRow(1).font = { bold: true, size: 14, color: { argb: 'FF2F5496' } };

  return workbook;
}

/**
 * Add sample test case data
 */
function addSampleData(sheet, columns) {
  const samples = [
    {
      testCaseId: 'TC-AUTH-001',
      requirementIds: 'REQ-AUTH-001',
      userStoryIds: 'US-1.1',
      epicId: 'EPIC-1',
      title: 'Valid user registration with email, password, and name',
      description: 'Verify new user can register with valid credentials and receives verification email',
      testType: 'Functional',
      testLevel: 'System',
      priority: 'Critical',
      severity: 'Critical',
      preconditions: 'Application deployed, email service configured, database accessible',
      testData: 'Valid email: test@example.com, Password: Pass123!, Name: John Doe',
      environment: 'QA',
      browser: 'Chrome, Firefox',
      device: 'Desktop',
      steps: '1. Navigate to /register\n2. Enter valid email, password, name\n3. Click Register button\n4. Verify success message displayed\n5. Check email for verification link\n6. Click verification link\n7. Verify account activated',
      expectedResult: 'User registered successfully, verification email sent, account activated after clicking link',
      postConditions: 'Delete test user account',
      automationStatus: 'Automated',
      automationId: 'tests/e2e/auth/register.spec.ts:validRegistration',
      automationFramework: 'Playwright',
      automationPattern: 'POM',
      executionTime: 5,
      status: 'Not Run',
      riskLevel: 'Critical',
      tags: 'smoke, regression, p0, auth, functional',
      testCategory: 'Happy Path',
      dataDriven: 'No',
      createdBy: 'SDET Team',
      createdAt: new Date().toISOString().split('T')[0],
      version: 1,
      reviewStatus: 'Approved',
      reviewedBy: 'QA Lead',
      reviewedAt: new Date().toISOString().split('T')[0],
      approvalRequired: 'Yes',
    },
    {
      testCaseId: 'TC-AUTH-002',
      requirementIds: 'REQ-AUTH-001',
      userStoryIds: 'US-1.1',
      epicId: 'EPIC-1',
      title: 'Registration with duplicate email shows error',
      description: 'Verify system prevents duplicate email registration',
      testType: 'Negative',
      testLevel: 'System',
      priority: 'Critical',
      severity: 'Major',
      preconditions: 'User with email test@example.com already exists',
      testData: 'Existing email: test@example.com, Password: Pass123!, Name: Jane Doe',
      environment: 'QA',
      browser: 'Chrome',
      device: 'Desktop',
      steps: '1. Navigate to /register\n2. Enter existing email, valid password, name\n3. Click Register button\n4. Verify error message displayed\n5. Verify no account created',
      expectedResult: 'Error message "Email already registered" displayed, no new account created',
      postConditions: 'None',
      automationStatus: 'Automated',
      automationId: 'tests/e2e/auth/register.spec.ts:duplicateEmail',
      automationFramework: 'Playwright',
      automationPattern: 'POM',
      executionTime: 3,
      status: 'Not Run',
      riskLevel: 'High',
      tags: 'regression, p0, auth, negative',
      testCategory: 'Negative',
      dataDriven: 'No',
      createdBy: 'SDET Team',
      createdAt: new Date().toISOString().split('T')[0],
      version: 1,
      reviewStatus: 'Approved',
    },
    {
      testCaseId: 'TC-AUTH-003',
      requirementIds: 'REQ-AUTH-001',
      userStoryIds: 'US-1.1',
      epicId: 'EPIC-1',
      title: 'Registration with invalid email format',
      description: 'Verify email format validation on registration',
      testType: 'Boundary',
      testLevel: 'System',
      priority: 'High',
      severity: 'Major',
      preconditions: 'Application deployed',
      testData: 'Invalid emails: "invalid", "test@", "@example.com", "test..test@example.com"',
      environment: 'QA',
      browser: 'Chrome',
      device: 'Desktop',
      steps: '1. Navigate to /register\n2. Enter invalid email format\n3. Enter valid password and name\n4. Click Register button\n5. Verify inline validation error\n6. Repeat for each invalid format',
      expectedResult: 'Inline error "Invalid email format" displayed for each invalid input',
      postConditions: 'None',
      automationStatus: 'Planned',
      automationFramework: 'Playwright',
      automationPattern: 'POM',
      executionTime: 4,
      status: 'Not Run',
      riskLevel: 'Medium',
      tags: 'regression, auth, boundary, validation',
      testCategory: 'Boundary',
      dataDriven: 'Yes',
      dataSetRef: 'test-data/auth/invalid-emails.csv',
      createdBy: 'SDET Team',
      createdAt: new Date().toISOString().split('T')[0],
      version: 1,
      reviewStatus: 'Pending',
    },
  ];

  samples.forEach(sample => {
    const row = [];
    columns.forEach(col => {
      row.push(sample[col.key] || '');
    });
    const addedRow = sheet.addRow(row);
    // Apply required cell style
    columns.forEach((col, idx) => {
      if (col.required) {
        addedRow.getCell(idx + 1).style = STYLES.cellRequired;
      } else {
        addedRow.getCell(idx + 1).style = STYLES.cell;
      }
    });
  });
}

/**
 * Generate specialized templates
 */
const SPECIALIZED_TEMPLATES = {
  api: {
    ...SHEET_CONFIGS.standard,
    name: 'API Test Cases',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['Functional', 'Negative', 'Boundary', 'Security', 'Performance', 'Contract', 'Schema Validation', 'Rate Limiting', 'Authentication', 'Authorization'] };
      }
      if (col.key === 'automationFramework') {
        return { ...col, validation: ['Pactum', 'k6', 'JMeter', 'Postman', 'REST Assured', 'SuperTest', 'RestSharp', 'HttpClient', 'Axios', 'Fetch'] };
      }
      return col;
    }),
  },
  security: {
    ...SHEET_CONFIGS.standard,
    name: 'Security Test Cases',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['SAST', 'DAST', 'IAST', 'SCA', 'Secrets', 'Penetration', 'Authentication', 'Authorization', 'Input Validation', 'Encryption', 'Session Management', 'CSRF', 'XSS', 'SQL Injection', 'API Security'] };
      }
      if (col.key === 'automationFramework') {
        return { ...col, validation: ['Semgrep', 'CodeQL', 'SonarQube', 'Checkmarx', 'OWASP ZAP', 'Burp Suite', 'Nikto', 'Trivy', 'Snyk', 'TruffleHog', 'Dependabot', 'OWASP Dependency Check'] };
      }
      return col;
    }),
  },
  performance: {
    ...SHEET_CONFIGS.standard,
    name: 'Performance Test Cases',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['Load', 'Stress', 'Soak', 'Spike', 'Breakpoint', 'Scalability', 'Volume', 'Configuration', 'Isolation'] };
      }
      if (col.key === 'automationFramework') {
        return { ...col, validation: ['k6', 'Gatling', 'JMeter', 'Locust', 'Vegeta', 'Artillery', 'Taurus', 'nGrinder'] };
      }
      return col;
    }),
  },
  accessibility: {
    ...SHEET_CONFIGS.standard,
    name: 'Accessibility Test Cases',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['Automated', 'Manual', 'Screen Reader', 'Keyboard Navigation', 'Color Contrast', 'Zoom', 'ARIA', 'Semantic HTML', 'Focus Management', 'Mobile Accessibility'] };
      }
      if (col.key === 'automationFramework') {
        return { ...col, validation: ['axe-core', 'Pa11y', 'Lighthouse', 'Tenon', 'WAVE', 'ANDI', 'NVDA', 'JAWS', 'VoiceOver', 'TalkBack'] };
      }
      return col;
    }),
  },
  mobile: {
    ...SHEET_CONFIGS.standard,
    name: 'Mobile Test Cases',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['Functional', 'UI', 'Compatibility', 'Performance', 'Security', 'Usability', 'Interruption', 'Network', 'Battery', 'Permission', 'Install/Uninstall', 'Upgrade', 'Localization', 'Accessibility'] };
      }
      if (col.key === 'automationFramework') {
        return { ...col, validation: ['Appium', 'Detox', 'XCUITest', 'Espresso', 'Maestro', 'EarlGrey', 'Calabash', 'Robot Framework'] };
      }
      return col;
    }),
  },
  exploratory: {
    ...SHEET_CONFIGS.standard,
    name: 'Exploratory Test Sessions',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['Charter', 'Session', 'Bug', 'Note', 'Coverage', 'Debrief'] };
      }
      return { ...col, required: false };
    }),
  },
  compliance: {
    ...SHEET_CONFIGS.standard,
    name: 'Compliance Test Cases',
    columns: STANDARD_COLUMNS.map(col => {
      if (col.key === 'testType') {
        return { ...col, validation: ['GDPR', 'HIPAA', 'PCI-DSS', 'SOX', 'FDA 21 CFR Part 11', 'ISO 27001', 'SOC 2', 'WCAG', 'Custom Regulation'] };
      }
      return col;
    }),
  },
  testPlan: {
    name: 'Test Plan',
    columns: [
      { key: 'section', header: 'Section', width: 30 },
      { key: 'subsection', header: 'Subsection', width: 30 },
      { key: 'description', header: 'Description', width: 60 },
      { key: 'owner', header: 'Owner', width: 20 },
      { key: 'status', header: 'Status', width: 15, validation: ['Not Started', 'In Progress', 'Complete', 'Approved'] },
      { key: 'dueDate', header: 'Due Date', width: 15, type: 'date' },
      { key: 'notes', header: 'Notes', width: 50 },
    ],
  },
};

/**
 * Main export function
 */
module.exports = {
  STANDARD_COLUMNS,
  SHEET_CONFIGS,
  STYLES,
  SPECIALIZED_TEMPLATES,
  generateStandardTemplate,
  addSampleData,
};

/**
 * CLI usage
 */
if (require.main === module) {
  const fs = require('fs');
  const path = require('path');

  const outputDir = process.argv[2] || './output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate all templates
  const templates = {
    'standard': {},
    'api': { projectName: 'API Service' },
    'security': { projectName: 'Security Testing' },
    'performance': { projectName: 'Performance Testing' },
    'accessibility': { projectName: 'Accessibility Testing' },
    'mobile': { projectName: 'Mobile App' },
    'exploratory': { projectName: 'Exploratory Testing' },
    'compliance': { projectName: 'Compliance Testing' },
  };

  async function generateAll() {
    for (const [name, options] of Object.entries(templates)) {
      const workbook = await generateStandardTemplate(options);
      const filePath = path.join(outputDir, `test-cases-${name}.xlsx`);
      await workbook.xlsx.writeFile(filePath);
      console.log(`Generated: ${filePath}`);
    }
    console.log('All templates generated successfully!');
  }

  generateAll().catch(console.error);
}