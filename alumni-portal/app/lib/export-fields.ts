export type ExportField = {
  key: string;
  label: string;
  group: string;
};

export const EXPORT_FIELDS: ExportField[] = [
  { key: "first_name", label: "First Name", group: "Basic Identity" },
  { key: "surname", label: "Surname", group: "Basic Identity" },
  { key: "full_name", label: "Full Name", group: "Basic Identity" },

  { key: "current_role", label: "Current Role", group: "Professional" },
  { key: "current_role_seniority", label: "Seniority", group: "Professional" },
  { key: "current_firm", label: "Current Company", group: "Professional" },
  { key: "current_industry", label: "Current Industry", group: "Professional" },
  { key: "current_city", label: "Current City", group: "Professional" },
  { key: "current_country", label: "Current Country", group: "Professional" },
  { key: "notable_past_firms", label: "Past Firms", group: "Professional" },
  { key: "npf_industry", label: "Past Industry", group: "Professional" },

  { key: "jeme_role", label: "JEME Role", group: "JEME / Network" },
  { key: "jeme_role_2", label: "JEME Role 2", group: "JEME / Network" },
  { key: "jeme_role_3", label: "JEME Role 3", group: "JEME / Network" },
  { key: "jeme_starting_period", label: "JEME Start Date", group: "JEME / Network" },
  { key: "jeme_ending_period", label: "JEME Graduation Date", group: "JEME / Network" },
  { key: "age_group", label: "Age Group", group: "JEME / Network" },
  { key: "board", label: "Board Member", group: "JEME / Network" },
  { key: "head", label: "Department Head", group: "JEME / Network" },

  { key: "email", label: "Email", group: "Contact" },
  { key: "phone_number", label: "Phone", group: "Contact" },
  { key: "linkedin", label: "LinkedIn", group: "Contact" },
];

export const EXPORT_FIELD_KEYS = new Set(EXPORT_FIELDS.map((f) => f.key));

export const FIELD_GROUPS = [...new Set(EXPORT_FIELDS.map((f) => f.group))];

export const DEFAULT_EXPORT_FIELDS = [
  "first_name",
  "surname",
  "current_role",
  "current_firm",
  "current_industry",
  "current_country",
  "linkedin",
  "jeme_role",
];
