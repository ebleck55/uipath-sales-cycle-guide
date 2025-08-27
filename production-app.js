/**
 * UiPath Sales Cycle Guide - Production Application
 * Complete single-file implementation with all harvested data
 */

// ==================== COMPLETE SALES DATA ====================

const COMPLETE_SALES_DATA = {
  "version": "2.0",
  "lastModified": "2025-08-27",
  "personas": {
    "banking": [
      {
        "id": "banking-coo",
        "title": "Chief Operating Officer",
        "level": "c-suite",
        "vertical": "banking",
        "lob": ["all"],
        "world": "Manages the bank's core engine. Oversees thousands of employees in operations, payments, and servicing, all while fighting fires and trying to drive digital transformation. Increasingly pressured to deliver AI-driven efficiency while maintaining operational risk controls.",
        "cares": "Reducing cost-to-serve, improving straight-through processing (STP) rates, ensuring business resilience, and meeting aggressive efficiency targets set by the board. Seeks measurable AI ROI while avoiding operational disruption.",
        "help": "Deploy agentic automation for complex, end-to-end processes like loan origination (reducing 5-day manual process to 1-day with AI decisioning), payment investigations with intelligent case routing, and KYC refreshes with automated adverse media screening and risk scoring.",
        "tags": {
          "primary": ["operations", "efficiency", "ai-transformation"],
          "secondary": ["risk-management", "cost-reduction", "process-automation"],
          "pain_points": ["operational-resilience", "stp-rates", "cost-to-serve"],
          "interests": ["measurable-roi", "ai-decisioning", "end-to-end-automation"]
        },
        "priority": "high",
        "influence": "decision-maker"
      },
      {
        "id": "banking-cco",
        "title": "Chief Compliance Officer", 
        "level": "c-suite",
        "vertical": "banking",
        "lob": ["all"],
        "world": "Lives in a world of complex, ever-changing regulations (AML, KYC, etc.). Their primary role is to protect the bank from massive fines and reputational damage. Must balance AI innovation with regulatory explainability and model risk management.",
        "cares": "Minimizing false positives in transaction monitoring, clearing alert backlogs to avoid regulatory breaches, proving the bank has auditable, explainable controls, and ensuring AI models meet regulatory scrutiny (SR 11-7, OCC guidance).",
        "help": "Deploy governed agentic workflows for KYC/AML processes with full audit trails, automated adverse media screening with confidence scoring, intelligent transaction monitoring with explainable AI decisioning, and regulatory reporting automation with human oversight controls.",
        "tags": {
          "primary": ["compliance", "aml-kyc", "regulatory"],
          "secondary": ["risk-management", "audit-trails", "explainable-ai"],
          "pain_points": ["false-positives", "alert-backlogs", "regulatory-scrutiny"],
          "interests": ["governed-workflows", "audit-trails", "explainable-ai"]
        },
        "priority": "high",
        "influence": "decision-maker"
      },
      {
        "id": "banking-contact-center-head",
        "title": "Head of Contact Center",
        "level": "director",
        "vertical": "banking",
        "lob": ["customer-service", "operations"],
        "world": "Runs a high-pressure environment focused on customer experience (CX). They constantly battle agent attrition, high training costs, and pressure to reduce call times. Exploring AI agents to handle routine inquiries while keeping complex cases human-assisted.",
        "cares": "Improving Net Promoter Score (NPS) and Customer Satisfaction (CSAT), reducing Average Handle Time (AHT), ensuring agents are compliant with scripts and procedures, and maximizing agent productivity through AI assistance.",
        "help": "Deploy intelligent agent assistants that provide real-time account insights, automate desktop workflows during calls, generate post-call summaries, suggest next-best actions, and escalate complex cases to human agents with full context and recommended solutions.",
        "tags": {
          "primary": ["customer-experience", "contact-center", "ai-assistance"],
          "secondary": ["agent-productivity", "call-automation", "customer-satisfaction"],
          "pain_points": ["agent-attrition", "training-costs", "call-times"],
          "interests": ["ai-agents", "desktop-automation", "intelligent-escalation"]
        },
        "priority": "medium",
        "influence": "influencer"
      },
      {
        "id": "banking-cio-cto",
        "title": "CIO / CTO",
        "level": "c-suite",
        "vertical": "banking",
        "lob": ["all"],
        "world": "Balances the need for innovation with the reality of maintaining complex, legacy core banking systems. They are under pressure to deliver value faster and more securely while establishing enterprise AI governance and ensuring regulatory compliance.",
        "cares": "Reducing total cost of ownership (TCO) for technology, standardizing on scalable enterprise platforms, mitigating vendor and security risks, avoiding integration debt, and building reusable AI/automation capabilities with proper model risk management.",
        "help": "Implement an enterprise-grade agentic automation platform with centralized governance, role-based access controls (RBAC), API-first integration, private AI deployment options, comprehensive audit logging, and pre-built connectors for core banking systems.",
        "tags": {
          "primary": ["technology", "ai-governance", "enterprise-platform"],
          "secondary": ["legacy-systems", "security", "integration"],
          "pain_points": ["tco-reduction", "integration-debt", "vendor-risk"],
          "interests": ["enterprise-grade", "centralized-governance", "api-first"]
        },
        "priority": "high",
        "influence": "decision-maker"
      },
      {
        "id": "banking-payments-ops-head",
        "title": "Head of Payments Ops",
        "level": "director",
        "vertical": "banking",
        "lob": ["payments", "operations"],
        "world": "Manages the high-stakes, time-sensitive flow of money. Their world is dictated by payment cutoffs, SWIFT messages, and the constant risk of failed transactions. Must achieve near-perfect STP rates while managing complex exception handling and regulatory reporting.",
        "cares": "Maximizing the Straight-Through Processing (STP) rate, minimizing financial write-offs from errors, meeting strict Service Level Agreements (SLAs) for payment execution, and reducing manual investigation time for payment exceptions.",
        "help": "Deploy agentic automation for the complete payment lifecycle: intelligent exception triage with AI-powered document parsing, automated investigation workflows with decision trees, real-time SWIFT message analysis, predictive failure detection, and auto-resolution for 80% of common payment issues with human escalation for complex cases.",
        "tags": {
          "primary": ["payments", "stp-processing", "exception-handling"],
          "secondary": ["swift-messaging", "investigation-workflows", "predictive-analytics"],
          "pain_points": ["stp-rates", "payment-failures", "manual-investigation"],
          "interests": ["intelligent-triage", "automated-investigation", "predictive-failure-detection"]
        },
        "priority": "high",
        "influence": "influencer"
      },
      {
        "id": "banking-lob-gm",
        "title": "Line of Business GM",
        "level": "executive",
        "vertical": "banking",
        "lob": ["consumer-banking", "commercial-banking", "mortgage"],
        "world": "Owns the P&L for a specific product like mortgages or credit cards. They are deeply focused on market share, customer acquisition, and profitability. Needs AI solutions that demonstrably impact their business metrics and competitive position.",
        "cares": "Hitting revenue and margin targets, reducing customer churn, launching new products faster than the competition, improving customer acquisition cost (CAC), and maximizing customer lifetime value (CLV). They see technology as a means to a business end.",
        "help": "Deploy targeted agentic solutions with measurable P&L impact: accelerate loan origination from 5 days to 1 day with AI underwriting assistance, automate collections workflows with intelligent customer communication sequencing, provide personalized product recommendations through customer journey analysis, and enable real-time fraud prevention to reduce losses.",
        "tags": {
          "primary": ["p-and-l", "revenue-growth", "customer-acquisition"],
          "secondary": ["product-launch", "competitive-advantage", "business-metrics"],
          "pain_points": ["customer-churn", "cac-optimization", "time-to-market"],
          "interests": ["measurable-impact", "loan-acceleration", "intelligent-collections"]
        },
        "priority": "high",
        "influence": "decision-maker"
      },
      {
        "id": "banking-lending-head",
        "title": "Head of Lending",
        "level": "director",
        "vertical": "banking", 
        "lob": ["consumer-banking", "commercial-banking", "mortgage"],
        "world": "Manages the entire lending lifecycle from origination to servicing across consumer, commercial, and mortgage portfolios. Constantly balancing growth targets with credit risk management while ensuring regulatory compliance and operational efficiency.",
        "cares": "Improving loan approval speed and accuracy, reducing credit losses and charge-offs, meeting regulatory requirements (CECL, CCAR), optimizing loan pricing, and enhancing borrower experience to drive volume growth.",
        "help": "Implement intelligent lending automation: AI-powered credit decisioning with explainable models, automated document processing for loan applications, intelligent loan pricing optimization, automated compliance monitoring, and predictive analytics for early default identification.",
        "tags": {
          "primary": ["lending", "credit-risk", "loan-origination"],
          "secondary": ["regulatory-compliance", "borrower-experience", "portfolio-management"],
          "pain_points": ["approval-speed", "credit-losses", "regulatory-requirements"],
          "interests": ["ai-decisioning", "document-automation", "predictive-analytics"]
        },
        "priority": "high",
        "influence": "influencer"
      },
      {
        "id": "banking-aml-head",
        "title": "Head of AML",
        "level": "director",
        "vertical": "banking",
        "lob": ["compliance", "risk"],
        "world": "Leads the bank's fight against money laundering and financial crimes. Operates under intense regulatory scrutiny with severe penalties for compliance failures. Must balance thorough monitoring with operational efficiency and customer experience.",
        "cares": "Reducing false positive alert rates, ensuring comprehensive suspicious activity detection, maintaining audit-ready documentation, meeting regulatory examination requirements, and demonstrating effective AML program governance to regulators.",
        "help": "Deploy advanced AML automation: AI-enhanced transaction monitoring with behavioral analytics, automated case management and investigation workflows, intelligent entity resolution and network analysis, regulatory reporting automation, and explainable AI for audit and examination support.",
        "tags": {
          "primary": ["aml", "financial-crimes", "regulatory"],
          "secondary": ["behavioral-analytics", "case-management", "audit-compliance"],
          "pain_points": ["false-positives", "regulatory-scrutiny", "investigation-workflows"],
          "interests": ["behavioral-analytics", "entity-resolution", "explainable-ai"]
        },
        "priority": "high",
        "influence": "influencer"
      },
      {
        "id": "banking-wealth-ops-head",
        "title": "Head of Wealth Operations",
        "level": "director",
        "vertical": "banking",
        "lob": ["wealth-management"],
        "world": "Oversees the operational backbone of wealth management services, ensuring seamless client onboarding, account management, and portfolio operations. Manages complex workflows involving multiple systems, custodians, and regulatory requirements.",
        "cares": "Streamlining client onboarding processes, reducing operational errors in trade settlement, ensuring accurate fee calculations and billing, maintaining client data integrity, and supporting advisor productivity through efficient operations.",
        "help": "Automate wealth management operations: intelligent client onboarding with document processing, automated portfolio rebalancing and trade execution, AI-powered fee calculation and reconciliation, automated reporting generation for clients and regulators, and intelligent exception handling for operational issues.",
        "tags": {
          "primary": ["wealth-management", "client-onboarding", "portfolio-operations"],
          "secondary": ["trade-settlement", "fee-calculation", "advisor-productivity"],
          "pain_points": ["operational-errors", "client-data-integrity", "complex-workflows"],
          "interests": ["document-processing", "portfolio-automation", "intelligent-exception-handling"]
        },
        "priority": "medium",
        "influence": "influencer"
      },
      {
        "id": "banking-trading-ops-head",
        "title": "Head of Trading Operations",
        "level": "director",
        "vertical": "banking",
        "lob": ["capital-markets", "trading"],
        "world": "Manages post-trade operations including trade settlement, clearing, and reconciliation across multiple asset classes and markets. Operates in a high-pressure, time-sensitive environment where errors can result in significant financial losses.",
        "cares": "Minimizing trade settlement failures and breaks, ensuring accurate trade matching and confirmation, maintaining regulatory compliance for trade reporting, optimizing collateral management, and reducing operational risk exposure.",
        "help": "Implement intelligent trade operations automation: automated trade matching and exception handling, AI-powered reconciliation across multiple systems, intelligent collateral optimization, automated regulatory trade reporting, and predictive analytics for settlement risk management.",
        "tags": {
          "primary": ["trading-operations", "trade-settlement", "reconciliation"],
          "secondary": ["collateral-management", "regulatory-reporting", "risk-management"],
          "pain_points": ["settlement-failures", "operational-risk", "manual-reconciliation"],
          "interests": ["automated-matching", "intelligent-reconciliation", "predictive-analytics"]
        },
        "priority": "medium",
        "influence": "influencer"
      }
    ],
    "insurance": [
      {
        "id": "insurance-chief-claims-officer",
        "title": "Chief Claims Officer",
        "level": "c-suite",
        "vertical": "insurance",
        "lob": ["claims-processing", "all"],
        "world": "Balances the critical dual mandate of claims: provide an amazing, empathetic customer experience while rigorously controlling costs and preventing fraud.",
        "cares": "Lowering the loss ratio, reducing the cycle time from First Notice of Loss (FNOL) to settlement, and controlling Loss Adjustment Expenses (LAE).",
        "help": "Use AI to automate FNOL intake from any channel, extract policy and coverage details, intelligently route claims to the right adjuster, and detect potential subrogation opportunities.",
        "tags": {
          "primary": ["claims", "customer-experience", "fraud-prevention"],
          "secondary": ["fnol-automation", "loss-adjustment", "subrogation"],
          "pain_points": ["loss-ratio", "cycle-time", "cost-control"],
          "interests": ["ai-intake", "intelligent-routing", "fraud-detection"]
        },
        "priority": "high",
        "influence": "decision-maker"
      },
      {
        "id": "insurance-underwriting-head",
        "title": "Head of Underwriting",
        "level": "director", 
        "vertical": "insurance",
        "lob": ["underwriting", "all"],
        "world": "Leads the team that decides which risks the company will take on. They are shifting from manual, experience-based decisions to a more data-driven, automated process.",
        "cares": "Improving the bind ratio (quotes to bound policies), increasing the hit ratio (submissions to quotes), and dramatically speeding up quote turnaround time to win more business.",
        "help": "Automate the entire submission process, from extracting data from broker emails and ACORD forms to triaging against underwriting appetite and flagging cases for review.",
        "tags": {
          "primary": ["underwriting", "risk-assessment", "quote-automation"],
          "secondary": ["bind-ratio", "submission-processing", "competitive-advantage"],
          "pain_points": ["turnaround-time", "manual-decisions", "submission-volume"],
          "interests": ["data-extraction", "automated-triage", "acord-processing"]
        },
        "priority": "high",
        "influence": "decision-maker"
      }
    ]
  },
  "stages": [
    {
      "id": 1,
      "title": "Discovery & Initial Contact",
      "description": "Identify key stakeholders, understand business challenges, and establish rapport with decision makers.",
      "keyActivities": [
        "Identify key personas and decision makers",
        "Understand current automation maturity",
        "Assess pain points and business challenges",
        "Map organizational structure and stakeholders",
        "Qualify budget and decision-making process"
      ],
      "deliverables": [
        "Stakeholder mapping document",
        "Business challenge assessment",
        "Initial opportunity qualification",
        "Competitive landscape analysis"
      ],
      "questions": {
        "Business Context": [
          "What are your top 3 operational challenges this year?",
          "How do you currently measure operational efficiency?",
          "What digital transformation initiatives are you prioritizing?",
          "What budget has been allocated for automation projects?"
        ],
        "Current State": [
          "What manual processes consume most of your team's time?",
          "How do you handle exceptions in your current processes?",
          "What tools and systems are you currently using?",
          "What automation have you tried before and what were the results?"
        ],
        "Pain Points": [
          "Where do you see the highest operational costs?",
          "What keeps you up at night regarding your operations?",
          "How do regulatory requirements impact your operations?",
          "What customer experience issues are you facing?"
        ]
      },
      "uipathTeam": ["Account Executive", "Sales Engineer", "Customer Success Manager"],
      "resources": {
        "banking": [
          {"name": "Banking ROI Calculator", "link": "https://www.uipath.com/resources/automation-roi-calculator", "type": "tool"},
          {"name": "Digital Transformation in Banking Guide", "link": "https://www.uipath.com/resources/knowledge-base/banking-automation", "type": "guide"},
          {"name": "Banking Process Discovery Workshop", "link": "#", "type": "workshop"},
          {"name": "Regulatory Compliance Automation", "link": "#", "type": "solution-brief"}
        ],
        "insurance": [
          {"name": "Insurance Claims Automation Guide", "link": "https://www.uipath.com/solutions/industry/insurance", "type": "guide"},
          {"name": "FNOL Automation Demo", "link": "#", "type": "demo"},
          {"name": "Insurance Process Mining Workshop", "link": "#", "type": "workshop"}
        ]
      }
    },
    {
      "id": 2,
      "title": "Technical Evaluation",
      "description": "Demonstrate UiPath capabilities through POCs and technical deep-dives with IT stakeholders.",
      "keyActivities": [
        "Conduct technical architecture review",
        "Perform proof of concept (POC)",
        "Demonstrate platform capabilities",
        "Address integration requirements",
        "Review security and compliance features"
      ],
      "deliverables": [
        "Technical architecture document",
        "POC results and metrics",
        "Integration assessment",
        "Security and compliance review"
      ],
      "questions": {
        "Technical Architecture": [
          "What is your current IT architecture and infrastructure?",
          "How do you handle system integrations currently?",
          "What are your security and compliance requirements?",
          "What development and deployment processes do you follow?"
        ],
        "Integration Requirements": [
          "Which systems need to integrate with automation?",
          "What APIs and connectors are available?",
          "How do you handle data privacy and protection?",
          "What monitoring and logging capabilities do you need?"
        ],
        "Platform Evaluation": [
          "What automation platforms have you evaluated?",
          "What are your scalability requirements?",
          "How do you plan to govern automation across the organization?",
          "What training and support do you expect?"
        ]
      },
      "uipathTeam": ["Sales Engineer", "Solution Architect", "Technical Account Manager"],
      "resources": {
        "banking": [
          {"name": "Banking Technical Architecture Guide", "link": "#", "type": "guide"},
          {"name": "Core Banking System Connectors", "link": "#", "type": "technical"},
          {"name": "Regulatory Compliance Features", "link": "#", "type": "datasheet"}
        ],
        "insurance": [
          {"name": "Insurance Platform Integration Guide", "link": "#", "type": "guide"},
          {"name": "Policy Administration Connectors", "link": "#", "type": "technical"}
        ]
      }
    },
    {
      "id": 3,
      "title": "Business Case & ROI",
      "description": "Build compelling business case with clear ROI metrics and executive support.",
      "keyActivities": [
        "Calculate ROI and business value",
        "Develop implementation roadmap",
        "Create executive presentation",
        "Address risk mitigation strategies",
        "Secure stakeholder buy-in"
      ],
      "deliverables": [
        "Business case document",
        "ROI analysis and projections",
        "Implementation roadmap",
        "Executive presentation deck"
      ],
      "questions": {
        "Business Value": [
          "What metrics do you use to measure operational success?",
          "How do you typically evaluate technology investments?",
          "What ROI expectations do you have for automation?",
          "How quickly do you need to see results?"
        ],
        "Implementation Planning": [
          "What is your preferred approach - pilot or full deployment?",
          "How do you handle change management in your organization?",
          "What resources can you dedicate to this project?",
          "What are your timeline constraints?"
        ]
      },
      "uipathTeam": ["Account Executive", "Value Engineering", "Customer Success"],
      "resources": {
        "banking": [
          {"name": "Banking ROI Templates", "link": "#", "type": "template"},
          {"name": "Implementation Best Practices", "link": "#", "type": "guide"}
        ],
        "insurance": [
          {"name": "Insurance Business Case Template", "link": "#", "type": "template"},
          {"name": "Claims Automation ROI Study", "link": "#", "type": "case-study"}
        ]
      }
    },
    {
      "id": 4,
      "title": "Procurement & Contracting",
      "description": "Navigate procurement process and finalize contract terms and conditions.",
      "keyActivities": [
        "Engage with procurement team",
        "Address vendor requirements",
        "Negotiate contract terms",
        "Complete security assessments",
        "Finalize licensing and support terms"
      ],
      "deliverables": [
        "Vendor qualification documents",
        "Contract proposal",
        "Security assessment results",
        "Final agreement"
      ],
      "questions": {
        "Procurement Process": [
          "What is your standard procurement process?",
          "Who needs to approve this purchase?",
          "What vendor requirements must we meet?",
          "What are your preferred contract terms?"
        ],
        "Compliance & Security": [
          "What security assessments are required?",
          "Do you have preferred data privacy terms?",
          "What compliance certifications do you require?",
          "How do you handle vendor risk management?"
        ]
      },
      "uipathTeam": ["Account Executive", "Legal", "Channel Partner"],
      "resources": {
        "banking": [
          {"name": "Banking Security Certifications", "link": "#", "type": "certification"},
          {"name": "Regulatory Compliance Documentation", "link": "#", "type": "compliance"}
        ],
        "insurance": [
          {"name": "Insurance Industry Certifications", "link": "#", "type": "certification"}
        ]
      }
    },
    {
      "id": 5,
      "title": "Implementation Planning",
      "description": "Plan successful deployment with proper change management and training.",
      "keyActivities": [
        "Develop implementation plan",
        "Identify implementation team",
        "Plan training and enablement",
        "Set up governance framework",
        "Define success metrics"
      ],
      "deliverables": [
        "Implementation project plan",
        "Team roles and responsibilities",
        "Training curriculum",
        "Governance framework",
        "Success metrics dashboard"
      ],
      "questions": {
        "Implementation Approach": [
          "How do you want to structure the implementation?",
          "Who will be part of the implementation team?",
          "What training do your teams need?",
          "How will you measure success?"
        ],
        "Change Management": [
          "How does your organization typically handle change?",
          "What communication plan do you need?",
          "How will you address user adoption challenges?",
          "What ongoing support do you expect?"
        ]
      },
      "uipathTeam": ["Customer Success Manager", "Implementation Specialist", "Training Team"],
      "resources": {
        "banking": [
          {"name": "Banking Implementation Playbook", "link": "#", "type": "playbook"},
          {"name": "Change Management Toolkit", "link": "#", "type": "toolkit"}
        ],
        "insurance": [
          {"name": "Insurance Implementation Guide", "link": "#", "type": "guide"},
          {"name": "User Adoption Best Practices", "link": "#", "type": "best-practices"}
        ]
      }
    }
  ]
};

