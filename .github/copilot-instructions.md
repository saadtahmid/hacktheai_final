🚀 Copilot Instructions
🛠 Workflow Guidelines

Copilot should always follow this order when generating code for the project:

1. Frontend First

Always generate UI components first (React / Next.js / Vue or chosen frontend framework).

Make components modular and reusable.

Use mock data or stubs when backend/database is not ready.

Include clear prop names, type definitions, and comments.

2. Backend Second (APIs)

Only generate backend APIs after frontend requirements are clear.

Match the API responses exactly to what the frontend components expect.

Follow RESTful conventions (or GraphQL if specified).

Add validation, authentication (if needed), and error handling.

3. Database Last (Schema Review Required)

Before writing any SQL or ORM models, review the database schema.

Suggest improvements or adjustments if schema doesn’t align with API needs.

Do not assume new tables—always confirm schema first.

Implement queries only after schema approval (Supabase / Postgres / etc.).

✅ Additional Rules

Keep code clean, documented, and consistent.

Always output copy-paste ready code.

Use mock data until backend/database is finalized.

Summarize what was built and what dependencies are required.

⚡ Example Flow

Copilot creates VolunteerCard.jsx with mock volunteer data.

Copilot defines /api/volunteers endpoint returning the same structure.

Copilot reviews the hackathon.volunteers table schema before writing queries.