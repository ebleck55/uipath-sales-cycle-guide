/**
 * Timeline Navigation UiPath Sales Cycle Guide
 * Modern timeline-based navigation with stage progression
 */

// ==================== SECURITY MODULE ====================
class HTMLSanitizer {
  constructor() {
    this.allowedTags = {
      basic: ['p', 'br', 'strong', 'em', 'span', 'div'],
      links: ['a'],
      lists: ['ul', 'ol', 'li']
    };
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  sanitize(html, level = 'basic') {
    if (typeof html !== 'string') return '';
    return this.escapeHtml(html);
  }

  // New method for rendering safe HTML content
  renderSafeHTML(content) {
    if (typeof content !== 'string') return '';
    
    // Allow specific safe HTML tags and escape the rest
    return content
      .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>')
      .replace(/<strong>(.*?)<\/strong>/gi, '<strong>$1</strong>')
      .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>')
      .replace(/<em>(.*?)<\/em>/gi, '<em>$1</em>')
      .replace(/&lt;br&gt;/gi, '<br>')
      .replace(/<br>/gi, '<br>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
  }
}

const sanitizer = new HTMLSanitizer();

// ==================== LOB OPTIONS DATA ====================
const LOB_OPTIONS = {
  general: [
    { value: '', label: 'All Lines of Business' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'it', label: 'Information Technology' },
    { value: 'operations', label: 'Operations' },
    { value: 'procurement', label: 'Procurement' },
    { value: 'customer-service', label: 'Customer Service' }
  ],
  banking: [
    { value: '', label: 'All Banking LOBs' },
    { value: 'consumer-banking', label: 'Consumer Banking' },
    { value: 'capital-markets', label: 'Capital Markets' },
    { value: 'commercial-banking', label: 'Commercial Banking' },
    { value: 'wealth-management', label: 'Wealth Management' },
    { value: 'operations', label: 'Operations' },
    { value: 'it-operations', label: 'IT Operations' },
    { value: 'finance-operations', label: 'Finance & Operations' }
  ],
  insurance: [
    { value: '', label: 'All Insurance LOBs' },
    { value: 'property-casualty', label: 'Property & Casualty' },
    { value: 'life-annuities', label: 'Life & Annuities' },
    { value: 'health-insurance', label: 'Health Insurance' },
    { value: 'commercial-lines', label: 'Commercial Lines' },
    { value: 'claims-processing', label: 'Claims Processing' },
    { value: 'underwriting', label: 'Underwriting' },
    { value: 'policy-administration', label: 'Policy Administration' },
    { value: 'reinsurance', label: 'Reinsurance' },
    { value: 'compliance-risk', label: 'Compliance & Risk' }
  ]
};

// ==================== COMPREHENSIVE PERSONAS DATABASE ====================
const PERSONAS_DATABASE = {
  // Banking Industry Personas
  banking: {
    'consumer-banking': [
      {
        id: 'coo-consumer-banking',
        title: 'Chief Operating Officer',
        description: 'Focused on cost-per-account reduction and digital experience transformation',
        priorities: ['Cost reduction', 'Customer satisfaction', 'Digital transformation', 'Operational efficiency'],
        painPoints: ['High cost per account', 'Manual processes', 'Customer complaints', 'Regulatory compliance'],
        interests: ['Process automation', 'Customer experience', 'Cost optimization', 'Scalability'],
        vertical: 'banking',
        lob: 'consumer-banking',
        level: 'executive'
      },
      {
        id: 'head-lending-ops',
        title: 'Head of Lending Operations',
        description: 'Driving loan origination speed and approval automation',
        priorities: ['Loan processing speed', 'Approval accuracy', 'Risk management', 'Compliance'],
        painPoints: ['Slow loan processing', 'Manual underwriting', 'Documentation errors', 'Regulatory requirements'],
        interests: ['Process automation', 'Risk assessment', 'Customer onboarding', 'Compliance automation'],
        vertical: 'banking',
        lob: 'consumer-banking',
        level: 'director'
      },
      {
        id: 'head-contact-center',
        title: 'Head of Contact Center',
        description: 'Improving customer experience and agent productivity',
        priorities: ['Customer satisfaction', 'Agent efficiency', 'Call resolution', 'Service quality'],
        painPoints: ['Long wait times', 'Repetitive inquiries', 'Agent turnover', 'Customer complaints'],
        interests: ['Customer service automation', 'Self-service options', 'Agent tools', 'Response time'],
        vertical: 'banking',
        lob: 'consumer-banking',
        level: 'director'
      }
    ],
    'capital-markets': [
      {
        id: 'head-trading-ops',
        title: 'Head of Trading Operations',
        description: 'Managing settlement risk and operational efficiency in trading operations',
        priorities: ['Settlement accuracy', 'Trade processing speed', 'Risk management', 'Compliance'],
        painPoints: ['Settlement failures', 'Manual reconciliation', 'Trade breaks', 'Regulatory reporting'],
        interests: ['Trade automation', 'Risk monitoring', 'Straight-through processing', 'Real-time reporting'],
        vertical: 'banking',
        lob: 'capital-markets',
        level: 'director'
      },
      {
        id: 'coo-capital-markets',
        title: 'COO Capital Markets',
        description: 'Focused on regulatory compliance and operational cost control',
        priorities: ['Regulatory compliance', 'Cost control', 'Operational risk', 'Process efficiency'],
        painPoints: ['Regulatory changes', 'Manual reporting', 'Operational costs', 'Risk exposure'],
        interests: ['Compliance automation', 'Process optimization', 'Risk reduction', 'Cost management'],
        vertical: 'banking',
        lob: 'capital-markets',
        level: 'executive'
      },
      {
        id: 'head-prime-services',
        title: 'Head of Prime Services',
        description: 'Managing client onboarding and servicing efficiency',
        priorities: ['Client onboarding speed', 'Service quality', 'Relationship management', 'Revenue growth'],
        painPoints: ['Slow onboarding', 'Manual processes', 'Client complaints', 'Competition'],
        interests: ['Client automation', 'Service efficiency', 'Digital transformation', 'Customer experience'],
        vertical: 'banking',
        lob: 'capital-markets',
        level: 'director'
      }
    ],
    'commercial-banking': [
      {
        id: 'head-commercial-lending',
        title: 'Head of Commercial Lending',
        description: 'Managing complex commercial loan portfolios and relationship banking',
        priorities: ['Loan portfolio quality', 'Risk assessment', 'Client relationships', 'Profitability'],
        painPoints: ['Complex underwriting', 'Manual credit analysis', 'Relationship management', 'Regulatory requirements'],
        interests: ['Credit automation', 'Risk analytics', 'Client management', 'Process efficiency'],
        vertical: 'banking',
        lob: 'commercial-banking',
        level: 'director'
      }
    ],
    'wealth-management': [
      {
        id: 'head-wealth-ops',
        title: 'Head of Wealth Operations',
        description: 'Managing client onboarding, portfolio administration, and service delivery',
        priorities: ['Client experience', 'Portfolio accuracy', 'Service quality', 'Advisor productivity'],
        painPoints: ['Complex onboarding', 'Manual reporting', 'Client expectations', 'Advisor efficiency'],
        interests: ['Client automation', 'Portfolio management', 'Advisor tools', 'Service optimization'],
        vertical: 'banking',
        lob: 'wealth-management',
        level: 'director'
      }
    ]
  },
  
  // Insurance Industry Personas
  insurance: {
    'property-casualty': [
      {
        id: 'head-pc-claims',
        title: 'Head of P&C Claims',
        description: 'Managing property and casualty claims processing and customer satisfaction',
        priorities: ['Claims processing speed', 'Fraud detection', 'Customer satisfaction', 'Cost control'],
        painPoints: ['Claim backlogs', 'Fraudulent claims', 'Manual processing', 'Customer complaints'],
        interests: ['Claims automation', 'Fraud detection', 'Process efficiency', 'Customer experience'],
        vertical: 'insurance',
        lob: 'property-casualty',
        level: 'director'
      }
    ],
    'life-annuities': [
      {
        id: 'head-life-ops',
        title: 'Head of Life Operations',
        description: 'Managing life insurance and annuity operations',
        priorities: ['Policy administration', 'Regulatory compliance', 'Customer service', 'Operational efficiency'],
        painPoints: ['Complex regulations', 'Manual processes', 'Customer inquiries', 'System integration'],
        interests: ['Policy automation', 'Compliance management', 'Customer self-service', 'Process optimization'],
        vertical: 'insurance',
        lob: 'life-annuities',
        level: 'director'
      }
    ],
    'claims-processing': [
      {
        id: 'head-claims-ops',
        title: 'Head of Claims Operations',
        description: 'Overseeing end-to-end claims processing across all lines of business',
        priorities: ['Claims accuracy', 'Processing speed', 'Cost management', 'Customer satisfaction'],
        painPoints: ['Claims complexity', 'Manual reviews', 'Adjuster productivity', 'Fraud detection'],
        interests: ['Claims automation', 'AI-powered decisions', 'Workflow optimization', 'Predictive analytics'],
        vertical: 'insurance',
        lob: 'claims-processing',
        level: 'director'
      }
    ],
    'underwriting': [
      {
        id: 'chief-underwriter',
        title: 'Chief Underwriting Officer',
        description: 'Setting underwriting standards and managing risk assessment processes',
        priorities: ['Risk assessment accuracy', 'Underwriting speed', 'Portfolio profitability', 'Competitive advantage'],
        painPoints: ['Manual underwriting', 'Risk evaluation complexity', 'Market competition', 'Regulatory changes'],
        interests: ['Automated underwriting', 'Risk analytics', 'Decision support', 'Process acceleration'],
        vertical: 'insurance',
        lob: 'underwriting',
        level: 'executive'
      }
    ]
  },
  
  // General Industry Personas
  general: {
    'finance': [
      {
        id: 'cfo-general',
        title: 'Chief Financial Officer',
        description: 'Focused on financial accuracy, reporting speed, and cost management',
        priorities: ['Financial accuracy', 'Reporting timeliness', 'Cost control', 'Audit readiness'],
        painPoints: ['Month-end delays', 'Manual reconciliation', 'Reporting errors', 'Audit preparation'],
        interests: ['Financial automation', 'Real-time reporting', 'Process efficiency', 'Cost reduction'],
        vertical: 'general',
        lob: 'finance',
        level: 'executive'
      }
    ],
    'hr': [
      {
        id: 'head-hr-ops',
        title: 'Head of HR Operations',
        description: 'Managing employee lifecycle processes and HR service delivery',
        priorities: ['Employee experience', 'Process efficiency', 'Compliance', 'Cost management'],
        painPoints: ['Manual onboarding', 'Benefits administration', 'Compliance tracking', 'Employee inquiries'],
        interests: ['HR automation', 'Employee self-service', 'Process standardization', 'Compliance management'],
        vertical: 'general',
        lob: 'hr',
        level: 'director'
      }
    ],
    'it': [
      {
        id: 'cio-general',
        title: 'Chief Information Officer',
        description: 'Balancing innovation velocity with operational stability and security',
        priorities: ['System reliability', 'Security', 'Innovation', 'Cost optimization'],
        painPoints: ['Legacy systems', 'Security threats', 'Technical debt', 'Resource constraints'],
        interests: ['IT automation', 'System modernization', 'Security enhancement', 'Operational efficiency'],
        vertical: 'general',
        lob: 'it',
        level: 'executive'
      },
      {
        id: 'cto-general',
        title: 'Chief Technology Officer',
        description: 'Driving technology strategy and innovation while managing technical architecture',
        priorities: ['Technology innovation', 'Platform scalability', 'Development efficiency', 'Technical excellence'],
        painPoints: ['Technical debt', 'Development bottlenecks', 'Innovation speed', 'System integration'],
        interests: ['Automation platforms', 'AI/ML integration', 'Development tools', 'Cloud architecture'],
        vertical: 'general',
        lob: 'it',
        level: 'executive'
      },
      {
        id: 'it-director-general',
        title: 'IT Director',
        description: 'Managing IT operations and overseeing technology implementation initiatives',
        priorities: ['System uptime', 'Process efficiency', 'Team productivity', 'Cost management'],
        painPoints: ['Manual IT processes', 'System maintenance', 'Resource allocation', 'Service requests'],
        interests: ['IT process automation', 'System monitoring', 'Workflow optimization', 'Service management'],
        vertical: 'general',
        lob: 'it',
        level: 'director'
      },
      {
        id: 'ai-director-general',
        title: 'Director of AI/Data Science',
        description: 'Leading artificial intelligence and data science initiatives across the organization',
        priorities: ['AI implementation', 'Data strategy', 'Model deployment', 'Business impact'],
        painPoints: ['Data quality', 'Model deployment', 'AI adoption', 'Technical complexity'],
        interests: ['AI platforms', 'Intelligent automation', 'ML pipelines', 'Data integration'],
        vertical: 'general',
        lob: 'it',
        level: 'director'
      },
      {
        id: 'digital-transformation-director',
        title: 'Director of Digital Transformation',
        description: 'Orchestrating digital transformation initiatives and process modernization',
        priorities: ['Digital initiatives', 'Process transformation', 'Technology adoption', 'Change management'],
        painPoints: ['Legacy processes', 'Digital adoption', 'Change resistance', 'ROI measurement'],
        interests: ['Process automation', 'Digital tools', 'Workflow transformation', 'Innovation platforms'],
        vertical: 'general',
        lob: 'it',
        level: 'director'
      }
    ]
  }
};

// ==================== COMPREHENSIVE RESOURCES DATABASE ====================
const RESOURCES_DATABASE = {
  // Banking Industry Resources
  banking: {
    'consumer-banking': [
      {
        id: 'consumer-banking-roi-calculator',
        name: 'Consumer Banking ROI Calculator',
        type: 'calculator',
        overview: 'Calculate ROI for consumer banking automation initiatives including account opening, loan processing, and customer service.',
        why: 'Quantify the business impact of automating high-volume consumer banking processes.',
        link: '#consumer-banking-roi',
        relevance: ['cost-reduction', 'process-efficiency', 'customer-experience'],
        deploymentContext: {
          'automation-cloud': 'Includes cloud scaling benefits for high-volume processing',
          'on-prem': 'Focuses on data security and compliance for sensitive financial data'
        }
      },
      {
        id: 'loan-automation-playbook',
        name: 'Loan Origination Automation Playbook',
        type: 'playbook',
        overview: 'Step-by-step guide for automating loan application processing, underwriting workflows, and compliance checks.',
        why: 'Reduce loan processing time from days to hours while ensuring regulatory compliance.',
        link: '#loan-automation',
        relevance: ['process-automation', 'compliance', 'risk-management'],
        customerContext: {
          'existing': 'Advanced strategies for expanding automation to complex loan products',
          'new-logo': 'Foundational approach starting with standard loan types'
        }
      },
      {
        id: 'customer-onboarding-template',
        name: 'Digital Customer Onboarding Templates',
        type: 'template',
        overview: 'Pre-built automation templates for KYC, account setup, and welcome workflows.',
        why: 'Accelerate customer onboarding while improving data accuracy and compliance.',
        link: '#onboarding-templates',
        relevance: ['customer-experience', 'compliance', 'efficiency']
      }
    ],
    'capital-markets': [
      {
        id: 'trade-settlement-automation',
        name: 'Trade Settlement Automation Guide',
        type: 'guide',
        overview: 'Comprehensive automation strategies for trade settlement, reconciliation, and exception handling.',
        why: 'Minimize settlement risk and reduce manual intervention in trade processing.',
        link: '#trade-settlement',
        relevance: ['risk-reduction', 'operational-efficiency', 'compliance'],
        deploymentContext: {
          'automation-cloud': 'Real-time processing capabilities with cloud infrastructure',
          'automation-suite': 'Hybrid deployment for sensitive trading data'
        }
      },
      {
        id: 'regulatory-reporting-accelerator',
        name: 'Regulatory Reporting Accelerator',
        type: 'accelerator',
        overview: 'Pre-configured automation for regulatory reports including CFTC, SEC, and Basel III requirements.',
        why: 'Ensure timely and accurate regulatory submissions while reducing compliance costs.',
        link: '#regulatory-reporting',
        relevance: ['compliance', 'reporting', 'risk-management']
      },
      {
        id: 'client-onboarding-capital-markets',
        name: 'Institutional Client Onboarding Kit',
        type: 'kit',
        overview: 'Automated workflows for prime brokerage and institutional client setup including documentation and approvals.',
        why: 'Accelerate revenue generation through faster client onboarding.',
        link: '#institutional-onboarding',
        relevance: ['client-service', 'revenue-growth', 'efficiency']
      }
    ],
    'commercial-banking': [
      {
        id: 'commercial-credit-automation',
        name: 'Commercial Credit Assessment Automation',
        type: 'solution',
        overview: 'AI-powered credit analysis and risk assessment for commercial lending portfolios.',
        why: 'Improve credit decision speed and accuracy while maintaining risk discipline.',
        link: '#commercial-credit',
        relevance: ['risk-assessment', 'decision-speed', 'portfolio-quality']
      }
    ],
    'wealth-management': [
      {
        id: 'portfolio-rebalancing-automation',
        name: 'Portfolio Rebalancing Automation',
        type: 'solution',
        overview: 'Automated portfolio rebalancing based on client objectives and market conditions.',
        why: 'Improve client outcomes through timely portfolio adjustments.',
        link: '#portfolio-automation',
        relevance: ['client-outcomes', 'advisor-productivity', 'efficiency']
      }
    ]
  },

  // Insurance Industry Resources  
  insurance: {
    'property-casualty': [
      {
        id: 'claims-processing-accelerator',
        name: 'P&C Claims Processing Accelerator',
        type: 'accelerator',
        overview: 'End-to-end claims automation including intake, assessment, approval, and payment processing.',
        why: 'Reduce claims processing time and improve customer satisfaction.',
        link: '#claims-accelerator',
        relevance: ['customer-satisfaction', 'processing-speed', 'cost-reduction']
      },
      {
        id: 'fraud-detection-ai',
        name: 'AI-Powered Fraud Detection Suite',
        type: 'ai-solution',
        overview: 'Machine learning models for identifying suspicious claims and preventing fraud.',
        why: 'Protect against fraudulent claims while maintaining legitimate claim processing speed.',
        link: '#fraud-detection',
        relevance: ['fraud-prevention', 'cost-protection', 'risk-management']
      }
    ],
    'life-annuities': [
      {
        id: 'policy-administration-automation',
        name: 'Life Insurance Policy Administration Automation',
        type: 'platform',
        overview: 'Comprehensive automation for policy issuance, changes, claims, and beneficiary management.',
        why: 'Reduce administrative costs and improve policy holder experience.',
        link: '#policy-admin',
        relevance: ['cost-reduction', 'customer-experience', 'efficiency']
      }
    ],
    'claims-processing': [
      {
        id: 'intelligent-claims-triage',
        name: 'Intelligent Claims Triage System',
        type: 'ai-solution',
        overview: 'AI-powered system for automatically routing claims to appropriate handlers based on complexity and type.',
        why: 'Optimize resource allocation and reduce processing time for routine claims.',
        link: '#claims-triage',
        relevance: ['resource-optimization', 'processing-efficiency', 'cost-management']
      },
      {
        id: 'claims-investigation-toolkit',
        name: 'Claims Investigation Automation Toolkit',
        type: 'toolkit',
        overview: 'Automated investigation workflows including data gathering, verification, and documentation.',
        why: 'Improve investigation thoroughness while reducing time to resolution.',
        link: '#investigation-toolkit',
        relevance: ['investigation-quality', 'time-reduction', 'compliance']
      }
    ],
    'underwriting': [
      {
        id: 'automated-underwriting-engine',
        name: 'Automated Underwriting Engine',
        type: 'platform',
        overview: 'AI-driven underwriting decisions for standard policies with straight-through processing capability.',
        why: 'Accelerate policy issuance while maintaining risk quality standards.',
        link: '#underwriting-engine',
        relevance: ['decision-speed', 'risk-accuracy', 'straight-through-processing']
      },
      {
        id: 'risk-assessment-models',
        name: 'Advanced Risk Assessment Models',
        type: 'ai-models',
        overview: 'Predictive models for assessing risk across different insurance product lines.',
        why: 'Improve underwriting accuracy and competitive positioning.',
        link: '#risk-models',
        relevance: ['risk-precision', 'competitive-advantage', 'profitability']
      }
    ]
  },

  // General Industry Resources
  general: {
    'finance': [
      {
        id: 'month-end-close-automation',
        name: 'Month-End Close Automation Suite',
        type: 'suite',
        overview: 'Complete automation of financial close processes including reconciliations, journal entries, and reporting.',
        why: 'Reduce close time from weeks to days while improving accuracy.',
        link: '#month-end-close',
        relevance: ['time-reduction', 'accuracy', 'audit-readiness']
      },
      {
        id: 'ap-automation-platform',
        name: 'Accounts Payable Automation Platform',
        type: 'platform',
        overview: 'Invoice processing, approval workflows, and payment automation with vendor integration.',
        why: 'Eliminate manual invoice processing and reduce payment errors.',
        link: '#ap-automation',
        relevance: ['process-elimination', 'error-reduction', 'vendor-relations']
      },
      {
        id: 'financial-reporting-accelerator',
        name: 'Financial Reporting Accelerator',
        type: 'accelerator',
        overview: 'Automated report generation for management, regulatory, and stakeholder reporting.',
        why: 'Ensure timely and consistent financial reporting across all stakeholders.',
        link: '#financial-reporting',
        relevance: ['reporting-timeliness', 'consistency', 'stakeholder-satisfaction']
      }
    ],
    'hr': [
      {
        id: 'employee-onboarding-automation',
        name: 'Employee Onboarding Automation',
        type: 'workflow',
        overview: 'End-to-end employee onboarding including documentation, system setup, and orientation scheduling.',
        why: 'Provide consistent onboarding experience while reducing HR administrative burden.',
        link: '#hr-onboarding',
        relevance: ['employee-experience', 'consistency', 'hr-efficiency']
      },
      {
        id: 'benefits-administration-suite',
        name: 'Benefits Administration Automation Suite',
        type: 'suite',
        overview: 'Automated benefits enrollment, changes, and COBRA processing.',
        why: 'Reduce benefits administration complexity and improve employee self-service.',
        link: '#benefits-admin',
        relevance: ['administrative-efficiency', 'employee-self-service', 'compliance']
      }
    ],
    'it': [
      {
        id: 'it-service-management-automation',
        name: 'IT Service Management Automation',
        type: 'platform',
        overview: 'Automated ticket routing, resolution, and user provisioning across IT systems.',
        why: 'Improve IT service delivery while reducing response times.',
        link: '#itsm-automation',
        relevance: ['service-delivery', 'response-time', 'user-satisfaction']
      },
      {
        id: 'security-compliance-automation',
        name: 'Security Compliance Automation',
        type: 'security-suite',
        overview: 'Automated security monitoring, compliance reporting, and incident response workflows.',
        why: 'Maintain security posture while reducing manual compliance overhead.',
        link: '#security-compliance',
        relevance: ['security-posture', 'compliance-automation', 'incident-response']
      }
    ]
  }
};

// ==================== COMPREHENSIVE USE CASES DATABASE ====================
const USE_CASES_DATABASE = {
  // Banking Industry Use Cases
  banking: {
    'consumer-banking': [
      {
        id: 'consumer-account-opening',
        name: 'Account Opening Automation',
        category: 'RPA',
        description: 'Automated customer data entry, document processing, and account setup workflows',
        businessValue: 'Reduce account opening time from 2 days to 2 hours while improving accuracy',
        complexity: 'Medium',
        timeToValue: '4-6 weeks',
        processes: ['Customer data entry', 'Document verification', 'System provisioning', 'Welcome communications'],
        page: 10,
        vertical: 'banking',
        lob: 'consumer-banking'
      },
      {
        id: 'consumer-loan-processing',
        name: 'Loan Application Processing',
        category: 'IDP + Agentic',
        description: 'AI-powered document extraction, credit analysis, and automated decision workflows',
        businessValue: 'Accelerate loan approvals by 70% while maintaining risk standards',
        complexity: 'High',
        timeToValue: '8-12 weeks',
        processes: ['Application intake', 'Document extraction', 'Credit scoring', 'Underwriting decisions'],
        page: 15,
        vertical: 'banking',
        lob: 'consumer-banking'
      },
      {
        id: 'consumer-customer-service',
        name: 'Customer Service Automation',
        category: 'Agentic',
        description: 'Intelligent ticket routing, automated responses, and escalation management',
        businessValue: 'Handle 60% more inquiries with same staff while improving satisfaction',
        complexity: 'Medium',
        timeToValue: '6-8 weeks',
        processes: ['Inquiry classification', 'Automated responses', 'Escalation routing', 'Follow-up tracking'],
        page: 20,
        vertical: 'banking',
        lob: 'consumer-banking'
      }
    ],
    'capital-markets': [
      {
        id: 'capital-trade-settlement',
        name: 'Trade Settlement Automation',
        category: 'RPA + Agentic',
        description: 'Automated trade matching, settlement processing, and exception handling',
        businessValue: 'Reduce settlement failures by 80% and processing time by 60%',
        complexity: 'High',
        timeToValue: '10-14 weeks',
        processes: ['Trade matching', 'Settlement processing', 'Exception handling', 'Reconciliation'],
        page: 30,
        vertical: 'banking',
        lob: 'capital-markets'
      },
      {
        id: 'capital-regulatory-reporting',
        name: 'Regulatory Reporting Automation',
        category: 'RPA + IDP',
        description: 'Automated data collection, validation, and regulatory report generation',
        businessValue: 'Ensure 100% timely submissions while reducing manual effort by 90%',
        complexity: 'High',
        timeToValue: '8-12 weeks',
        processes: ['Data aggregation', 'Validation checks', 'Report generation', 'Submission tracking'],
        page: 35,
        vertical: 'banking',
        lob: 'capital-markets'
      },
      {
        id: 'capital-client-onboarding',
        name: 'Institutional Client Onboarding',
        category: 'Maestro',
        description: 'End-to-end client setup including KYC, documentation, and account activation',
        businessValue: 'Reduce onboarding time from 4 weeks to 3 days while improving compliance',
        complexity: 'High',
        timeToValue: '12-16 weeks',
        processes: ['KYC verification', 'Documentation review', 'Account setup', 'Service activation'],
        page: 40,
        vertical: 'banking',
        lob: 'capital-markets'
      }
    ],
    'commercial-banking': [
      {
        id: 'commercial-credit-analysis',
        name: 'Commercial Credit Assessment',
        category: 'Agentic + IDP',
        description: 'AI-powered financial analysis, risk assessment, and credit decision support',
        businessValue: 'Improve decision speed by 50% while maintaining portfolio quality',
        complexity: 'High',
        timeToValue: '10-14 weeks',
        processes: ['Financial analysis', 'Risk scoring', 'Decision support', 'Documentation'],
        page: 25,
        vertical: 'banking',
        lob: 'commercial-banking'
      }
    ],
    'wealth-management': [
      {
        id: 'wealth-portfolio-rebalancing',
        name: 'Portfolio Rebalancing Automation',
        category: 'Agentic',
        description: 'Automated portfolio analysis, rebalancing recommendations, and execution',
        businessValue: 'Increase advisor productivity by 40% while improving client outcomes',
        complexity: 'High',
        timeToValue: '8-12 weeks',
        processes: ['Portfolio analysis', 'Rebalancing logic', 'Client approval', 'Trade execution'],
        page: 45,
        vertical: 'banking',
        lob: 'wealth-management'
      }
    ]
  },

  // Insurance Industry Use Cases
  insurance: {
    'property-casualty': [
      {
        id: 'pc-claims-processing',
        name: 'Property & Casualty Claims Processing',
        category: 'IDP + Agentic',
        description: 'Automated claims intake, damage assessment, and settlement processing',
        businessValue: 'Reduce claim processing time by 65% while improving customer satisfaction',
        complexity: 'High',
        timeToValue: '8-12 weeks',
        processes: ['Claims intake', 'Damage assessment', 'Coverage verification', 'Settlement processing'],
        page: 50,
        vertical: 'insurance',
        lob: 'property-casualty'
      },
      {
        id: 'pc-fraud-detection',
        name: 'Fraud Detection Automation',
        category: 'Agentic',
        description: 'AI-powered fraud pattern recognition and investigation workflow automation',
        businessValue: 'Detect 95% of fraudulent claims while reducing false positives by 40%',
        complexity: 'High',
        timeToValue: '10-14 weeks',
        processes: ['Pattern analysis', 'Risk scoring', 'Investigation triggers', 'Escalation workflows'],
        page: 52,
        vertical: 'insurance',
        lob: 'property-casualty'
      }
    ],
    'life-annuities': [
      {
        id: 'life-policy-administration',
        name: 'Life Insurance Policy Administration',
        category: 'RPA + IDP',
        description: 'Automated policy changes, beneficiary updates, and claims processing',
        businessValue: 'Reduce administrative costs by 50% while improving policy holder experience',
        complexity: 'Medium',
        timeToValue: '6-10 weeks',
        processes: ['Policy updates', 'Beneficiary management', 'Premium processing', 'Claims handling'],
        page: 54,
        vertical: 'insurance',
        lob: 'life-annuities'
      }
    ],
    'claims-processing': [
      {
        id: 'claims-intelligent-triage',
        name: 'Intelligent Claims Triage',
        category: 'Agentic',
        description: 'AI-powered claim complexity assessment and automated routing to appropriate handlers',
        businessValue: 'Optimize resource allocation and reduce processing time by 45%',
        complexity: 'Medium',
        timeToValue: '6-8 weeks',
        processes: ['Complexity assessment', 'Handler matching', 'Workload balancing', 'Priority routing'],
        page: 56,
        vertical: 'insurance',
        lob: 'claims-processing'
      },
      {
        id: 'claims-investigation',
        name: 'Claims Investigation Automation',
        category: 'RPA + Agentic',
        description: 'Automated evidence gathering, verification workflows, and investigation documentation',
        businessValue: 'Improve investigation thoroughness while reducing time by 60%',
        complexity: 'High',
        timeToValue: '8-12 weeks',
        processes: ['Evidence collection', 'Verification checks', 'Documentation', 'Decision support'],
        page: 58,
        vertical: 'insurance',
        lob: 'claims-processing'
      }
    ],
    'underwriting': [
      {
        id: 'underwriting-automation',
        name: 'Automated Underwriting Engine',
        category: 'Agentic + IDP',
        description: 'AI-driven risk assessment and automated underwriting decisions',
        businessValue: 'Increase underwriting capacity by 70% while maintaining quality standards',
        complexity: 'High',
        timeToValue: '10-16 weeks',
        processes: ['Risk assessment', 'Policy pricing', 'Decision logic', 'Quality controls'],
        page: 60,
        vertical: 'insurance',
        lob: 'underwriting'
      },
      {
        id: 'underwriting-risk-models',
        name: 'Advanced Risk Modeling',
        category: 'Agentic',
        description: 'Predictive models for risk assessment across different insurance product lines',
        businessValue: 'Improve risk accuracy by 35% while reducing manual reviews by 80%',
        complexity: 'High',
        timeToValue: '12-18 weeks',
        processes: ['Data modeling', 'Risk scoring', 'Predictive analytics', 'Model validation'],
        page: 62,
        vertical: 'insurance',
        lob: 'underwriting'
      }
    ]
  },

  // General Industry Use Cases
  general: {
    'finance': [
      {
        id: 'finance-month-end-close',
        name: 'Month-End Close Automation',
        category: 'RPA + Maestro',
        description: 'End-to-end financial close process automation including reconciliations and reporting',
        businessValue: 'Reduce close time from 10 days to 3 days while improving accuracy',
        complexity: 'High',
        timeToValue: '8-12 weeks',
        processes: ['Data reconciliation', 'Journal entries', 'Report generation', 'Approval workflows'],
        page: 70,
        vertical: 'general',
        lob: 'finance'
      },
      {
        id: 'finance-accounts-payable',
        name: 'Accounts Payable Automation',
        category: 'IDP + RPA',
        description: 'Invoice processing, approval routing, and payment automation',
        businessValue: 'Process 90% of invoices without manual intervention while reducing errors',
        complexity: 'Medium',
        timeToValue: '4-8 weeks',
        processes: ['Invoice extraction', 'Approval routing', 'Payment processing', 'Vendor management'],
        page: 72,
        vertical: 'general',
        lob: 'finance'
      }
    ],
    'hr': [
      {
        id: 'hr-employee-onboarding',
        name: 'Employee Onboarding Automation',
        category: 'RPA + Maestro',
        description: 'Complete new hire process from offer acceptance to first day setup',
        businessValue: 'Reduce onboarding time by 60% while ensuring consistent experience',
        complexity: 'Medium',
        timeToValue: '6-10 weeks',
        processes: ['Documentation collection', 'System provisioning', 'Training scheduling', 'Equipment setup'],
        page: 74,
        vertical: 'general',
        lob: 'hr'
      }
    ],
    'it': [
      {
        id: 'it-service-management',
        name: 'IT Service Management Automation',
        category: 'RPA + Agentic',
        description: 'Automated ticket routing, resolution, and user provisioning workflows',
        businessValue: 'Improve IT service delivery while reducing response times by 50%',
        complexity: 'Medium',
        timeToValue: '6-8 weeks',
        processes: ['Ticket classification', 'Automated resolution', 'User provisioning', 'Service requests'],
        page: 76,
        vertical: 'general',
        lob: 'it'
      }
    ]
  }
};

// ==================== USE CASE FILTERING AND STORAGE SYSTEM ====================
class UseCaseManager {
  constructor() {
    this.selectedUseCases = new Set();
    this.filteredUseCases = [];
    this.useCaseStorage = this.initializeStorage();
  }

  initializeStorage() {
    const saved = localStorage.getItem('uipath-selected-use-cases');
    return saved ? JSON.parse(saved) : {};
  }

  saveSelectedUseCases() {
    localStorage.setItem('uipath-selected-use-cases', JSON.stringify(this.useCaseStorage));
  }

  getFilteredUseCases(vertical = '', lob = '', customerType = '', deployment = '') {
    console.log('UseCaseManager: Filtering use cases with criteria:', {
      vertical, lob, customerType, deployment
    });

    let allUseCases = [];

    // Determine which vertical database to use
    if (vertical && USE_CASES_DATABASE[vertical]) {
      // If specific vertical is selected
      if (lob && USE_CASES_DATABASE[vertical][lob]) {
        // Specific LOB within vertical
        allUseCases = [...USE_CASES_DATABASE[vertical][lob]];
      } else {
        // All LOBs within vertical
        Object.values(USE_CASES_DATABASE[vertical]).forEach(lobUseCases => {
          if (Array.isArray(lobUseCases)) {
            allUseCases.push(...lobUseCases);
          }
        });
      }
    } else if (lob) {
      // No vertical specified but LOB is selected - search across all verticals
      Object.values(USE_CASES_DATABASE).forEach(verticalData => {
        if (verticalData[lob] && Array.isArray(verticalData[lob])) {
          allUseCases.push(...verticalData[lob]);
        }
      });
    } else {
      // No specific criteria - show general use cases as default
      if (USE_CASES_DATABASE.general) {
        Object.values(USE_CASES_DATABASE.general).forEach(lobUseCases => {
          if (Array.isArray(lobUseCases)) {
            allUseCases.push(...lobUseCases);
          }
        });
      }
    }

    // Additional context-based filtering can be added here
    // For now, we'll focus on the primary vertical/LOB filtering

    this.filteredUseCases = allUseCases;
    console.log(`UseCaseManager: Found ${allUseCases.length} filtered use cases`);
    
    return allUseCases;
  }

  toggleUseCaseSelection(useCaseId) {
    if (this.selectedUseCases.has(useCaseId)) {
      this.selectedUseCases.delete(useCaseId);
      delete this.useCaseStorage[useCaseId];
    } else {
      this.selectedUseCases.add(useCaseId);
      const useCase = this.findUseCaseById(useCaseId);
      if (useCase) {
        this.useCaseStorage[useCaseId] = {
          id: useCase.id,
          name: useCase.name,
          category: useCase.category,
          selectedAt: new Date().toISOString()
        };
      }
    }
    this.saveSelectedUseCases();
    this.renderUseCaseCards();
  }

  findUseCaseById(useCaseId) {
    for (const verticalData of Object.values(USE_CASES_DATABASE)) {
      for (const lobUseCases of Object.values(verticalData)) {
        if (Array.isArray(lobUseCases)) {
          const useCase = lobUseCases.find(uc => uc.id === useCaseId);
          if (useCase) return useCase;
        }
      }
    }
    return null;
  }

  renderUseCaseCards() {
    const container = document.getElementById('use-cases-container');
    if (!container) {
      console.log('UseCaseManager: Use cases container not found');
      return;
    }

    if (this.filteredUseCases.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Select customer criteria to see relevant use cases...</p>';
      return;
    }

    const useCaseCards = this.filteredUseCases.map(useCase => {
      const isSelected = this.selectedUseCases.has(useCase.id);
      
      return `
        <div class="use-case-card bg-white p-6 rounded-lg border hover:border-orange-300 transition-colors ${isSelected ? 'ring-2 ring-orange-500 border-orange-500' : 'border-gray-200'}">
          <div class="flex justify-between items-start mb-3">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">${useCase.name}</h3>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                  ${useCase.category}
                </span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  ${useCase.complexity}
                </span>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                  ${useCase.timeToValue}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                class="use-case-select-btn px-3 py-1 text-xs font-medium rounded transition-colors ${isSelected ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                data-use-case-id="${useCase.id}">
                ${isSelected ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </div>
          
          <p class="text-gray-600 text-sm mb-4">${useCase.description}</p>
          
          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Business Value:</h4>
            <p class="text-green-700 text-sm font-medium">${useCase.businessValue}</p>
          </div>

          <div class="mb-4">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Key Processes:</h4>
            <div class="flex flex-wrap gap-1">
              ${useCase.processes.map(process => 
                `<span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${process}</span>`
              ).join('')}
            </div>
          </div>

          ${useCase.page ? `
          <div class="border-t pt-4">
            <button class="lob-use-case-link w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded hover:from-orange-600 hover:to-red-600 transition-all" 
                    data-page="${useCase.page}">
              📊 View Detailed Slide (Page ${useCase.page})
            </button>
          </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = useCaseCards;

    // Add event listeners for selection buttons
    container.addEventListener('click', (e) => {
      if (e.target.matches('.use-case-select-btn')) {
        const useCaseId = e.target.dataset.useCaseId;
        this.toggleUseCaseSelection(useCaseId);
      }
    });
  }

  getSelectedUseCases() {
    return Array.from(this.selectedUseCases).map(id => {
      const useCase = this.findUseCaseById(id);
      return useCase ? {
        ...useCase,
        ...(this.useCaseStorage[id] || {})
      } : null;
    }).filter(Boolean);
  }

  clearSelections() {
    this.selectedUseCases.clear();
    this.useCaseStorage = {};
    this.saveSelectedUseCases();
    this.renderUseCaseCards();
  }

  loadStoredSelections() {
    Object.keys(this.useCaseStorage).forEach(useCaseId => {
      this.selectedUseCases.add(useCaseId);
    });
  }
}

// ==================== PERSONA FILTERING AND STORAGE SYSTEM ====================
class PersonaManager {
  constructor() {
    this.selectedPersonas = new Set();
    this.filteredPersonas = [];
    this.personaStorage = this.initializeStorage();
  }

  initializeStorage() {
    const saved = localStorage.getItem('uipath-selected-personas');
    return saved ? JSON.parse(saved) : {};
  }

  saveSelectedPersonas() {
    localStorage.setItem('uipath-selected-personas', JSON.stringify(this.personaStorage));
  }

  getFilteredPersonas(context) {
    // Determine the key for personas lookup
    let personas = [];
    
    // If specific LOB is selected, get LOB-specific personas
    if (context.lob && context.vertical) {
      const verticalPersonas = PERSONAS_DATABASE[context.vertical];
      if (verticalPersonas && verticalPersonas[context.lob]) {
        personas = verticalPersonas[context.lob];
      }
    }
    // If only vertical is selected, get all personas from that vertical
    else if (context.vertical) {
      const verticalPersonas = PERSONAS_DATABASE[context.vertical];
      if (verticalPersonas) {
        personas = Object.values(verticalPersonas).flat();
      }
    }
    // If no vertical is selected, get general personas based on LOB
    else if (context.lob) {
      const generalPersonas = PERSONAS_DATABASE.general;
      if (generalPersonas && generalPersonas[context.lob]) {
        personas = generalPersonas[context.lob];
      }
    }
    // Default fallback - show general executive personas
    else {
      personas = [
        {
          id: 'generic-executive',
          title: 'Business Executive',
          description: 'Focused on operational efficiency and business transformation',
          priorities: ['Cost reduction', 'Process efficiency', 'Customer satisfaction', 'Digital transformation'],
          painPoints: ['Manual processes', 'Operational costs', 'Resource constraints', 'Competitive pressure'],
          interests: ['Process automation', 'Cost optimization', 'Innovation', 'Scalability'],
          vertical: 'general',
          lob: 'general',
          level: 'executive'
        }
      ];
    }

    // Always include IT and AI leadership personas since we sell software
    const itPersonas = PERSONAS_DATABASE.general.it || [];
    const relevantITPersonas = itPersonas.filter(persona => 
      // Include all IT/AI leadership personas as they're always relevant for software sales
      persona.level === 'executive' || 
      persona.level === 'director' ||
      persona.title.includes('AI') || 
      persona.title.includes('Digital Transformation') ||
      persona.title.includes('Technology') ||
      persona.title.includes('Information')
    );

    // Add IT personas to the main list, avoiding duplicates
    const existingIds = new Set(personas.map(p => p.id));
    relevantITPersonas.forEach(itPersona => {
      if (!existingIds.has(itPersona.id)) {
        personas.push(itPersona);
      }
    });

    // Add context-specific filtering based on customer type and deployment
    return this.applyAdditionalFilters(personas, context);
  }

  applyAdditionalFilters(personas, context) {
    let filtered = [...personas];
    
    // Add deployment-specific considerations
    if (context.deployment) {
      filtered = filtered.map(persona => ({
        ...persona,
        deploymentContext: this.getDeploymentContext(context.deployment),
        customerTypeContext: this.getCustomerTypeContext(context.customerType)
      }));
    }

    return filtered;
  }

  getDeploymentContext(deployment) {
    const contexts = {
      'on-prem': 'Focused on on-premises infrastructure and security requirements',
      'automation-suite': 'Interested in hybrid cloud deployment and platform consolidation',
      'automation-cloud': 'Prioritizing cloud-first strategy and scalability'
    };
    return contexts[deployment] || '';
  }

  getCustomerTypeContext(customerType) {
    const contexts = {
      'new-logo': 'Evaluating automation platforms for first-time implementation',
      'existing': 'Looking to expand or optimize current automation investments'
    };
    return contexts[customerType] || '';
  }

  renderPersonaCards(personas, containerId = 'personas-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!personas || personas.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No personas found for the selected criteria. Please select a vertical and/or line of business to see relevant decision makers.</p>';
      return;
    }

    const personasHTML = personas.map((persona, index) => `
      <div class="persona-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div class="collapsible-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-section="persona-card">
          <div class="flex justify-between items-center">
            <div class="flex items-center flex-1">
              <svg class="chevron-icon w-4 h-4 mr-2 text-blue-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-lg font-semibold text-blue-700">
                ${persona.title}
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-4 pb-4">
          <div class="space-y-4 pt-4 border-t border-gray-100">
            <!-- Persona Level Badge -->
            ${persona.level ? `
            <div class="flex items-center space-x-2 mb-3">
              <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                ${persona.level.charAt(0).toUpperCase() + persona.level.slice(1)} Level
              </span>
              ${persona.vertical && persona.lob ? `
              <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                ${persona.vertical} - ${persona.lob}
              </span>
              ` : ''}
            </div>
            ` : ''}
            
            <!-- Who They Are -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Who They Are
              </h4>
              <p class="text-sm text-blue-700 leading-relaxed mb-3">${persona.description}</p>
              <div class="space-y-2">
                <div>
                  <span class="text-xs font-medium text-blue-600">Key Responsibilities:</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    ${persona.priorities.slice(0, 3).map(priority => 
                      `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${priority}</span>`
                    ).join('')}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- What They Care About -->
            <div class="bg-green-50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-green-800 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                What They Care About
              </h4>
              <div class="space-y-3">
                <div>
                  <span class="text-xs font-medium text-green-700">Top Priorities:</span>
                  <ul class="mt-1 space-y-1">
                    ${persona.priorities.map(priority => 
                      `<li class="text-sm text-green-700 flex items-start">
                         <span class="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                         ${priority}
                       </li>`
                    ).join('')}
                  </ul>
                </div>
                <div>
                  <span class="text-xs font-medium text-red-700">Pain Points:</span>
                  <ul class="mt-1 space-y-1">
                    ${persona.painPoints.map(pain => 
                      `<li class="text-sm text-red-700 flex items-start">
                         <span class="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                         ${pain}
                       </li>`
                    ).join('')}
                  </ul>
                </div>
              </div>
            </div>
            
            <!-- How UiPath Can Help Them -->
            <div class="bg-orange-50 rounded-lg p-4">
              <h4 class="text-sm font-semibold text-orange-800 mb-3 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                How UiPath Can Help Them
              </h4>
              <div class="space-y-3">
                <div>
                  <span class="text-xs font-medium text-orange-700">Value Drivers:</span>
                  <ul class="mt-1 space-y-1">
                    ${persona.interests.map(interest => 
                      `<li class="text-sm text-orange-700 flex items-start">
                         <span class="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                         ${interest}
                       </li>`
                    ).join('')}
                  </ul>
                </div>
                <div class="bg-orange-100 rounded-md p-3 mt-3">
                  <span class="text-xs font-medium text-orange-800">UiPath Impact:</span>
                  <p class="text-sm text-orange-800 mt-1 leading-relaxed">
                    ${this.generateUiPathValue(persona)}
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Context-specific information -->
            ${persona.deploymentContext ? `
            <div class="bg-orange-50 rounded-lg p-3">
              <h4 class="text-sm font-semibold text-orange-800 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                Deployment Context
              </h4>
              <p class="text-sm text-orange-700">${persona.deploymentContext}</p>
            </div>
            ` : ''}
            
            ${persona.customerTypeContext ? `
            <div class="bg-indigo-50 rounded-lg p-3">
              <h4 class="text-sm font-semibold text-indigo-800 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20a3 3 0 01-3-3v-2a3 3 0 01-3-3V9a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3v2a3 3 0 01-3 3z"/>
                </svg>
                Customer Context
              </h4>
              <p class="text-sm text-indigo-700">${persona.customerTypeContext}</p>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = personasHTML;

    // Add event listeners for collapsible functionality
    this.attachCollapsibleEventListeners(container);
  }

  generateUiPathValue(persona) {
    // Generate context-aware UiPath value proposition based on persona data
    const roleType = persona.title.toLowerCase();
    const topPainPoint = persona.painPoints[0]?.toLowerCase() || '';
    const topInterest = persona.interests[0]?.toLowerCase() || '';
    
    if (roleType.includes('cto') || roleType.includes('cio') || roleType.includes('chief technology')) {
      return 'UiPath provides enterprise-grade automation platform with AI-powered capabilities to transform your technology landscape. Our solution offers centralized governance, scalable architecture, and comprehensive security to drive digital transformation initiatives while reducing technical debt and operational complexity.';
    }
    
    if (roleType.includes('cfo') || roleType.includes('finance')) {
      return 'UiPath delivers measurable ROI through process automation that reduces operational costs, eliminates errors, and accelerates financial processes. Our platform provides clear audit trails, compliance controls, and detailed analytics to optimize financial operations while ensuring regulatory adherence.';
    }
    
    if (roleType.includes('operations') || roleType.includes('ops')) {
      return 'UiPath streamlines operations by automating repetitive tasks, reducing processing times, and improving accuracy. Our intelligent automation handles high-volume transactions, integrates with existing systems, and scales with your business needs to drive operational excellence.';
    }
    
    if (roleType.includes('customer') || roleType.includes('contact center')) {
      return 'UiPath enhances customer experience by automating customer service processes, reducing response times, and providing agents with intelligent assistance. Our platform enables 24/7 service availability, consistent service quality, and personalized customer interactions.';
    }
    
    if (roleType.includes('risk') || roleType.includes('compliance')) {
      return 'UiPath strengthens risk management and compliance through automated monitoring, standardized processes, and comprehensive audit trails. Our platform ensures consistent policy enforcement, reduces human error, and provides real-time visibility into compliance status.';
    }
    
    if (roleType.includes('trading') || roleType.includes('capital markets')) {
      return 'UiPath accelerates trading operations with straight-through processing, automated reconciliation, and real-time risk monitoring. Our platform reduces settlement failures, ensures regulatory compliance, and enables faster response to market opportunities.';
    }
    
    if (roleType.includes('claims') || roleType.includes('underwriting')) {
      return 'UiPath transforms insurance operations through intelligent claims processing, automated underwriting, and fraud detection. Our platform accelerates claim resolution, improves accuracy, and enhances customer satisfaction while reducing operational costs.';
    }
    
    // Generic value proposition based on interests and pain points
    let value = 'UiPath automates your most time-consuming processes, ';
    
    if (topPainPoint.includes('manual') || topPainPoint.includes('slow')) {
      value += 'eliminating manual work and accelerating processing times. ';
    } else if (topPainPoint.includes('cost') || topPainPoint.includes('efficiency')) {
      value += 'reducing operational costs and improving efficiency. ';
    } else if (topPainPoint.includes('error') || topPainPoint.includes('accuracy')) {
      value += 'improving accuracy and reducing errors. ';
    } else {
      value += 'driving operational excellence. ';
    }
    
    if (topInterest.includes('automation')) {
      value += 'Our intelligent automation platform integrates with your existing systems to deliver measurable business outcomes.';
    } else if (topInterest.includes('digital transformation')) {
      value += 'Our platform accelerates your digital transformation journey with enterprise-ready automation capabilities.';
    } else {
      value += 'Our comprehensive automation solution scales with your business needs and delivers rapid ROI.';
    }
    
    return value;
  }

  attachCollapsibleEventListeners(container) {
    // Handle collapsible functionality
    const headers = container.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.chevron-icon');
        
        if (content.classList.contains('hidden')) {
          content.classList.remove('hidden');
          chevron.style.transform = 'rotate(90deg)';
        } else {
          content.classList.add('hidden');
          chevron.style.transform = 'rotate(0deg)';
        }
      });
    });
  }