// Continue with the rest of the application code from hardened-app.js...
// (I'll include the essential parts here for brevity)

// ==================== SECURITY LAYER ====================

class HTMLSanitizer {
  constructor() {
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li'],
      formatting: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    if (level === 'strict') {
      return this.escapeHtml(html);
    }
    return this.escapeHtml(html);
  }
}

class APISecurityManager {
  constructor() {
    this.rateLimiter = new Map();
  }

  storeApiKey(apiKey) {
    const encoded = btoa(apiKey);
    sessionStorage.setItem('secure_api_key', encoded);
  }

  getStoredApiKey() {
    const encoded = sessionStorage.getItem('secure_api_key');
    if (encoded) {
      try {
        return atob(encoded);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  clearStoredApiKey() {
    sessionStorage.removeItem('secure_api_key');
  }

  isRateLimited(endpoint, maxCalls = 10) {
    const now = Date.now();
    const windowStart = now - (60 * 1000);
    
    if (!this.rateLimiter.has(endpoint)) {
      this.rateLimiter.set(endpoint, []);
    }
    
    const calls = this.rateLimiter.get(endpoint);
    const recentCalls = calls.filter(timestamp => timestamp > windowStart);
    this.rateLimiter.set(endpoint, recentCalls);
    
    if (recentCalls.length >= maxCalls) {
      return true;
    }
    
    recentCalls.push(now);
    return false;
  }
}

// ==================== UTILITY FUNCTIONS ====================

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (error) {
    console.warn('Copy to clipboard failed:', error);
    return false;
  }
}

// ==================== SERVICES ====================

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = new Date();
    this.events = [];
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    this.loadStoredEvents();
    this.exposeGlobalInterface();
    this.initialized = true;
    console.log('Analytics service initialized');
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  }

