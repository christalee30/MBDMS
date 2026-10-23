require("dotenv").config();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter(k => !process.env[k]);

if (missing.length) {
  console.error(`Missing environment variable(s): ${missing.join(", ")}. Copy .env.example to .env first.`);
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  supabaseUrl: process.env.SUPABASE_URL,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};