  attachPersonaEventListeners() {
    // Handle persona selection
    document.addEventListener('click', (e) => {
      if (e.target.matches('.persona-select-btn')) {
        e.preventDefault();
        const personaId = e.target.dataset.personaId;
        this.togglePersonaSelection(personaId);
      }
      
      if (e.target.matches('#clear-personas-btn')) {
        e.preventDefault();
        this.clearAllPersonas();
      }
    });
  }

  togglePersonaSelection(personaId) {
    const button = document.querySelector(`[data-persona-id="${personaId}"].persona-select-btn`);
    
    if (this.selectedPersonas.has(personaId)) {
      this.selectedPersonas.delete(personaId);
      button.textContent = 'Select';
      button.classList.remove('bg-blue-600', 'text-white');
      button.classList.add('border-gray-300', 'hover:bg-gray-50');
    } else {
      this.selectedPersonas.add(personaId);
      button.textContent = 'Selected';
      button.classList.add('bg-blue-600', 'text-white');
      button.classList.remove('border-gray-300', 'hover:bg-gray-50');
    }

    // Store selection
    this.storePersonaSelection(personaId);
    
    // Update selected count display
    this.updateSelectedDisplay();
  }

  clearAllPersonas() {
    this.selectedPersonas.clear();
    document.querySelectorAll('.persona-select-btn').forEach(btn => {
      btn.textContent = 'Select';
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('border-gray-300', 'hover:bg-gray-50');
    });
    
    // Clear storage
    this.personaStorage = {};
    this.saveSelectedPersonas();
    
    // Update display
    this.updateSelectedDisplay();
  }

  storePersonaSelection(personaId) {
    const context = window.customerInfoManager ? window.customerInfoManager.getSelectionContext() : {};
    const storageKey = `${context.vertical || 'general'}-${context.lob || 'all'}`;
    
    if (!this.personaStorage[storageKey]) {
      this.personaStorage[storageKey] = [];
    }
    
    if (this.selectedPersonas.has(personaId)) {
      if (!this.personaStorage[storageKey].includes(personaId)) {
        this.personaStorage[storageKey].push(personaId);
      }
    } else {
      this.personaStorage[storageKey] = this.personaStorage[storageKey].filter(id => id !== personaId);
    }
    
    this.saveSelectedPersonas();
  }

  loadStoredSelections(context) {
    const storageKey = `${context.vertical || 'general'}-${context.lob || 'all'}`;
    const stored = this.personaStorage[storageKey] || [];
    
    this.selectedPersonas.clear();
    stored.forEach(personaId => this.selectedPersonas.add(personaId));
  }

  updateSelectedDisplay() {
    const container = document.getElementById('personas-container');
    if (container) {
      const countElement = container.querySelector('.flex.justify-between .text-gray-600');
      if (countElement && this.selectedPersonas.size > 0) {
        countElement.textContent = `${this.selectedPersonas.size} selected`;
      }
    }
  }

  getSelectedPersonasData() {
    const allPersonas = Object.values(PERSONAS_DATABASE).flatMap(vertical => 
      Object.values(vertical).flat()
    );
    
    return Array.from(this.selectedPersonas).map(id => 
      allPersonas.find(persona => persona.id === id)
    ).filter(Boolean);
  }
}

// ==================== RESOURCE FILTERING AND STORAGE SYSTEM ====================
class ResourceManager {
  constructor() {
    this.selectedResources = new Set();
    this.filteredResources = [];
    this.resourceStorage = this.initializeStorage();
  }

  initializeStorage() {
    const saved = localStorage.getItem('uipath-selected-resources');
    return saved ? JSON.parse(saved) : {};
  }

  saveSelectedResources() {
    localStorage.setItem('uipath-selected-resources', JSON.stringify(this.resourceStorage));
  }