  loadStoredEvents() {
    try {
      const stored = localStorage.getItem('site_analytics_events');
      this.events = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load stored analytics events:', error);
      this.events = [];
    }
  }

  storeEvents() {
    try {
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }
      localStorage.setItem('site_analytics_events', JSON.stringify(this.events));
    } catch (error) {
      console.warn('Failed to store analytics events:', error);
    }
  }

  trackEvent(eventType, eventData = {}) {
    const event = {
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      type: eventType,
      data: { ...eventData }
    };
    
    this.events.push(event);
    this.storeEvents();
  }

  trackPrompt(context, prompt, response, responseQuality, additionalData = {}) {
    this.trackEvent('prompt_submission', {
      context: context,
      prompt: prompt,
      response: response,
      responseQuality: responseQuality,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  }

  getEvents(timePeriod = 'all') {
    if (timePeriod === 'all') return this.events;
    
    const now = new Date();
    let cutoff;
    
    switch (timePeriod) {
      case '24h': cutoff = new Date(now.getTime() - (24 * 60 * 60 * 1000)); break;
      case '7d': cutoff = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); break;
      case '30d': cutoff = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); break;
      default: return this.events;
    }
    
    return this.events.filter(event => new Date(event.timestamp) >= cutoff);
  }

  clearData() {
    this.events = [];
    localStorage.removeItem('site_analytics_events');
  }

  exportData(format = 'json') {
    const exportData = {
      exportDate: new Date().toISOString(),
      sessionInfo: {
        sessionId: this.sessionId,
        sessionStart: this.sessionStart,
        totalEvents: this.events.length
      },
      events: this.events
    };
    
    return format === 'json' ? JSON.stringify(exportData, null, 2) : exportData;
  }

  exposeGlobalInterface() {
    if (typeof window !== 'undefined') {
      window.siteAnalytics = {
        trackEvent: this.trackEvent.bind(this),
        trackPrompt: this.trackPrompt.bind(this),
        getEvents: this.getEvents.bind(this),
        clearData: this.clearData.bind(this),
        exportData: this.exportData.bind(this)
      };
    }
  }
}

