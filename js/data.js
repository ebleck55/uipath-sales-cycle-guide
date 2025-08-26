// UiPath Sales Cycle Guide - Data Configuration
// This file contains all the content data that can be easily modified

const SALES_CYCLE_DATA = {
  // Current industry selection
  industry: 'banking',
  
  // Buyer personas by industry
  personas: {
    banking: [
      {
        title: 'Chief Operating Officer',
        world: 'Manages the bank\'s core engine. Oversees thousands of employees in operations, payments, and servicing, all while fighting fires and trying to drive digital transformation. Increasingly pressured to deliver AI-driven efficiency while maintaining operational risk controls.',
        cares: 'Reducing cost-to-serve, improving straight-through processing (STP) rates, ensuring business resilience, and meeting aggressive efficiency targets set by the board. Seeks measurable AI ROI while avoiding operational disruption.',
        help: 'Deploy agentic automation for complex, end-to-end processes like loan origination (reducing 5-day manual process to 1-day with AI decisioning), payment investigations with intelligent case routing, and KYC refreshes with automated adverse media screening and risk scoring.'
      },
      {
        title: 'Chief Compliance Officer',
        world: 'Lives in a world of complex, ever-changing regulations (AML, KYC, etc.). Their primary role is to protect the bank from massive fines and reputational damage. Must balance AI innovation with regulatory explainability and model risk management.',
        cares: 'Minimizing false positives in transaction monitoring, clearing alert backlogs to avoid regulatory breaches, proving the bank has auditable, explainable controls, and ensuring AI models meet regulatory scrutiny (SR 11-7, OCC guidance).',
        help: 'Deploy governed agentic workflows for KYC/AML processes with full audit trails, automated adverse media screening with confidence scoring, intelligent transaction monitoring with explainable AI decisioning, and regulatory reporting automation with human oversight controls.'
      },
      {
        title: 'Head of Contact Center',
        world: 'Runs a high-pressure environment focused on customer experience (CX). They constantly battle agent attrition, high training costs, and pressure to reduce call times. Exploring AI agents to handle routine inquiries while keeping complex cases human-assisted.',
        cares: 'Improving Net Promoter Score (NPS) and Customer Satisfaction (CSAT), reducing Average Handle Time (AHT), ensuring agents are compliant with scripts and procedures, and maximizing agent productivity through AI assistance.',
        help: 'Deploy intelligent agent assistants that provide real-time account insights, automate desktop workflows during calls, generate post-call summaries, suggest next-best actions, and escalate complex cases to human agents with full context and recommended solutions.'
      },
      {
        title: 'CIO / CTO',
        world: 'Balances the need for innovation with the reality of maintaining complex, legacy core banking systems. They are under pressure to deliver value faster and more securely while establishing enterprise AI governance and ensuring regulatory compliance.',
        cares: 'Reducing total cost of ownership (TCO) for technology, standardizing on scalable enterprise platforms, mitigating vendor and security risks, avoiding integration debt, and building reusable AI/automation capabilities with proper model risk management.',
        help: 'Implement an enterprise-grade agentic automation platform with centralized governance, role-based access controls (RBAC), API-first integration, private AI deployment options, comprehensive audit logging, and pre-built connectors for core banking systems.'
      },
      {
        title: 'Head of Payments Ops',
        world: 'Manages the high-stakes, time-sensitive flow of money. Their world is dictated by payment cutoffs, SWIFT messages, and the constant risk of failed transactions. Must achieve near-perfect STP rates while managing complex exception handling and regulatory reporting.',
        cares: 'Maximizing the Straight-Through Processing (STP) rate, minimizing financial write-offs from errors, meeting strict Service Level Agreements (SLAs) for payment execution, and reducing manual investigation time for payment exceptions.',
        help: 'Deploy agentic automation for the complete payment lifecycle: intelligent exception triage with AI-powered document parsing, automated investigation workflows with decision trees, real-time SWIFT message analysis, predictive failure detection, and auto-resolution for 80% of common payment issues with human escalation for complex cases.'
      },
      {
        title: 'Line of Business GM',
        world: 'Owns the P&L for a specific product like mortgages or credit cards. They are deeply focused on market share, customer acquisition, and profitability. Needs AI solutions that demonstrably impact their business metrics and competitive position.',
        cares: 'Hitting revenue and margin targets, reducing customer churn, launching new products faster than the competition, improving customer acquisition cost (CAC), and maximizing customer lifetime value (CLV). They see technology as a means to a business end.',
        help: 'Deploy targeted agentic solutions with measurable P&L impact: accelerate loan origination from 5 days to 1 day with AI underwriting assistance, automate collections workflows with intelligent customer communication sequencing, provide personalized product recommendations through customer journey analysis, and enable real-time fraud prevention to reduce losses.'
      },
      {
        title: 'Head of Lending',
        world: 'Manages the entire lending lifecycle from origination to servicing across consumer, commercial, and mortgage portfolios. Constantly balancing growth targets with credit risk management while ensuring regulatory compliance and operational efficiency.',
        cares: 'Improving loan approval speed and accuracy, reducing credit losses and charge-offs, meeting regulatory requirements (CECL, CCAR), optimizing loan pricing, and enhancing borrower experience to drive volume growth.',
        help: 'Implement intelligent lending automation: AI-powered credit decisioning with explainable models, automated document processing for loan applications, intelligent loan pricing optimization, automated compliance monitoring, and predictive analytics for early default identification.'
      },
      {
        title: 'Head of AML',
        world: 'Leads the bank\'s fight against money laundering and financial crimes. Operates under intense regulatory scrutiny with severe penalties for compliance failures. Must balance thorough monitoring with operational efficiency and customer experience.',
        cares: 'Reducing false positive alert rates, ensuring comprehensive suspicious activity detection, maintaining audit-ready documentation, meeting regulatory examination requirements, and demonstrating effective AML program governance to regulators.',
        help: 'Deploy advanced AML automation: AI-enhanced transaction monitoring with behavioral analytics, automated case management and investigation workflows, intelligent entity resolution and network analysis, regulatory reporting automation, and explainable AI for audit and examination support.'
      },
      {
        title: 'Head of Wealth Operations',
        world: 'Oversees the operational backbone of wealth management services, ensuring seamless client onboarding, account management, and portfolio operations. Manages complex workflows involving multiple systems, custodians, and regulatory requirements.',
        cares: 'Streamlining client onboarding processes, reducing operational errors in trade settlement, ensuring accurate fee calculations and billing, maintaining client data integrity, and supporting advisor productivity through efficient operations.',
        help: 'Automate wealth management operations: intelligent client onboarding with document processing, automated portfolio rebalancing and trade execution, AI-powered fee calculation and reconciliation, automated reporting generation for clients and regulators, and intelligent exception handling for operational issues.'
      },
      {
        title: 'Head of Trading Operations',
        world: 'Manages post-trade operations including trade settlement, clearing, and reconciliation across multiple asset classes and markets. Operates in a high-pressure, time-sensitive environment where errors can result in significant financial losses.',
        cares: 'Minimizing trade settlement failures and breaks, ensuring accurate trade matching and confirmation, maintaining regulatory compliance for trade reporting, optimizing collateral management, and reducing operational risk exposure.',
        help: 'Implement intelligent trade operations automation: automated trade matching and exception handling, AI-powered reconciliation across multiple systems, intelligent collateral optimization, automated regulatory trade reporting, and predictive analytics for settlement risk management.'
      }
    ],
    
    insurance: [
      {
        title: 'Chief Claims Officer',
        world: 'Balances the critical dual mandate of claims: provide an amazing, empathetic customer experience while rigorously controlling costs and preventing fraud.',
        cares: 'Lowering the loss ratio, reducing the cycle time from First Notice of Loss (FNOL) to settlement, and controlling Loss Adjustment Expenses (LAE).',
        help: 'Use AI to automate FNOL intake from any channel, extract policy and coverage details, intelligently route claims to the right adjuster, and detect potential subrogation opportunities.'
      },
      {
        title: 'Head of Underwriting',
        world: 'Leads the team that decides which risks the company will take on. They are shifting from manual, experience-based decisions to a more data-driven, automated process.',
        cares: 'Improving the bind ratio (quotes to bound policies), increasing the hit ratio (submissions to quotes), and dramatically speeding up quote turnaround time to win more business.',
        help: 'Automate the entire submission process, from extracting data from broker emails and ACORD forms to triaging against underwriting appetite and flagging cases for review.'
      },
      {
        title: 'Chief Actuary',
        world: 'Responsible for the complex mathematical models that underpin the entire insurance business, from pricing policies to estimating future losses and ensuring solvency.',
        cares: 'Ensuring the quality and integrity of the data feeding their pricing models, understanding loss cost trends, and maintaining model explainability for regulators.',
        help: 'Use AI to capture structured data from unstructured documents, ensuring data lineage and providing a full audit trail to support actuarial models.'
      },
      {
        title: 'CIO / CTO',
        world: 'Tasked with modernizing creaking, monolithic core systems (policy admin, claims, billing) without disrupting the business. They seek agile, low-risk ways to innovate.',
        cares: 'Accelerating time-to-value for new digital initiatives, minimizing the effort and cost of integrating new technologies, and managing vendor and cybersecurity risk.',
        help: 'Provide pre-built connectors to common insurance systems, a central governance framework, and guardrails for the safe and compliant use of AI across the enterprise.'
      },
      {
        title: 'Head of Customer Service',
        world: 'Manages the front-line of customer interaction for everything that isn\'t a claim—policy questions, endorsements, billing inquiries, and more.',
        cares: 'Maintaining high Customer Satisfaction (CSAT) scores, reducing Average Handle Time (AHT) for inquiries, and ensuring agents are providing accurate, compliant information.',
        help: 'Deploy agent-assist bots to surface knowledge, automate desktop tasks, analyze call sentiment in real-time, and handle post-call automation and summarization.'
      },
      {
        title: 'Head of Billing',
        world: 'Oversees the complex flow of money, including premium collections from policyholders, commission payments to brokers, and processing refunds and dunning notices.',
        cares: 'Reducing Days Sales Outstanding (DSO), minimizing premium leakage and write-offs, and improving the efficiency of accounts receivable and payable processes.',
        help: 'Automate accounts receivable processes, use LLMs to summarize and help resolve billing disputes, and streamline the reconciliation of payments and commissions.'
      }
    ]
  },
  
  // Sales stages configuration
  stages: [
    {
      id: 'discovery',
      title: '1. Discovery: Find Impact, Build Trust',
      outcomes: [
        'Customer pain identified and business imperatives agreed',
        'Champions & coaches confirmed',
        'Competition understood',
        'Timeline & budget identified',
        '"Before scenarios" identified with value drivers',
        'NDA executed (if needed)'
      ],
      initialPersonas: [
        '<strong>Automation COE / IT Manager:</strong> First-line evaluator and technical guide.',
        '<strong>Line of Business Director:</strong> Feels the pain and can champion change.'
      ],
      uipathTeam: [
        '<strong>Sales:</strong> Lead discovery and qualification',
        '<strong>BDR:</strong> Initial prospecting and lead qualification',
        '<strong>Sales Engineer:</strong> Technical discovery and demos',
        '<strong>Partner Team:</strong> Channel engagement and enablement'
      ],
      questions: {
        'Business Impact & Pain': [
          'Walk me through your biggest operational challenge. What breaks if nothing changes?',
          'Can we quantify the impact in cost, revenue, risk, or customer satisfaction terms?',
          'Which executive initiative does solving this support?'
        ],
        'Industry & LOB Priorities': [
          'What are your top 3 regulatory or compliance pressures this year?',
          'How are you measuring operational efficiency across your lines of business?',
          'What customer experience metrics are you being held accountable for?'
        ],
        'Decision Process': [
          'Who owns this process and who would benefit most from automation?',
          'What would success look like to your CFO and your board?',
          'What\'s your timeline and what triggers urgency?'
        ],
        'AI Readiness': [
          'How is your organization approaching AI governance and model risk management?',
          'What systems and data would an AI solution need to integrate with?'
        ]
      },
      objections: [
        {
          q: "We are focused on Copilot/another GenAI tool.",
          a: "Those are great for personal productivity. UiPath governs end‑to‑end processes with auditability, orchestration, and system integration—complementary, not overlapping."
        },
        {
          q: "We tried RPA before and it didn't scale.",
          a: "Many programs stalled without central governance and discovery. We bake in guardrails, testing, and pipeline management to scale safely."
        },
        {
          q: "We can't move to cloud due to security/compliance requirements.",
          a: "UiPath offers flexible deployment options including private cloud and on-premise. However, our cloud platform provides enhanced security, compliance certifications (SOC2, FedRAMP), and significant cost advantages—let's explore what specific requirements we need to address."
        },
        {
          q: "Cloud costs will be too high compared to on-premise.",
          a: "Cloud TCO is typically 30-40% lower when you factor in infrastructure management, updates, security, and scalability. We can model your specific usage patterns to show the complete cost comparison including reduced IT overhead."
        },
        {
          q: "We've already invested heavily in our current infrastructure.",
          a: "We understand sunk cost concerns. Cloud migration can be phased to maximize your existing investment while gaining immediate benefits like automatic updates, enhanced security, and access to newest AI capabilities that aren't available on-premise."
        }
      ],
      resources: {
        banking: [
          {
            name: 'Intelligent KYC / AML',
            link: '#',
            overview: 'Automate KYC refresh and adverse media screening.',
            why: 'Show CCO risk mitigation and OPEX reduction.'
          },
          {
            name: 'Agentic Loan Origination',
            link: '#',
            overview: 'End-to-end loan processing with AI decisioning: application intake, document extraction, credit analysis, compliance checks, and approval routing.',
            why: 'Reduce 5-day manual process to 1-day automated with 80% straight-through processing.'
          },
          {
            name: 'Intelligent Payment Operations',
            link: '#',
            overview: 'Automated payment exception handling: SWIFT message parsing, investigation workflows, and resolution routing.',
            why: 'Increase STP rates and reduce manual investigation time by 70%.'
          },
          {
            name: 'AI-Powered Contact Center',
            link: '#',
            overview: 'Agent copilot with real-time account insights, desktop automation, and post-call summarization.',
            why: 'Improve AHT, CSAT, and agent productivity while ensuring compliance.'
          },
          {
            name: 'Automated Regulatory Reporting',
            link: '#',
            overview: 'Intelligent data collection, validation, and regulatory report generation with audit trails.',
            why: 'Reduce compliance risk and manual reporting effort by 60%.'
          },
          {
            name: 'Intelligent Lending Automation',
            link: '#',
            overview: 'End-to-end loan processing with AI credit decisioning, document processing, and pricing optimization.',
            why: 'Reduce loan approval time from days to hours with 95% automation rate.'
          },
          {
            name: 'Advanced AML Transaction Monitoring',
            link: '#',
            overview: 'AI-enhanced suspicious activity detection with behavioral analytics and case management automation.',
            why: 'Reduce false positives by 80% while improving detection accuracy.'
          },
          {
            name: 'Wealth Operations Automation',
            link: '#',
            overview: 'Client onboarding, portfolio management, and fee calculation automation with exception handling.',
            why: 'Streamline operations and reduce processing errors by 90%.'
          },
          {
            name: 'Trading Operations Intelligence',
            link: '#',
            overview: 'Automated trade settlement, reconciliation, and regulatory reporting with risk analytics.',
            why: 'Minimize settlement breaks and ensure real-time compliance monitoring.'
          },
          {
            name: 'Cloud Migration Strategy for Financial Services',
            link: '#',
            overview: 'Comprehensive guide for migrating banking operations to UiPath Cloud with security, compliance, and governance frameworks.',
            why: 'Reduce infrastructure costs by 40% while gaining access to latest AI capabilities and enhanced security.'
          },
          {
            name: 'UiPath Cloud Security & Compliance Guide',
            link: '#',
            overview: 'Security architecture, compliance certifications (SOC2, FedRAMP), and data residency options for banking.',
            why: 'Address security and compliance concerns while demonstrating cloud advantages.'
          }
        ],
        insurance: [
          {
            name: 'AI-Powered Claims Intake',
            link: '#',
            overview: 'Extract FNOL, classify claims, route to adjuster.',
            why: 'Reduce cycle time and improve FNOL quality.'
          },
          {
            name: 'Intelligent Underwriting Automation',
            link: '#',
            overview: 'Automated submission processing: extract data from broker emails and ACORD forms, triage against appetite, and route for review.',
            why: 'Improve bind ratio and dramatically speed up quote turnaround time.'
          },
          {
            name: 'Automated Premium Audit',
            link: '#',
            overview: 'AI-powered audit processes: analyze payroll records, classify employees, and identify premium adjustments automatically.',
            why: 'Reduce audit cycle time by 60% and improve accuracy of premium calculations.'
          },
          {
            name: 'Claims Investigation Automation',
            link: '#',
            overview: 'Intelligent claims processing: fraud detection, medical record analysis, and automated settlement recommendations.',
            why: 'Lower loss adjustment expenses and improve claim settlement accuracy.'
          },
          {
            name: 'Policy Administration Automation',
            link: '#',
            overview: 'Streamline policy changes, renewals, and endorsements with AI-powered document processing and validation.',
            why: 'Reduce processing time by 70% and improve customer satisfaction scores.'
          },
          {
            name: 'Insurance Cloud Migration Roadmap',
            link: '#',
            overview: 'Step-by-step guide for moving insurance operations to cloud with regulatory compliance and security best practices.',
            why: 'Reduce infrastructure costs and gain access to advanced AI capabilities for claims and underwriting.'
          },
          {
            name: 'UiPath Cloud TCO Calculator for Insurance',
            link: '#',
            overview: 'Total cost of ownership analysis comparing cloud vs on-premise deployment for insurance operations.',
            why: 'Demonstrate cost savings and ROI of cloud migration for CFO approval.'
          }
        ]
      }
    },
    {
      id: 'business-qualification',
      title: '2. Business Qualification: Value, Sponsor, Compelling Event',
      outcomes: [
        'Economic buyer confirmed with budget',
        'Decision process understood and validated',
        'Customer success metrics defined',
        'Positive business outcomes defined',
        'Required capabilities defined',
        'ROI and financials modeled via assisted Outside-in'
      ],
      initialPersonas: [
        '<strong>EVP/VP Operations:</strong> Owns savings targets.',
        '<strong>Finance Partner:</strong> Validates benefits & ROI.'
      ],
      uipathTeam: [
        '<strong>Sales:</strong> Business case development and stakeholder alignment',
        '<strong>Sales Engineer:</strong> Solution validation and technical demos',
        '<strong>Global Value Engineering:</strong> ROI modeling and business case support',
        '<strong>Professional Services:</strong> Implementation planning and scoping',
        '<strong>Executives:</strong> Executive sponsor alignment'
      ],
      questions: {
        'Value & ROI Validation': [
          'What target KPIs would prove success (STP rates, cost per transaction, compliance metrics)?',
          'What budget source funds this and what\'s the decision timeline?',
          'How do you typically measure ROI for technology investments?'
        ],
        'Industry-Specific Business Drivers': [
          'What are your biggest cost pressures in [LOB] operations right now?',
          'How are regulatory changes impacting your operational costs and timelines?',
          'What customer experience improvements would most impact your competitive position?',
          'Which operational processes have the highest error rates or rework?'
        ],
        'Decision Authority & Process': [
          'Who is the economic buyer and what\'s their approval threshold?',
          'What steps remain from evaluation to signature?',
          'Which stakeholders need to sign off (Risk, Compliance, IT, Legal)?',
          'Any required security, privacy, or model risk management approvals?'
        ],
        'Implementation Readiness': [
          'What would be the ideal pilot process to prove value quickly?',
          'How do you typically handle change management for process automation?',
          'What success metrics would convince leadership to expand the program?'
        ]
      },
      objections: [
        {
          q: 'No budget until next FY.',
          a: 'We can phase—start with a funded pilot tied to a fast payback and lock pricing for next FY.'
        },
        {
          q: 'Hard to prove ROI.',
          a: 'We co-build a defendable model with baselines, sample data, and finance-approved assumptions.'
        }
      ],
      resources: {
        banking: [
          {
            name: 'ROI Template (Bank Ops)',
            link: '#',
            overview: 'Prebuilt value model for bank processes.',
            why: 'Accelerates CFO validation.'
          }
        ],
        insurance: [
          {
            name: 'Claims ROI Model',
            link: '#',
            overview: 'Cycle-time and leakage model.',
            why: 'Supports CCO decision.'
          },
          {
            name: 'Underwriting Value Calculator',
            link: '#',
            overview: 'ROI model for automated underwriting processes.',
            why: 'Quantifies bind ratio and turnaround improvements.'
          },
          {
            name: 'Premium Audit Business Case',
            link: '#',
            overview: 'Cost savings model for audit automation.',
            why: 'Shows CFO impact on audit expenses and accuracy.'
          }
        ]
      }
    },
    {
      id: 'technical-qualification',
      title: '3. Technical Qualification: Feasibility, Risk, Architecture',
      outcomes: [
        'Technical requirements understood',
        'Required capabilities proven (e.g.: POV)',
        'Products, solutions, configuration validated',
        'Technical win confirmed',
        'Rollout plan created'
      ],
      initialPersonas: [
        '<strong>Enterprise Architect:</strong> Integrations & standards.',
        '<strong>Security / Model Risk:</strong> Controls, audit.'
      ],
      uipathTeam: [
        '<strong>Sales:</strong> Technical qualification coordination',
        '<strong>Sales Engineer:</strong> Technical validation and POV execution',
        '<strong>Professional Services:</strong> Implementation architecture and rollout planning',
        '<strong>Partner Team:</strong> Partner technical resources and integration'
      ],
      questions: {
        'Architecture & Integrations': [
          'What integration patterns are preferred (APIs, queues, UI)?',
          'Any constraints for on-prem vs. cloud vs. private AI?'
        ],
        'Risk & Controls': [
          'Which controls are mandatory (PII, SOC2, SOX, SR 11-7)?',
          'How is model performance monitored and governed today?'
        ]
      },
      objections: [
        {
          q: 'LLMs are not allowed with PII.',
          a: 'We support redaction, local models, and policy controls—with full audit trails.'
        },
        {
          q: 'Change risk to core systems.',
          a: 'We start read-only, use APIs where possible, and have rollback plans.'
        }
      ],
      resources: {
        banking: [
          {
            name: 'Ref Architecture – Banking',
            link: '#',
            overview: 'Reference patterns for payments/KYC/ops.',
            why: 'Aligns EA early.'
          }
        ],
        insurance: [
          {
            name: 'Ref Architecture – Insurance',
            link: '#',
            overview: 'Patterns for claims/underwriting.',
            why: 'De-risks integration.'
          },
          {
            name: 'Insurance Data Integration Guide',
            link: '#',
            overview: 'API patterns for policy admin, claims, and billing systems.',
            why: 'Accelerates technical validation and POV setup.'
          }
        ]
      }
    },
    {
      id: 'proposal',
      title: '4. Proposal & Negotiation: Commercials, Scope, Success Plan',
      outcomes: [
        'Economic buyer & UiPath executive sponsor aligned',
        'Compelling proposal w/ROI presented (with Global Value Engineering)',
        'Primary quote accepted',
        'Partner involvement correct (where applicable)',
        'Close plan defined with customer to support close date'
      ],
      initialPersonas: [
        '<strong>Procurement:</strong> Commercials & terms.',
        '<strong>Legal:</strong> Data & liability.'
      ],
      uipathTeam: [
        '<strong>Sales:</strong> Proposal presentation and negotiation leadership',
        '<strong>Commercial Desk/Deal Hub:</strong> Pricing and commercial terms',
        '<strong>Global Value Engineering:</strong> ROI validation and value presentation',
        '<strong>Executives:</strong> Executive alignment and sponsorship',
        '<strong>Professional Services:</strong> SOW development and scoping'
      ],
      questions: {
        'Commercials': [
          'Which pricing model best fits usage and risk?',
          'Any non-standard terms or MSAs we should align to?'
        ],
        'Plan & Governance': [
          'Confirm milestones, owners, and weekly cadence.',
          'What does Day 30/60/90 success look like?'
        ]
      },
      objections: [
        {
          q: 'Too expensive.',
          a: 'Let\'s align price to value—phase scope or tie to milestones while protecting outcomes.'
        },
        {
          q: 'Term liability caps.',
          a: 'We can adjust with scope controls and shared responsibilities.'
        }
      ],
      resources: {
        banking: [
          {
            name: 'Banking Proposal Pack',
            link: '#',
            overview: 'Templates + success plan.',
            why: 'Shortens cycle.'
          }
        ],
        insurance: [
          {
            name: 'Insurance Proposal Pack',
            link: '#',
            overview: 'Templates + success plan.',
            why: 'Aligns stakeholders.'
          }
        ]
      }
    },
    {
      id: 'implement',
      title: '5. Implement & Expand: Deliver Value, Land & Expand',
      outcomes: [
        'Order documents verified and received',
        'SOW signed (if PS included)',
        'Implementation plan confirmed',
        'Initial internal handover meeting completed (AE/SE/CSD/CSM)',
        'Close plan defined and validated with customer'
      ],
      initialPersonas: [
        '<strong>Program Lead:</strong> Drives cadence & unblockers.',
        '<strong>Ops Manager:</strong> Adopts new way of working.'
      ],
      uipathTeam: [
        '<strong>Sales:</strong> Account management and expansion planning',
        '<strong>Deal Hub:</strong> Order processing and documentation',
        '<strong>Finance Operations:</strong> Invoice processing and licensing',
        '<strong>Customer Success:</strong> Implementation support and onboarding'
      ],
      questions: {
        'Delivery & Change': [
          'What change management is needed for agents/analysts?',
          'Who signs off on acceptance and KPI validation?'
        ],
        'Scale & Pipeline': [
          'What\'s the 3–6 month pipeline after pilot?',
          'Where can we reuse components to accelerate?'
        ]
      },
      objections: [
        {
          q: 'Users won\'t adopt.',
          a: 'We co-design with users, provide in-flow guidance, and measure adoption against KPIs.'
        },
        {
          q: 'No resources to expand.',
          a: 'We standardize assets and create a factory model with clear ownership.'
        }
      ],
      resources: {
        banking: [
          {
            name: 'Adoption Toolkit',
            link: '#',
            overview: 'Comms, training, success metrics.',
            why: 'Boosts change success.'
          }
        ],
        insurance: [
          {
            name: 'Claims Pilot Runbook',
            link: '#',
            overview: 'Roles, milestones, rollback.',
            why: 'Ensures safe go-live.'
          }
        ]
      }
    }
  ]
};

// Export data for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SALES_CYCLE_DATA;
}