  getFilteredResources(context) {
    let resources = [];
    
    // Start with exact matches first (highest priority)
    if (context.lob && context.vertical) {
      const verticalResources = RESOURCES_DATABASE[context.vertical];
      if (verticalResources && verticalResources[context.lob]) {
        resources.push(...verticalResources[context.lob]);
      }
    }
    
    // Add all resources from the selected vertical (if any)
    if (context.vertical && RESOURCES_DATABASE[context.vertical]) {
      const verticalResources = RESOURCES_DATABASE[context.vertical];
      const allVerticalResources = Object.values(verticalResources).flat();
      // Add resources that aren't already included
      allVerticalResources.forEach(resource => {
        if (!resources.some(r => r.id === resource.id)) {
          resources.push(resource);
        }
      });
    }
    
    // Add general resources based on LOB (if selected)
    if (context.lob && RESOURCES_DATABASE.general && RESOURCES_DATABASE.general[context.lob]) {
      const generalLOBResources = RESOURCES_DATABASE.general[context.lob];
      generalLOBResources.forEach(resource => {
        if (!resources.some(r => r.id === resource.id)) {
          resources.push(resource);
        }
      });
    }
    
    // If we still don't have many resources, add more general resources
    if (resources.length < 3) {
      // Add finance resources as they're generally applicable
      if (RESOURCES_DATABASE.general.finance) {
        RESOURCES_DATABASE.general.finance.forEach(resource => {
          if (!resources.some(r => r.id === resource.id)) {
            resources.push(resource);
          }
        });
      }
      
      // Add IT resources as they're broadly relevant
      if (RESOURCES_DATABASE.general.it) {
        RESOURCES_DATABASE.general.it.forEach(resource => {
          if (!resources.some(r => r.id === resource.id)) {
            resources.push(resource);
          }
        });
      }
      
      // Add HR resources for comprehensive coverage
      if (RESOURCES_DATABASE.general.hr) {
        RESOURCES_DATABASE.general.hr.forEach(resource => {
          if (!resources.some(r => r.id === resource.id)) {
            resources.push(resource);
          }
        });
      }
    }
    
    // If still no resources, add default resources
    if (resources.length === 0) {
      resources = [
        {
          id: 'generic-automation-guide',
          name: 'Business Process Automation Guide',
          type: 'guide',
          overview: 'Comprehensive guide to identifying and automating business processes across any industry.',
          why: 'Start your automation journey with proven methodologies and best practices.',
          link: '#automation-guide',
          relevance: ['process-identification', 'automation-strategy', 'best-practices'],
          vertical: 'general',
          lob: 'general'
        },
        {
          id: 'roi-calculator-generic',
          name: 'Automation ROI Calculator',
          type: 'calculator',
          overview: 'Calculate the return on investment for your automation initiatives across different business processes.',
          why: 'Quantify the business value and build a compelling business case for automation.',
          link: '#roi-calculator',
          relevance: ['business-case', 'roi-analysis', 'value-measurement'],
          vertical: 'general',
          lob: 'general'
        },
        {
          id: 'implementation-playbook',
          name: 'Automation Implementation Playbook',
          type: 'playbook',
          overview: 'Step-by-step guidance for planning and executing successful automation projects.',
          why: 'Ensure successful automation implementation with proven methodologies and best practices.',
          link: '#implementation-playbook',
          relevance: ['implementation-strategy', 'project-management', 'success-factors'],
          vertical: 'general',
          lob: 'general'
        }
      ];
    }

    // Apply context-specific enrichment and return
    return this.applyAdditionalFilters(resources, context);
  }

  applyAdditionalFilters(resources, context) {
    let filtered = [...resources];
    
    // Add deployment-specific context
    if (context.deployment) {
      filtered = filtered.map(resource => {
        const enrichedResource = { ...resource };
        
        if (resource.deploymentContext && resource.deploymentContext[context.deployment]) {
          enrichedResource.deploymentNote = resource.deploymentContext[context.deployment];
        }
        
        if (resource.customerContext && resource.customerContext[context.customerType]) {
          enrichedResource.customerNote = resource.customerContext[context.customerType];
        }
        
        return enrichedResource;
      });
    }

    return filtered;
  }

  renderResourceCards(resources, containerId = 'resources-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!resources || resources.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">No resources found for the selected criteria. Please select a vertical and/or line of business to see relevant resources.</p>';
      return;
    }

    const resourcesHTML = resources.map(resource => `
      <div class="resource-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div class="collapsible-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-section="resource-card">
          <div class="flex justify-between items-center">
            <div class="flex items-center flex-1">
              <svg class="chevron-icon w-4 h-4 mr-2 text-green-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-lg font-semibold text-green-700">${sanitizer.escapeHtml(resource.name)}</h3>
            </div>
            <span class="text-sm text-gray-600">${resource.type}</span>
          </div>
        </div>
        <div class="collapsible-content hidden px-4 pb-4">
          <div class="space-y-2 pt-2 border-t border-gray-100">
            <div class="relative">
              <h4 class="text-sm font-medium text-gray-700 mb-1">Overview:</h4>
              <p class="text-xs text-gray-600 leading-relaxed">${sanitizer.escapeHtml(resource.overview)}</p>
            </div>
            <div class="relative">
              <h4 class="text-sm font-medium text-gray-700 mb-1">Why This Matters:</h4>
              <p class="text-xs text-orange-700 leading-relaxed">${sanitizer.escapeHtml(resource.why)}</p>
            </div>
            <div class="relative">
              <h4 class="text-sm font-medium text-gray-700 mb-1">Relevance:</h4>
              <p class="text-xs text-gray-600 leading-relaxed">${resource.relevance.join(', ')}</p>
            </div>
            <div class="pt-2">
              <a href="${resource.link}" class="w-full inline-block px-3 py-1 bg-green-600 text-white text-xs text-center rounded hover:bg-green-700 transition-colors" target="_blank">
                View Resource
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = resourcesHTML;

    // Add event listeners for collapsible functionality
    this.attachCollapsibleEventListeners(container);
  }

  attachCollapsibleEventListeners(container) {
    // Handle collapsible functionality
    const headers = container.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const content = header.nextElementSibling;
        const chevron = header.querySelector('.chevron-icon');
        
        if (content.classList.contains('hidden')) {
          content.classList.remove('hidden');
          chevron.style.transform = 'rotate(90deg)';
        } else {
          content.classList.add('hidden');
          chevron.style.transform = 'rotate(0deg)';
        }
      });
    });
  }

  renderStageResources(resources, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!resources || resources.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">No resources found for the selected customer criteria.</p>';
      return;
    }

    const resourcesHTML = resources.map(resource => `
      <div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-3">
          <h4 class="font-semibold text-gray-800 flex items-center">
            <a href="${sanitizer.escapeHtml(resource.link)}" 
               class="text-blue-600 hover:underline hover:text-blue-800 transition-colors" 
               target="_blank" rel="noopener noreferrer">
              ${sanitizer.renderSafeHTML(resource.name)}
            </a>
          </h4>
        </div>
        
        <div class="space-y-3">
          <div>
            <h5 class="text-sm font-medium text-green-700 mb-1">Overview:</h5>
            <p class="text-sm text-gray-600 leading-relaxed">
              ${sanitizer.renderSafeHTML(resource.overview || 'No overview provided.')}
            </p>
          </div>
          
          <div>
            <h5 class="text-sm font-medium text-green-700 mb-1">Why it matters:</h5>
            <p class="text-sm text-gray-600 leading-relaxed">
              ${sanitizer.renderSafeHTML(resource.why || 'Reason not specified.')}
            </p>
          </div>
          
          ${resource.relevance && resource.relevance.length > 0 ? `
          <div>
            <h5 class="text-sm font-medium text-green-700 mb-1">Relevance:</h5>
            <p class="text-sm text-gray-600 leading-relaxed">
              ${resource.relevance.join(', ')}
            </p>
          </div>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.innerHTML = resourcesHTML;
  }

  attachResourceEventListeners() {
    // Handle resource selection
    document.addEventListener('click', (e) => {
      if (e.target.matches('.resource-select-btn')) {
        e.preventDefault();
        const resourceId = e.target.dataset.resourceId;
        this.toggleResourceSelection(resourceId);
      }
      
      if (e.target.matches('#clear-resources-btn')) {
        e.preventDefault();
        this.clearAllResources();
      }
    });
  }

  toggleResourceSelection(resourceId) {
    const button = document.querySelector(`[data-resource-id="${resourceId}"].resource-select-btn`);
    
    if (this.selectedResources.has(resourceId)) {
      this.selectedResources.delete(resourceId);
      button.textContent = 'Select';
      button.classList.remove('bg-blue-600', 'text-white');
      button.classList.add('border-gray-300', 'hover:bg-gray-50');
    } else {
      this.selectedResources.add(resourceId);
      button.textContent = 'Selected';
      button.classList.add('bg-blue-600', 'text-white');
      button.classList.remove('border-gray-300', 'hover:bg-gray-50');
    }

    // Store selection
    this.storeResourceSelection(resourceId);
    
    // Update selected count display
    this.updateSelectedDisplay();
  }

  clearAllResources() {
    this.selectedResources.clear();
    document.querySelectorAll('.resource-select-btn').forEach(btn => {
      btn.textContent = 'Select';
      btn.classList.remove('bg-blue-600', 'text-white');
      btn.classList.add('border-gray-300', 'hover:bg-gray-50');
    });
    
    // Clear storage
    this.resourceStorage = {};
    this.saveSelectedResources();
    
    // Update display
    this.updateSelectedDisplay();
  }

  storeResourceSelection(resourceId) {
    const context = window.customerInfoManager ? window.customerInfoManager.getSelectionContext() : {};
    const storageKey = `${context.vertical || 'general'}-${context.lob || 'all'}`;
    
    if (!this.resourceStorage[storageKey]) {
      this.resourceStorage[storageKey] = [];
    }
    
    if (this.selectedResources.has(resourceId)) {
      if (!this.resourceStorage[storageKey].includes(resourceId)) {
        this.resourceStorage[storageKey].push(resourceId);
      }
    } else {
      this.resourceStorage[storageKey] = this.resourceStorage[storageKey].filter(id => id !== resourceId);
    }
    
    this.saveSelectedResources();
  }

  loadStoredSelections(context) {
    const storageKey = `${context.vertical || 'general'}-${context.lob || 'all'}`;
    const stored = this.resourceStorage[storageKey] || [];
    
    this.selectedResources.clear();
    stored.forEach(resourceId => this.selectedResources.add(resourceId));
  }

  updateSelectedDisplay() {
    const container = document.getElementById('resources-container');
    if (container) {
      const countElement = container.querySelector('.flex.justify-between .text-gray-600');
      if (countElement && this.selectedResources.size > 0) {
        countElement.textContent = `${this.selectedResources.size} selected`;
      }
    }
  }

  getSelectedResourcesData() {
    const allResources = Object.values(RESOURCES_DATABASE).flatMap(vertical => 
      Object.values(vertical).flat()
    );
    
    return Array.from(this.selectedResources).map(id => 
      allResources.find(resource => resource.id === id)
    ).filter(Boolean);
  }
}

// ==================== CUSTOMER INFO MANAGEMENT ====================
class CustomerInfoManager {
  constructor() {
    this.selectedVertical = '';
    this.selectedLOB = '';
    this.selectedProjectTypes = new Set();
    this.selectedCustomerType = '';
    this.selectedDeployment = '';
    this.personaManager = new PersonaManager();
    this.resourceManager = new ResourceManager();
    this.useCaseManager = new UseCaseManager();
    this.initializeEventListeners();
    this.initializeLOBSelector();
    this.initializePersonasDisplay();
    this.initializeResourcesDisplay();
    this.initializeUseCasesDisplay();
  }

  initializeLOBSelector() {
    // Initialize with general LOB options when no vertical is selected
    this.updateLOBSelector('');
  }

  initializePersonasDisplay() {
    // Initial personas display with generic personas
    this.updatePersonasDisplay();
  }

  initializeResourcesDisplay() {
    // Initial resources display with generic resources
    this.updateResourcesDisplay();
  }

  initializeUseCasesDisplay() {
    // Initial use cases display with generic use cases
    this.updateUseCasesDisplay();
  }

  initializeEventListeners() {
    // Vertical selector buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.industry-btn')) {
        this.handleVerticalSelection(e.target);
      }
      if (e.target.matches('.customer-type-btn')) {
        this.handleCustomerTypeSelection(e.target);
      }
      if (e.target.matches('.project-type-btn')) {
        this.handleProjectTypeSelection(e.target);
      }
    });

    // LOB selector
    const lobSelector = document.getElementById('lob-selector');
    if (lobSelector) {
      lobSelector.addEventListener('change', (e) => {
        this.selectedLOB = e.target.value;
        // Update personas, resources, and use cases display when LOB changes
        this.updatePersonasDisplay();
        this.updateResourcesDisplay();
        this.updateUseCasesDisplay();
      });
    }

    // Deployment selector
    const deploymentSelector = document.getElementById('deployment-type');
    if (deploymentSelector) {
      deploymentSelector.addEventListener('change', (e) => {
        this.selectedDeployment = e.target.value;
        // Update personas, resources, and use cases display when deployment changes
        this.updatePersonasDisplay();
        this.updateResourcesDisplay();
        this.updateUseCasesDisplay();
      });
    }

    // Update Content button
    const updateBtn = document.getElementById('update-content-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        this.updateAllContent();
      });
    }
  }

  handleVerticalSelection(button) {
    const vertical = button.dataset.industry;
    
    // Update button states
    document.querySelectorAll('.industry-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    this.selectedVertical = vertical;
    
    // Update LOB selector based on selected vertical
    this.updateLOBSelector(vertical);
    
    // Reset LOB selection when vertical changes
    this.selectedLOB = '';
    
    // Update personas, resources, and use cases display based on new context
    this.updatePersonasDisplay();
    this.updateResourcesDisplay();
    this.updateUseCasesDisplay();
  }

  updateLOBSelector(vertical) {
    const lobSelector = document.getElementById('lob-selector');
    const mobileLobSelector = document.getElementById('mobile-lob-selector');
    
    const selectors = [lobSelector, mobileLobSelector].filter(selector => selector);
    if (selectors.length === 0) return;

    // Determine which LOB options to show
    let options = LOB_OPTIONS.general; // Default to general
    if (vertical === 'banking') {
      options = LOB_OPTIONS.banking;
    } else if (vertical === 'insurance') {
      options = LOB_OPTIONS.insurance;
    }
    
    // Update all selectors
    selectors.forEach(selector => {
      // Clear existing options
      selector.innerHTML = '';
      
      // Add options to selector
      options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        selector.appendChild(optionElement);
      });
      
      // Enable the selector
      selector.disabled = false;
    });
  }

  handleCustomerTypeSelection(button) {
    const type = button.dataset.type;
    
    // Update button states
    document.querySelectorAll('.customer-type-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    button.classList.add('selected');
    
    this.selectedCustomerType = type;
    this.toggleDeploymentSelector(type);
    
    // Update personas and resources display when customer type changes
    this.updatePersonasDisplay();
    this.updateResourcesDisplay();
  }

  toggleDeploymentSelector(customerType) {
    const deploymentContainer = document.getElementById('deployment-container');
    if (!deploymentContainer) return;

    if (customerType) {
      deploymentContainer.classList.remove('hidden');
    } else {
      deploymentContainer.classList.add('hidden');
    }
  }

  handleProjectTypeSelection(button) {
    const type = button.dataset.type;
    
    if (this.selectedProjectTypes.has(type)) {
      // Deselect
      this.selectedProjectTypes.delete(type);
      button.classList.remove('selected');
    } else {
      // Select
      this.selectedProjectTypes.add(type);
      button.classList.add('selected');
    }
  }

  updateAllContent() {
    // Show loading state
    const updateBtn = document.getElementById('update-content-btn');
    const originalText = updateBtn.textContent;
    updateBtn.textContent = 'Updating...';
    updateBtn.disabled = true;

    // Simulate content update (replace with actual update logic)
    setTimeout(() => {
      this.performContentUpdate();
      
      // Reset button
      updateBtn.textContent = originalText;
      updateBtn.disabled = false;
      
      // Show success feedback
      this.showUpdateFeedback();
    }, 1000);
  }

  performContentUpdate() {
    const context = this.getSelectionContext();
    
    // Update personas based on context (old method for stage personas)
    this.updatePersonas(context);
    
    // Update main personas display (new method for Decision Makers section)
    this.updatePersonasDisplay();
    
    // Update resources display (new method for Key Resources section)
    this.updateResourcesDisplay();
    
    // Update discovery questions
    this.updateDiscoveryQuestions(context);
    
    // Update objections
    this.updateObjections(context);
    
    // Update LOB use cases
    this.updateLOBUseCases(context);
    
    console.log('Content updated with context:', context);
  }

  updatePersonasDisplay() {
    const context = this.getSelectionContext();
    
    // Load stored selections for this context
    this.personaManager.loadStoredSelections(context);
    
    // Get filtered personas based on current context
    const filteredPersonas = this.personaManager.getFilteredPersonas(context);
    
    // Render the personas in the main Decision Makers section
    this.personaManager.renderPersonaCards(filteredPersonas, 'personas-container');
    
    console.log('Personas updated for context:', context, 'Found personas:', filteredPersonas.length);
  }

  updateResourcesDisplay() {
    const context = this.getSelectionContext();
    
    // Load stored selections for this context
    this.resourceManager.loadStoredSelections(context);
    
    // Get filtered resources based on current context
    const filteredResources = this.resourceManager.getFilteredResources(context);
    
    // Render the resources in all stage Key Resources sections
    const currentStage = appState.get('currentStage') || 0;
    this.resourceManager.renderStageResources(filteredResources, `stage-resources-container-${currentStage}`);
    
    console.log('Resources updated for context:', context, 'Found resources:', filteredResources.length);
  }

  updateUseCasesDisplay() {
    const context = this.getSelectionContext();
    
    // Load stored selections for this context
    this.useCaseManager.loadStoredSelections();
    
    // Get filtered use cases based on current context
    const filteredUseCases = this.useCaseManager.getFilteredUseCases(
      context.vertical, 
      context.lob, 
      context.customerType, 
      context.deployment
    );
    
    // Render the use cases
    this.useCaseManager.renderUseCaseCards();
    
    console.log('Use cases updated for context:', context, 'Found use cases:', filteredUseCases.length);
  }

  getSelectionContext() {
    return {
      vertical: this.selectedVertical,
      lob: this.selectedLOB,
      projectTypes: Array.from(this.selectedProjectTypes),
      customerType: this.selectedCustomerType,
      deployment: this.selectedDeployment
    };
  }

  updatePersonas(context) {
    // Update personas based on customer selections
    const personaSelectors = document.querySelectorAll('[data-stage-id] .editable-content');
    personaSelectors.forEach(personaContainer => {
      if (personaContainer.parentElement.id && personaContainer.parentElement.id.includes('-personas')) {
        const updatedPersonas = this.getContextualPersonas(context);
        personaContainer.innerHTML = this.createPersonaHTML(updatedPersonas);
      }
    });
    
    // Update UiPath team based on context
    const teamSelectors = document.querySelectorAll('[data-stage-id] .editable-content');
    teamSelectors.forEach(teamContainer => {
      if (teamContainer.parentElement.id && teamContainer.parentElement.id.includes('-team')) {
        const updatedTeam = this.getContextualTeam(context);
        teamContainer.innerHTML = this.createTeamHTML(updatedTeam);
      }
    });
  }

  updateDiscoveryQuestions(context) {
    // Add cloud migration questions for on-prem/hub deployments
    if (['on-prem', 'automation-suite'].includes(context.deployment)) {
      this.addCloudMigrationQuestions(context);
    }
    
    // Add contract review questions for existing customers
    if (context.customerType === 'existing') {
      this.addContractReviewQuestions(context);
    }
  }

  updateObjections(context) {
    // Add deployment-specific objections
    const objectionContainers = document.querySelectorAll('.objection-item, .objection-container');
    if (['on-prem', 'automation-suite'].includes(context.deployment)) {
      this.addCloudMigrationObjections(objectionContainers, context);
    }
  }

  updateLOBUseCases(context) {
    // Update LOB use cases based on vertical, LOB, and project types
    const useCaseSection = document.getElementById('use-cases-section');
    if (useCaseSection) {
      const updatedUseCases = this.getContextualUseCases(context);
      this.updateUseCaseContent(useCaseSection, updatedUseCases);
    }
    
    // Update Key Resources section
    this.updateKeyResources(context);
  }

  updateKeyResources(context) {
    // Update resources sections across all stages
    const resourceSections = document.querySelectorAll('.resources-section, [id$="-resources"]');
    resourceSections.forEach(section => {
      const updatedResources = this.getContextualResources(context);
      this.updateResourceContent(section, updatedResources);
    });
  }

  updateResourceContent(resourceSection, resources) {
    const contentContainer = resourceSection.querySelector('.editable-content');
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="space-y-4">
          ${resources.map(resource => `
            <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h4 class="font-semibold text-gray-800 mb-2">${resource.name}</h4>
              <p class="text-sm text-gray-600 mb-2">${resource.overview}</p>
              <p class="text-xs text-orange-700 font-medium">${resource.why}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  getContextualPersonas(context) {
    // Return personas based on LOB and customer context
    const personas = {
      'consumer-banking': [
        '<strong>Chief Operating Officer:</strong> Focused on cost-per-account reduction and digital experience.',
        '<strong>Head of Lending Operations:</strong> Driving loan origination speed and approval automation.',
        '<strong>Head of Contact Center:</strong> Improving customer experience and agent productivity.'
      ],
      'capital-markets': [
        '<strong>Head of Trading Operations:</strong> Managing settlement risk and operational efficiency.',
        '<strong>COO Capital Markets:</strong> Focused on regulatory compliance and cost control.',
        '<strong>Head of Prime Services:</strong> Managing client onboarding and servicing efficiency.'
      ],
      'operations': [
        '<strong>Chief Operating Officer:</strong> Accountable for operational KPIs and efficiency metrics.',
        '<strong>Head of Process Excellence:</strong> Driving operational risk reduction and automation.',
        '<strong>VP Operations:</strong> Managing day-to-day operational performance.'
      ],
      'it-operations': [
        '<strong>CIO/CTO:</strong> Balancing innovation velocity with operational stability.',
        '<strong>Head of IT Operations:</strong> Managing incident response and system reliability.',
        '<strong>Director of Infrastructure:</strong> Focused on technical debt and platform modernization.'
      ],
      'finance-operations': [
        '<strong>CFO:</strong> Focused on month-end close timing and financial accuracy.',
        '<strong>Controller:</strong> Managing financial controls and audit readiness.',
        '<strong>Head of Financial Planning:</strong> Driving cost allocation and profitability analysis.'
      ]
    };
    
    return personas[context.lob] || [
      '<strong>Business Stakeholder:</strong> Operational efficiency and customer experience focus.',
      '<strong>IT Stakeholder:</strong> Integration and governance requirements.'
    ];
  }

  getContextualTeam(context) {
    let team = [
      '<strong>Sales:</strong> Lead business case development and stakeholder alignment',
      '<strong>Sales Engineer:</strong> Technical validation and solution demonstrations'
    ];
    
    // Add specific roles based on deployment and customer type
    if (['on-prem', 'automation-suite'].includes(context.deployment)) {
      team.push('<strong>Cloud Solutions Architect:</strong> Cloud migration planning and value positioning');
    }
    
    if (context.customerType === 'existing') {
      team.push('<strong>Customer Success Manager:</strong> Contract optimization and expansion planning');
      team.push('<strong>Legal/Procurement:</strong> Contract review and terms evaluation');
    }
    
    return team;
  }

  addCloudMigrationQuestions(context) {
    // Add cloud migration questions to discovery stages
    const discoveryStage = document.querySelector('[data-stage-id="discovery"]');
    if (discoveryStage) {
      const cloudQuestions = this.createCloudMigrationQuestionsHTML();
      this.insertAdditionalQuestions(discoveryStage, cloudQuestions, 'Cloud Migration Strategy');
    }
  }

  addContractReviewQuestions(context) {
    // Add contract review questions for technical and business qualification
    const technicalStage = document.querySelector('[data-stage-id="technical-qualification"]');
    const businessStage = document.querySelector('[data-stage-id="business-qualification"]');
    
    if (technicalStage) {
      const contractQuestions = this.createContractReviewQuestionsHTML();
      this.insertAdditionalQuestions(technicalStage, contractQuestions, 'Contract & Legal Review');
    }
  }

  createCloudMigrationQuestionsHTML() {
    return `
      <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 class="font-semibold text-blue-800 mb-2">🌤️ Cloud Migration Questions</h4>
        <ul class="space-y-2 text-sm">
          <li>• What are your organization's current policies regarding cloud adoption?</li>
          <li>• What security or compliance concerns do you have about moving to cloud?</li>
          <li>• How do you evaluate the TCO of cloud vs on-premise solutions?</li>
          <li>• What would need to happen for your organization to consider cloud deployment?</li>
        </ul>
      </div>
    `;
  }

  createContractReviewQuestionsHTML() {
    return `
      <div class="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 class="font-semibold text-purple-800 mb-2">📋 Contract Review Questions</h4>
        <ul class="space-y-2 text-sm">
          <li>• When does your current UiPath contract expire?</li>
          <li>• What are your current licensing terms and usage patterns?</li>
          <li>• Are there any contractual restrictions we should be aware of?</li>
          <li>• Who needs to be involved in contract modifications or expansions?</li>
        </ul>
      </div>
    `;
  }

  insertAdditionalQuestions(stageElement, questionsHTML, title) {
    const questionsContainer = stageElement.querySelector('.questions-container, .editable-content');
    if (questionsContainer) {
      questionsContainer.insertAdjacentHTML('beforeend', questionsHTML);
    }
  }

  createPersonaHTML(personas) {
    return `<ul class="list-disc list-inside space-y-3 text-gray-700 ml-4">
      ${personas.map(persona => `<li class="leading-relaxed">${persona}</li>`).join('')}
    </ul>`;
  }

  createTeamHTML(team) {
    return `<ul class="list-disc list-inside space-y-3 text-gray-700 ml-4">
      ${team.map(member => `<li class="leading-relaxed">${member}</li>`).join('')}
    </ul>`;
  }

  getContextualResources(context) {
    // Return resources based on vertical, deployment, and customer type
    let resources = [];
    
    // Add base resources from SALES_CYCLE_DATA
    if (SALES_CYCLE_DATA && SALES_CYCLE_DATA.stages) {
      const discoveryStage = SALES_CYCLE_DATA.stages.find(stage => stage.id === 'discovery');
      if (discoveryStage && discoveryStage.resources && discoveryStage.resources[context.vertical]) {
        resources = [...discoveryStage.resources[context.vertical]];
      }
    }
    
    // Add cloud migration resources for on-prem/hub deployments
    if (['on-prem', 'automation-suite'].includes(context.deployment)) {
      resources = resources.filter(resource => 
        resource.name.includes('Cloud Migration') || 
        resource.name.includes('Cloud Security') || 
        resource.name.includes('TCO Calculator')
      );
    }
    
    // Add existing customer resources
    if (context.customerType === 'existing') {
      resources.push({
        name: 'Contract Optimization Guide',
        link: '#',
        overview: 'Best practices for expanding UiPath usage and optimizing existing contract terms.',
        why: 'Maximize value from current investment while planning expansion.'
      });
    }
    
    return resources;
  }

  getContextualUseCases(context) {
    // Return use cases based on LOB, project types, and deployment - Enhanced with Maestro-specific examples
    const useCases = {
      'consumer-banking': {
        'rpa': [
          'Account opening data entry and validation',
          'Credit card application processing',
          'Customer service ticket routing',
          'Loan payment processing automation'
        ],
        'idp': [
          'Loan application document extraction',
          'KYC identity document verification',
          'Bank statement analysis and categorization',
          'Insurance document processing for lending'
        ],
        'agentic': [
          'Intelligent loan underwriting with credit scoring',
          'Fraud detection and alert triage',
          'Customer inquiry intelligent routing',
          'Collection strategy optimization'
        ],
        'maestro': [
          'End-to-end mortgage origination (application to closing)',
          'Complete customer onboarding journey orchestration',
          'Cross-channel dispute resolution workflow',
          'Personal banking relationship management automation'
        ]
      },
      'capital-markets': {
        'rpa': [
          'Trade settlement confirmation automation',
          'Client reporting generation',
          'Regulatory trade reporting',
          'Market data reconciliation'
        ],
        'idp': [
          'Client onboarding document extraction',
          'Trade confirmation document processing',
          'Compliance documentation management',
          'Research report data extraction'
        ],
        'agentic': [
          'Trade exception investigation and resolution',
          'Client portfolio analysis and recommendations',
          'Risk assessment and monitoring',
          'Compliance alert triage and escalation'
        ],
        'maestro': [
          'End-to-end client onboarding (KYC to account activation)',
          'Complete trade lifecycle management',
          'Prime brokerage service orchestration',
          'Multi-asset portfolio management workflows'
        ]
      },
      'operations': {
        'rpa': [
          'Invoice processing and approval routing',
          'Employee onboarding data entry',
          'Vendor management workflows',
          'Financial reconciliation automation'
        ],
        'idp': [
          'Contract extraction and analysis',
          'HR document processing',
          'Expense report data capture',
          'Procurement document management'
        ],
        'agentic': [
          'Intelligent process exception handling',
          'Quality assurance and audit trail management',
          'Vendor risk assessment and monitoring',
          'Operational metrics analysis and reporting'
        ],
        'maestro': [
          'End-to-end procurement process (request to payment)',
          'Employee lifecycle management orchestration',
          'Multi-system financial close process',
          'Comprehensive vendor onboarding and management'
        ]
      },
      'it-operations': {
        'rpa': [
          'System monitoring and alert generation',
          'User access provisioning',
          'Software deployment automation',
          'Backup and recovery processes'
        ],
        'idp': [
          'IT service ticket categorization',
          'System documentation extraction',
          'Security incident report processing',
          'Change request documentation'
        ],
        'agentic': [
          'Intelligent incident routing and prioritization',
          'Automated root cause analysis',
          'Security threat assessment and response',
          'Capacity planning and optimization'
        ],
        'maestro': [
          'End-to-end incident management (detection to resolution)',
          'Complete software development lifecycle orchestration',
          'IT service management workflow automation',
          'Cross-platform system integration management'
        ]
      },
      'finance-operations': {
        'rpa': [
          'Accounts payable processing',
          'Financial report generation',
          'Budget variance analysis',
          'Tax calculation and filing automation'
        ],
        'idp': [
          'Invoice and receipt data extraction',
          'Financial statement analysis',
          'Tax document processing',
          'Expense categorization and validation'
        ],
        'agentic': [
          'Intelligent expense approval routing',
          'Financial anomaly detection and investigation',
          'Budget planning and forecasting assistance',
          'Audit trail management and compliance checking'
        ],
        'maestro': [
          'End-to-end month-end close process orchestration',
          'Complete purchase-to-pay workflow automation',
          'Integrated financial planning and analysis',
          'Multi-entity consolidated reporting workflows'
        ]
      }
    };
    
    const lobUseCases = useCases[context.lob] || {};
    let contextualUseCases = [];
    
    context.projectTypes.forEach(projectType => {
      if (lobUseCases[projectType]) {
        contextualUseCases.push(...lobUseCases[projectType].map(useCase => ({
          name: useCase,
          type: projectType,
          deployment: context.deployment
        })));
      }
    });
    
    return contextualUseCases;
  }

  updateUseCaseContent(useCaseSection, useCases) {
    const contentContainer = useCaseSection.querySelector('.editable-content');
    if (contentContainer && useCases.length > 0) {
      contentContainer.innerHTML = `
        <div class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-semibold text-blue-800 mb-2">🎯 Contextual Use Cases</h4>
            <p class="text-sm text-blue-700">Based on your selections: ${this.getSelectedContext()}</p>
          </div>
          
          <div class="grid gap-4">
            ${useCases.map((useCase, index) => `
              <div class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 mb-2">${useCase.name}</h4>
                    <div class="text-sm text-gray-600 mb-3">
                      ${this.getUseCaseDescription(useCase.name, useCase.type)}
                    </div>
                  </div>
                  <div class="ml-4 flex flex-col gap-1">
                    <span class="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">${useCase.type.toUpperCase()}</span>
                    ${useCase.deployment && useCase.deployment !== 'automation-cloud' ? 
                      `<span class="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Limited Features</span>` : 
                      `<span class="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Full Features</span>`
                    }
                  </div>
                </div>
                ${useCase.deployment && ['on-prem', 'automation-suite'].includes(useCase.deployment) ? 
                  `<div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <strong>Note:</strong> Consider cloud migration to access advanced AI and Maestro capabilities for this use case.
                  </div>` : ''
                }
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  getSelectedContext() {
    return [
      this.selectedVertical ? `${this.selectedVertical}` : '',
      this.selectedLOB ? `${this.selectedLOB}` : '',
      this.selectedProjectTypes.size > 0 ? `${Array.from(this.selectedProjectTypes).join(', ')}` : '',
      this.selectedCustomerType ? `${this.selectedCustomerType} customer` : '',
      this.selectedDeployment ? `${this.selectedDeployment}` : ''
    ].filter(Boolean).join(' | ');
  }

  getUseCaseDescription(useCaseName, type) {
    const descriptions = {
      'rpa': 'Automated rule-based process with system integrations',
      'idp': 'AI-powered document processing and data extraction',
      'agentic': 'Intelligent decision-making with AI reasoning capabilities',
      'maestro': 'End-to-end orchestrated workflow with human-AI collaboration'
    };
    
    const typeDescription = descriptions[type] || 'Automated workflow';
    
    // Add specific descriptions for common patterns
    if (useCaseName.includes('End-to-end') || useCaseName.includes('Complete')) {
      return `${typeDescription} - Orchestrates multiple systems and stakeholders across the entire process lifecycle`;
    } else if (useCaseName.includes('Intelligent') || useCaseName.includes('AI')) {
      return `${typeDescription} - Uses advanced AI for complex decision-making and exception handling`;
    } else if (useCaseName.includes('document') || useCaseName.includes('extraction')) {
      return `${typeDescription} - Processes unstructured documents with high accuracy and validation`;
    } else {
      return typeDescription;
    }
  }

  showUpdateFeedback() {
    // Create temporary success message
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300';
    message.textContent = 'Content updated successfully!';
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => message.remove(), 300);
    }, 2000);
  }
}

// ==================== STATE MANAGEMENT ====================
class AppState {
  constructor() {
    this.state = {
      currentIndustry: 'banking',
      currentStage: 0,
      adminMode: false,
      checkboxes: new Map(),
      notes: new Map()
    };
    this.listeners = new Map();
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notifyListeners(key, value, oldValue);
  }

