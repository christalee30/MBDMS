const { createClient } = require("@supabase/supabase-js");
const { supabaseUrl, serviceKey } = require("./config");

// Service-role key: server-side only, never exposed to /public.
const db = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function rowExists(table, id) {
  const { count, error } = await db
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("id", id);
  if (error) throw error;
  return count > 0;
}

async function countRows(table, narrow) {
  let query = db.from(table).select("id", { count: "exact", head: true });
  if (narrow) query = narrow(query);
  const { count, error } = await query;
  if (error) throw error;
  return count;
}

async function listAll(table) {
  const { data, error } = await db.from(table).select("*").order("id");
  if (error) throw error;
  return data;
}

module.exports = { db, rowExists, countRows, listAll };
