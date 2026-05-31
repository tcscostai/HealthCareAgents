# AI Entropy — UI Design Specification

Reference guide for building pages that match the **Design Agent** look and feel. Source of truth: `src/pages/DesignAgent.js`, `src/theme.js`, `src/components/Layout.js`.

Use this document when creating a new page with collapsible category sections and agent widget cards.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Global Design Tokens](#global-design-tokens)
3. [App Shell (Layout)](#app-shell-layout)
4. [Design Agent Page Structure](#design-agent-page-structure)
5. [Quick Action Bar](#quick-action-bar)
6. [Category Section (Collapsible Drop)](#category-section-collapsible-drop)
7. [Agent Card Widget](#agent-card-widget)
8. [Agent Categories & Widgets Catalog](#agent-categories--widgets-catalog)
9. [Agent Type → Dialog Mapping](#agent-type--dialog-mapping)
10. [Dialog Patterns](#dialog-patterns)
11. [Create Custom Agent Flow](#create-custom-agent-flow)
12. [Design SLM Agent Page (Variant)](#design-slm-agent-page-variant)
13. [Recipe: Build a Similar Page](#recipe-build-a-similar-page)

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| Apple-inspired light UI | Frosted glass cards, soft shadows, `#F5F5F7` / `#F8FAFF` backgrounds |
| Category-first navigation | Agents grouped under collapsible category sections (dropdown-style expand/collapse) |
| Card grid | Responsive 3-column agent cards (`xs=12`, `sm=6`, `md=4`) |
| Motion | Framer Motion fade-in on category sections; hover lift on cards |
| Status visibility | `stable` = green chip, `beta` = orange/warning chip |
| Category color coding | Each category has a brand color used for icon badge background (`color15` opacity) |

---

## Global Design Tokens

### Theme (`src/theme.js`)

```javascript
palette: {
  primary:   { main: '#0066FF', light: '#00C6FF', dark: '#0047B3' },
  secondary: { main: '#00C6FF', light: '#66DFFF', dark: '#0099CC' },
  background: { default: '#F5F5F7', paper: '#FFFFFF' },
}
typography: {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...',
  h1: { fontWeight: 700 },
  h2: { fontWeight: 600 },
}
shape: { borderRadius: 12 }
```

### Category Accent Colors

| Color | Hex | Used By |
|-------|-----|---------|
| Blue | `#007AFF` | SDLC Agents, Claims Processing |
| Orange | `#FF9500` | MultiAgent Workflows, Analytics Agents |
| Purple | `#5856D6` | RAG Agents, DevOps Agents |
| Green | `#34C759` | MLOps Agents, Quality Assurance Agents |
| Red | `#FF3B30` | Security Agents |

### Styled Components (Design Agent)

#### `StyledCard` — Category container

| Property | Value |
|----------|-------|
| Padding | `theme.spacing(3)` (24px) |
| Border radius | `theme.shape.borderRadius * 2` (24px) |
| Background | `rgba(255, 255, 255, 0.9)` |
| Backdrop filter | `blur(10px)` |
| Border | `1px solid rgba(0, 0, 0, 0.05)` |
| Box shadow | `0 4px 20px rgba(0, 0, 0, 0.05)` |
| Transition | `all 0.3s ease-in-out` |

#### `AgentCard` — Individual agent widget

| Property | Value |
|----------|-------|
| Min height | `200px` |
| Cursor | `pointer` |
| Hover | `translateY(-4px)`, stronger shadow |
| Hover actions | `.agent-actions` fades in (custom agents only) |

#### `StyledButton`

| Property | Value |
|----------|-------|
| Border radius | `theme.shape.borderRadius * 3` |
| Padding | `8px 24px` |
| Text transform | `none` |
| Font weight | `600` |

#### `TerminalBox` (used in SRE / DevOps dialogs)

| Property | Value |
|----------|-------|
| Background | `#1e1e1e` |
| Text | `#00ff00` (monospace) |
| Max height | `400px`, scrollable |

---

## App Shell (Layout)

**File:** `src/components/Layout.js`

| Element | Spec |
|---------|------|
| App bar | Frosted white `rgba(255,255,255,0.95)`, blur, bottom border |
| Main content area | Background `#F8FAFF`, padding `24px`, `marginTop: 64px` |
| Nav tabs | Dashboard, Design Agent, Design SLM Agent, Analyse Agents, Configuration |
| Tab style | No uppercase, selected = primary color + weight 600 |
| Logo | Gradient text, 40×40 logo image |

---

## Design Agent Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Quick Action Bar — horizontal scroll, gradient buttons]   │
├─────────────────────────────────────────────────────────────┤
│  ┌─ Category Section (StyledCard) ──────────────────────┐   │
│  │  [Icon badge]  Category Title          [▼ expand]   │   │
│  │  Category description                                 │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                 │   │
│  │  │ Agent   │ │ Agent   │ │ Agent   │  (Collapse)     │   │
│  │  │ Card    │ │ Card    │ │ Card    │                 │   │
│  │  └─────────┘ └─────────┘ └─────────┘                 │   │
│  └───────────────────────────────────────────────────────┘   │
│  ... repeat for each category ...                             │
├─────────────────────────────────────────────────────────────┤
│  [Dialogs — one per agent type, opened on card click]       │
└─────────────────────────────────────────────────────────────┘
```

**Default state:** All category sections start **collapsed** (`collapsedSections[category] = true`).

**Expand/collapse:** `ExpandMoreIcon` rotates 180° when expanded; content wrapped in MUI `<Collapse>`.

**Animation:** Each category wrapped in `motion.div` with `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`, `duration: 0.5`.

---

## Quick Action Bar

Horizontal scroll row above categories. Centered, hidden scrollbar, `flexWrap: nowrap`, `gap: 2`.

| Button Label | Gradient | Icon | Opens |
|--------------|----------|------|-------|
| Design Custom AI Agent | `#007AFF → #5856D6` | `AddIcon` | `CustomAgentDesigner` |
| Agent Collaboration Hub | `#FF9500 → #FFBD2E` | `Groups` | Agent Collaboration dialog |
| Knowledge Base Manager | `#AF52DE → #5E5CE6` | `Storage` | Knowledge Base dialog |
| Workflow Designer | `#FF375F → #FF6482` | `AccountTree` | Workflow Designer dialog |
| Performance Optimizer | `#64D2FF → #5AC8FA` | `Speed` | Performance Tester dialog |
| Mobile Developer Assist | `#FF2D55 → #FF375F` | `PhoneAndroid` | Mobile Developer Assist dialog |

**Button spec:** `variant="contained"`, white text, `fontWeight: 600`, `px: 3`, `py: 1.5`, darker gradient on hover.

---

## Category Section (Collapsible Drop)

### Header Row

```
[Icon Box]  [Title + Description]                    [Expand IconButton]
```

| Element | Spec |
|---------|------|
| Icon box | `p: 1`, `borderRadius: 2`, `bgcolor: ${color}15`, `color: category.color` |
| Category icon | MUI icon, `fontSize="large"` |
| Title | `Typography variant="h6"`, `fontWeight: 600` |
| Description | `Typography variant="body2"`, `color="text.secondary"` |
| Expand button | `ExpandMoreIcon`, rotates when collapsed |

### Content Grid (when expanded)

| Breakpoint | Columns |
|------------|---------|
| xs | 1 (`xs={12}`) |
| sm | 2 (`sm={6}`) |
| md+ | 3 (`md={4}`) |

Spacing: `spacing={2}` inside category, `spacing={3}` between categories.

### Data Shape (Category)

```javascript
{
  value: 'sdlc',              // unique key, used for collapse state
  label: 'SDLC Agents',       // display title
  icon: <CodeIcon fontSize="large" />,
  color: '#007AFF',
  description: 'Streamline your development lifecycle',
  subcategories: ['Requirements Analysis', 'Design', ...],  // optional metadata
  subAgents: [ /* agent widgets */ ]
}
```

---

## Agent Card Widget

### Layout

```
┌──────────────────────────────────────────┐
│  [Icon]   Agent Name          [stable]   │
│  badge    Description text               │
│           [feature] [feature] [feature]    │
│                              [⋮ menu]*   │
└──────────────────────────────────────────┘
* menu only for custom agents (type: 'custom')
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | Card title, `subtitle1`, weight 600 |
| `description` | string | Yes | Secondary text |
| `icon` | React node | Yes | MUI icon inside category-colored badge |
| `features` | string[] | No | Outlined chips, wrapped |
| `status` | `'stable'` \| `'beta'` | No | Chip: success / warning |
| `type` | string | Yes | Routes to dialog via `handleAgentClick` |
| `id` | string | No | For custom/API-backed agents |

### Status Chips

| Status | MUI Chip color |
|--------|----------------|
| `stable` | `success` (green) |
| `beta` | `warning` (orange) |

### Feature Chips

`size="small"`, `variant="outlined"`, flex wrap with `gap: 1`.

### Click Behavior

1. Card `onClick` → `handleAgentSelect(agent)`
2. Special types handled first (TRR, CSNP, claims, etc.)
3. Then `handleAgentClick(agent.type)` opens the matching dialog

### Custom Agent Overlay

On hover, bottom-right `MoreVertIcon` menu appears (opacity 0 → 1, `translateY(10px → 0)`).

---

## Agent Categories & Widgets Catalog

### 1. SDLC Agents

| Property | Value |
|----------|-------|
| `value` | `sdlc` |
| `color` | `#007AFF` |
| `icon` | `CodeIcon` |
| `description` | Streamline your development lifecycle |
| `subcategories` | Requirements Analysis, Design, Development, Testing, Deployment, Maintenance |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Requirements Analyzer | `requirements` | stable | `AssignmentIcon` | Requirements validation, Gap analysis, User story generation, Acceptance criteria |
| Architecture Assistant | `architecture` | beta | `ArchitectureIcon` | Pattern suggestions, Scalability analysis, Best practices |
| Integration Test Designer | `testing` | beta | `IntegrationInstructionsIcon` | API testing, End-to-end scenarios, Test automation |
| Data Analyzer | `data` | beta | `StorageIcon` | Data modeling, Schema optimization, Performance analysis |
| User Story Generator | `story-generator` | stable | `AssignmentIcon` | AI-powered story generation, Jira integration, Story refinement, Acceptance criteria |
| Deployment Agent | `deployment-agent` | stable | `CloudUploadIcon` | GitHub Actions Integration, Zero-downtime Deployment, Build Ready for Deployment |
| Code Agent | `code-agent` | stable | `CodeIcon` | Design Document Upload, Jira Integration, Smart Debugging |

**Dialog components:** `RequirementsAnalyzerDialog`, `ArchitectureAssistantDialog`, `IntegrationTestDesignerDialog`, `DataAnalyzerDialog`, `UserStoryGeneratorDialog`, `DeploymentAgentDialog`, `CodeAgentDialog`

---

### 2. MultiAgent Workflows

| Property | Value |
|----------|-------|
| `value` | `multiagent` |
| `color` | `#FF9500` |
| `icon` | `HubIcon` |
| `description` | Create collaborative agent workflows |
| `subcategories` | Sequential, Parallel, Hybrid |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Workflow Designer | `workflow` | stable | `AccountTreeIcon` | Visual workflow builder, Agent chaining, Parallel execution |
| Chain of Thought | `chain` | beta | `PsychologyIcon` | Reasoning steps, Knowledge transfer, Decision tracking |
| Agent Collaboration | `collaboration` | beta | `GroupsIcon` | Shared context, Message passing, Conflict resolution |
| TRR Processing Workflow | `trr_processor` | — | `AssessmentIcon` | File Upload & Validation, TRC Logic Processing, Automated Testing, Report Generation, Error Handling |
| CSNP Workflow | `csnp_workflow` | beta | `HubIcon` | Eligibility Verification, Condition Management, Care Coordination |
| Provider Outreach | `provider_outreach` | — | `HospitalIcon` | Provider Selection, Multiple Contact Methods, Real-time Verification, Documentation Tracking |
| Sales - Intake to Install Agents | `level_funded_copilot` | beta | `AttachMoneyIcon` | Census & Intake Normalization Agent, Pricing & Claims Estimation Agent, Benchmark & Similarity Intelligence Agent, Risk/Legal/Regulatory Agent, Clinical Engagement Agent, Financial Structure Agent, Sales & Proposal Agent |
| Ticket Flow Orchestration | `ticket_flow_orchestration` | beta | `SupportIcon` | Signal Intake & Classification, Ownership & Risk Intelligence, Remediation Planning, ServiceNow Orchestration, Verification & Sync |
| Medical Adherence Agentic Intervention | `medical_adherence_intervention` | beta | `MonitorHeartIcon` | Data Ingestion & medication graph, Clinical Insight Agent, Signal Agent (SureScripts NO_FILL), Digital Outreach, Action Agent & nurse routing, Care coordination timeline, Outcome & expected avoided cost |

**Dialog components:** `WorkflowDesignerDialog`, `ChainOfThoughtDialog`, `AgentCollaborationDialog`, `TRRProcessingDialog`, `CSNPWorkflowDialog`, `ProviderOutreachDialog`, `LevelFundedPlanCopilotDialog`, `TicketFlowOrchestrationDialog`, `MedicalAdherenceAgentDialog`

---

### 3. Claims Processing

| Property | Value |
|----------|-------|
| `value` | `claims_processing` |
| `color` | `#007AFF` |
| `icon` | `AssignmentIcon` |
| `description` | Process and manage claims with AI assistance |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Claim Center AI | `claim_center` | stable | `AssignmentIcon` | Claim PEND Resolution, Claims Policy, General Inquiry |
| Care Cost Gaps Center AI | `care_cost_gaps_center` | stable | `AttachMoneyIcon` | Cost Gap Analysis, Savings Optimization, Provider Rate Validation |

**Dialog components:** `ClaimCenterAIDialog`, `CareCostGapsCenterAIDialog`

---

### 4. RAG Agents

| Property | Value |
|----------|-------|
| `value` | `rag` |
| `color` | `#5856D6` |
| `icon` | `StorageIcon` |
| `description` | Retrieval Augmented Generation Agents |
| `subcategories` | Document Retrieval, Context Augmentation, Knowledge Management, Query Optimization |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Document Retriever | `document-retriever` | stable | `DescriptionIcon` | Smart retrieval, Document indexing, Semantic search |
| Context Augmenter | `context-augmenter` | beta | `AutoFixHighIcon` | Context injection, Prompt enhancement, Knowledge fusion |
| Knowledge Base Manager | `knowledge-base` | stable | `StorageIcon` | Document management, Version control, Content indexing |
| Query Optimizer | `query-optimizer` | beta | `ManageSearchIcon` | Query refinement, Search optimization, Relevance tuning |
| Talk 2 Data | `talk-2-data` | stable | `ChatIcon` | Database connectivity, Semantic search, RAG-powered extraction, Natural language queries |
| Content Generation Agent | `content-generation` | stable | `DescriptionIcon` | SOP generation, Document upload, Language preferences, PDF export, Custom prompts |

**Dialog components:** `DocumentRetrieverDialog`, inline dialogs for context/knowledge/query, `Talk2DataDialog`, `ContentGenerationAgentDialog`

---

### 5. MLOps Agents

| Property | Value |
|----------|-------|
| `value` | `mlops` |
| `color` | `#34C759` |
| `icon` | `AnalyticsIcon` |
| `description` | Streamline your machine learning operations |
| `subcategories` | Data Processing, Model Training, Model Deployment, Monitoring |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Data Preprocessor | — | stable | `DataArrayIcon` | Data cleaning, Feature engineering, Data augmentation |
| Model Trainer | — | beta | `PlaylistPlayIcon` | Hyperparameter tuning, Distributed training, Model evaluation |
| Model Deployer | — | stable | `CloudUploadIcon` | Containerization, Scalable deployment, Versioning |
| Model Monitor | — | beta | `TrendingUp` | Drift detection, Performance metrics, Alerting |

---

### 6. DevOps Agents

| Property | Value |
|----------|-------|
| `value` | `devops` |
| `color` | `#5856D6` |
| `icon` | `CloudUploadIcon` |
| `description` | Automate your DevOps workflows |
| `subcategories` | CI/CD, Infrastructure, Monitoring, Deployment |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Pipeline Builder | `pipeline` | stable | `IntegrationInstructionsIcon` | Pipeline automation, Build optimization, Deployment strategies |
| Infrastructure Manager | `infrastructure` | beta | `StorageIcon` | IaC generation, Resource optimization, Cost analysis |
| Deployment Orchestrator | `deployment` | stable | `PlayArrowIcon` | Zero-downtime deployment, Rollback automation, Environment management |
| SRE AI Agent | `sre` | stable | `MonitorHeartIcon` | Anomaly detection, Incident response automation, SLO/SLI monitoring, Performance optimization, Capacity planning |

**Dialog components:** `PipelineBuilderWorkflow`, inline infra/deployment dialogs, large inline SRE dialog (11 tabs)

---

### 7. Security Agents

| Property | Value |
|----------|-------|
| `value` | `security` |
| `color` | `#FF3B30` |
| `icon` | `SecurityIcon` |
| `description` | Enhance your application security |
| `subcategories` | Code Analysis, Vulnerability Scanning, Compliance, Monitoring |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Code Scanner | `scanner` | stable | `SearchIcon` | SAST analysis, Dependency checking, Security best practices |
| Compliance Checker | `compliance` | beta | `CheckCircleIcon` | Policy validation, Compliance reporting, Risk assessment |
| Security Monitor | `security-monitor` | beta | `SpeedIcon` | Real-time monitoring, Threat detection, Incident response |

---

### 8. Quality Assurance Agents

| Property | Value |
|----------|-------|
| `value` | `quality` |
| `color` | `#34C759` |
| `icon` | `BugReportIcon` |
| `description` | Ensure software quality and reliability |
| `subcategories` | Testing, Code Quality, Performance, Documentation |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Test Generator | `test-generator` | stable | `PlaylistPlayIcon` | Unit test generation, Integration testing, Test coverage analysis |
| Code Quality Analyzer | `code-quality` | beta | `CodeIcon` | Code review, Best practices, Technical debt analysis |
| Performance Tester | `performance` | beta | `SpeedIcon` | Load testing, Performance metrics, Bottleneck detection |
| Documentation Generator | `documentation` | stable | `DescriptionIcon` | API documentation, Code documentation, User guides |

---

### 9. Analytics Agents

| Property | Value |
|----------|-------|
| `value` | `analytics` |
| `color` | `#FF9500` |
| `icon` | `TrendingUp` |
| `description` | Gain insights from your data and metrics |
| `subcategories` | Performance Analytics, User Analytics, Business Intelligence, Monitoring |

| Agent | Type | Status | Icon | Features |
|-------|------|--------|------|----------|
| Metrics Analyzer | `metrics` | stable | `AnalyticsIcon` | Performance analysis, Trend detection, Anomaly detection |
| User Behavior Analyzer | `user-analytics` | beta | `PersonIcon` | Usage patterns, User journey analysis, Conversion optimization |
| Report Generator | `reporting` | stable | `AssignmentIcon` | Custom reporting, Data visualization, Automated insights |
| Demand Forecasting | `demand_forecasting` | beta | `TrendingUpIcon` | Regional ML forecasts, Historical + external signals, Inventory optimization, Stockout reduction |
| Supplier Risk Scoring Agent | `supplier_risk_scoring` | beta | `ShieldIcon` | Real-time risk scoring, AI interventions, Geopolitical + operational intelligence, Reduced supply chain disruption |

**Dialog components:** `DemandForecastingDialog`, `SupplierRiskScoringDialog`

---

## Agent Type → Dialog Mapping

| `type` | Dialog / Action |
|--------|-----------------|
| `requirements` | RequirementsAnalyzerDialog |
| `architecture` | ArchitectureAssistantDialog |
| `testing` | IntegrationTestDesignerDialog |
| `data` | DataAnalyzerDialog |
| `workflow` | WorkflowDesignerDialog |
| `chain` | ChainOfThoughtDialog |
| `collaboration` | AgentCollaborationDialog |
| `pipeline` | PipelineBuilderWorkflow |
| `infrastructure` | Inline infra dialog |
| `deployment` | Inline deployment orchestrator dialog |
| `deployment-agent` | DeploymentAgentDialog |
| `code-agent` | CodeAgentDialog |
| `scanner` | Inline code scanner dialog |
| `compliance` | Inline compliance dialog |
| `security-monitor` | Inline security monitor dialog |
| `test-generator` | Inline test generator dialog |
| `code-quality` | Inline code quality dialog |
| `performance` | Inline performance tester dialog |
| `documentation` | Inline documentation dialog |
| `metrics` | Inline metrics analyzer dialog |
| `user-analytics` | Inline user analyzer dialog |
| `reporting` | Inline report generator dialog |
| `story-generator` | UserStoryGeneratorDialog |
| `document-retriever` | DocumentRetrieverDialog |
| `context-augmenter` | Inline context augmenter dialog |
| `knowledge-base` | Inline knowledge base dialog |
| `query-optimizer` | Inline query optimizer dialog |
| `content-generation` | ContentGenerationAgentDialog |
| `talk-2-data` | Talk2DataDialog |
| `trr_processor` | TRRProcessingDialog |
| `csnp_workflow` | CSNPWorkflowDialog |
| `provider_outreach` | ProviderOutreachDialog |
| `level_funded_copilot` | LevelFundedPlanCopilotDialog |
| `ticket_flow_orchestration` | TicketFlowOrchestrationDialog |
| `medical_adherence_intervention` | MedicalAdherenceAgentDialog |
| `mobile-developer-assist` | MobileDeveloperAssistDialog |
| `claim_center` | ClaimCenterAIDialog |
| `care_cost_gaps_center` | CareCostGapsCenterAIDialog |
| `demand_forecasting` | DemandForecastingDialog |
| `supplier_risk_scoring` | SupplierRiskScoringDialog |
| `sre` | Inline SRE dialog (11-tab full-screen experience) |
| `custom` | User-created agent (API-backed, deletable) |

---

## Dialog Patterns

### Standard Agent Dialog

```jsx
<Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth
  PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', maxHeight: '92vh' } }}>
  <DialogTitle>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <AgentIcon color="primary" />
      <Typography variant="h6">Agent Name</Typography>
    </Box>
  </DialogTitle>
  <DialogContent>...</DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Close</Button>
    <Button variant="contained">Primary Action</Button>
  </DialogActions>
</Dialog>
```

### Dialog Size Guide

| Size | `maxWidth` | Used For |
|------|------------|----------|
| Medium | `md` | Talk2Data, simple forms |
| Large | `lg` | Most agent dialogs |
| Extra large | `xl` | Code Agent, Medical Adherence, SRE Agent |

### Common Dialog Content Blocks

- **Paper sections** with `p: 2`, subtitle `fontWeight: 600`
- **List + ListItemIcon** for capability lists
- **Alert** components for status/info (`severity: success | info | warning | error`)
- **LinearProgress / CircularProgress** for async operations
- **Tabs** for multi-step agent experiences (SRE has 11 tabs)
- **TerminalBox** for log output
- **Stepper** for guided workflows

### Snackbar Feedback

```javascript
{ open, message, severity: 'success' | 'error' | 'warning' | 'info' }
```

Position: bottom-center via MUI `<Snackbar>` + `<Alert>`.

---

## Create Custom Agent Flow

**Trigger:** "Design Custom AI Agent" button → `CustomAgentDesigner`

**Stepper dialog** (`maxWidth="md"`):

| Step | Fields |
|------|--------|
| 0 — Category | Select from `AGENT_CATEGORIES` dropdown |
| 1 — Details | Name, Description (multiline) |
| 2 — Capabilities | Features (comma-separated) |
| 3 — Review | Summary before create |

Custom agents appear in their category grid with `SmartToyIcon`, `type: 'custom'`, and delete menu on hover.

---

## Design SLM Agent Page (Variant)

**File:** `src/pages/DesignSLMAgent.js`

Same visual system (`StyledCard`, `AgentCard`, collapsible sections) with a separate category catalog:

| Category | Color | Agents |
|----------|-------|--------|
| Base Model Agents | `#007AFF` | BERT-Mini, DistilBERT, TinyBERT |
| Specialized Agents | `#34C759` | Text Classifier, QA Assistant, Summarizer |
| Deployment Agents | `#5856D6` | Model Quantizer, Edge Deployer, Performance Monitor |
| Fine-tuning Agents | `#FF9500` | Domain Adapter, LoRA Trainer, Evaluation Agent |

Use the same widget card spec; only the category data and dialog components differ.

---

## Recipe: Build a Similar Page

### Step 1 — Copy styled components

```javascript
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
}));

const AgentCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  minHeight: '200px',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' },
}));
```

### Step 2 — Define your category catalog

```javascript
const MY_CATEGORIES = [
  {
    value: 'my_category',
    label: 'My Category',
    icon: <MyIcon fontSize="large" />,
    color: '#007AFF',
    description: 'Category description',
    subAgents: [
      {
        name: 'My Agent',
        icon: <MyAgentIcon />,
        description: 'What this agent does',
        features: ['Feature 1', 'Feature 2'],
        status: 'stable',
        type: 'my-agent-type',
      },
    ],
  },
];
```

### Step 3 — Collapse state

```javascript
const [collapsedSections, setCollapsedSections] = useState(
  MY_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.value]: true }), {})
);
```

### Step 4 — Render loop

For each category → `StyledCard` → header + `Collapse` → `Grid` of `AgentCard` widgets.

### Step 5 — Wire dialogs

One `useState` boolean per dialog; `handleAgentClick(type)` switch; pass `open` / `onClose` to dialog component.

### Step 6 — Optional quick action bar

Row of gradient `Button`s above categories for top-level shortcuts.

---

## File Reference

| File | Purpose |
|------|---------|
| `src/pages/DesignAgent.js` | Main Design Agent page + `AGENT_CATEGORIES` |
| `src/pages/DesignSLMAgent.js` | SLM variant page |
| `src/theme.js` | MUI theme tokens |
| `src/components/Layout.js` | App shell |
| `src/components/*Dialog.js` | Agent detail dialogs |
| `src/components/CustomAgentDesigner.js` | Custom agent creation |

---

*Last synced with codebase: Design Agent page, 9 categories, 40+ agent widgets.*