  notifyListeners(key, newValue, oldValue) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error('State listener error:', error);
        }
      });
    }
  }

  toggleCheckbox(checkboxId, checked) {
    const checkboxes = new Map(this.state.checkboxes);
    if (checked) {
      checkboxes.set(checkboxId, true);
    } else {
      checkboxes.delete(checkboxId);
    }
    this.set('checkboxes', checkboxes);
  }

  updateNote(noteId, content) {
    const notes = new Map(this.state.notes);
    if (content && content.trim()) {
      notes.set(noteId, content);
    } else {
      notes.delete(noteId);
    }
    this.set('notes', notes);
  }

  clearFormState() {
    this.set('checkboxes', new Map());
    this.set('notes', new Map());
  }
}

const appState = new AppState();

// ==================== DOM UTILITIES ====================
function $(selector, context = document) {
  return context.querySelector(selector);
}

function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

// ==================== AI CHATBOT ====================
class AIChatbot {
  constructor() {
    this.isOpen = false;
    this.conversationHistory = [];
    this.knowledgeBase = null;
    this.initializeKnowledgeBase();
    this.initializeEventListeners();
  }

  initializeKnowledgeBase() {
    // Build searchable knowledge base from SALES_CYCLE_DATA
    this.knowledgeBase = {
      personas: {},
      questions: {},
      objections: {},
      outcomes: {},
      resources: {},
      stages: []
    };

    // Index all personas
    Object.keys(SALES_CYCLE_DATA.personas).forEach(industry => {
      this.knowledgeBase.personas[industry] = SALES_CYCLE_DATA.personas[industry].map(persona => ({
        title: persona.title,
        world: persona.world,
        cares: persona.cares,
        help: persona.help,
        industry: industry
      }));
    });

    // Index all stages and their content
    SALES_CYCLE_DATA.stages.forEach((stage, stageIndex) => {
      this.knowledgeBase.stages.push({
        title: stage.title,
        index: stageIndex,
        outcomes: stage.outcomes || [],
        questions: stage.questions || {},
        objections: stage.objections || [],
        resources: stage.resources || {}
      });

      // Index questions
      Object.entries(stage.questions || {}).forEach(([category, questions]) => {
        this.knowledgeBase.questions[category] = questions.map(q => ({
          question: q,
          category: category,
          stage: stage.title,
          stageIndex: stageIndex
        }));
      });

      // Index objections
      (stage.objections || []).forEach(objection => {
        if (!this.knowledgeBase.objections[stage.title]) {
          this.knowledgeBase.objections[stage.title] = [];
        }
        this.knowledgeBase.objections[stage.title].push({
          question: objection.q,
          answer: objection.a,
          stage: stage.title,
          stageIndex: stageIndex
        });
      });

      // Index outcomes
      (stage.outcomes || []).forEach(outcome => {
        if (!this.knowledgeBase.outcomes[stage.title]) {
          this.knowledgeBase.outcomes[stage.title] = [];
        }
        this.knowledgeBase.outcomes[stage.title].push({
          outcome: outcome,
          stage: stage.title,
          stageIndex: stageIndex
        });
      });
    });
  }

  initializeEventListeners() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    const clearChat = document.getElementById('clear-chat');

    chatToggle?.addEventListener('click', () => this.toggleChat());
    chatClose?.addEventListener('click', () => this.closeChat());
    chatSend?.addEventListener('click', () => this.sendMessage());
    clearChat?.addEventListener('click', () => this.clearChat());

