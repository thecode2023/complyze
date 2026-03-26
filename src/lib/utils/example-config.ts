export const exampleOpenClawConfig = {
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
    enabled: [
      "calendar",
      "email-send",
      "crm-lookup",
      "payment-processing",
    ],
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
};

export const exampleConfigString = JSON.stringify(
  exampleOpenClawConfig,
  null,
  2
);