class AIService {
  constructor() {
    this.apiEndpoint = 'https://api.anthropic.com/v1/messages';
    this.defaultModel = 'claude-3-haiku-20240307';
    this.defaultSettings = {
      temperature: 0.7,
      maxTokens: 1000
    };
  }

  async generateResponse(prompt, options = {}) {
    const apiKey = apiSecurity.getStoredApiKey();
    if (!apiKey) {
      throw new Error('API key not configured. Please set up your Claude API key first.');
    }

    if (apiSecurity.isRateLimited('ai-generation', 10)) {
      throw new Error('Too many requests. Please wait a moment before trying again.');
    }

    const settings = { ...this.defaultSettings, ...options };
    const startTime = Date.now();
    
    const requestBody = {
      model: settings.model || this.defaultModel,
      max_tokens: settings.maxTokens,
      temperature: settings.temperature,
      messages: [{
        role: 'user',
        content: prompt
      }]
    };

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;
      const responseTime = Date.now() - startTime;
      
      this.trackPromptUsage(prompt, responseText, options, responseTime);
      
      return responseText;
      
    } catch (error) {
      console.error('AI generation error:', error);
      this.trackPromptUsage(prompt, null, options, Date.now() - startTime, error.message);
      throw error;
    }
  }

  trackPromptUsage(prompt, response, options = {}, responseTime = 0, error = null) {
    if (window.siteAnalytics && window.siteAnalytics.trackPrompt) {
      const context = options.context || this.inferContextFromPrompt(prompt);
      const keywords = this.extractKeywords(prompt);
      const responseQuality = response ? this.assessResponseQuality(response, prompt) : 'failed';
      
      window.siteAnalytics.trackPrompt(context, prompt, response, responseQuality, {
        keywords: keywords,
        responseTime: responseTime,
        responseLength: response ? response.length : 0,
        model: options.model || this.defaultModel,
        error: error
      });
    }
  }

  inferContextFromPrompt(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('compet') || lowerPrompt.includes('versus') || lowerPrompt.includes('vs ') || lowerPrompt.includes('alternative')) {
      return 'competitive';
    }
    if (lowerPrompt.includes('objection') || lowerPrompt.includes('concern') || lowerPrompt.includes('pushback')) {
      return 'objection';
    }
    if (lowerPrompt.includes('uipath') || lowerPrompt.includes('our company') || lowerPrompt.includes('our product')) {
      return 'company';
    }
    if (lowerPrompt.includes('discover') || lowerPrompt.includes('question') || lowerPrompt.includes('ask')) {
      return 'discovery';
    }
    
    return 'general';
  }

  extractKeywords(prompt) {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    return prompt.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 10);
  }

  assessResponseQuality(response, prompt) {
    if (!response || response.length < 50) return 'weak';
    
    const responseLength = response.length;
    const hasSpecifics = /\b(uipath|automation|rpa|enterprise|solution|process)\b/i.test(response);
    const hasStructure = response.includes('\n') || response.match(/\d+\./) || response.includes('•');
    
    if (responseLength > 300 && hasSpecifics && hasStructure) return 'strong';
    if (responseLength > 150 && (hasSpecifics || hasStructure)) return 'moderate';
    return 'weak';
  }
}

