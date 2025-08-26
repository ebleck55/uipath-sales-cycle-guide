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
        world: 'Manages the bank\'s core engine. Oversees thousands of employees in operations, payments, and servicing, all while fighting fires and trying to drive digital transformation.',
        cares: 'Reducing cost-to-serve, improving straight-through processing (STP) rates, ensuring business resilience, and meeting aggressive efficiency targets set by the board.',
        help: 'Automate high-volume, repetitive back-office processes like payment investigations, KYC refreshes, and dispute resolution using a governed combination of AI and RPA.'
      },
      {
        title: 'Chief Compliance Officer',
        world: 'Lives in a world of complex, ever-changing regulations (AML, KYC, etc.). Their primary role is to protect the bank from massive fines and reputational damage.',
        cares: 'Minimizing false positives in transaction monitoring, clearing alert backlogs to avoid regulatory breaches, and proving the bank has auditable, explainable controls.',
        help: 'Use Document Understanding and AI to automate KYC/AML checks, screen for adverse media, and provide clear, auditable decision trails for regulators.'
      },
      {
        title: 'Head of Contact Center',
        world: 'Runs a high-pressure environment focused on customer experience (CX). They constantly battle agent attrition, high training costs, and pressure to reduce call times.',
        cares: 'Improving Net Promoter Score (NPS) and Customer Satisfaction (CSAT), reducing Average Handle Time (AHT), and ensuring agents are compliant with scripts and procedures.',
        help: 'Provide agents with a "copilot" that automates desktop tasks, finds answers in knowledge bases, and handles post-call summary and wrap-up work automatically.'
      },
      {
        title: 'CIO / CTO',
        world: 'Balances the need for innovation with the reality of maintaining complex, legacy core banking systems. They are under pressure to deliver value faster and more securely.',
        cares: 'Reducing total cost of ownership (TCO) for technology, standardizing on scalable enterprise platforms, mitigating vendor and security risks, and avoiding integration debt.',
        help: 'Deploy an enterprise-grade automation fabric with robust governance, role-based access controls (RBAC), API-first integration, and options for private AI.'
      },
      {
        title: 'Head of Payments Ops',
        world: 'Manages the high-stakes, time-sensitive flow of money. Their world is dictated by payment cutoffs, SWIFT messages, and the constant risk of failed transactions.',
        cares: 'Maximizing the Straight-Through Processing (STP) rate, minimizing financial write-offs from errors, and meeting strict Service Level Agreements (SLAs) for payment execution.',
        help: 'Automate the entire payment exceptions workflow: triage incoming cases, parse documents, use rules and LLMs for routing, and enable auto-resolution for common issues.'
      },
      {
        title: 'Line of Business GM',
        world: 'Owns the P&L for a specific product like mortgages or credit cards. They are deeply focused on market share, customer acquisition, and profitability.',
        cares: 'Hitting revenue and margin targets, reducing customer churn, and launching new products faster than the competition. They see technology as a means to a business end.',
        help: 'Deliver automation for specific, high-impact use cases that are directly tied to their P&L, such as accelerating loan onboarding or improving the collections process.'
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
        'Aligned on pains automation can solve',
        'Confirmed interest in UiPath solution',
        'Customer commitment to invest time',
        'Executive sponsor identified',
        'NDA signed (if necessary)'
      ],
      initialPersonas: [
        '<strong>Automation COE / IT Manager:</strong> First-line evaluator and technical guide.',
        '<strong>Line of Business Director:</strong> Feels the pain and can champion change.'
      ],
      questions: {
        'Pain & Impact': [
          'Walk me through how <em>X</em> happens today. Where are the delays or re-work?',
          'If nothing changes in 6–12 months, what breaks or who is impacted most?',
          'Can we quantify the impact in cost, revenue, risk, or CX terms?'
        ],
        'Strategic Alignment': [
          'Which executive initiative does improving this process support (e.g., efficiency, CX, risk)?',
          'What would a successful quarter look like if we fixed this?'
        ],
        'People & Roles': [
          'Who owns the process? Who needs to sign off?',
          'Who benefits day-to-day and who could block it?'
        ],
        'Tech & Data': [
          'Which systems are in the flow (core, CRM, email, spreadsheets)?',
          'What documents or data inputs are involved and how are they validated today?'
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
        }
      ],
      resources: {
        banking: [
          {
            name: 'Intelligent KYC / AML',
            link: '#',
            overview: 'Automate KYC refresh and adverse media screening.',
            why: 'Show CCO risk mitigation and OPEX reduction.'
          }
        ],
        insurance: [
          {
            name: 'AI-Powered Claims Intake',
            link: '#',
            overview: 'Extract FNOL, classify claims, route to adjuster.',
            why: 'Reduce cycle time and improve FNOL quality.'
          }
        ]
      }
    },
    {
      id: 'business-qualification',
      title: '2. Business Qualification: Value, Sponsor, Compelling Event',
      outcomes: [
        'Economic buyer identified',
        'Business case agreed in principle',
        'Compelling event/date documented',
        'Decision process mapped'
      ],
      initialPersonas: [
        '<strong>EVP/VP Operations:</strong> Owns savings targets.',
        '<strong>Finance Partner:</strong> Validates benefits & ROI.'
      ],
      questions: {
        'Value & Outcomes': [
          'What target KPIs would prove success (e.g., STP, AHT, leakage)?',
          'What budget source funds this and when does it reset?'
        ],
        'Decision & Process': [
          'Who signs? What steps from now to signature?',
          'Any security, privacy, or model risk approvals required?'
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
          }
        ]
      }
    },
    {
      id: 'technical-qualification',
      title: '3. Technical Qualification: Feasibility, Risk, Architecture',
      outcomes: [
        'Target architecture agreed',
        'Security & compliance posture accepted',
        'Data availability confirmed',
        'Pilot plan defined'
      ],
      initialPersonas: [
        '<strong>Enterprise Architect:</strong> Integrations & standards.',
        '<strong>Security / Model Risk:</strong> Controls, audit.'
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
          }
        ]
      }
    },
    {
      id: 'proposal',
      title: '4. Proposal & Negotiation: Commercials, Scope, Success Plan',
      outcomes: [
        'Mutually agreed success plan',
        'SOW/Order form drafted',
        'Pricing approved',
        'Redlines resolved'
      ],
      initialPersonas: [
        '<strong>Procurement:</strong> Commercials & terms.',
        '<strong>Legal:</strong> Data & liability.'
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
        'Pilot completed on time',
        'KPIs achieved/validated',
        'Runbook & ownership in place',
        'Next use-cases prioritized'
      ],
      initialPersonas: [
        '<strong>Program Lead:</strong> Drives cadence & unblockers.',
        '<strong>Ops Manager:</strong> Adopts new way of working.'
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