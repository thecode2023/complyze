export interface ExampleConfig {
  id: string;
  name: string;
  industry: string;
  icon: string;
  description: string;
  riskPreview: "Critical" | "High" | "Medium" | "Low";
  config: Record<string, unknown>;
}

export const exampleConfigs: ExampleConfig[] = [
  {
    id: "healthcare-ai",
    name: "Healthcare AI Agent",
    industry: "Healthcare",
    icon: "🏥",
    description: "Patient triage assistant processing health records and making care recommendations",
    riskPreview: "Critical",
    config: {
      name: "patient-triage-agent",
      model: "claude-sonnet-4-20250514",
      description: "AI-powered patient triage and care recommendation system",
      channels: ["web-portal", "ehr-integration", "mobile-app"],
      capabilities: {
        web_browsing: false,
        file_access: {
          read: ["~/patient-records", "~/medical-guidelines"],
          write: ["~/triage-reports"],
        },
        code_execution: false,
        api_access: ["epic-ehr", "cerner-fhir", "lab-results-api"],
      },
      tools: {
        enabled: ["patient-lookup", "diagnosis-assist", "appointment-scheduling", "medication-check"],
        elevated: ["diagnosis-assist", "medication-check", "treatment-recommendation"],
        approval_required: ["treatment-recommendation"],
      },
      data_access: {
        pii: true,
        financial_records: false,
        health_data: true,
        biometric_data: true,
      },
      permissions: {
        autonomous_decisions: true,
        max_transaction_amount: 0,
        human_oversight: "minimal",
        geographic_scope: ["US", "EU", "CA"],
      },
      security: {
        sandbox_mode: false,
        audit_logging: true,
        credential_storage: "vault",
        gateway_binding: "127.0.0.1:18789",
      },
    },
  },
  {
    id: "fintech-trading",
    name: "FinTech Trading Bot",
    industry: "Financial Services",
    icon: "📈",
    description: "Autonomous trading agent executing market orders with real-time portfolio management",
    riskPreview: "Critical",
    config: {
      name: "algo-trading-agent",
      model: "claude-sonnet-4-20250514",
      description: "Algorithmic trading agent for equities and derivatives markets",
      channels: ["api-gateway", "trading-terminal"],
      capabilities: {
        web_browsing: true,
        file_access: {
          read: ["~/market-data", "~/portfolios"],
          write: ["~/trade-logs", "~/reports"],
        },
        code_execution: true,
        api_access: ["bloomberg-api", "alpaca-trading", "risk-engine", "compliance-check"],
      },
      tools: {
        enabled: ["market-analysis", "order-execution", "portfolio-rebalance", "risk-assessment"],
        elevated: ["order-execution", "portfolio-rebalance", "margin-trading"],
        approval_required: [],
      },
      data_access: {
        pii: true,
        financial_records: true,
        health_data: false,
        biometric_data: false,
      },
      permissions: {
        autonomous_decisions: true,
        max_transaction_amount: 50000,
        human_oversight: "none",
        geographic_scope: ["US", "EU", "GB", "SG"],
      },
      security: {
        sandbox_mode: false,
        audit_logging: true,
        credential_storage: "env-vars",
        gateway_binding: "0.0.0.0:18789",
      },
    },
  },
  {
    id: "hr-screening",
    name: "HR Screening Agent",
    industry: "Human Resources",
    icon: "👥",
    description: "Resume screening and candidate ranking agent for hiring pipelines",
    riskPreview: "High",
    config: {
      name: "hr-screening-agent",
      model: "claude-sonnet-4-20250514",
      description: "Automated resume screening and candidate evaluation for hiring",
      channels: ["ats-integration", "recruiter-dashboard"],
      capabilities: {
        web_browsing: false,
        file_access: {
          read: ["~/resumes", "~/job-descriptions"],
          write: ["~/screening-reports"],
        },
        code_execution: false,
        api_access: ["greenhouse-ats", "linkedin-api", "background-check-api"],
      },
      tools: {
        enabled: ["resume-parse", "candidate-rank", "interview-schedule", "reference-check"],
        elevated: ["candidate-rank", "background-check"],
        approval_required: ["background-check"],
      },
      data_access: {
        pii: true,
        financial_records: false,
        health_data: false,
        biometric_data: false,
      },
      permissions: {
        autonomous_decisions: true,
        max_transaction_amount: 0,
        human_oversight: "limited",
        geographic_scope: ["US", "US-IL", "US-CO", "EU"],
      },
      security: {
        sandbox_mode: true,
        audit_logging: true,
        credential_storage: "vault",
        gateway_binding: "127.0.0.1:18789",
      },
    },
  },
  {
    id: "customer-support",
    name: "Customer Support Agent",
    industry: "Technology",
    icon: "💬",
    description: "Autonomous support agent handling customer queries with payment processing access",
    riskPreview: "High",
    config: {
      name: "customer-support-agent",
      model: "claude-sonnet-4-20250514",
      description: "Autonomous customer support agent for financial services",
      channels: ["whatsapp", "slack", "email"],
      capabilities: {
        web_browsing: true,
        file_access: {
          read: ["~/documents", "~/downloads"],
          write: ["~/reports"],
        },
        code_execution: false,
        api_access: ["stripe-api", "salesforce-crm", "internal-database"],
      },
      tools: {
        enabled: ["calendar", "email-send", "crm-lookup", "payment-processing"],
        elevated: ["payment-processing", "account-modification"],
        approval_required: [],
      },
      data_access: {
        pii: true,
        financial_records: true,
        health_data: false,
        biometric_data: false,
      },
      permissions: {
        autonomous_decisions: true,
        max_transaction_amount: 5000,
        human_oversight: "none",
        geographic_scope: ["US", "EU", "SG", "ID"],
      },
      security: {
        sandbox_mode: false,
        audit_logging: false,
        credential_storage: "plaintext",
        gateway_binding: "0.0.0.0:18789",
      },
    },
  },
  {
    id: "content-moderation",
    name: "Content Moderation Agent",
    industry: "Media & Entertainment",
    icon: "🛡️",
    description: "Automated content moderation agent scanning user-generated content for policy violations",
    riskPreview: "Medium",
    config: {
      name: "content-moderation-agent",
      model: "claude-sonnet-4-20250514",
      description: "AI-powered content moderation for user-generated platforms",
      channels: ["content-pipeline", "moderation-dashboard"],
      capabilities: {
        web_browsing: false,
        file_access: {
          read: ["~/content-queue", "~/policy-docs"],
          write: ["~/moderation-logs"],
        },
        code_execution: false,
        api_access: ["content-api", "user-service", "appeals-queue"],
      },
      tools: {
        enabled: ["content-scan", "toxicity-check", "image-classify", "action-enforce"],
        elevated: ["action-enforce", "account-restrict"],
        approval_required: ["account-restrict"],
      },
      data_access: {
        pii: true,
        financial_records: false,
        health_data: false,
        biometric_data: false,
      },
      permissions: {
        autonomous_decisions: true,
        max_transaction_amount: 0,
        human_oversight: "limited",
        geographic_scope: ["US", "EU", "BR", "INTL"],
      },
      security: {
        sandbox_mode: true,
        audit_logging: true,
        credential_storage: "vault",
        gateway_binding: "127.0.0.1:18789",
      },
    },
  },
];

// Legacy export for backward compatibility
export const exampleOpenClawConfig = exampleConfigs[3].config;
export const exampleConfigString = JSON.stringify(exampleOpenClawConfig, null, 2);