    // Handle input events
    chatInput?.addEventListener('input', (e) => {
      const charCount = e.target.value.length;
      document.getElementById('char-count').textContent = charCount;
      chatSend.disabled = charCount === 0;
    });

    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !chatSend.disabled) {
        this.sendMessage();
      }
    });

    // Handle quick actions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.quick-action-btn')) {
        const action = e.target.closest('.quick-action-btn').dataset.action;
        this.handleQuickAction(action);
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('chat-window');
    const quickActions = document.getElementById('quick-actions');
    const chatIcon = document.getElementById('chat-icon');
    const closeIcon = document.getElementById('close-icon');

    if (this.isOpen) {
      chatWindow.classList.remove('hidden');
      quickActions.classList.add('hidden');
      chatIcon.classList.add('hidden');
      closeIcon.classList.remove('hidden');
      document.getElementById('chat-input')?.focus();
    } else {
      chatWindow.classList.add('hidden');
      quickActions.classList.remove('hidden');
      chatIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    }
  }

  closeChat() {
    this.isOpen = false;
    this.toggleChat();
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Clear input
    input.value = '';
    document.getElementById('char-count').textContent = '0';
    document.getElementById('chat-send').disabled = true;

    // Add user message
    this.addMessage(message, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Process the message
      const response = await this.processMessage(message);
      
      // Hide typing indicator
      this.hideTypingIndicator();

      // Add bot response
      this.addMessage(response.text, 'bot', response.actions);
    } catch (error) {
      console.error('Chat error:', error);
      this.hideTypingIndicator();
      this.addMessage('I apologize, but I encountered an error. Please try asking your question again.', 'bot');
    }
  }

  addMessage(text, sender, actions = null) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    if (sender === 'user') {
      messageDiv.className = 'flex justify-end';
      messageDiv.innerHTML = `
        <div class="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
          <p class="text-sm">${this.escapeHtml(text)}</p>
        </div>
      `;
    } else {
      messageDiv.className = 'flex items-start space-x-3';
      messageDiv.innerHTML = `
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
          <p class="text-sm text-gray-800">${text}</p>
          ${actions ? this.renderActions(actions) : ''}
        </div>
      `;
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in conversation history
    this.conversationHistory.push({ text, sender, timestamp: new Date() });
  }

  renderActions(actions) {
    return `
      <div class="mt-3 space-y-2">
        ${actions.map(action => `
          <button onclick="window.chatbot.handleAction('${action.type}', '${action.data}')" class="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  async processMessage(message) {
    // First, search local knowledge base
    const localResults = this.searchKnowledgeBase(message);
    
    if (localResults.length > 0) {
      return this.formatLocalResponse(localResults, message);
    }

    // If no local results, try AI response (if API key available)
    if (this.hasAICredentials()) {
      return await this.generateAIResponse(message);
    }

    // Fallback to general guidance
    return this.generateFallbackResponse(message);
  }

  searchKnowledgeBase(query) {
    const results = [];
    const queryLower = query.toLowerCase();

    // Search personas
    Object.values(this.knowledgeBase.personas).flat().forEach(persona => {
      if (this.matchesQuery(persona.title + ' ' + persona.world + ' ' + persona.cares, queryLower)) {
        results.push({ type: 'persona', data: persona, relevance: this.calculateRelevance(persona, queryLower) });
      }
    });

    // Search questions
    Object.values(this.knowledgeBase.questions).flat().forEach(q => {
      if (this.matchesQuery(q.question + ' ' + q.category, queryLower)) {
        results.push({ type: 'question', data: q, relevance: this.calculateRelevance(q, queryLower) });
      }
    });

    // Search objections
    Object.values(this.knowledgeBase.objections).flat().forEach(obj => {
      if (this.matchesQuery(obj.question + ' ' + obj.answer, queryLower)) {
        results.push({ type: 'objection', data: obj, relevance: this.calculateRelevance(obj, queryLower) });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  matchesQuery(text, query) {
    const words = query.split(' ');
    const textLower = text.toLowerCase();
    return words.some(word => word.length > 2 && textLower.includes(word));
  }

  calculateRelevance(item, query) {
    const text = JSON.stringify(item).toLowerCase();
    const words = query.split(' ');
    let score = 0;
    words.forEach(word => {
      if (word.length > 2 && text.includes(word)) {
        score += word.length;
      }
    });
    return score;
  }

  formatLocalResponse(results, originalQuery) {
    const primaryResult = results[0];
    let response = '';
    let actions = [];

    switch (primaryResult.type) {
      case 'persona':
        const persona = primaryResult.data;
        response = `I found information about the **${persona.title}** persona in ${persona.industry}:\n\n**Their World:** ${persona.world}\n\n**What They Care About:** ${persona.cares}`;
        actions = [
          { type: 'navigate', data: `personas-${persona.industry}`, label: '📋 View All Personas' },
          { type: 'search', data: `${persona.title} objections`, label: '❓ Common Objections' }
        ];
        break;
        
      case 'question':
        const question = primaryResult.data;
        response = `Here's a key discovery question from the **${question.stage}** stage:\n\n"${question.question}"\n\n**Category:** ${question.category}`;
        actions = [
          { type: 'navigate', data: `stage-${question.stageIndex}`, label: '📊 View Full Stage' },
          { type: 'search', data: `${question.category} questions`, label: '❓ More Questions' }
        ];
        break;
        
      case 'objection':
        const objection = primaryResult.data;
        response = `Here's how to handle this objection from **${objection.stage}**:\n\n**Objection:** "${objection.question}"\n\n**Suggested Response:** ${objection.answer}`;
        actions = [
          { type: 'navigate', data: `stage-${objection.stageIndex}`, label: '📊 View Full Stage' },
          { type: 'search', data: 'objection handling', label: '❓ More Objections' }
        ];
        break;
    }

    if (results.length > 1) {
      response += `\n\n*I found ${results.length} related items. Would you like me to show more?*`;
      actions.push({ type: 'search', data: originalQuery, label: '🔍 Show More Results' });
    }

    return { text: response, actions };
  }

  generateFallbackResponse(message) {
    const keywords = message.toLowerCase();
    
    if (keywords.includes('persona') || keywords.includes('decision maker')) {
      return {
        text: "I can help you find information about decision makers and personas! Try asking about specific roles like 'COO', 'CIO', or 'Compliance Officer'.",
        actions: [
          { type: 'quickAction', data: 'search-personas', label: '👥 Browse All Personas' }
        ]
      };
    }
    
    if (keywords.includes('objection') || keywords.includes('handle')) {
      return {
        text: "I can help you handle objections! Each sales stage has common objections with suggested responses.",
        actions: [
          { type: 'quickAction', data: 'search-objections', label: '❓ View Common Objections' }
        ]
      };
    }
    
    if (keywords.includes('question') || keywords.includes('discovery')) {
      return {
        text: "I can help you find the right discovery questions! Each stage has categorized questions to guide your conversations.",
        actions: [
          { type: 'quickAction', data: 'search-questions', label: '❓ View Discovery Questions' }
        ]
      };
    }

    return {
      text: "I can help you with information about:\n• **Personas** - Decision makers and their motivations\n• **Objections** - Common objections and responses\n• **Discovery Questions** - Questions for each sales stage\n• **Use Cases** - Industry-specific examples\n\nWhat would you like to explore?",
      actions: [
        { type: 'quickAction', data: 'search-personas', label: '👥 Personas' },
        { type: 'quickAction', data: 'search-objections', label: '❓ Objections' },
        { type: 'quickAction', data: 'search-questions', label: '💬 Questions' }
      ]
    };
  }

  hasAICredentials() {
    return sessionStorage.getItem('claude_api_key') !== null;
  }

  async generateAIResponse(message) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    
    const prompt = `You are a UiPath sales expert assistant. The user is asking: "${message}". 

    Based on this UiPath Sales Cycle Guide content, provide helpful guidance. Focus on:
    - Sales processes and methodologies
    - Handling objections
    - Discovery questions
    - Persona insights
    - Use cases and value propositions

    Keep your response conversational, helpful, and focused on sales guidance. If the question is outside sales topics, politely redirect to sales-related assistance.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error('AI request failed');

      const data = await response.json();
      return {
        text: data.content[0]?.text || 'I apologize, but I could not generate a response.',
        actions: []
      };
    } catch (error) {
      console.error('AI response error:', error);
      return this.generateFallbackResponse(message);
    }
  }

  handleAction(type, data) {
    switch (type) {
      case 'navigate':
        // Navigate to specific section
        if (data.startsWith('stage-')) {
          const stageIndex = parseInt(data.split('-')[1]);
          appState.set('currentStage', stageIndex);
          this.addMessage(`Navigated to ${SALES_CYCLE_DATA.stages[stageIndex]?.title || 'stage'}`, 'bot');
        }
        break;
      case 'search':
        this.addMessage(data, 'user');
        this.sendMessage();
        break;
      case 'quickAction':
        this.handleQuickAction(data);
        break;
    }
  }

  handleQuickAction(action) {
    this.openChat();
    
    switch (action) {
      case 'search-personas':
        this.addMessage('Tell me about the personas', 'user');
        break;
      case 'search-objections':
        this.addMessage('How do I handle common objections?', 'user');
        break;
      case 'search-questions':
        this.addMessage('What are good discovery questions?', 'user');
        break;
    }
    
    // Trigger search
    setTimeout(() => this.sendMessage(), 100);
  }

  openChat() {
    if (!this.isOpen) {
      this.toggleChat();
    }
  }

  showTypingIndicator() {
    document.getElementById('typing-indicator')?.classList.remove('hidden');
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    document.getElementById('typing-indicator')?.classList.add('hidden');
  }

  clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div class="bg-gray-100 rounded-lg p-3 max-w-xs">
          <p class="text-sm text-gray-800">Hi! I'm your UiPath Sales Assistant. I can help you find content, answer questions about sales processes, personas, objections, and more. What would you like to know?</p>
        </div>
      </div>
    `;
    this.conversationHistory = [];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ==================== EDIT SYSTEM ====================
class ContentEditor {
  constructor() {
    this.quillEditor = null;
    this.currentEditData = null;
  }

  initializeQuill() {
    if (this.quillEditor) return;
    
    this.quillEditor = new Quill('#editor', {
      theme: 'snow',
      placeholder: 'Enter your content here...',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link'],
          ['clean']
        ]
      }
    });
  }

  openEditor(type, data, element) {
    this.currentEditData = { type, data, element };
    
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const editorContainer = document.getElementById('editor-container');
    const textarea = document.getElementById('modal-textarea');
    
    // Set title based on content type
    const titles = {
      'persona-field': 'Edit Persona Field',
      'outcome': 'Edit Outcome',
      'question': 'Edit Discovery Question',
      'objection-question': 'Edit Objection',
      'objection-answer': 'Edit Objection Response',
      'resource': 'Edit Resource',
      'resource-overview': 'Edit Resource Overview',
      'resource-why': 'Edit Resource Why',
      'use-case': 'Edit Use Case',
      'initial-persona': 'Edit Initial Persona',
      'uipath-team': 'Edit UiPath Team Member',
      'use-case-category': 'Edit Use Case Category',
      'use-case-item': 'Edit Use Case Item',
      // New entry types
      'new-outcome': 'Add New Outcome',
      'new-question': 'Add New Discovery Question',
      'new-objection': 'Add New Objection',
      'new-resource': 'Add New Resource',
      'new-use-case': 'Add New Use Case',
      'new-persona': 'Add New Persona',
      'new-initial-persona': 'Add New Initial Persona',
      'new-uipath-team': 'Add New UiPath Team Member',
      'new-use-case-category': 'Add New Use Case Category',
      'new-use-case-item': 'Add New Use Case Item'
    };
    modalTitle.textContent = titles[type] || 'Edit Content';
    
    // Initialize Quill if not already done
    this.initializeQuill();
    
    // Show editor and hide textarea
    editorContainer.classList.remove('hidden');
    textarea.classList.add('hidden');
    
    // Set content in editor
    const currentContent = this.getCurrentContent(type, data, element);
    this.quillEditor.root.innerHTML = currentContent;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus editor
    setTimeout(() => this.quillEditor.focus(), 100);
  }

  getCurrentContent(type, data, element) {
    switch (type) {
      case 'persona-field':
        return data.content || '';
      case 'outcome':
      case 'question':
        return data.text || '';
      case 'objection-question':
        return data.question || '';
      case 'objection-answer':
        return data.answer || '';
      case 'resource':
        return data.name || '';
      case 'resource-overview':
        return data.overview || '';
      case 'resource-why':
        return data.why || '';
      case 'use-case':
        return data.name || '';
      case 'initial-persona':
      case 'uipath-team':
        return data.text || '';
      case 'use-case-category':
        return data.category || '';
      case 'use-case-item':
        return data.name || '';
      // New entry types start with empty content
      case 'new-outcome':
      case 'new-question':
      case 'new-objection':
      case 'new-resource':
      case 'new-use-case':
      case 'new-persona':
      case 'new-initial-persona':
      case 'new-uipath-team':
      case 'new-use-case-category':
      case 'new-use-case-item':
        return '';
      default:
        return element?.textContent || '';
    }
  }

  saveContent() {
    if (!this.currentEditData || !this.quillEditor) return;
    
    const content = this.quillEditor.root.innerHTML;
    const { type, data, element } = this.currentEditData;
    
    // Update the data structure
    this.updateData(type, data, content);
    
    // Update the UI element
    this.updateUIElement(type, element, content);
    
    // Save to localStorage for persistence
    this.saveToStorage();
    
    // Close modal
    this.closeEditor();
    
    // Show success notification
    this.showNotification('Content updated successfully!', 'success');
  }

  updateData(type, data, content) {
    const textContent = this.htmlToText(content);
    
    switch (type) {
      case 'persona-field':
        if (data.field === 'title') data.persona.title = textContent;
        else if (data.field === 'world') data.persona.world = content;
        else if (data.field === 'cares') data.persona.cares = content;
        else if (data.field === 'help') data.persona.help = content;
        break;
      case 'outcome':
        data.outcome = textContent;
        break;
      case 'question':
        data.question = content;
        break;
      case 'objection-question':
        data.objection.q = textContent;
        break;
      case 'objection-answer':
        data.objection.a = content;
        break;
      case 'resource':
        data.resource.name = textContent;
        break;
      case 'resource-overview':
        data.resource.overview = content;
        break;
      case 'resource-why':
        data.resource.why = content;
        break;
      case 'use-case':
        data.useCase.name = textContent;
        break;
      case 'initial-persona':
        data.list[data.index] = content;
        break;
      case 'uipath-team':
        data.list[data.index] = content;
        break;
      case 'use-case-category':
        data.categoryData.category = textContent;
        break;
      case 'use-case-item':
        data.useCaseData.name = textContent;
        break;
      
      // Handle new entries
      case 'new-outcome':
        SALES_CYCLE_DATA.stages[data.stageIndex].outcomes.push(textContent);
        break;
      case 'new-question':
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].questions[data.category]) {
          SALES_CYCLE_DATA.stages[data.stageIndex].questions[data.category] = [];
        }
        SALES_CYCLE_DATA.stages[data.stageIndex].questions[data.category].push(content);
        break;
      case 'new-objection':
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].objections) {
          SALES_CYCLE_DATA.stages[data.stageIndex].objections = [];
        }
        SALES_CYCLE_DATA.stages[data.stageIndex].objections.push({
          q: textContent,
          a: 'Add your suggested response here...'
        });
        break;
      case 'new-resource':
        const currentIndustry = appState.get('currentIndustry');
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].resources) {
          SALES_CYCLE_DATA.stages[data.stageIndex].resources = {};
        }
        if (!SALES_CYCLE_DATA.stages[data.stageIndex].resources[currentIndustry]) {
          SALES_CYCLE_DATA.stages[data.stageIndex].resources[currentIndustry] = [];
        }
        SALES_CYCLE_DATA.stages[data.stageIndex].resources[currentIndustry].push({
          name: textContent,
          link: '#',
          overview: 'Add overview here...',
          why: 'Add why this is useful here...'
        });
        break;
      case 'new-persona':
        const industry = appState.get('currentIndustry');
        SALES_CYCLE_DATA.personas[industry].push({
          title: textContent,
          world: 'Describe their world here...',
          cares: 'Describe what they care about here...',
          help: 'Describe how UiPath helps here...'
        });
        break;
      case 'new-initial-persona':
        SALES_CYCLE_DATA.stages[data.stageIndex].initialPersonas.push(content);
        break;
      case 'new-uipath-team':
        SALES_CYCLE_DATA.stages[data.stageIndex].uipathTeam.push(content);
        break;
      case 'new-use-case-category':
        // For static data, we would need to modify the useCasesData structure
        // This is a placeholder for the functionality
        console.log('Adding new use case category:', textContent);
        break;
      case 'new-use-case-item':
        // For static data, we would need to modify the specific category's cases array
        console.log('Adding new use case item:', textContent);
        break;
    }
  }

  updateUIElement(type, element, content) {
    // For new entries, trigger re-rendering of the entire section
    if (type.startsWith('new-')) {
      this.triggerSectionRerender(type);
      return;
    }
    
    // For existing entries, update the element directly
    if (type === 'persona-field' && ['title'].includes(this.currentEditData.data.field)) {
      element.innerHTML = this.htmlToText(content);
    } else if (element) {
      element.innerHTML = content;
    }
  }

  triggerSectionRerender(type) {
    // Get the main app instance
    const app = window.appInstance || this.app;
    if (!app) return;

    switch (type) {
      case 'new-outcome':
      case 'new-question':
      case 'new-objection':
      case 'new-resource':
      case 'new-initial-persona':
      case 'new-uipath-team':
        // Re-render the current stage
        const currentStage = appState.get('currentStage');
        app.renderStageContent(currentStage);
        break;
      case 'new-persona':
        // Re-render personas section
        app.renderPersonas();
        break;
      case 'new-use-case':
      case 'new-use-case-category':
      case 'new-use-case-item':
        // Re-render use cases section
        app.renderUseCases();
        break;
    }
  }

  htmlToText(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  saveToStorage() {
    try {
      localStorage.setItem('sales_cycle_data_edits', JSON.stringify(SALES_CYCLE_DATA));
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  closeEditor() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
    this.currentEditData = null;
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }
}

// ==================== MAIN APPLICATION ====================
class TimelineUiPathApp {
  constructor() {
    this.initialized = false;
    this.contentEditor = new ContentEditor();
    this.chatbot = null;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing Timeline UiPath Sales Guide...');
      
      // Initialize UI
      this.initializeUI();
      
      // Initialize event listeners
      this.initializeEventListeners();
      
      // Load and render data
      this.loadData();
      
      this.initialized = true;
      console.log('Application initialized successfully');
      
      // Hide loading indicator
      const loading = $('#app-loading');
      if (loading) {
        loading.style.display = 'none';
      }
      
      // Dispatch ready event
      document.dispatchEvent(new CustomEvent('app:ready'));
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.showError('Failed to initialize application. Please refresh and try again.');
    }
  }

  initializeUI() {
    // Subscribe to state changes
    appState.subscribe('currentStage', (stageIndex) => {
      this.renderStageContent(stageIndex);
      this.updateTimelineUI(stageIndex);
    });

    appState.subscribe('currentIndustry', (industry) => {
      this.updateIndustryUI(industry);
      this.loadData();
    });

    appState.subscribe('adminMode', (enabled) => {
      document.body.classList.toggle('admin-mode', enabled);
      this.updateAdminUI(enabled);
    });
  }

  initializeEventListeners() {
    // Global click handler
    document.addEventListener('click', (e) => {
      // Handle timeline dot clicks
      if (e.target.closest('.timeline-dot')) {
        e.preventDefault();
        const dot = e.target.closest('.timeline-dot');
        const stageIndex = parseInt(dot.dataset.stage);
        if (!isNaN(stageIndex)) {
          appState.set('currentStage', stageIndex);
        }
      }
      
      // Handle export notes
      if (e.target.closest('.export-notes-btn')) {
        e.preventDefault();
        this.handleExportNotes();
      }
      
      // Handle clear all
      if (e.target.closest('.clear-all-btn')) {
        e.preventDefault();
        this.handleClearAll();
      }
      
      // Handle admin mode toggle
      if (e.target.closest('#admin-mode-btn')) {
        e.preventDefault();
        this.toggleAdminMode();
      }

      // Handle edit button clicks
      if (e.target.closest('.edit-btn')) {
        e.preventDefault();
        this.handleEditClick(e.target.closest('.edit-btn'));
      }

      // Handle modal save/cancel
      if (e.target.closest('#modal-save')) {
        e.preventDefault();
        this.contentEditor.saveContent();
      }
      if (e.target.closest('#modal-cancel') || e.target.closest('.modal-close')) {
        e.preventDefault();
        this.contentEditor.closeEditor();
      }
      
      // Handle industry switcher
      if (e.target.closest('.industry-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.industry-btn');
        const industry = btn.dataset.industry;
        if (industry) {
          appState.set('currentIndustry', industry);
        }
      }
      
      // Handle mobile menu
      if (e.target.closest('#mobile-menu-btn')) {
        e.preventDefault();
        const menu = $('#mobile-menu');
        if (menu) {
          menu.classList.toggle('hidden');
        }
      }

      // Handle collapsible sections
      if (e.target.closest('.collapsible-header')) {
        e.preventDefault();
        const header = e.target.closest('.collapsible-header');
        const section = header.parentElement;
        const content = section.querySelector('.collapsible-content');
        const chevron = header.querySelector('.chevron-icon');
        
        if (content && chevron) {
          const isHidden = content.classList.contains('hidden');
          content.classList.toggle('hidden');
          chevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
          
          // Update the hint text
          const hintText = header.querySelector('span');
          if (hintText) {
            // Removed hint text functionality
          }
        }
      }
      
      // Handle AI response buttons
      if (e.target.closest('.ai-question-response-btn')) {
        e.preventDefault();
        this.handleAIResponse(e.target.closest('.ai-question-response-btn'));
      }
      
      // Handle AI objection response buttons
      if (e.target.closest('.ai-objection-response-btn')) {
        e.preventDefault();
        this.handleAIObjectionResponse(e.target.closest('.ai-objection-response-btn'));
      }

      // Handle navigation arrows
      if (e.target.closest('.nav-prev')) {
        e.preventDefault();
        this.navigateToPreviousStage();
      }
      
      if (e.target.closest('.nav-next')) {
        e.preventDefault();
        this.navigateToNextStage();
      }
    });
    
    // Handle checkbox changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const checkboxId = e.target.dataset.id;
        if (checkboxId) {
          appState.toggleCheckbox(checkboxId, e.target.checked);
          e.target.closest('label')?.classList.toggle('checked-item', e.target.checked);
        }
      }
    });
    
    // Handle textarea input
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('note-textarea')) {
        const noteId = e.target.dataset.noteId;
        if (noteId) {
          appState.updateNote(noteId, e.target.value);
        }
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.navigateToPreviousStage();
      } else if (e.key === 'ArrowRight') {
        this.navigateToNextStage();
      }
    });
  }

  loadData() {
    if (typeof SALES_CYCLE_DATA === 'undefined') {
      console.error('Sales cycle data not loaded, waiting...');
      setTimeout(() => {
        if (typeof SALES_CYCLE_DATA === 'undefined') {
          console.error('Sales cycle data still not loaded');
          this.showError('Failed to load sales data. Please refresh the page.');
          return;
        }
        this.loadData();
      }, 500);
      return;
    }
    
    console.log('Loading data with', SALES_CYCLE_DATA.stages?.length, 'stages');
    
    // Initialize AI chatbot after data is loaded
    if (!this.chatbot) {
      try {
        this.chatbot = new AIChatbot();
        window.chatbot = this.chatbot; // Make globally accessible for action buttons
        console.log('AI Chatbot initialized successfully');
      } catch (error) {
        console.error('Failed to initialize AI Chatbot:', error);
        // Continue without chatbot if initialization fails
      }
    }

    // Make app instance globally accessible for content editor
    window.appInstance = this;
    
    // Render personas
    this.renderPersonas();
    this.renderUseCases();
    
    // Render timeline
    this.renderTimeline();
    
    // Render initial stage content
    this.renderStageContent(appState.get('currentStage') || 0);
    
    // Set default expanded states
    this.setDefaultExpandedStates();
  }

  renderTimeline() {
    const container = $('#timeline-container');
    if (!container || !SALES_CYCLE_DATA.stages) return;
    
    const stages = SALES_CYCLE_DATA.stages;
    const currentStage = appState.get('currentStage') || 0;
    
    const timelineHTML = `
      <div class="relative">
        <!-- Progress Line -->
        <div class="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
        <div class="absolute top-8 left-0 h-1 bg-gradient-to-r from-green-500 to-orange-500 rounded-full transition-all duration-500" 
             style="width: ${((currentStage + 1) / stages.length) * 100}%"></div>
        
        <!-- Timeline Dots -->
        <div class="relative flex justify-between items-start">
          ${stages.map((stage, index) => {
            const isActive = index === currentStage;
            
            return `
              <div class="timeline-dot flex flex-col items-center cursor-pointer group transition-all duration-200 hover:scale-105"
                   data-stage="${index}">
                <div class="relative">
                  <div class="w-16 h-16 rounded-full ${isActive ? 'bg-orange-500' : 'bg-gray-300'} flex items-center justify-center text-white font-bold text-lg mb-3 
                              transition-all duration-300 group-hover:shadow-lg ${isActive ? 'ring-4 ring-orange-200 scale-110' : ''} hover:bg-orange-400">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  ${isActive ? '<div class="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25"></div>' : ''}
                </div>
                <div class="text-center">
                  <div class="font-semibold text-sm ${isActive ? 'text-orange-600' : 'text-gray-600'} mb-1 max-w-20 leading-tight">${sanitizer.escapeHtml(stage.title)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = timelineHTML;
  }

  renderPersonas() {
    const container = $('#personas-container');
    if (!container || !SALES_CYCLE_DATA.personas) return;
    
    const currentIndustry = appState.get('currentIndustry');
    const personas = SALES_CYCLE_DATA.personas[currentIndustry] || [];
    
    const personasHTML = personas.map((persona, index) => `
      <div class="persona-card bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div class="collapsible-header p-4 cursor-pointer hover:bg-gray-50 transition-colors" data-section="persona-card">
          <div class="flex justify-between items-center">
            <div class="flex items-center flex-1">
              <svg class="chevron-icon w-4 h-4 mr-2 text-blue-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-lg font-semibold text-blue-700" data-editable>
                ${sanitizer.renderSafeHTML(persona.title)}
              </h3>
              <button class="edit-btn hidden ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                      data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="title">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-4 pb-4">
          <div class="space-y-2 pt-2 border-t border-gray-100">
            <div class="relative">
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-700 mb-1">Their World:</h4>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                        data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="world">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed" data-editable>${sanitizer.renderSafeHTML(persona.world || '')}</p>
            </div>
            <div class="relative">
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-700 mb-1">What They Care About:</h4>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                        data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="cares">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed" data-editable>${sanitizer.renderSafeHTML(persona.cares || '')}</p>
            </div>
            <div class="relative">
              <div class="flex items-start justify-between">
                <h4 class="text-sm font-medium text-gray-700 mb-1">How UiPath Helps:</h4>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors" 
                        data-edit-type="persona-field" data-edit-id="${index}" data-edit-field="help">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed" data-editable>${sanitizer.renderSafeHTML(persona.help || '')}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Add "Add New Persona" button
    const addNewPersonaButton = `
      <div class="edit-btn hidden mt-4">
        <button class="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors" 
                data-edit-type="new-persona" data-edit-id="${currentIndustry}">
          <div class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Persona
          </div>
        </button>
      </div>
    `;
    
    container.innerHTML = (personasHTML || '<p class="text-gray-500 col-span-full text-center">No personas available for this industry.</p>') + addNewPersonaButton;
  }

  renderUseCases() {
    const container = document.getElementById('use-cases-container');
    if (!container) return;
    
    const currentIndustry = appState.get('currentIndustry');
    
    const useCasesData = {
      banking: [
        { category: 'Consumer Banking', color: 'blue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1', cases: [
          { name: 'Consumer Banking Operations', page: 10 },
          { name: 'Credit Risk Assessment', page: 15 },
          { name: 'Commercial Lending', page: 20 },
          { name: 'Trade Finance Automation', page: 25 }
        ]},
        { category: 'Capital Markets', color: 'indigo', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', cases: [
          { name: 'Capital Markets Processing', page: 30 },
          { name: 'Wealth Management', page: 35 },
          { name: 'Payments Processing', page: 40 },
          { name: 'Treasury Operations', page: 45 }
        ]}
      ],
      insurance: [
        { category: 'Core Insurance', color: 'green', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', cases: [
          { name: 'Claims Processing', page: 50 },
          { name: 'Policy Administration', page: 52 },
          { name: 'Underwriting Automation', page: 54 },
          { name: 'Customer Onboarding', page: 56 }
        ]},
        { category: 'Operations', color: 'teal', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cases: [
          { name: 'Regulatory Reporting', page: 58 },
          { name: 'Fraud Detection', page: 60 },
          { name: 'Risk Assessment', page: 62 },
          { name: 'Compliance Monitoring', page: 64 }
        ]}
      ]
    };

    // Common horizontal functions for both industries
    const horizontalFunctions = [
      { category: 'IT Operations', color: 'purple', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', cases: [
        { name: 'ServiceNow Integration', page: 66 },
        { name: 'System Monitoring', page: 68 },
        { name: 'Data Migration', page: 70 },
        { name: 'Infrastructure Automation', page: 72 }
      ]},
      { category: 'Finance & Operations', color: 'orange', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', cases: [
        { name: 'Invoice Processing', page: 74 },
        { name: 'Financial Reconciliation', page: 76 },
        { name: 'Expense Management', page: 78 },
        { name: 'Procurement Automation', page: 80 }
      ]}
    ];

    const industryUseCases = useCasesData[currentIndustry] || [];
    const allUseCases = [...industryUseCases, ...horizontalFunctions];

    const getColorClasses = (color) => {
      const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-900', link: 'text-blue-700', linkHover: 'hover:text-blue-900' },
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', link: 'text-indigo-700', linkHover: 'hover:text-indigo-900' },
        green: { bg: 'bg-green-50', text: 'text-green-900', link: 'text-green-700', linkHover: 'hover:text-green-900' },
        teal: { bg: 'bg-teal-50', text: 'text-teal-900', link: 'text-teal-700', linkHover: 'hover:text-teal-900' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-900', link: 'text-purple-700', linkHover: 'hover:text-purple-900' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-900', link: 'text-orange-700', linkHover: 'hover:text-orange-900' }
      };
      return colorMap[color] || colorMap.blue;
    };

    const useCasesHTML = `
      <div class="grid md:grid-cols-2 gap-6">
        ${allUseCases.map((category, categoryIndex) => {
          const colors = getColorClasses(category.color);
          return `
          <div class="${colors.bg} rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold ${colors.text} flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${category.icon}"/>
                </svg>
                <span data-editable>${sanitizer.renderSafeHTML(category.category)}</span>
              </h3>
              <button class="edit-btn hidden p-1 text-gray-400 hover:text-${category.color}-600 transition-colors" 
                      data-edit-type="use-case-category" data-edit-id="${categoryIndex}" data-industry="${currentIndustry}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                </svg>
              </button>
            </div>
            <ul class="space-y-2">
              ${category.cases.map((useCase, useCaseIndex) => `
                <li class="flex items-center justify-between group">
                  <button class="use-case-link text-sm ${colors.link} ${colors.linkHover} text-left transition-colors flex-1" data-page="${useCase.page}" data-name="${sanitizer.escapeHtml(useCase.name)}">
                    <span data-editable>• ${sanitizer.renderSafeHTML(useCase.name)}</span>
                  </button>
                  <button class="edit-btn hidden p-1 text-gray-400 hover:text-${category.color}-600 transition-colors ml-2" 
                          data-edit-type="use-case-item" data-edit-id="${categoryIndex}-${useCaseIndex}" data-industry="${currentIndustry}">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                    </svg>
                  </button>
                </li>
              `).join('')}
              <!-- Add New Use Case Button -->
              <li class="edit-btn hidden mt-3">
                <button class="w-full p-2 border-2 border-dashed border-${category.color}-300 rounded-lg text-${category.color}-600 hover:border-${category.color}-400 hover:bg-${category.color}-50 transition-colors" 
                        data-edit-type="new-use-case-item" data-edit-id="${categoryIndex}" data-industry="${currentIndustry}">
                  <div class="flex items-center justify-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Use Case
                  </div>
                </button>
              </li>
            </ul>
          </div>
        `;
        }).join('')}
      </div>
      <!-- Add New Category Button -->
      <div class="edit-btn hidden mt-6">
        <button class="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-colors" 
                data-edit-type="new-use-case-category" data-edit-id="${currentIndustry}">
          <div class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add New Category
          </div>
        </button>
      </div>
    `;

    container.innerHTML = useCasesHTML;
  }

  setDefaultExpandedStates() {
    // Default expand personas and use cases sections
    setTimeout(() => {
      const personasSection = document.querySelector('#personas-section .collapsible-content');
      const personasChevron = document.querySelector('#personas-section .chevron-icon');
      
      if (personasSection && personasChevron) {
        personasSection.classList.remove('hidden');
        personasChevron.style.transform = 'rotate(90deg)';
      }
      
      const useCasesSection = document.querySelector('#use-cases-section .collapsible-content');
      const useCasesChevron = document.querySelector('#use-cases-section .chevron-icon');
      
      if (useCasesSection && useCasesChevron) {
        useCasesSection.classList.remove('hidden');
        useCasesChevron.style.transform = 'rotate(90deg)';
      }
    }, 100);
  }

  renderStageContent(stageIndex) {
    const container = $('#stage-content');
    if (!container || !SALES_CYCLE_DATA.stages) return;
    
    const stage = SALES_CYCLE_DATA.stages[stageIndex];
    if (!stage) return;
    
    const currentIndustry = appState.get('currentIndustry');
    
    const contentHTML = `
      <!-- Stage Header -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900">
            ${sanitizer.escapeHtml(stage.title)}
          </h2>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-3 gap-6 mb-6">
        <!-- Outcomes -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-orange-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Verifiable Outcomes
          </h3>
          <div class="space-y-3">
            ${(stage.outcomes || []).map((outcome, i) => `
              <div class="flex items-start justify-between group">
                <label class="flex items-start cursor-pointer group flex-1">
                  <input type="checkbox" class="mt-1 mr-3 h-5 w-5 text-orange-600 rounded focus:ring-orange-500" 
                         data-id="stage-${stageIndex}-outcome-${i}">
                  <span class="text-gray-700 group-hover:text-gray-900" data-editable>${sanitizer.renderSafeHTML(outcome)}</span>
                </label>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-orange-600 transition-colors ml-2" 
                        data-edit-type="outcome" data-edit-id="${stageIndex}-${i}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </div>
            `).join('')}
            <!-- Add New Outcome Button -->
            <button class="edit-btn hidden w-full mt-4 p-3 border-2 border-dashed border-orange-300 rounded-lg text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors" 
                    data-edit-type="new-outcome" data-edit-id="${stageIndex}">
              <div class="flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Outcome
              </div>
            </button>
          </div>
        </div>

        <!-- Initial Personas -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-blue-600 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Personas
          </h3>
          <ul class="space-y-2">
            ${(stage.initialPersonas || []).map((persona, i) => `
              <li class="flex items-start justify-between group">
                <div class="flex items-start">
                  <span class="text-blue-500 mr-2">•</span>
                  <span class="text-gray-700" data-editable>${sanitizer.renderSafeHTML(persona)}</span>
                </div>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-blue-600 transition-colors ml-2" 
                        data-edit-type="initial-persona" data-edit-id="${stageIndex}-${i}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </li>
            `).join('')}
            <!-- Add New Initial Persona Button -->
            <li>
              <button class="edit-btn hidden w-full mt-3 p-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors" 
                      data-edit-type="new-initial-persona" data-edit-id="${stageIndex}">
                <div class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Persona
                </div>
              </button>
            </li>
          </ul>
        </div>

        <!-- UiPath Team -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-xl font-bold mb-4 text-orange-500 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20a3 3 0 01-3-3v-2a3 3 0 01-3-3V9a3 3 0 013-3h3a3 3 0 013 3v3a3 3 0 01-3 3v2a3 3 0 01-3 3z"></path>
            </svg>
            UiPath Team
          </h3>
          <ul class="space-y-2">
            ${(stage.uipathTeam || []).map((member, i) => `
              <li class="flex items-start justify-between group">
                <div class="flex items-start flex-1">
                  <span class="text-gray-700" data-editable>${sanitizer.renderSafeHTML(member)}</span>
                </div>
                <button class="edit-btn hidden p-1 text-gray-400 hover:text-orange-500 transition-colors ml-2" 
                        data-edit-type="uipath-team" data-edit-id="${stageIndex}-${i}">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                  </svg>
                </button>
              </li>
            `).join('')}
            <!-- Add New UiPath Team Member Button -->
            <li>
              <button class="edit-btn hidden w-full mt-3 p-2 border-2 border-dashed border-orange-300 rounded-lg text-orange-500 hover:border-orange-400 hover:bg-orange-50 transition-colors" 
                      data-edit-type="new-uipath-team" data-edit-id="${stageIndex}">
                <div class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Team Member
                </div>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Key Resources -->
      <div class="bg-white rounded-lg shadow-lg mb-6">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="key-resources">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-green-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-green-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Key Resources
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div id="stage-resources-container-${stageIndex}" class="grid lg:grid-cols-3 gap-6">
            <!-- Filtered resources will be rendered here by ResourceManager -->
          </div>
        </div>
      </div>

      <!-- Discovery Questions -->
      <div class="bg-white rounded-lg shadow-lg mb-6 discovery-questions-section">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="discovery-questions">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-purple-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-purple-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Key Discovery Questions
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid md:grid-cols-2 gap-4">
            ${Object.entries(stage.questions || {}).map(([category, questions]) => `
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-700 mb-3 text-left">${sanitizer.renderSafeHTML(category)}</h4>
                <div class="space-y-3">
                  ${questions.map((q, i) => {
                    const noteId = `stage-${stageIndex}-q-${category.replace(/\s+/g, '-')}-${i}`;
                    return `
                      <details class="bg-white rounded border border-gray-200 question-details">
                        <summary class="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700 text-sm flex items-center justify-between">
                          <span class="text-left flex-1" data-editable>${sanitizer.renderSafeHTML(q)}</span>
                          <button class="edit-btn hidden p-1 text-gray-400 hover:text-purple-600 transition-colors ml-2" 
                                  data-edit-type="question" data-edit-id="${stageIndex}-${category}-${i}">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                            </svg>
                          </button>
                        </summary>
                        <div class="p-3 pt-0 space-y-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Your Notes & Customer Response:</label>
                            <textarea class="note-textarea w-full p-2 border border-gray-300 rounded text-sm resize-none" 
                                     rows="3" 
                                     placeholder="Capture customer responses and your notes here..."
                                     data-note-id="${noteId}"></textarea>
                          </div>
                          <div class="flex justify-end">
                            <button class="ai-question-response-btn px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition-colors flex items-center"
                                    data-question="${encodeURIComponent(q)}" data-note-id="${noteId}">
                              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                              </svg>
                              AI Response
                            </button>
                          </div>
                        </div>
                      </details>
                    `;
                  }).join('')}
                  <!-- Add New Question Button -->
                  <button class="edit-btn hidden w-full mt-3 p-2 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition-colors" 
                          data-edit-type="new-question" data-edit-id="${stageIndex}" data-category="${category}">
                    <div class="flex items-center justify-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Add New Question
                    </div>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Common Objections -->
      <div class="bg-white rounded-lg shadow-lg mb-6 objections-section">
        <div class="collapsible-header p-6 cursor-pointer hover:bg-gray-50 transition-colors" data-section="objections">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <svg class="chevron-icon w-5 h-5 mr-3 text-red-600 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <h3 class="text-xl font-bold text-red-600 flex items-center">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Common Objections
              </h3>
            </div>
          </div>
        </div>
        <div class="collapsible-content hidden px-6 pb-6">
          <div class="grid md:grid-cols-2 gap-4">
            ${(stage.objections || []).map((objection, i) => {
              const objectionId = `stage-${stageIndex}-obj-${i}`;
              return `
                <div class="bg-gray-50 p-4 rounded-lg">
                  <details class="bg-white rounded border border-gray-200 objection-details">
                    <summary class="p-3 cursor-pointer hover:bg-gray-50 font-medium text-gray-700 text-sm flex items-center justify-between">
                      <span class="text-left flex-1" data-editable>${sanitizer.renderSafeHTML(objection.q)}</span>
                      <button class="edit-btn hidden p-1 text-gray-400 hover:text-red-600 transition-colors ml-2" 
                              data-edit-type="objection-question" data-edit-id="${stageIndex}-${i}">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                        </svg>
                      </button>
                    </summary>
                    <div class="p-3 pt-0 space-y-3">
                      <div class="bg-green-50 p-3 rounded-lg border border-green-100 relative">
                        <div class="flex items-start justify-between">
                          <h5 class="text-sm font-semibold text-green-700 mb-2 flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Suggested Response:
                          </h5>
                          <button class="edit-btn hidden p-1 text-gray-400 hover:text-green-600 transition-colors" 
                                  data-edit-type="objection-answer" data-edit-id="${stageIndex}-${i}">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path>
                            </svg>
                          </button>
                        </div>
                        <p class="text-sm text-gray-700" data-editable>${sanitizer.renderSafeHTML(objection.a)}</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-600 mb-1">Your Custom Response & Notes:</label>
                        <textarea class="note-textarea w-full p-2 border border-gray-300 rounded text-sm resize-none" 
                                 rows="3" 
                                 placeholder="Add your own response strategy and notes for this objection..."
                                 data-note-id="${objectionId}"></textarea>
                      </div>
                      <div class="flex justify-end">
                        <button class="ai-objection-response-btn px-3 py-1.5 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition-colors flex items-center"
                                data-objection="${encodeURIComponent(objection.q)}" 
                                data-context="${encodeURIComponent(objection.a)}"
                                data-note-id="${objectionId}">
                          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                          </svg>
                          AI Response
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              `;
            }).join('')}
            <!-- Add New Objection Button -->
            <div class="edit-btn hidden col-span-2 mt-4">
              <button class="w-full p-4 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors" 
                      data-edit-type="new-objection" data-edit-id="${stageIndex}">
                <div class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add New Objection
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between items-center">
        <button class="nav-prev px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors
                       ${stageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
          ← Previous Stage
        </button>
        
        <div class="flex gap-3">
          <button class="export-notes-btn px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy Notes
          </button>
          <button class="clear-all-btn px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors">
            Clear All
          </button>
        </div>
        
        <button class="nav-next px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors
                       ${stageIndex === SALES_CYCLE_DATA.stages.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}">
          Next Stage →
        </button>
      </div>
    `;
    
    container.innerHTML = contentHTML;
    
    // Render filtered resources in the stage Key Resources section
    if (this.resourceManager) {
      const context = this.getSelectionContext();
      const filteredResources = this.resourceManager.getFilteredResources(context);
      this.resourceManager.renderStageResources(filteredResources, `stage-resources-container-${stageIndex}`);
    }
    
    // Restore checkbox states
    this.restoreFormState(stageIndex);
  }

  restoreFormState(stageIndex) {
    // Restore checkboxes
    appState.state.checkboxes.forEach((checked, checkboxId) => {
      if (checkboxId.startsWith(`stage-${stageIndex}-`)) {
        const checkbox = $(`[data-id="${checkboxId}"]`);
        if (checkbox) {
          checkbox.checked = checked;
          checkbox.closest('label')?.classList.toggle('checked-item', checked);
        }
      }
    });
    
    // Restore notes
    appState.state.notes.forEach((content, noteId) => {
      if (noteId.startsWith(`stage-${stageIndex}-`)) {
        const textarea = $(`[data-note-id="${noteId}"]`);
        if (textarea) {
          textarea.value = content;
        }
      }
    });
  }

  updateTimelineUI(stageIndex) {
    // Re-render timeline to show updated active state
    this.renderTimeline();
  }

  navigateToPreviousStage() {
    const currentStage = appState.get('currentStage') || 0;
    if (currentStage > 0) {
      appState.set('currentStage', currentStage - 1);
    }
  }

  navigateToNextStage() {
    const currentStage = appState.get('currentStage') || 0;
    if (SALES_CYCLE_DATA.stages && currentStage < SALES_CYCLE_DATA.stages.length - 1) {
      appState.set('currentStage', currentStage + 1);
    }
  }

  toggleAdminMode() {
    const currentMode = appState.get('adminMode');
    appState.set('adminMode', !currentMode);
  }

  updateAdminUI(enabled) {
    const adminBtn = $('#admin-mode-btn');
    const adminStatus = $('#admin-status');
    
    if (adminBtn) {
      adminBtn.textContent = enabled ? 'Exit Edit Mode' : 'Enter Edit Mode';
      adminBtn.classList.toggle('bg-orange-600', enabled);
      adminBtn.classList.toggle('text-white', enabled);
    }
    
    if (adminStatus) {
      adminStatus.classList.toggle('hidden', !enabled);
    }

    // Show/hide all edit buttons
    $$('.edit-btn').forEach(btn => {
      btn.classList.toggle('hidden', !enabled);
    });
  }

  handleEditClick(button) {
    const editType = button.dataset.editType;
    const editId = button.dataset.editId;
    const editField = button.dataset.editField;
    
    // Find the content element and data
    const contentElement = button.parentElement.querySelector('[data-editable]') || 
                          button.previousElementSibling ||
                          button.nextElementSibling;
    
    if (!contentElement) {
      console.error('Could not find content element for editing');
      return;
    }

    // Prepare edit data based on type
    let editData = {};
    
    switch (editType) {
      case 'persona-field':
        editData = this.getPersonaEditData(editId, editField);
        break;
      case 'outcome':
        editData = this.getOutcomeEditData(editId);
        break;
      case 'question':
        editData = this.getQuestionEditData(editId);
        break;
      case 'objection-question':
      case 'objection-answer':
        editData = this.getObjectionEditData(editId, editType);
        break;
      case 'resource':
        editData = this.getResourceEditData(editId);
        break;
      case 'initial-persona':
        editData = this.getInitialPersonaEditData(editId);
        break;
      case 'uipath-team':
        editData = this.getUipathTeamEditData(editId);
        break;
      case 'use-case-category':
        editData = this.getUseCaseCategoryEditData(editId);
        break;
      case 'use-case-item':
        editData = this.getUseCaseItemEditData(editId);
        break;
    }

    // Open editor
    this.contentEditor.openEditor(editType, editData, contentElement);
  }

  getPersonaEditData(personaIndex, field) {
    const currentIndustry = appState.get('currentIndustry');
    const persona = SALES_CYCLE_DATA.personas[currentIndustry][personaIndex];
    return {
      persona,
      field,
      content: persona[field]
    };
  }

  getOutcomeEditData(outcomeId) {
    const [stageIndex, outcomeIndex] = outcomeId.split('-').map(Number);
    const outcome = SALES_CYCLE_DATA.stages[stageIndex].outcomes[outcomeIndex];
    return {
      outcome,
      text: outcome
    };
  }

  getQuestionEditData(questionId) {
    const [stageIndex, category, questionIndex] = questionId.split('-');
    const question = SALES_CYCLE_DATA.stages[stageIndex].questions[category][questionIndex];
    return {
      question,
      text: question
    };
  }

  getObjectionEditData(objectionId, type) {
    const [stageIndex, objectionIndex] = objectionId.split('-').map(Number);
    const objection = SALES_CYCLE_DATA.stages[stageIndex].objections[objectionIndex];
    return {
      objection,
      question: objection.q,
      answer: objection.a
    };
  }

  getResourceEditData(resourceId) {
    const [stageIndex, resourceIndex] = resourceId.split('-').map(Number);
    const currentIndustry = appState.get('currentIndustry');
    const resource = SALES_CYCLE_DATA.stages[stageIndex].resources[currentIndustry][resourceIndex];
    return {
      resource,
      name: resource.name
    };
  }

  getInitialPersonaEditData(personaId) {
    const [stageIndex, personaIndex] = personaId.split('-').map(Number);
    const persona = SALES_CYCLE_DATA.stages[stageIndex].initialPersonas[personaIndex];
    return {
      list: SALES_CYCLE_DATA.stages[stageIndex].initialPersonas,
      index: personaIndex,
      text: persona
    };
  }

  getUipathTeamEditData(memberId) {
    const [stageIndex, memberIndex] = memberId.split('-').map(Number);
    const member = SALES_CYCLE_DATA.stages[stageIndex].uipathTeam[memberIndex];
    return {
      list: SALES_CYCLE_DATA.stages[stageIndex].uipathTeam,
      index: memberIndex,
      text: member
    };
  }

  getUseCaseCategoryEditData(editId) {
    // For static data editing - this is a simplified version
    // In a full implementation, this would reference actual stored data
    return {
      categoryData: { category: 'Category Name' },
      category: 'Category Name'
    };
  }

  getUseCaseItemEditData(editId) {
    // For static data editing - this is a simplified version
    // In a full implementation, this would reference actual stored data
    return {
      useCaseData: { name: 'Use Case Name' },
      name: 'Use Case Name'
    };
  }

  updateIndustryUI(industry) {
    $$('.industry-btn').forEach(btn => {
      const isActive = btn.dataset.industry === industry;
      btn.classList.toggle('bg-orange-600', isActive);
      btn.classList.toggle('text-white', isActive);
      btn.classList.toggle('bg-white', !isActive);
      btn.classList.toggle('text-gray-700', !isActive);
    });
    
    this.renderPersonas();
    this.renderUseCases();
  }

  async handleExportNotes() {
    try {
      const notes = this.collectAllNotes();
      
      if (!notes.trim()) {
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
    
    SALES_CYCLE_DATA.stages.forEach((stage, index) => {
      const stageNotes = [];
      
      notesMap.forEach((value, key) => {
        if (key.startsWith(`stage-${index}-`) && value.trim()) {
          stageNotes.push(`- ${value.trim()}`);
        }
      });
      
      if (stageNotes.length > 0) {
        notes.push(`\n=== Stage ${index + 1}: ${stage.title} ===\n${stageNotes.join('\n')}`);
      }
    });
    
    return notes.join('\n\n').trim();
  }

  handleClearAll() {
    if (confirm('Are you sure you want to clear all checkboxes and notes? This cannot be undone.')) {
      appState.clearFormState();
      
      $$('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('label')?.classList.remove('checked-item');
      });
      
      $$('.note-textarea').forEach(textarea => {
        textarea.value = '';
      });
      
      this.showNotification('All data cleared', 'success');
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 animate-slideIn ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>' :
            type === 'warning' ? '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>' :
            type === 'error' ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>' :
            '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  async handleAIResponse(button) {
    const question = decodeURIComponent(button.dataset.question);
    const noteId = button.dataset.noteId;
    const textarea = $(`[data-note-id="${noteId}"]`);
    
    if (!question || !textarea) {
      this.showError('Unable to process AI response request');
      return;
    }

    // Check if AI integration is available
    if (!this.isAIAvailable()) {
      this.showAISetupModal();
      return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;

    try {
      const context = this.buildAIContext(question);
      const response = await this.generateAIResponse(question, context);
      
      // Append response to existing notes or create new
      const existingNotes = textarea.value.trim();
      const newContent = existingNotes 
        ? `${existingNotes}\n\n--- AI Response ---\n${response}`
        : `--- AI Response ---\n${response}`;
      
      textarea.value = newContent;
      
      // Update state
      appState.updateNote(noteId, newContent);
      
      this.showNotification('AI response generated successfully!', 'success');
    } catch (error) {
      console.error('AI response generation failed:', error);
      this.showError('Failed to generate AI response. Please check your API key and try again.');
    } finally {
      // Reset button
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  isAIAvailable() {
    // Check for stored API key (simplified version)
    const apiKey = sessionStorage.getItem('claude_api_key');
    return apiKey && apiKey.length > 0;
  }

  buildAIContext(question) {
    const currentIndustry = appState.get('currentIndustry');
    const currentStage = appState.get('currentStage') || 0;
    const stageName = SALES_CYCLE_DATA.stages[currentStage]?.title || 'Unknown Stage';
    
    return {
      industry: currentIndustry,
      stage: stageName,
      question: question
    };
  }

  async generateAIResponse(question, context) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const prompt = `You are a UiPath sales expert helping with ${context.industry} industry prospects in the ${context.stage} stage.

Question: "${question}"

Please provide a helpful response that:
1. Suggests what to listen for in the customer's answer
2. Provides follow-up questions to ask
3. Identifies potential objections or concerns
4. Suggests how UiPath's solutions address this area

Keep your response concise and actionable (2-3 paragraphs maximum).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }

  showAISetupModal() {
    // Create a simple modal for API key setup
    const modalHTML = `
      <div id="ai-setup-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">AI Response Setup</h3>
          <p class="text-sm text-gray-600 mb-4">
            To use AI-powered responses, please enter your Claude API key. Your key is stored securely in your browser session.
          </p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Claude API Key</label>
              <input type="password" id="ai-api-key" placeholder="sk-ant-api03-..." 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <p class="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://console.anthropic.com" target="_blank" class="text-blue-600 hover:underline">console.anthropic.com</a>
              </p>
            </div>
            <div class="flex justify-end space-x-3">
              <button id="ai-setup-cancel" class="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button id="ai-setup-save" class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = $('#ai-setup-modal');
    const cancelBtn = $('#ai-setup-cancel');
    const saveBtn = $('#ai-setup-save');
    const apiKeyInput = $('#ai-api-key');
    
    const closeModal = () => {
      modal?.remove();
    };
    
    cancelBtn?.addEventListener('click', closeModal);
    
    saveBtn?.addEventListener('click', () => {
      const apiKey = apiKeyInput?.value.trim();
      if (apiKey) {
        sessionStorage.setItem('claude_api_key', apiKey);
        this.showNotification('API key saved! You can now use AI responses.', 'success');
        closeModal();
      } else {
        this.showError('Please enter a valid API key');
      }
    });
    
    // Close on outside click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  async handleAIObjectionResponse(button) {
    const objection = decodeURIComponent(button.dataset.objection);
    const context = decodeURIComponent(button.dataset.context);
    const noteId = button.dataset.noteId;
    const textarea = document.querySelector(`[data-note-id="${noteId}"]`);
    
    if (!objection || !textarea) {
      this.showError('Unable to process AI objection response request');
      return;
    }

    // Check if AI integration is available
    if (!this.isAIAvailable()) {
      this.showAISetupModal();
      return;
    }

    // Show loading state
    const originalText = button.textContent;
    button.textContent = 'Generating...';
    button.disabled = true;

    try {
      const response = await this.generateAIObjectionResponse(objection, context);
      
      // Append response to existing notes or create new
      const existingNotes = textarea.value.trim();
      const newContent = existingNotes 
        ? `${existingNotes}\n\n--- AI Enhanced Response ---\n${response}`
        : `--- AI Enhanced Response ---\n${response}`;
      
      textarea.value = newContent;
      
      // Update state
      appState.updateNote(noteId, newContent);
      
      this.showNotification('AI objection response generated successfully!', 'success');
    } catch (error) {
      console.error('AI objection response generation failed:', error);
      this.showError('Failed to generate AI response. Please check your API key and try again.');
    } finally {
      // Reset button
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  async generateAIObjectionResponse(objection, suggestedResponse) {
    const apiKey = sessionStorage.getItem('claude_api_key');
    if (!apiKey) {
      throw new Error('No API key available');
    }

    const currentStage = this.stages[appState.getState().currentStage];
    const stageContext = this.buildAIContext('objection handling');

    const prompt = `You are a UiPath sales expert helping handle objections in the ${stageContext.stage} stage for ${stageContext.industry} industry prospects.

Objection: "${objection}"
Suggested Response: "${suggestedResponse}"

Please provide an enhanced response strategy that:
1. Acknowledges the customer's concern with empathy
2. Builds on or improves the suggested response
3. Provides specific UiPath value propositions that address this objection
4. Includes follow-up questions to continue the conversation
5. Suggests concrete next steps or proof points

Keep your response practical and conversation-ready (2-3 paragraphs maximum).`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 600,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  }
}

// Initialize application
const timelineApp = new TimelineUiPathApp();

// Export for debugging
if (typeof window !== 'undefined') {
  window.TimelineApp = timelineApp;
  window.appState = appState;
}

// ==================== USE CASE PDF FUNCTIONALITY ====================
class UseCasePDFHandler {
  constructor() {
    this.pdfFileName = 'FINS - MAESTRO - Use Case Deck- Aug 2025.pdf';
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    document.addEventListener('click', (e) => {
      const useCaseButton = e.target.closest('.use-case-link');
      const lobUseCaseButton = e.target.closest('.lob-use-case-link');
      
      if (useCaseButton) {
        e.preventDefault();
        this.handleUseCaseClick(useCaseButton);
      } else if (lobUseCaseButton) {
        e.preventDefault();
        this.handleUseCaseClick(lobUseCaseButton);
      }
    });
  }

  async handleUseCaseClick(button) {
    const pageNumber = button.dataset.page;
    const useCaseName = button.dataset.name || button.textContent.trim().replace('• ', '');
    
    if (!pageNumber) {
      this.showNotification('Page number not found for this use case', 'error');
      return;
    }

    try {
      // Show loading state
      button.style.opacity = '0.6';
      button.disabled = true;
      
      // Show the slide image modal
      this.showSlideModal(pageNumber, useCaseName);
      
    } catch (error) {
      console.error('Error opening PDF viewer:', error);
      this.showNotification(`Unable to open PDF viewer`, 'error');
    } finally {
      // Reset button state  
      button.style.opacity = '1';
      button.disabled = false;
    }
  }

  showSlideModal(pageNumber, useCaseName) {
    // Close any existing modal
    if (window.currentSlideModal) {
      window.currentSlideModal.remove();
    }
    
    // Create the slide modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center';
    
    modal.innerHTML = `
      <div class="relative bg-white rounded-lg shadow-xl max-w-6xl max-h-[95vh] w-full mx-4 flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">${useCaseName}</h3>
            <p class="text-sm text-gray-600">Page ${pageNumber} - UiPath Use Case Deck</p>
          </div>
          <button type="button" class="modal-close text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Image Container -->
        <div class="flex-1 p-4 flex items-center justify-center overflow-hidden">
          <div class="relative w-full h-full flex items-center justify-center">
            <div id="slide-loading" class="text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
              <p class="text-gray-600">Loading slide...</p>
            </div>
            <img id="slide-image" src="" alt="${useCaseName} - Page ${pageNumber}" 
                 class="hidden max-w-full max-h-full object-contain rounded-lg shadow-lg"
                 onload="document.getElementById('slide-loading').classList.add('hidden'); this.classList.remove('hidden');"
                 onerror="this.parentElement.innerHTML='<div class=\\"text-center\\"><div class=\\"text-red-600 mb-2\\"><svg class=\\"w-12 h-12 mx-auto mb-2\\" fill=\\"currentColor\\" viewBox=\\"0 0 20 20\\"><path fill-rule=\\"evenodd\\" d=\\"M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z\\" clip-rule=\\"evenodd\\"></path></svg></div><h4 class=\\"font-semibold text-gray-900 mb-2\\">Slide Image Not Available</h4><p class=\\"text-gray-600 mb-4\\">The slide image for page ${pageNumber} hasn\\'t been uploaded yet.</p><div class=\\"space-y-2\\"><button onclick=\\"window.useCasePDFHandler.contactSupport(\\'${useCaseName}\\', \\'${pageNumber}\\')\\" class=\\"inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors\\"><svg class=\\"w-4 h-4 mr-2\\" fill=\\"currentColor\\" viewBox=\\"0 0 20 20\\"><path d=\\"M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z\\"></path><path d=\\"m18 8.118-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z\\"></path></svg>Request Slide</button></div></div>';">
          </div>
        </div>
        
        <!-- Footer -->
        <div class="flex justify-between items-center p-4 border-t border-gray-200 bg-gray-50">
          <div class="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Right-click the image to save or copy for your presentation
          </div>
          <div class="flex gap-2">
            <button type="button" class="contact-support-btn px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" onclick="window.useCasePDFHandler.contactSupport('${useCaseName}', '${pageNumber}')">
              Request Details
            </button>
            <button type="button" class="modal-close px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Set the image source - try multiple possible formats
    const slideImage = modal.querySelector('#slide-image');
    const possibleExtensions = ['png', 'jpg', 'jpeg'];
    let currentExtensionIndex = 0;
    
    const tryNextExtension = () => {
      if (currentExtensionIndex < possibleExtensions.length) {
        const ext = possibleExtensions[currentExtensionIndex];
        slideImage.src = `assets/slides/page-${pageNumber}.${ext}`;
        currentExtensionIndex++;
      }
    };
    
    // Start with first extension
    tryNextExtension();
    
    // If image fails to load, try next extension
    slideImage.addEventListener('error', () => {
      if (currentExtensionIndex < possibleExtensions.length) {
        tryNextExtension();
      }
    });
    
    // Add event listeners for closing
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.modal-close')) {
        modal.remove();
        window.currentSlideModal = null;
      }
    });
    
    // ESC key support
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        window.currentSlideModal = null;
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    // Store reference and show modal
    window.currentSlideModal = modal;
    document.body.appendChild(modal);
  }

  openPDFViewer(pageNumber, useCaseName) {
    // Create an inline modal for PDF viewing
    this.createPDFViewerModal(pageNumber, useCaseName);
    this.showNotification(`Opening ${useCaseName} (Page ${pageNumber})`, 'success');
  }

  createPDFViewerModal(pageNumber, useCaseName) {
    // Remove existing modal if any
    const existingModal = document.getElementById('pdf-viewer-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.id = 'pdf-viewer-modal';
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    
    const pdfPath = '/Users/eric.bouchard/Downloads/FINS - MAESTRO - Use Case Deck- Aug 2025.pdf';
    
    modal.innerHTML = `
      <div class="relative top-4 mx-auto p-4 border w-full max-w-6xl shadow-lg rounded-md bg-white" style="height: 90vh;">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-medium text-gray-900">${this.escapeHtml(useCaseName)}</h3>
            <p class="text-sm text-gray-600">Document page ${pageNumber}</p>
          </div>
          <div class="flex items-center space-x-3">
            <button onclick="this.openDirectPDF()" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              Open in System Viewer
            </button>
            <button onclick="document.getElementById('pdf-viewer-modal').remove()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="h-full pb-16">
          <div id="pdf-frame-container" class="h-full">
            <div class="bg-gray-100 rounded-lg p-8 h-full flex items-center justify-center">
              <div class="text-center max-w-md">
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div class="flex items-center mb-4">
                    <svg class="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h4 class="text-lg font-medium text-blue-900">${this.escapeHtml(useCaseName)}</h4>
                  </div>
                  <div class="text-sm text-blue-800 space-y-3">
                    <p><strong>Document:</strong> ${this.pdfFileName}</p>
                    <p><strong>Page Reference:</strong> ${pageNumber}</p>
                    <div class="bg-blue-100 border border-blue-300 rounded p-3 mt-4">
                      <p class="text-blue-900 font-medium mb-2">📄 Use Case Details:</p>
                      <p class="text-blue-800">Please refer to <strong>page ${pageNumber}</strong> in your UiPath use case document for detailed information about this use case.</p>
                    </div>
                  </div>
                  <div class="mt-6 space-y-3">
                    <button onclick="window.useCasePDFHandler.openPDFInstructions('${pageNumber}', '${this.escapeHtml(useCaseName)}')" class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                      📖 View PDF Instructions
                    </button>
                    <button onclick="window.useCasePDFHandler.contactSupport('${this.escapeHtml(useCaseName)}', '${pageNumber}')" class="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                      💬 Request Use Case Details
                    </button>
                    <p class="text-xs text-blue-600 text-center">
                      Need help accessing the PDF or want more details about this use case?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event handlers
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Store reference for cleanup
    window.currentPDFModal = modal;

    document.body.appendChild(modal);
  }

  openPDFInstructions(pageNumber, useCaseName) {
    // Close current modal
    if (window.currentPDFModal) {
      window.currentPDFModal.remove();
    }
    
    // Create instructions modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
      <div class="relative top-4 mx-auto p-4 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">📖 How to Access ${this.escapeHtml(useCaseName)}</h3>
          <button onclick="this.remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="space-y-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 class="font-semibold text-blue-900 mb-3">📄 Document Information</h4>
            <ul class="space-y-2 text-sm text-blue-800">
              <li><strong>Document:</strong> ${this.pdfFileName}</li>
              <li><strong>Page Number:</strong> ${pageNumber}</li>
              <li><strong>Use Case:</strong> ${this.escapeHtml(useCaseName)}</li>
            </ul>
          </div>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 class="font-semibold text-green-900 mb-3">💡 How to Access the PDF</h4>
            <ol class="space-y-2 text-sm text-green-800 list-decimal list-inside">
              <li>Request the <strong>${this.pdfFileName}</strong> from your UiPath sales representative</li>
              <li>Download and save the PDF to your computer</li>
              <li>Open the PDF and navigate to <strong>page ${pageNumber}</strong></li>
              <li>Find the detailed information about <strong>${this.escapeHtml(useCaseName)}</strong></li>
            </ol>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 class="font-semibold text-yellow-900 mb-3">📞 Need Help?</h4>
            <p class="text-sm text-yellow-800">
              Contact your UiPath sales team or use the "Request Use Case Details" button to get more information about this specific use case.
            </p>
          </div>
        </div>
      </div>
    `;
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
  }
  
  contactSupport(useCaseName, pageNumber) {
    // Close current modal  
    if (window.currentPDFModal) {
      window.currentPDFModal.remove();
    }
    
    const subject = encodeURIComponent(`Use Case Request: ${useCaseName}`);
    const body = encodeURIComponent(`Hi,

I would like more information about the following use case:

Use Case: ${useCaseName}
Document: ${this.pdfFileName} 
Page Reference: ${pageNumber}

Could you please provide:
1. Detailed information about this use case
2. Access to the complete use case document
3. Implementation examples or customer success stories

Thank you!`);
    
    // Try to open default email client
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    
    try {
      window.location.href = mailtoUrl;
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Use Case Request: ${useCaseName}\nDocument: ${this.pdfFileName}\nPage: ${pageNumber}`).then(() => {
        this.showNotification('Request details copied to clipboard!', 'success');
      }).catch(() => {
        this.showNotification('Please contact your UiPath sales representative for more details about this use case.', 'info');
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showNotification(message, type = 'info') {
    // Reuse the existing notification system
    if (window.appInstance && window.appInstance.notificationManager) {
      window.appInstance.notificationManager.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize PDF handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.useCasePDFHandler = new UseCasePDFHandler();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .animate-slideIn { animation: slideIn 0.3s ease-out; }
  @keyframes ping {
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .use-case-link {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .use-case-link:hover {
    transform: translateX(2px);
  }
`;
document.head.appendChild(style);

// ==================== LLM PROMPT BAR ====================
class LLMPromptBar {
  constructor() {
    this.promptHistory = this.loadPromptHistory();
    this.currentContext = 'general';
    this.initializeEventListeners();
    this.updateContextualPrompts();
  }

  initializeEventListeners() {
    const promptInput = document.getElementById('llm-prompt-input');
    const sendBtn = document.getElementById('llm-send-btn');
    const quickBtns = document.querySelectorAll('.llm-quick-btn');

    // Send button click
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        this.handlePromptSubmit();
      });
    }

    // Enter key in input
    if (promptInput) {
      promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handlePromptSubmit();
        }
      });
    }


    // Quick action buttons
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('company-research-btn')) {
          this.showCompanyResearchModal();
        } else if (btn.classList.contains('competitive-analysis-btn')) {
          this.showCompetitiveAnalysisModal();
        } else {
          const prompt = btn.dataset.prompt;
          if (promptInput) {
            promptInput.value = prompt;
            this.handlePromptSubmit();
          }
        }
      });
    });

    // Company Research Modal Event Listeners
    this.initializeCompanyResearchModal();
    
    // Competitive Analysis Modal Event Listeners
    this.initializeCompetitiveAnalysisModal();
  }

  handlePromptSubmit() {
    const promptInput = document.getElementById('llm-prompt-input');
    const prompt = promptInput?.value.trim();

    if (!prompt) {
      this.showNotification('Please enter a question or prompt', 'warning');
      return;
    }

    // Track prompt usage for analytics
    this.trackPromptUsage(prompt);

    // Check if the existing AI chatbot is available
    if (window.chatbot && typeof window.chatbot.handleUserMessage === 'function') {
      // Clear the input
      if (promptInput) {
        promptInput.value = '';
      }
      
      // Show the chatbot and send the message
      const chatModal = document.getElementById('ai-chat-modal');
      
      if (chatModal) {
        // Open the chatbot modal
        chatModal.classList.remove('hidden');
        
        // Send the message to the chatbot
        setTimeout(() => {
          window.chatbot.handleUserMessage(prompt);
        }, 300);
        
        this.showNotification('Question sent to AI assistant!', 'success');
      } else {
        this.showNotification('AI chatbot is not available. Please try again later.', 'error');
      }
    } else {
      this.showNotification('AI assistant is not available. Please check your settings.', 'error');
    }
  }


  showNotification(message, type = 'info') {
    // Reuse the existing notification system if available
    if (window.appInstance && window.appInstance.notificationManager) {
      window.appInstance.notificationManager.showNotification(message, type);
    } else {
      // Fallback notification
      console.log(`${type.toUpperCase()}: ${message}`);
      alert(message);
    }
  }

  // ==================== ANALYTICS & TRACKING ====================
  trackPromptUsage(prompt) {
    const timestamp = new Date().toISOString();
    const context = this.getCurrentContext();
    
    const usage = {
      prompt: prompt,
      timestamp: timestamp,
      context: context,
      length: prompt.length,
      category: this.categorizePrompt(prompt)
    };
    
    // Store in localStorage for analytics
    this.promptHistory.push(usage);
    
    // Keep only last 100 prompts
    if (this.promptHistory.length > 100) {
      this.promptHistory = this.promptHistory.slice(-100);
    }
    
    localStorage.setItem('llm_prompt_history', JSON.stringify(this.promptHistory));
    
    // Update contextual suggestions based on usage
    this.updateQuickActions();
  }

  loadPromptHistory() {
    try {
      const history = localStorage.getItem('llm_prompt_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load prompt history:', error);
      return [];
    }
  }

  categorizePrompt(prompt) {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('objection') || lower.includes('handle') || lower.includes('overcome')) {
      return 'objections';
    } else if (lower.includes('persona') || lower.includes('decision maker') || lower.includes('stakeholder')) {
      return 'personas';
    } else if (lower.includes('discovery') || lower.includes('question') || lower.includes('ask')) {
      return 'discovery';
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('budget')) {
      return 'pricing';
    } else if (lower.includes('compete') || lower.includes('competitor') || lower.includes('vs')) {
      return 'competitive';
    } else if (lower.includes('demo') || lower.includes('show') || lower.includes('present')) {
      return 'demonstration';
    } else {
      return 'general';
    }
  }

  getCurrentContext() {
    // Determine current context based on page state
    const currentStage = window.appState?.get('currentStage') || 0;
    const currentIndustry = window.appState?.get('currentIndustry') || 'banking';
    
    return {
      stage: currentStage,
      industry: currentIndustry,
      section: this.getVisibleSection()
    };
  }

  getVisibleSection() {
    // Detect which section is currently expanded/visible
    const expandedSections = document.querySelectorAll('.collapsible-content:not(.hidden)');
    if (expandedSections.length > 0) {
      const section = expandedSections[0].closest('[class*="section"]');
      if (section) {
        if (section.classList.contains('discovery-questions-section')) return 'discovery';
        if (section.classList.contains('objections-section')) return 'objections';
      }
    }
    return 'timeline';
  }

  updateContextualPrompts() {
    // Update quick action buttons based on current context
    setTimeout(() => {
      const context = this.getCurrentContext();
      const quickBtns = document.querySelectorAll('.llm-quick-btn');
      
      // Get contextual prompts
      const contextualPrompts = this.getContextualPrompts(context);
      
      // Update button text and prompts
      quickBtns.forEach((btn, index) => {
        if (contextualPrompts[index]) {
          btn.textContent = contextualPrompts[index].label;
          btn.dataset.prompt = contextualPrompts[index].prompt;
        }
      });
    }, 500);
  }

  getContextualPrompts(context) {
    const stageNames = ['Discovery', 'Technical Evaluation', 'Business Case', 'Negotiation', 'Close'];
    const currentStageName = stageNames[context.stage] || 'Discovery';
    
    const prompts = {
      discovery: [
        { label: '🔍 Discovery', prompt: `What are the best discovery questions for the ${currentStageName} stage?` },
        { label: '👥 Personas', prompt: `Who are the key personas I should engage during ${currentStageName}?` },
        { label: '⚠️ Risks', prompt: `What risks should I watch for in the ${currentStageName} stage?` }
      ],
      objections: [
        { label: '💬 Handle', prompt: 'How do I handle the most common objections in this stage?' },
        { label: '🎯 Reframe', prompt: 'How can I reframe this objection as an opportunity?' },
        { label: '📊 Evidence', prompt: 'What evidence or proof points help overcome objections?' }
      ],
      timeline: [
        { label: '🚀 Strategy', prompt: `What's the best strategy for the ${currentStageName} stage?` },
        { label: '✅ Success', prompt: `What are the key success factors for ${currentStageName}?` },
        { label: '⏰ Timeline', prompt: `How long should the ${currentStageName} stage typically take?` }
      ]
    };
    
    return prompts[context.section] || prompts.timeline;
  }

  updateQuickActions() {
    // Analyze prompt history and update quick actions with popular queries
    if (this.promptHistory.length < 5) return;
    
    const categories = {};
    this.promptHistory.slice(-20).forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    
    // Update context based on popular categories
    const topCategories = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
      
    console.log('Popular prompt categories:', topCategories);
  }

  // ==================== POPULAR PROMPTS ====================
  getPopularPrompts() {
    return [
      "How do I handle pricing objections effectively?",
      "What questions should I ask to qualify this opportunity?",
      "How do I position UiPath against competitors?",
      "What ROI metrics should I focus on?",
      "How do I identify the real decision maker?",
      "What are the best demo scenarios for this industry?",
      "How do I create urgency in the sales process?",
      "What evidence do I need to build a business case?"
    ];
  }

  // ==================== COMPANY RESEARCH FUNCTIONALITY ====================
  initializeCompanyResearchModal() {
    const modal = document.getElementById('company-research-modal');
    const closeBtn = document.getElementById('company-research-close');
    const cancelBtn = document.getElementById('company-research-cancel');
    const startBtn = document.getElementById('company-research-start');
    const urlInput = document.getElementById('company-url-input');

    // Close modal event listeners
    [closeBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.hideCompanyResearchModal();
        });
      }
    });

    // Click outside modal to close
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideCompanyResearchModal();
        }
      });
    }

    // Start research button
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.handleCompanyResearch();
      });
    }

    // Enter key in URL input
    if (urlInput) {
      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleCompanyResearch();
        }
      });
    }
  }

  showCompanyResearchModal() {
    const modal = document.getElementById('company-research-modal');
    const urlInput = document.getElementById('company-url-input');
    
    if (modal) {
      modal.classList.remove('hidden');
      // Focus the input field
      if (urlInput) {
        setTimeout(() => urlInput.focus(), 100);
      }
    }
  }

  hideCompanyResearchModal() {
    const modal = document.getElementById('company-research-modal');
    const urlInput = document.getElementById('company-url-input');
    
    if (modal) {
      modal.classList.add('hidden');
      // Clear the input
      if (urlInput) {
        urlInput.value = '';
      }
      // Reset button state
      this.resetResearchButton();
    }
  }

  async handleCompanyResearch() {
    const urlInput = document.getElementById('company-url-input');
    const url = urlInput?.value.trim();

    if (!url) {
      this.showNotification('Please enter a valid company URL', 'warning');
      return;
    }

    if (!this.isValidUrl(url)) {
      this.showNotification('Please enter a valid URL format', 'warning');
      return;
    }

    try {
      // Show loading state
      this.setResearchButtonLoading(true);

      // Perform company research
      const researchData = await this.performCompanyResearch(url);
      
      // Hide modal
      this.hideCompanyResearchModal();
      
      // Format and display results
      await this.displayCompanyResearchResults(researchData);

    } catch (error) {
      console.error('Company research error:', error);
      this.showNotification('Failed to research company. Please try again.', 'error');
    } finally {
      this.setResearchButtonLoading(false);
    }
  }

  async performCompanyResearch(url) {
    console.log('Starting comprehensive company research for:', url);
    
    try {
      // Extract company domain/name from URL
      const domain = new URL(url).hostname.replace('www.', '');
      const companyName = domain.split('.')[0];
      
      // Gather multiple data sources
      const researchPromises = [
        this.fetchCompanyOverview(url, domain, companyName),
        this.searchEarningsReports(companyName),
        this.searchRecentNews(companyName),
        this.searchLeadershipInfo(companyName)
      ];

      const [overview, earnings, news, leadership] = await Promise.allSettled(researchPromises);
      
      return {
        url,
        domain,
        companyName,
        overview: overview.status === 'fulfilled' ? overview.value : null,
        earnings: earnings.status === 'fulfilled' ? earnings.value : null,
        news: news.status === 'fulfilled' ? news.value : null,
        leadership: leadership.status === 'fulfilled' ? leadership.value : null,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Research compilation error:', error);
      throw new Error('Failed to compile research data');
    }
  }

  async fetchCompanyOverview(url, domain, companyName) {
    try {
      const response = await fetch('/api/web-fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          prompt: `Extract key information about this company including: what they do, their main business lines, size, and industry focus. Provide a concise 1-2 sentence overview.`
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          source: 'company_website',
          content: data.content || data.response || 'No overview available',
          url: url
        };
      }
    } catch (error) {
      console.log('Website fetch failed, using web search fallback');
    }

    // Fallback to web search
    return await this.webSearchFallback(`${companyName} company overview business description`);
  }

  async searchEarningsReports(companyName) {
    const searchQueries = [
      `${companyName} quarterly earnings 2024`,
      `${companyName} annual report 2024`,
      `${companyName} earnings transcript Q4 2024`
    ];

    const results = [];
    for (const query of searchQueries) {
      try {
        const result = await this.webSearchFallback(query);
        if (result && result.content) {
          results.push(result);
        }
      } catch (error) {
        console.log(`Search failed for: ${query}`);
      }
    }

    return results;
  }

  async searchRecentNews(companyName) {
    const query = `${companyName} company news 2024 -stock -price`;
    return await this.webSearchFallback(query);
  }

  async searchLeadershipInfo(companyName) {
    const query = `${companyName} CEO leadership team executives`;
    return await this.webSearchFallback(query);
  }

  async webSearchFallback(query) {
    try {
      const response = await fetch('/api/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          max_results: 3
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          source: 'web_search',
          query: query,
          content: data.results || data.content || 'No results found',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.log(`Web search failed for: ${query}`);
    }

    return null;
  }

  async displayCompanyResearchResults(researchData) {
    // Format the comprehensive research report
    const report = await this.formatCompanyResearchReport(researchData);
    
    // Display in the AI response area
    const promptInput = document.getElementById('llm-prompt-input');
    if (promptInput) {
      promptInput.value = `Company Research: ${researchData.companyName}`;
    }
    
    // Show the formatted report
    this.showCompanyResearchReport(report);
  }

  async formatCompanyResearchReport(data) {
    const sections = {
      overview: this.extractCompanyOverview(data),
      leadership: this.extractLeadershipInfo(data), 
      automation: this.identifyAutomationOpportunities(data),
      citations: this.compileCitations(data)
    };

    return sections;
  }

  extractCompanyOverview(data) {
    let overview = "Company information not available.";
    
    if (data.overview && data.overview.content) {
      overview = data.overview.content;
    } else if (data.news && data.news.content) {
      // Try to extract company description from news
      overview = `Based on recent news: ${data.news.content.substring(0, 300)}...`;
    }
    
    return overview;
  }

  extractLeadershipInfo(data) {
    const leaders = [];
    
    if (data.leadership && data.leadership.content) {
      // Simple extraction - in a real implementation you'd use more sophisticated parsing
      const content = data.leadership.content;
      
      // Look for common leadership patterns
      const ceoMatch = content.match(/CEO[:\s]+([^,.\n]+)/i);
      const presMatch = content.match(/President[:\s]+([^,.\n]+)/i);
      const ctoMatch = content.match(/CTO[:\s]+([^,.\n]+)/i);
      
      if (ceoMatch) leaders.push({ title: 'CEO', name: ceoMatch[1].trim() });
      if (presMatch) leaders.push({ title: 'President', name: presMatch[1].trim() });
      if (ctoMatch) leaders.push({ title: 'CTO', name: ctoMatch[1].trim() });
    }
    
    return leaders.length > 0 ? leaders : [{ title: 'Leadership', name: 'Information not available' }];
  }

  identifyAutomationOpportunities(data) {
    const opportunities = [];
    
    // Analyze content for automation keywords and opportunities
    const allContent = [
      data.overview?.content || '',
      data.earnings?.map(e => e.content).join(' ') || '',
      data.news?.content || ''
    ].join(' ').toLowerCase();

    // Common automation opportunity patterns
    const patterns = {
      'Financial Process Automation': ['invoice', 'payment', 'reconciliation', 'financial reporting', 'accounts payable'],
      'Customer Service Automation': ['customer service', 'support', 'call center', 'helpdesk', 'customer experience'],
      'HR Process Automation': ['employee onboarding', 'hr processes', 'payroll', 'benefits', 'recruitment'],
      'Supply Chain Automation': ['supply chain', 'inventory', 'logistics', 'procurement', 'vendor management'],
      'Compliance & Risk Automation': ['compliance', 'regulatory', 'risk management', 'audit', 'governance']
    };

    for (const [category, keywords] of Object.entries(patterns)) {
      const matchingKeywords = keywords.filter(keyword => allContent.includes(keyword));
      if (matchingKeywords.length > 0) {
        opportunities.push({
          category,
          relevance: matchingKeywords.length,
          keywords: matchingKeywords,
          description: this.getAutomationDescription(category)
        });
      }
    }

    return opportunities.sort((a, b) => b.relevance - a.relevance);
  }

  getAutomationDescription(category) {
    const descriptions = {
      'Financial Process Automation': 'UiPath can automate invoice processing, financial reconciliation, and reporting workflows to reduce manual effort and improve accuracy.',
      'Customer Service Automation': 'Implement intelligent virtual assistants and automated ticket routing to enhance customer experience and reduce response times.',
      'HR Process Automation': 'Streamline employee onboarding, benefits administration, and HR analytics with automated workflows.',
      'Supply Chain Automation': 'Optimize inventory management, purchase order processing, and vendor communications through intelligent automation.',
      'Compliance & Risk Automation': 'Automate regulatory reporting, compliance monitoring, and risk assessment processes for better governance.'
    };
    
    return descriptions[category] || 'Automation opportunities available in this area.';
  }

  compileCitations(data) {
    const citations = [];
    let citationIndex = 1;

    if (data.overview && data.overview.url) {
      citations.push({
        index: citationIndex++,
        title: 'Company Website',
        url: data.overview.url,
        type: 'Primary Source'
      });
    }

    if (data.earnings && Array.isArray(data.earnings)) {
      data.earnings.forEach(earning => {
        if (earning.query) {
          citations.push({
            index: citationIndex++,
            title: earning.query,
            url: `Search: ${earning.query}`,
            type: 'Financial Information'
          });
        }
      });
    }

    if (data.news && data.news.query) {
      citations.push({
        index: citationIndex++,
        title: 'Recent Company News',
        url: `Search: ${data.news.query}`,
        type: 'News & Updates'
      });
    }

    if (data.leadership && data.leadership.query) {
      citations.push({
        index: citationIndex++,
        title: 'Leadership Information',
        url: `Search: ${data.leadership.query}`,
        type: 'Leadership'
      });
    }

    return citations;
  }

  showCompanyResearchReport(report) {
    // Create a formatted HTML report
    let reportHTML = `
      <div class="company-research-report bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">🏢 Company Research Report</h2>
          <p class="text-sm text-gray-500">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <!-- Company Overview -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">1. Company Overview</h3>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-gray-800">${report.overview}</p>
          </div>
        </div>

        <!-- Key Leaders -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">2. Key Leaders</h3>
          <div class="space-y-2">
            ${report.leadership.map(leader => `
              <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                <div class="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  ${leader.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="font-medium text-gray-900">${leader.name}</div>
                  <div class="text-sm text-gray-600">${leader.title}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Automation Opportunities -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">3. Primary Automation Focus Areas</h3>
          <div class="space-y-4">
            ${report.automation.length > 0 ? report.automation.map(opp => `
              <div class="border border-orange-200 rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-semibold text-orange-900">${opp.category}</h4>
                  <span class="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    ${opp.relevance} match${opp.relevance !== 1 ? 'es' : ''}
                  </span>
                </div>
                <p class="text-gray-700 text-sm mb-2">${opp.description}</p>
                <div class="flex flex-wrap gap-1">
                  ${opp.keywords.map(keyword => `
                    <span class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">${keyword}</span>
                  `).join('')}
                </div>
              </div>
            `).join('') : '<p class="text-gray-500 italic">No specific automation opportunities identified from available data.</p>'}
          </div>
        </div>

        <!-- Citations -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">4. Citations & Sources</h3>
          <div class="space-y-2">
            ${report.citations.map(citation => `
              <div class="flex items-start p-3 bg-gray-50 rounded-lg">
                <span class="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  ${citation.index}
                </span>
                <div>
                  <div class="font-medium text-gray-900">${citation.title}</div>
                  <div class="text-sm text-gray-600">${citation.type}</div>
                  ${citation.url.startsWith('http') ? 
                    `<a href="${citation.url}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">View Source →</a>` :
                    `<div class="text-sm text-gray-500">${citation.url}</div>`
                  }
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Display the report in a way that integrates with the existing UI
    this.displayAIResponse(reportHTML);
  }

  displayAIResponse(content) {
    // Check if chatbot exists and use its display method
    if (window.chatbot && typeof window.chatbot.addMessage === 'function') {
      window.chatbot.addMessage('assistant', content);
    } else {
      // Fallback: Show notification or create custom display
      this.showCustomAIResponse(content);
    }
  }

  showCustomAIResponse(content) {
    // Create or update a custom response area
    let responseArea = document.getElementById('ai-response-area');
    if (!responseArea) {
      responseArea = document.createElement('div');
      responseArea.id = 'ai-response-area';
      responseArea.className = 'fixed bottom-4 right-4 max-w-md max-h-96 overflow-y-auto z-50';
      document.body.appendChild(responseArea);
    }

    responseArea.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl border border-gray-200">
        <div class="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 class="font-semibold text-gray-900">AI Research Results</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-4 max-h-80 overflow-y-auto">
          ${content}
        </div>
      </div>
    `;
  }

  setResearchButtonLoading(loading) {
    const startBtn = document.getElementById('company-research-start');
    const textSpan = document.querySelector('.research-btn-text');
    const loadingSpan = document.querySelector('.research-btn-loading');

    if (startBtn && textSpan && loadingSpan) {
      startBtn.disabled = loading;
      if (loading) {
        textSpan.classList.add('hidden');
        loadingSpan.classList.remove('hidden');
      } else {
        textSpan.classList.remove('hidden');
        loadingSpan.classList.add('hidden');
      }
    }
  }

  resetResearchButton() {
    this.setResearchButtonLoading(false);
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // ==================== COMPETITIVE ANALYSIS FUNCTIONALITY ====================
  initializeCompetitiveAnalysisModal() {
    const modal = document.getElementById('competitive-analysis-modal');
    const closeBtn = document.getElementById('competitive-analysis-close');
    const cancelBtn = document.getElementById('competitive-analysis-cancel');
    const startBtn = document.getElementById('competitive-analysis-start');
    const competitorInput = document.getElementById('competitor-name-input');

    // Close modal event listeners
    [closeBtn, cancelBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.hideCompetitiveAnalysisModal();
        });
      }
    });

    // Click outside modal to close
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideCompetitiveAnalysisModal();
        }
      });
    }

    // Start analysis button
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.handleCompetitiveAnalysis();
      });
    }

    // Enter key in competitor input
    if (competitorInput) {
      competitorInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleCompetitiveAnalysis();
        }
      });
    }
  }

  showCompetitiveAnalysisModal() {
    const modal = document.getElementById('competitive-analysis-modal');
    const competitorInput = document.getElementById('competitor-name-input');
    
    if (modal) {
      modal.classList.remove('hidden');
      // Focus the input field
      if (competitorInput) {
        setTimeout(() => competitorInput.focus(), 100);
      }
    }
  }

  hideCompetitiveAnalysisModal() {
    const modal = document.getElementById('competitive-analysis-modal');
    const competitorInput = document.getElementById('competitor-name-input');
    
    if (modal) {
      modal.classList.add('hidden');
      // Clear the input
      if (competitorInput) {
        competitorInput.value = '';
      }
      // Reset button state
      this.resetCompetitiveButton();
    }
  }

  async handleCompetitiveAnalysis() {
    const competitorInput = document.getElementById('competitor-name-input');
    const competitorName = competitorInput?.value.trim();

    if (!competitorName) {
      this.showNotification('Please enter a competitor name', 'warning');
      return;
    }

    try {
      // Show loading state
      this.setCompetitiveButtonLoading(true);

      // Get current customer context
      const customerContext = this.getCurrentCustomerContext();
      
      // Perform competitive analysis
      const analysisData = await this.performCompetitiveAnalysis(competitorName, customerContext);
      
      // Hide modal
      this.hideCompetitiveAnalysisModal();
      
      // Display results
      await this.displayCompetitiveAnalysisResults(analysisData, competitorName);

    } catch (error) {
      console.error('Competitive analysis error:', error);
      this.showNotification('Failed to analyze competitor. Please try again.', 'error');
    } finally {
      this.setCompetitiveButtonLoading(false);
    }
  }

  getCurrentCustomerContext() {
    // Get current customer information from the CustomerInfoManager
    const context = {
      vertical: '',
      lob: '',
      customerType: '',
      deployment: '',
      selectedPersonas: [],
      selectedResources: [],
      selectedUseCases: []
    };

    // Try to get context from CustomerInfoManager if available
    if (window.customerInfoManager) {
      const selectionContext = window.customerInfoManager.getSelectionContext();
      context.vertical = selectionContext.vertical || '';
      context.lob = selectionContext.lob || '';
      context.customerType = selectionContext.customerType || '';
      context.deployment = selectionContext.deployment || '';
      
      // Get selected personas, resources, and use cases
      if (window.customerInfoManager.personaManager) {
        context.selectedPersonas = window.customerInfoManager.personaManager.getSelectedPersonas();
      }
      if (window.customerInfoManager.resourceManager) {
        context.selectedResources = window.customerInfoManager.resourceManager.getSelectedResources();
      }
      if (window.customerInfoManager.useCaseManager) {
        context.selectedUseCases = window.customerInfoManager.useCaseManager.getSelectedUseCases();
      }
    }

    return context;
  }

  async performCompetitiveAnalysis(competitorName, customerContext) {
    console.log('Starting competitive analysis for:', competitorName, 'with context:', customerContext);
    
    try {
      // Create comprehensive competitive analysis prompt
      const analysisPrompt = this.buildCompetitiveAnalysisPrompt(competitorName, customerContext);
      
      // Gather competitive intelligence
      const competitiveData = await this.gatherCompetitiveIntelligence(competitorName, customerContext);
      
      // Generate contextual competitive positioning
      const positioningAnalysis = await this.generateCompetitivePositioning(analysisPrompt, competitiveData);
      
      return {
        competitor: competitorName,
        customerContext,
        competitiveData,
        positioningAnalysis,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Competitive analysis compilation error:', error);
      throw new Error('Failed to compile competitive analysis');
    }
  }

  buildCompetitiveAnalysisPrompt(competitorName, context) {
    let prompt = `Provide a comprehensive competitive analysis comparing UiPath against ${competitorName}`;
    
    // Add customer context to make it relevant
    const contextParts = [];
    if (context.vertical) {
      contextParts.push(`in the ${context.vertical} industry`);
    }
    if (context.lob) {
      contextParts.push(`specifically for ${context.lob.replace('-', ' ')} use cases`);
    }
    if (context.customerType) {
      contextParts.push(`for a ${context.customerType} customer`);
    }
    if (context.deployment) {
      contextParts.push(`considering ${context.deployment.replace('-', ' ')} deployment`);
    }
    
    if (contextParts.length > 0) {
      prompt += ` ${contextParts.join(', ')}`;
    }

    // Add specific focus areas based on selected use cases/personas
    if (context.selectedUseCases.length > 0) {
      const useCaseNames = context.selectedUseCases.map(uc => uc.name).join(', ');
      prompt += `. Focus on these specific use cases: ${useCaseNames}`;
    }

    if (context.selectedPersonas.length > 0) {
      const personaRoles = context.selectedPersonas.map(p => p.role).join(', ');
      prompt += `. Consider the perspective of these decision makers: ${personaRoles}`;
    }

    prompt += `. Please provide:
    1. Key competitive strengths where UiPath has advantages
    2. Potential competitive threats or areas where ${competitorName} might have advantages
    3. Specific talking points and positioning messages
    4. ROI and business value differentiation
    5. Technical capabilities comparison
    6. Implementation and deployment advantages`;

    return prompt;
  }

  async gatherCompetitiveIntelligence(competitorName, context) {
    const searchPromises = [
      this.searchCompetitorInfo(competitorName),
      this.searchUiPathVsCompetitor(competitorName),
      this.searchIndustryComparisons(competitorName, context.vertical),
      this.searchCustomerReviews(competitorName)
    ];

    const results = await Promise.allSettled(searchPromises);
    
    return {
      competitorInfo: results[0].status === 'fulfilled' ? results[0].value : null,
      directComparison: results[1].status === 'fulfilled' ? results[1].value : null,
      industryComparison: results[2].status === 'fulfilled' ? results[2].value : null,
      customerReviews: results[3].status === 'fulfilled' ? results[3].value : null
    };
  }

  async searchCompetitorInfo(competitorName) {
    const query = `${competitorName} automation platform features capabilities 2024`;
    return await this.webSearchFallback(query);
  }

  async searchUiPathVsCompetitor(competitorName) {
    const query = `UiPath vs ${competitorName} comparison automation platform`;
    return await this.webSearchFallback(query);
  }

  async searchIndustryComparisons(competitorName, vertical) {
    if (!vertical) return null;
    const query = `${competitorName} UiPath ${vertical} automation comparison`;
    return await this.webSearchFallback(query);
  }

  async searchCustomerReviews(competitorName) {
    const query = `${competitorName} customer reviews Gartner G2 automation platform`;
    return await this.webSearchFallback(query);
  }

  async generateCompetitivePositioning(prompt, competitiveData) {
    try {
      // Use AI to analyze competitive data and generate positioning
      const response = await this.callAIForAnalysis(prompt, competitiveData);
      return response;
    } catch (error) {
      console.log('AI analysis failed, using template-based analysis');
      return this.generateTemplateBasedPositioning(competitiveData);
    }
  }

  async callAIForAnalysis(prompt, competitiveData) {
    // Check if we have an AI endpoint available
    if (window.chatbot && typeof window.chatbot.generateResponse === 'function') {
      const dataContext = this.summarizeCompetitiveData(competitiveData);
      const fullPrompt = `${prompt}\n\nBased on this competitive intelligence:\n${dataContext}`;
      return await window.chatbot.generateResponse(fullPrompt);
    }
    
    // Fallback to simpler analysis
    return this.generateTemplateBasedPositioning(competitiveData);
  }

  summarizeCompetitiveData(competitiveData) {
    let summary = '';
    
    if (competitiveData.competitorInfo?.content) {
      summary += `Competitor Information: ${competitiveData.competitorInfo.content.substring(0, 500)}...\n\n`;
    }
    
    if (competitiveData.directComparison?.content) {
      summary += `Direct Comparison Data: ${competitiveData.directComparison.content.substring(0, 500)}...\n\n`;
    }
    
    if (competitiveData.industryComparison?.content) {
      summary += `Industry-Specific Comparison: ${competitiveData.industryComparison.content.substring(0, 300)}...\n\n`;
    }
    
    return summary || 'Limited competitive data available.';
  }

  generateTemplateBasedPositioning(competitiveData) {
    // Generate analysis based on known UiPath strengths and common competitive scenarios
    return {
      strengths: this.getUiPathCompetitiveStrengths(),
      threats: this.getCommonCompetitiveChallenges(),
      positioning: this.getStandardPositioningMessages(),
      roi: this.getROIComparisonPoints(),
      technical: this.getTechnicalDifferentiators(),
      implementation: this.getImplementationAdvantages()
    };
  }

  getUiPathCompetitiveStrengths() {
    return [
      {
        area: 'Platform Completeness',
        strength: 'End-to-end automation platform with RPA, AI, and process mining in a single solution',
        impact: 'Reduces vendor complexity and integration overhead'
      },
      {
        area: 'AI Integration',
        strength: 'Native AI capabilities with Document Understanding and AI Center',
        impact: 'Enables intelligent document processing and machine learning integration'
      },
      {
        area: 'Community & Ecosystem',
        strength: 'Largest automation community with UiPath Marketplace',
        impact: 'Access to pre-built automations and extensive support resources'
      },
      {
        area: 'Deployment Flexibility',
        strength: 'Multi-cloud, on-premises, and hybrid deployment options',
        impact: 'Fits any enterprise architecture and compliance requirements'
      }
    ];
  }

  getCommonCompetitiveChallenges() {
    return [
      {
        area: 'Pricing Perception',
        challenge: 'May be perceived as premium-priced solution',
        response: 'Focus on total cost of ownership and faster time-to-value'
      },
      {
        area: 'Complexity',
        challenge: 'Platform richness might seem complex for simple use cases',
        response: 'Emphasize starting simple with Studio X and growing into advanced capabilities'
      }
    ];
  }

  getStandardPositioningMessages() {
    return [
      'UiPath provides the most comprehensive automation platform, reducing the need for multiple vendors',
      'Our AI-first approach ensures automations are intelligent and adaptive, not just rule-based',
      'The largest automation community provides unmatched support and pre-built solutions',
      'Flexible deployment options ensure compliance and integration with existing systems'
    ];
  }

  getROIComparisonPoints() {
    return [
      'Faster implementation due to low-code/no-code approach',
      'Higher automation success rate with built-in analytics and monitoring',
      'Reduced maintenance overhead with centralized management',
      'Scalability that grows with business needs without architectural changes'
    ];
  }

  getTechnicalDifferentiators() {
    return [
      'Superior computer vision and OCR capabilities',
      'Advanced workflow orchestration and exception handling',
      'Built-in process mining for optimization opportunities',
      'Enterprise-grade security and governance features'
    ];
  }

  getImplementationAdvantages() {
    return [
      'Comprehensive training and certification programs',
      'Professional services and partner ecosystem',
      'Change management tools and adoption frameworks',
      'Continuous innovation with quarterly platform updates'
    ];
  }

  async displayCompetitiveAnalysisResults(analysisData, competitorName) {
    // Format the competitive analysis report
    const report = await this.formatCompetitiveAnalysisReport(analysisData, competitorName);
    
    // Display in the AI response area
    const promptInput = document.getElementById('llm-prompt-input');
    if (promptInput) {
      promptInput.value = `Competitive Analysis: UiPath vs ${competitorName}`;
    }
    
    // Show the formatted report
    this.showCompetitiveAnalysisReport(report);
  }

  async formatCompetitiveAnalysisReport(data, competitorName) {
    const positioning = data.positioningAnalysis;
    
    return {
      competitor: competitorName,
      context: data.customerContext,
      strengths: positioning.strengths || [],
      threats: positioning.threats || [],
      positioning: positioning.positioning || [],
      roi: positioning.roi || [],
      technical: positioning.technical || [],
      implementation: positioning.implementation || [],
      sources: this.compileCompetitiveSources(data.competitiveData)
    };
  }

  compileCompetitiveSources(competitiveData) {
    const sources = [];
    let index = 1;

    if (competitiveData.competitorInfo?.query) {
      sources.push({
        index: index++,
        title: 'Competitor Information',
        search: competitiveData.competitorInfo.query,
        type: 'Market Research'
      });
    }

    if (competitiveData.directComparison?.query) {
      sources.push({
        index: index++,
        title: 'Direct Comparison',
        search: competitiveData.directComparison.query,
        type: 'Competitive Analysis'
      });
    }

    if (competitiveData.industryComparison?.query) {
      sources.push({
        index: index++,
        title: 'Industry Comparison',
        search: competitiveData.industryComparison.query,
        type: 'Industry Analysis'
      });
    }

    return sources;
  }

  showCompetitiveAnalysisReport(report) {
    const contextSummary = this.buildContextSummary(report.context);
    
    const reportHTML = `
      <div class="competitive-analysis-report bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">⚔️ Competitive Analysis: UiPath vs ${report.competitor}</h2>
          <div class="bg-blue-50 p-3 rounded-lg">
            <p class="text-sm text-gray-700"><strong>Customer Context:</strong> ${contextSummary}</p>
          </div>
          <p class="text-sm text-gray-500 mt-2">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <!-- Competitive Strengths -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🚀 UiPath Competitive Strengths</h3>
          <div class="space-y-3">
            ${report.strengths.map(strength => `
              <div class="bg-green-50 border-l-4 border-green-400 p-4">
                <div class="font-semibold text-green-900">${strength.area}</div>
                <div class="text-green-800 mt-1">${strength.strength}</div>
                <div class="text-green-700 text-sm mt-2"><strong>Impact:</strong> ${strength.impact}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Potential Challenges -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">⚠️ Potential Competitive Challenges</h3>
          <div class="space-y-3">
            ${report.threats.map(threat => `
              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div class="font-semibold text-yellow-900">${threat.area}</div>
                <div class="text-yellow-800 mt-1">${threat.challenge}</div>
                <div class="text-yellow-700 text-sm mt-2"><strong>Response Strategy:</strong> ${threat.response}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Key Positioning Messages -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">💬 Key Positioning Messages</h3>
          <div class="bg-blue-50 p-4 rounded-lg">
            <ul class="space-y-2">
              ${report.positioning.map(message => `
                <li class="flex items-start">
                  <div class="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span class="text-blue-900">${message}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- ROI Differentiation -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">💰 ROI & Business Value Differentiation</h3>
          <div class="grid md:grid-cols-2 gap-3">
            ${report.roi.map(point => `
              <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div class="text-orange-900 text-sm">${point}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Technical Differentiators -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">⚙️ Technical Differentiators</h3>
          <div class="grid md:grid-cols-2 gap-3">
            ${report.technical.map(tech => `
              <div class="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div class="text-purple-900 text-sm">${tech}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Implementation Advantages -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">🔧 Implementation & Support Advantages</h3>
          <div class="space-y-2">
            ${report.implementation.map(impl => `
              <div class="flex items-center p-2 bg-gray-50 rounded">
                <div class="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                <span class="text-gray-800 text-sm">${impl}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sources -->
        <div class="mb-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">📚 Research Sources</h3>
          <div class="space-y-2">
            ${report.sources.map(source => `
              <div class="flex items-start p-3 bg-gray-50 rounded-lg">
                <span class="bg-gray-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                  ${source.index}
                </span>
                <div>
                  <div class="font-medium text-gray-900">${source.title}</div>
                  <div class="text-sm text-gray-600">${source.type}</div>
                  <div class="text-sm text-gray-500">Search: ${source.search}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Display the report
    this.displayAIResponse(reportHTML);
  }

  buildContextSummary(context) {
    const parts = [];
    
    if (context.vertical) {
      parts.push(`${context.vertical} industry`);
    }
    if (context.lob) {
      parts.push(`${context.lob.replace('-', ' ')} use cases`);
    }
    if (context.customerType) {
      parts.push(`${context.customerType} customer`);
    }
    if (context.deployment) {
      parts.push(`${context.deployment.replace('-', ' ')} deployment`);
    }

    return parts.length > 0 ? parts.join(', ') : 'General competitive analysis';
  }

  setCompetitiveButtonLoading(loading) {
    const startBtn = document.getElementById('competitive-analysis-start');
    const textSpan = document.querySelector('.competitive-btn-text');
    const loadingSpan = document.querySelector('.competitive-btn-loading');

    if (startBtn && textSpan && loadingSpan) {
      startBtn.disabled = loading;
      if (loading) {
        textSpan.classList.add('hidden');
        loadingSpan.classList.remove('hidden');
      } else {
        textSpan.classList.remove('hidden');
        loadingSpan.classList.add('hidden');
      }
    }
  }

  resetCompetitiveButton() {
    this.setCompetitiveButtonLoading(false);
  }
}

// ==================== DYNAMIC DISCOVERY QUESTIONS ====================
class DynamicDiscoveryManager {
  constructor() {
    this.selectedLOB = '';
    this.selectedProjectTypes = new Set();
    this.selectedCustomerType = '';
    this.selectedDeploymentType = '';
    this.initializeEventListeners();
    this.initializeProfileCompletion();
  }

  initializeEventListeners() {
    // LOB selector handlers
    const lobSelector = document.getElementById('lob-selector');
    const mobileLobSelector = document.getElementById('mobile-lob-selector');
    
    if (lobSelector) {
      lobSelector.addEventListener('change', (e) => {
        this.selectedLOB = e.target.value;
        if (mobileLobSelector) mobileLobSelector.value = e.target.value;
        this.updateDiscoveryQuestions();
      });
    }

    if (mobileLobSelector) {
      mobileLobSelector.addEventListener('change', (e) => {
        this.selectedLOB = e.target.value;
        if (lobSelector) lobSelector.value = e.target.value;
        this.updateDiscoveryQuestions();
      });
    }

    // Project type button handlers
    document.addEventListener('click', (e) => {
      if (e.target.matches('.project-type-btn')) {
        this.handleProjectTypeToggle(e.target);
      }
      // Customer type button handlers
      if (e.target.matches('.customer-type-btn')) {
        this.handleCustomerTypeToggle(e.target);
      }
    });

    // Deployment type selector handlers
    const deploymentSelector = document.getElementById('deployment-type');
    const mobileDeploymentSelector = document.getElementById('mobile-deployment-type');
    
    if (deploymentSelector) {
      deploymentSelector.addEventListener('change', (e) => {
        this.selectedDeploymentType = e.target.value;
        if (mobileDeploymentSelector) mobileDeploymentSelector.value = e.target.value;
        this.updateProfileCompletion();
        this.updateDiscoveryQuestions();
      });
    }
    if (mobileDeploymentSelector) {
      mobileDeploymentSelector.addEventListener('change', (e) => {
        this.selectedDeploymentType = e.target.value;
        if (deploymentSelector) deploymentSelector.value = e.target.value;
        this.updateProfileCompletion();
        this.updateDiscoveryQuestions();
      });
    }

    // Profile completion bar dismiss
    const dismissBtn = document.getElementById('dismiss-profile-bar');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const profileBar = document.getElementById('profile-completion-bar');
        if (profileBar) {
          profileBar.style.display = 'none';
          localStorage.setItem('profile-bar-dismissed', 'true');
        }
      });
    }
  }

  handleProjectTypeToggle(button) {
    const type = button.dataset.type;
    const isSelected = button.classList.contains('bg-orange-600');

    // Toggle selection
    if (isSelected) {
      this.selectedProjectTypes.delete(type);
      button.classList.remove('bg-orange-600', 'text-white');
      button.classList.add('text-gray-700');
    } else {
      this.selectedProjectTypes.add(type);
      button.classList.add('bg-orange-600', 'text-white');
      button.classList.remove('text-gray-700');
    }

    // Sync desktop and mobile versions
    const allButtons = document.querySelectorAll(`[data-type="${type}"]`);
    allButtons.forEach(btn => {
      if (isSelected) {
        btn.classList.remove('bg-orange-600', 'text-white');
        btn.classList.add('text-gray-700');
      } else {
        btn.classList.add('bg-orange-600', 'text-white');
        btn.classList.remove('text-gray-700');
      }
    });

    this.updateDiscoveryQuestions();
  }

  updateDiscoveryQuestions() {
    // Get current stage data
    const currentStage = window.appState?.get('currentStage') || 0;
    const stageData = SALES_CYCLE_DATA?.stages?.[currentStage];
    
    if (!stageData) return;

    // Generate dynamic content based on selections
    const dynamicQuestions = this.generateContextualQuestions();
    const dynamicObjections = this.generateContextualObjections();
    
    // Store original content if not already stored
    if (!stageData.originalQuestions) {
      stageData.originalQuestions = JSON.parse(JSON.stringify(stageData.questions));
    }
    if (!stageData.originalObjections) {
      stageData.originalObjections = JSON.parse(JSON.stringify(stageData.objections));
    }

    // Update questions
    if (this.selectedLOB || this.selectedProjectTypes.size > 0) {
      stageData.questions = { ...stageData.originalQuestions, ...dynamicQuestions };
    } else {
      stageData.questions = stageData.originalQuestions;
    }
    
    // Update objections
    if (this.selectedLOB || this.selectedProjectTypes.size > 0) {
      const combinedObjections = [...stageData.originalObjections, ...dynamicObjections];
      stageData.objections = combinedObjections;
    } else {
      stageData.objections = stageData.originalObjections;
    }

    // Re-render the stage content to show updated questions and objections
    if (window.appInstance) {
      window.appInstance.renderStageContent(currentStage);
    }
    
    // Update profile completion
    this.updateProfileCompletion();
  }

  handleCustomerTypeToggle(button) {
    const type = button.dataset.type;
    
    // Update all customer type buttons
    document.querySelectorAll('.customer-type-btn').forEach(btn => {
      if (btn.dataset.type === type) {
        btn.classList.add('bg-orange-600', 'text-white');
        btn.classList.remove('text-gray-700', 'bg-gray-100');
      } else {
        btn.classList.remove('bg-orange-600', 'text-white');
        btn.classList.add('text-gray-700', 'bg-gray-100');
      }
    });

    this.selectedCustomerType = type;
    
    // Show/hide deployment selector based on customer type
    const deploymentSelector = document.getElementById('deployment-selector');
    const mobileDeploymentSelector = document.getElementById('mobile-deployment-selector');
    
    if (type === 'existing') {
      if (deploymentSelector) deploymentSelector.classList.remove('hidden');
      if (mobileDeploymentSelector) mobileDeploymentSelector.classList.remove('hidden');
    } else {
      if (deploymentSelector) deploymentSelector.classList.add('hidden');
      if (mobileDeploymentSelector) mobileDeploymentSelector.classList.add('hidden');
      
      // Reset deployment selection when hiding
      this.selectedDeploymentType = '';
      const deploymentTypeSelect = document.getElementById('deployment-type');
      const mobileDeploymentTypeSelect = document.getElementById('mobile-deployment-type');
      if (deploymentTypeSelect) deploymentTypeSelect.value = '';
      if (mobileDeploymentTypeSelect) mobileDeploymentTypeSelect.value = '';
    }

    this.updateProfileCompletion();
    this.updateDiscoveryQuestions();
  }

  initializeProfileCompletion() {
    // Check if profile bar was previously dismissed
    const dismissed = localStorage.getItem('profile-bar-dismissed');
    if (dismissed === 'true') {
      const profileBar = document.getElementById('profile-completion-bar');
      if (profileBar) {
        profileBar.style.display = 'none';
      }
    }
    
    // Initial profile completion update
    setTimeout(() => {
      this.updateProfileCompletion();
    }, 500);
  }

  updateProfileCompletion() {
    const profileBar = document.getElementById('profile-completion-bar');
    if (!profileBar || profileBar.style.display === 'none') return;

    // Calculate completion
    const totalFields = 4; // Industry, LOB, Project Type, Customer Type
    let completedFields = 1; // Industry is always set (banking/insurance)
    
    const missingItems = [];
    
    // Check LOB
    if (this.selectedLOB) {
      completedFields++;
    } else {
      missingItems.push('📋 LOB');
    }
    
    // Check Project Type
    if (this.selectedProjectTypes.size > 0) {
      completedFields++;
    } else {
      missingItems.push('⚙️ Project Type');
    }
    
    // Check Customer Type
    if (this.selectedCustomerType) {
      completedFields++;
      
      // If existing customer, also check deployment (optional but recommended)
      if (this.selectedCustomerType === 'existing') {
        if (this.selectedDeploymentType) {
          // Bonus completion for deployment
          completedFields += 0.5;
        } else {
          missingItems.push('☁️ Deployment');
        }
      }
    } else {
      missingItems.push('🏢 Customer Type');
    }
    
    // Calculate percentage (max 100%)
    const maxPossible = this.selectedCustomerType === 'existing' ? 4.5 : 4;
    const percentage = Math.round((completedFields / maxPossible) * 100);
    
    // Update progress bar
    const progressBar = document.getElementById('profile-progress');
    const percentageText = document.getElementById('profile-percentage');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    if (percentageText) {
      percentageText.textContent = `${percentage}%`;
    }
    
    // Update missing items
    const missingItemsContainer = document.getElementById('missing-items');
    if (missingItemsContainer) {
      if (missingItems.length === 0) {
        missingItemsContainer.innerHTML = '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">🎉 Profile Complete!</span>';
      } else {
        missingItemsContainer.innerHTML = missingItems.map(item => 
          `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200">${item}</span>`
        ).join('');
      }
    }
    
    // Update AI prompt placeholder with contextual information
    this.updatePromptPlaceholder();
  }

  updatePromptPlaceholder() {
    const promptInput = document.getElementById('llm-prompt-input');
    if (!promptInput) return;
    
    let context = [];
    if (this.selectedCustomerType) {
      context.push(this.selectedCustomerType === 'new-logo' ? 'new customer' : 'existing customer');
    }
    if (this.selectedLOB) {
      const lobName = this.selectedLOB.replace('-', ' ');
      context.push(lobName);
    }
    if (this.selectedProjectTypes.size > 0) {
      context.push(Array.from(this.selectedProjectTypes).join('/'));
    }
    if (this.selectedDeploymentType) {
      context.push(this.selectedDeploymentType.replace('-', ' '));
    }
    
    if (context.length > 0) {
      promptInput.placeholder = `Ask AI about ${context.join(' ')} strategies, objections, or processes...`;
    } else {
      promptInput.placeholder = 'Ask AI about sales strategies, objections, personas, or anything else...';
    }
  }

  generateContextualQuestions() {
    const questions = {};

    // LOB-specific questions
    if (this.selectedLOB) {
      questions[this.getLOBQuestionCategory()] = this.getLOBSpecificQuestions();
    }

    // Project type-specific questions
    if (this.selectedProjectTypes.size > 0) {
      questions['Technology & Implementation'] = this.getProjectTypeQuestions();
    }

    // Combined LOB + Project Type questions
    if (this.selectedLOB && this.selectedProjectTypes.size > 0) {
      questions['Specialized Use Cases'] = this.getCombinedQuestions();
    }

    return questions;
  }

  getLOBQuestionCategory() {
    const lobCategories = {
      'consumer-banking': 'Consumer Banking Focus',
      'capital-markets': 'Capital Markets Focus',
      'operations': 'Operations Focus',
      'it-operations': 'IT Operations Focus',
      'finance-operations': 'Finance & Operations Focus'
    };
    return lobCategories[this.selectedLOB] || 'Department-Specific Questions';
  }

  getLOBSpecificQuestions() {
    const lobQuestions = {
      'consumer-banking': [
        'What\'s driving your cost per account and how do you compete on digital experience?',
        'How are you managing the speed vs. compliance balance in loan origination?',
        'What consumer banking metrics is your board most focused on this year?'
      ],
      'capital-markets': [
        'What\'s your biggest operational risk in trade settlement and clearing?',
        'How are you managing cost pressures in prime brokerage and custody operations?',
        'What capital markets regulations are creating the most operational overhead?'
      ],
      'operations': [
        'Which operational processes create the most customer impact when delayed?',
        'What operational KPIs are you accountable for at the executive level?',
        'How do you balance operational risk management with process speed?'
      ],
      'it-operations': [
        'How are you balancing innovation velocity with operational stability?',
        'What\'s your strategy for managing technical debt while delivering new capabilities?',
        'How do you measure mean time to resolution for business-critical incidents?'
      ],
      'finance-operations': [
        'What are your biggest challenges in month-end close timing and accuracy?',
        'How do you manage cost allocation and profitability analysis across business lines?',
        'What finance operations create the most audit or regulatory risk?'
      ],
      'compliance': [
        'What compliance processes require the most manual oversight?',
        'How do you currently handle risk assessment and monitoring?',
        'What regulatory reporting involves manual data collection?',
        'Where do you see gaps in your compliance monitoring?',
        'How much time is spent on audit preparation and documentation?'
      ]
    };
    return lobQuestions[this.selectedLOB] || [];
  }

  generateContextualObjections() {
    const objections = [];
    
    // LOB-specific objections
    const lobObjections = this.getLOBSpecificObjections();
    if (lobObjections.length > 0) {
      objections.push(...lobObjections);
    }
    
    // Project type-specific objections
    const projectTypeObjections = this.getProjectTypeObjections();
    if (projectTypeObjections.length > 0) {
      objections.push(...projectTypeObjections);
    }
    
    // Combined LOB + Project Type objections
    const combinedObjections = this.getCombinedObjections();
    if (combinedObjections.length > 0) {
      objections.push(...combinedObjections);
    }
    
    return objections;
  }

  getLOBSpecificObjections() {
    const lobObjections = {
      'consumer-banking': [
        {
          q: "We're focused on digital transformation, not automation.",
          a: "UiPath agentic automation IS digital transformation—it's AI-powered, governs end-to-end processes, and provides the foundation for your digital banking strategy."
        },
        {
          q: "Regulatory concerns about AI in banking decisions.",
          a: "We provide full audit trails, explainable AI, and compliance-ready governance frameworks designed specifically for financial services regulations."
        }
      ],
      'capital-markets': [
        {
          q: "Trading operations are too complex for automation.",
          a: "Our platform handles complex, exception-based processes with intelligent decision-making—perfect for the sophisticated workflows in capital markets."
        },
        {
          q: "Risk management concerns about automated trading processes.",
          a: "We provide comprehensive risk controls, real-time monitoring, and emergency stop capabilities with full audit trails for regulatory compliance."
        }
      ],
      'operations': [
        {
          q: "We tried RPA before and it didn't scale for operations.",
          a: "Modern agentic automation goes beyond traditional RPA—it handles exceptions, makes intelligent decisions, and includes built-in governance for enterprise scale."
        },
        {
          q: "Operational processes are too unpredictable.",
          a: "That's exactly why we use AI—it adapts to variations, handles exceptions intelligently, and learns from your operational patterns."
        }
      ],
      'it-operations': [
        {
          q: "IT security concerns about automation access.",
          a: "We provide role-based access controls, encrypted communications, audit trails, and can run entirely on-premise or in private cloud environments."
        },
        {
          q: "Integration complexity with existing IT systems.",
          a: "UiPath has pre-built connectors for 500+ systems including ServiceNow, with API-first architecture designed for enterprise IT environments."
        }
      ],
      'finance-operations': [
        {
          q: "Finance processes require too much human judgment.",
          a: "Agentic automation provides AI-powered insights and recommendations while maintaining human oversight for final decisions—perfect for financial controls."
        },
        {
          q: "Compliance and audit trail requirements are too strict.",
          a: "We provide comprehensive audit logs, approval workflows, and compliance-ready documentation specifically designed for financial regulations."
        }
      ]
    };
    
    return lobObjections[this.selectedLOB] || [];
  }

  getProjectTypeObjections() {
    const projectTypeObjections = {
      'RPA': [
        {
          q: "We've heard RPA is brittle and hard to maintain.",
          a: "Modern RPA with AI resilience handles UI changes automatically and includes self-healing capabilities to minimize maintenance."
        }
      ],
      'IDP': [
        {
          q: "Document processing accuracy concerns.",
          a: "Our IDP achieves 99%+ accuracy with human-in-the-loop validation and continuous learning from corrections."
        }
      ],
      'Agentic': [
        {
          q: "AI agents are too unpredictable for business processes.",
          a: "Our agentic platform includes guardrails, approval workflows, and escalation paths to ensure controlled, predictable outcomes."
        }
      ],
      'Maestro': [
        {
          q: "Orchestration sounds complex and risky.",
          a: "Maestro provides visual workflow design, testing environments, and rollback capabilities—making complex orchestration safe and manageable."
        }
      ]
    };
    
    const objections = [];
    for (const projectType of this.selectedProjectTypes) {
      if (projectTypeObjections[projectType]) {
        objections.push(...projectTypeObjections[projectType]);
      }
    }
    return objections;
  }

  getCombinedObjections() {
    // Return combined objections based on specific LOB + Project Type combinations
    const combinedKey = `${this.selectedLOB}-${Array.from(this.selectedProjectTypes).join('-')}`;
    const combinedObjections = {
      'consumer-banking-Agentic': [
        {
          q: "Customer data privacy concerns with AI agents.",
          a: "We support private AI models, data residency controls, and PII redaction—ensuring customer data never leaves your secure environment."
        }
      ],
      'capital-markets-RPA': [
        {
          q: "Market timing is critical—automation might be too slow.",
          a: "Our platform processes at sub-second speeds with real-time monitoring and can handle high-frequency trading requirements."
        }
      ],
      'operations-IDP-Agentic': [
        {
          q: "Combining document processing with AI decision-making seems risky.",
          a: "This combination is powerful—IDP extracts data accurately, then agentic workflows make intelligent routing decisions with full audit trails."
        }
      ]
    };
    
    return combinedObjections[combinedKey] || [];
  }

  getProjectTypeQuestions() {
    const questions = [];
    
    this.selectedProjectTypes.forEach(type => {
      const typeQuestions = {
        'rpa': [
          'What high-volume, rule-based processes are eating up your FTE budget?',
          'Which manual tasks are causing your teams to work overtime or miss SLAs?'
        ],
        'idp': [
          'What document-heavy processes are creating bottlenecks for your customers?',
          'How much revenue or cost savings is tied up in manual document processing?'
        ],
        'agentic': [
          'What business decisions currently require expensive expert judgment?',
          'Where would autonomous decision-making provide competitive advantage?'
        ],
        'maestro': [
          'What cross-functional processes are impacting your customer experience metrics?',
          'Which end-to-end workflows are you accountable for optimizing?'
        ]
      };
      questions.push(...(typeQuestions[type] || []));
    });

    return questions;
  }

  getCombinedQuestions() {
    const questions = [];
    const selectedTypes = Array.from(this.selectedProjectTypes);
    
    // Generate combined questions based on LOB + Project Type combinations
    selectedTypes.forEach(type => {
      const combinedKey = `${this.selectedLOB}-${type}`;
      const combinedQuestions = this.getCombinedQuestionsByKey(combinedKey);
      questions.push(...combinedQuestions);
    });

    return questions;
  }

  getCombinedQuestionsByKey(key) {
    const combinedQuestions = {
      'finance-rpa': [
        'How do you currently handle invoice processing from receipt to payment?',
        'What financial reconciliation processes could benefit from automation?'
      ],
      'finance-idp': [
        'What types of financial documents require manual data extraction?',
        'How do you process expense reports and receipts currently?'
      ],
      'hr-rpa': [
        'What employee onboarding steps are repetitive across all hires?',
        'How do you handle benefits enrollment and changes?'
      ],
      'hr-idp': [
        'What HR documents require manual review and data entry?',
        'How do you process resumes and job applications currently?'
      ],
      'it-agentic': [
        'What IT incidents require intelligent analysis and routing?',
        'Where could autonomous monitoring and response add value?'
      ],
      'operations-maestro': [
        'What end-to-end operational processes span multiple systems?',
        'How do you coordinate between different operational teams?'
      ]
    };
    
    return combinedQuestions[key] || [];
  }

  getSelectionSummary() {
    const summary = {
      lob: this.selectedLOB,
      projectTypes: Array.from(this.selectedProjectTypes),
      hasSelections: this.selectedLOB || this.selectedProjectTypes.size > 0
    };
    
    return summary;
  }
}

// Initialize managers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    try {
      window.customerInfoManager = new CustomerInfoManager();
      window.llmPromptBar = new LLMPromptBar();
      window.dynamicDiscoveryManager = new DynamicDiscoveryManager();
      console.log('Customer Info Manager, LLM Prompt Bar and Dynamic Discovery Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize managers:', error);
    }
  }, 1000); // Delay to ensure other components are loaded
});