// ==================== STATE MANAGEMENT ====================

class AppState {
  constructor() {
    this.state = {
      currentIndustry: 'banking',
      adminMode: false,
      formData: {},
      notes: {}
    };
    this.subscribers = new Map();
    this.loadFromStorage();
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.saveToStorage();
    this.notifySubscribers(key, value, oldValue);
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    this.subscribers.get(key).push(callback);
  }

  notifySubscribers(key, newValue, oldValue) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => {
        try {
          callback(newValue, oldValue);
        } catch (error) {
          console.error('Subscriber callback error:', error);
        }
      });
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('uipath_sales_guide_state', JSON.stringify(this.state));
    } catch (error) {
      console.warn('Failed to save state:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('uipath_sales_guide_state');
      if (stored) {
        this.state = { ...this.state, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load state:', error);
    }
  }

  clearFormState() {
    this.state.formData = {};
    this.state.notes = {};
    this.saveToStorage();
  }
}

// ==================== MAIN APPLICATION ====================

class ProductionUiPathApp {
  constructor() {
    this.initialized = false;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing UiPath Sales Guide - Production Edition...');
      
      // Initialize services
      analyticsService.initialize();
      
      // Initialize UI
      this.initializeUI();
      this.initializeEventListeners();
      this.initializeAdmin();
      
      // Load and render data
      this.loadData();
      
      this.initialized = true;
      console.log('Application initialized successfully');
      
      // Hide loading indicators
      const loading = $('#app-loading');
      const securityWarning = $('#security-warning');
      
      if (loading) loading.style.display = 'none';
      if (securityWarning) securityWarning.style.display = 'none';
      
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh and try again.');
    }
  }

  initializeUI() {
    appState.subscribe('adminMode', (enabled) => {
      this.updateAdminModeUI(enabled);
    });

    appState.subscribe('currentIndustry', (industry) => {
      this.updateIndustryUI(industry);
    });
  }

  initializeEventListeners() {
    document.addEventListener('click', (e) => {
      // Export notes
      if (e.target.closest('.export-notes-btn')) {
        e.preventDefault();
        this.handleExportNotes();
      }
      
      // Clear all
      if (e.target.closest('.clear-all-btn')) {
        e.preventDefault();
        this.handleClearAll();
      }
      
      // Admin mode toggle
      if (e.target.closest('#admin-mode-btn') || e.target.closest('#mobile-admin-btn')) {
        e.preventDefault();
        this.handleAdminToggle();
      }
      
      // Admin panel controls
      if (e.target.closest('#show-admin-panel')) {
        e.preventDefault();
        this.showAdminPanel();
      }
      
      if (e.target.closest('#close-admin-panel')) {
        e.preventDefault();
        this.hideAdminPanel();
      }
      
      // Admin tab switching
      if (e.target.closest('.admin-tab-btn')) {
        e.preventDefault();
        const tab = e.target.closest('.admin-tab-btn').dataset.tab;
        this.switchAdminTab(tab);
      }
      
      // Admin functionality
      if (e.target.closest('#save-api-key')) {
        e.preventDefault();
        this.saveApiKey();
      }
      
      if (e.target.closest('#test-api-connection')) {
        e.preventDefault();
        this.testApiConnection();
      }
      
      if (e.target.closest('#clear-api-key')) {
        e.preventDefault();
        this.clearApiKey();
      }
      
      if (e.target.closest('#toggle-api-visibility')) {
        e.preventDefault();
        this.toggleApiKeyVisibility();
      }
      
      if (e.target.closest('#export-analytics')) {
        e.preventDefault();
        this.exportAnalytics();
      }
      
      if (e.target.closest('#clear-analytics')) {
        e.preventDefault();
        this.clearAnalytics();
      }
      
      // Industry switching
      if (e.target.closest('.industry-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.industry-btn');
        const industry = btn.dataset.industry;
        if (industry) {
          appState.set('currentIndustry', industry);
        }
      }
      
      // Mobile menu
      if (e.target.closest('#mobile-menu-btn')) {
        e.preventDefault();
        const menu = $('#mobile-menu');
        if (menu) {
          menu.classList.toggle('hidden');
        }
      }
    });
  }

  initializeAdmin() {
    const analyticsTimeFilter = $('#analytics-time-filter');
    if (analyticsTimeFilter) {
      analyticsTimeFilter.addEventListener('change', () => {
        this.updateAnalyticsDisplay();
      });
    }
  }

  loadData() {
    // Use the embedded COMPLETE_SALES_DATA
    this.renderPersonas();
    this.renderStages();
    this.updateIndustryUI(appState.get('currentIndustry'));
  }

  renderPersonas() {
    const container = $('#personas-container');
    const currentIndustry = appState.get('currentIndustry');
    const personas = COMPLETE_SALES_DATA.personas[currentIndustry] || [];
    
    if (container) {
      container.innerHTML = personas.map(persona => `
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-lg font-semibold text-gray-900">${sanitizer.escapeHtml(persona.title)}</h3>
            <span class="px-2 py-1 text-xs font-medium bg-${persona.priority === 'high' ? 'red' : persona.priority === 'medium' ? 'yellow' : 'gray'}-100 text-${persona.priority === 'high' ? 'red' : persona.priority === 'medium' ? 'yellow' : 'gray'}-800 rounded-full">
              ${persona.priority} priority
            </span>
          </div>
          
          <div class="space-y-3 text-sm">
            <div>
              <strong class="text-gray-700">Their World:</strong>
              <p class="text-gray-600 mt-1">${sanitizer.escapeHtml(persona.world)}</p>
            </div>
            
            <div>
              <strong class="text-gray-700">What They Care About:</strong>
              <p class="text-gray-600 mt-1">${sanitizer.escapeHtml(persona.cares)}</p>
            </div>
            
            <div>
              <strong class="text-gray-700">How UiPath Helps:</strong>
              <p class="text-gray-600 mt-1">${sanitizer.escapeHtml(persona.help)}</p>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex flex-wrap gap-1">
              ${persona.tags.primary.slice(0, 3).map(tag => `
                <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${tag}</span>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  renderStages() {
    COMPLETE_SALES_DATA.stages.forEach(stage => {
      this.renderStage(stage);
    });
  }

  renderStage(stage) {
    const container = $(`#stage-${stage.id} .stage-content`);
    if (container) {
      container.innerHTML = `
        <div class="space-y-6">
          <p class="text-gray-700">${sanitizer.escapeHtml(stage.description)}</p>
          
          <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Key Activities</h4>
              <ul class="space-y-2 text-sm text-gray-700">
                ${stage.keyActivities.map(activity => `
                  <li class="flex items-start">
                    <span class="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2"></span>
                    ${sanitizer.escapeHtml(activity)}
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-3">Deliverables</h4>
              <ul class="space-y-2 text-sm text-gray-700">
                ${stage.deliverables.map(deliverable => `
                  <li class="flex items-start">
                    <span class="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full mt-2 mr-2"></span>
                    ${sanitizer.escapeHtml(deliverable)}
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
          
          ${this.createQuestionsSection(stage)}
          ${this.createResourcesSection(stage)}
        </div>
      `;
    }
  }

  createQuestionsSection(stage) {
    const questions = stage.questions || {};
    return `
      <div class="bg-gray-50 rounded-lg p-4 mt-6">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-medium text-gray-900">Key Discovery Questions</h4>
          <button class="text-gray-400 hover:text-gray-600 transition-colors" onclick="this.parentElement.nextElementSibling.classList.toggle('hidden')">
            <svg class="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>
        <div class="space-y-4">
          ${Object.entries(questions).map(([category, items]) => `
            <div>
              <h5 class="font-medium text-gray-800 mb-2">${sanitizer.escapeHtml(category)}</h5>
              <ul class="space-y-2 text-sm text-gray-700">
                ${items.map(question => `
                  <li class="flex items-start">
                    <span class="flex-shrink-0 text-orange-500 mr-2">?</span>
                    ${sanitizer.escapeHtml(question)}
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  createResourcesSection(stage) {
    const resources = stage.resources || {};
    const currentIndustry = appState.get('currentIndustry');
    const industryResources = resources[currentIndustry] || [];
    
    return `
      <div class="bg-blue-50 p-4 rounded-lg">
        <h4 class="font-medium text-blue-900 mb-3">Key Resources</h4>
        <div class="grid md:grid-cols-2 gap-4">
          ${industryResources.map(resource => `
            <a href="${sanitizer.escapeHtml(resource.link)}" target="_blank" class="flex items-center p-3 bg-white rounded border hover:shadow-sm transition-shadow">
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                <span class="text-blue-600 text-xs font-medium">${resource.type.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div class="font-medium text-gray-900">${sanitizer.escapeHtml(resource.name)}</div>
                <div class="text-xs text-gray-500 capitalize">${sanitizer.escapeHtml(resource.type)}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  updateIndustryUI(industry) {
    // Update industry buttons
    $$('.industry-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm', 'bg-orange-50', 'text-orange-700', 'border-orange-200');
      btn.classList.add('text-gray-500', 'hover:text-gray-700');
      
      if (btn.dataset.industry === industry) {
        btn.classList.remove('text-gray-500', 'hover:text-gray-700');
        btn.classList.add('bg-white', 'text-gray-900', 'shadow-sm');
      }
    });
    
    // Re-render content
    this.renderPersonas();
    COMPLETE_SALES_DATA.stages.forEach(stage => {
      this.renderStage(stage);
    });
  }

  updateAdminModeUI(enabled) {
    const adminStatus = $('#admin-status');
    const adminBtn = $('#admin-mode-btn');
    const mobileAdminBtn = $('#mobile-admin-btn');
    
    if (adminStatus) {
      adminStatus.classList.toggle('hidden', !enabled);
    }
    
    [adminBtn, mobileAdminBtn].forEach(btn => {
      if (btn) {
        btn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
        btn.classList.toggle('bg-red-100', enabled);
        btn.classList.toggle('text-red-800', enabled);
        btn.classList.toggle('border-red-300', enabled);
      }
    });
    
    document.body.classList.toggle('admin-mode', enabled);
  }

  // Admin Methods
  handleAdminToggle() {
    const isAdmin = appState.get('adminMode');
    appState.set('adminMode', !isAdmin);
  }

  showAdminPanel() {
    const panel = $('#admin-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.updateAnalyticsDisplay();
    }
  }

  hideAdminPanel() {
    const panel = $('#admin-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
  }

  switchAdminTab(tab) {
    $$('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('border-blue-500', 'text-blue-600');
      btn.classList.add('border-transparent', 'text-gray-500');
    });

    const activeBtn = $(`.admin-tab-btn[data-tab="${tab}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('border-transparent', 'text-gray-500');
      activeBtn.classList.add('border-blue-500', 'text-blue-600');
    }

    $$('.admin-tab-content').forEach(content => {
      content.classList.add('hidden');
    });

    const activeTab = $(`#${tab}-tab`);
    if (activeTab) {
      activeTab.classList.remove('hidden');
      
      if (tab === 'analytics') {
        this.updateAnalyticsDisplay();
      } else if (tab === 'ai-settings') {
        this.loadApiKeyDisplay();
      }
    }
  }

  updateAnalyticsDisplay() {
    const events = analyticsService.getEvents('7d');
    const promptEvents = events.filter(e => e.type === 'prompt_submission');
    
    const totalPrompts = $('#total-prompts');
    const strongResponses = $('#strong-responses');
    const weakResponses = $('#weak-responses');

    if (totalPrompts) totalPrompts.textContent = promptEvents.length;
    
    const strong = promptEvents.filter(e => e.data.responseQuality === 'strong').length;
    const weak = promptEvents.filter(e => e.data.responseQuality === 'weak').length;
    
    if (strongResponses) strongResponses.textContent = strong;
    if (weakResponses) weakResponses.textContent = weak;

    const recentList = $('#recent-prompts-list');
    if (recentList) {
      if (promptEvents.length > 0) {
        const recent = promptEvents
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 10);

        recentList.innerHTML = recent.map(event => `
          <div class="border-l-4 border-blue-400 pl-3 py-2 bg-white rounded">
            <div class="flex justify-between items-start mb-1">
              <span class="text-xs font-medium text-gray-500">${event.data.context || 'general'}</span>
              <span class="text-xs text-gray-400">${new Date(event.timestamp).toLocaleDateString()}</span>
            </div>
            <p class="text-sm text-gray-800 line-clamp-2">${sanitizer.escapeHtml(event.data.prompt.substring(0, 100))}</p>
            <div class="mt-1">
              <span class="text-xs px-2 py-0.5 rounded ${
                event.data.responseQuality === 'strong' ? 'bg-green-100 text-green-800' :
                event.data.responseQuality === 'weak' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }">${event.data.responseQuality || 'Unknown'}</span>
            </div>
          </div>
        `).join('');
      } else {
        recentList.innerHTML = '<p class="text-sm text-gray-500">No prompts submitted yet. Try using AI features!</p>';
      }
    }
  }

  // API Management
  saveApiKey() {
    const input = $('#admin-api-key');
    if (!input || !input.value.trim()) {
      this.showApiStatus('Please enter an API key', 'error');
      return;
    }

    try {
      apiSecurity.storeApiKey(input.value.trim());
      this.showApiStatus('API key saved successfully', 'success');
      input.value = '';
    } catch (error) {
      this.showApiStatus('Failed to save API key', 'error');
    }
  }

  async testApiConnection() {
    try {
      this.showApiStatus('Testing connection...', 'info');
      
      const response = await aiService.generateResponse(
        'Respond with "Connection successful" if you receive this message.',
        { maxTokens: 50, temperature: 0.1 }
      );
      
      if (response.includes('Connection successful')) {
        this.showApiStatus('Connection successful! API key is working.', 'success');
      } else {
        this.showApiStatus('Connection test failed. Please check your API key.', 'error');
      }
    } catch (error) {
      this.showApiStatus(`Connection failed: ${error.message}`, 'error');
    }
  }

  clearApiKey() {
    if (confirm('Are you sure you want to clear the API key?')) {
      apiSecurity.clearStoredApiKey();
      this.showApiStatus('API key cleared', 'success');
    }
  }

  toggleApiKeyVisibility() {
    const input = $('#admin-api-key');
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  }

  loadApiKeyDisplay() {
    const input = $('#admin-api-key');
    const hasKey = !!apiSecurity.getStoredApiKey();
    
    if (input && hasKey) {
      input.placeholder = 'API key is configured';
    }
  }

  showApiStatus(message, type) {
    const status = $('#api-status');
    if (status) {
      status.className = `p-4 rounded-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' :
        type === 'error' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`;
      status.textContent = message;
      status.classList.remove('hidden');
      
      setTimeout(() => {
        if (type !== 'error') {
          status.classList.add('hidden');
        }
      }, 3000);
    }
  }

  exportAnalytics() {
    const data = analyticsService.exportData('json');
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uipath-sales-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Analytics data exported', 'success');
  }

  clearAnalytics() {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      analyticsService.clearData();
      this.updateAnalyticsDisplay();
      this.showNotification('Analytics data cleared', 'success');
    }
  }

  // Utility methods
  async handleExportNotes() {
    try {
      const notes = this.collectAllNotes();
      if (!notes) {
        this.showNotification('No notes to export', 'warning');
        return;
      }
      
      const success = await copyToClipboard(notes);
      
      if (success) {
        this.showNotification('Notes copied to clipboard!', 'success');
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Export failed:', error);
      this.showError('Failed to copy notes. Please try selecting and copying manually.');
    }
  }

  collectAllNotes() {
    const notes = [];
    const notesMap = appState.get('notes');
    
    COMPLETE_SALES_DATA.stages.forEach(stage => {
      const stageNotes = [];
      
      if (notesMap[`stage_${stage.id}_notes`]) {
        stageNotes.push(`Notes: ${notesMap[`stage_${stage.id}_notes`]}`);
      }
      
      if (stageNotes.length > 0) {
        notes.push(`## ${stage.title}\n${stageNotes.join('\n')}`);
      }
    });
    
    return notes.join('\n\n').trim();
  }

  handleClearAll() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      appState.clearFormState();
      $$('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      $$('.note-textarea').forEach(textarea => {
        textarea.value = '';
      });
      $$('.progress-bar').forEach(bar => {
        bar.style.width = '0%';
      });
      this.showNotification('All data cleared', 'success');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
      type === 'error' ? 'bg-red-100 text-red-800' :
      'bg-blue-100 text-blue-800'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }
}

// ==================== INITIALIZATION ====================

const sanitizer = new HTMLSanitizer();
const apiSecurity = new APISecurityManager();
const analyticsService = new AnalyticsService();
const aiService = new AIService();
const appState = new AppState();

// Initialize application
const productionApp = new ProductionUiPathApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.ProductionApp = productionApp;
  window.appState = appState;
  window.apiSecurity = apiSecurity;
  window.aiService = aiService;
  window.analyticsService = analyticsService;
  window.COMPLETE_SALES_DATA = COMPLETE_SALES_DATA;
}

console.log('🎉 UiPath Sales Guide Production Edition Loaded');
console.log('📊 Data includes:', Object.keys(COMPLETE_SALES_DATA.personas).length, 'industries,', COMPLETE_SALES_DATA.stages.length, 'stages');
console.log('🔧 Open admin panel to configure AI features');