import { api } from "./api.js";
import { esc, code, pill } from "./format.js";

const store = { activities: [], donors: [], screenings: [], donations: [] };

const TITLES = {
  dashboard: "Dashboard",
  activities: "MBD Activities",
  donors: "Donor Records",
  screenings: "Medical Screening",
  donations: "Donation Records",
  reports: "Reports"
};

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

/* ---------- lookups ---------- */
const donorLabel = id => {
  const d = store.donors.find(x => x.id === id);
  return d ? `${d.first} ${d.last}` : "Unknown donor";
};
const activityLabel = id => store.activities.find(x => x.id === id)?.name ?? "Unknown activity";

/* ---------- errors ---------- */
let errorTimer;
function showError(message) {
  const el = $("#error-banner");
  el.textContent = message;
  el.hidden = false;
  clearTimeout(errorTimer);
  errorTimer = setTimeout(() => (el.hidden = true), 5000);
}

/* ---------- views ---------- */
function openView(name) {
  $$(".view").forEach(v => (v.hidden = v.id !== `view-${name}`));
  $$(".menu-item").forEach(b => b.classList.toggle("is-active", b.dataset.view === name));
  $("#view-title").textContent = TITLES[name] ?? "MBDMS";
}

/* ---------- table rendering ---------- */
function fillRows(selector, items, toRow, emptyText, cols = 4) {
  $(selector).innerHTML = items.length
    ? items.map(toRow).join("")
    : `<tr><td class="empty" colspan="${cols}">${emptyText}</td></tr>`;
}

const activityRow = a => `
  <tr><td>${esc(a.name)}</td><td>${esc(a.date)}</td><td>${esc(a.venue)}</td><td>${pill(a.status)}</td></tr>`;

function renderActivities() {
  const term = $("#search-activities").value.toLowerCase();
  const matches = store.activities.filter(a =>
    `${a.name} ${a.venue} ${a.date}`.toLowerCase().includes(term));
  fillRows("#rows-activities", matches, activityRow, "No activities found.");
  fillRows("#rows-dashboard", store.activities.slice(0, 5), activityRow, "No activities yet.");
}

function renderDonors() {
  const term = $("#search-donors").value.toLowerCase();
  const matches = store.donors.filter(d =>
    `${d.first} ${d.last} ${code("DON", d.id)}`.toLowerCase().includes(term));
  fillRows("#rows-donors", matches, d => `
    <tr>
      <td>${code("DON", d.id)}</td>
      <td>${esc(d.first)} ${esc(d.last)}</td>
      <td>${esc(d.birthdate)}</td>
      <td>${esc(d.contact)}</td>
    </tr>`, "No donors found.");
}

function renderScreenings() {
  fillRows("#rows-screenings", store.screenings, s => `
    <tr>
      <td>${code("SCR", s.id)}</td>
      <td>${esc(donorLabel(s.donorId))}</td>
      <td>${esc(activityLabel(s.activityId))}</td>
      <td>${pill(s.outcome)}</td>
    </tr>`, "No screening records yet.");
}

function renderDonations() {
  fillRows("#rows-donations", store.donations, d => `
    <tr>
      <td>${code("DONATION", d.id)}</td>
      <td>${esc(donorLabel(d.donorId))}</td>
      <td>${esc(activityLabel(d.activityId))}</td>
      <td>${pill(d.status)}</td>
    </tr>`, "No donations recorded yet.");
}

function renderStats() {
  const stats = {
    activities: store.activities.length,
    donors: store.donors.length,
    screenings: store.screenings.length,
    donations: store.donations.filter(d => d.status === "Completed").length
  };
  $$("[data-stat]").forEach(el => (el.textContent = stats[el.dataset.stat]));
}

function renderSelects() {
  const sources = {
    donors: store.donors.map(d => ({ value: d.id, label: `${code("DON", d.id)} - ${d.first} ${d.last}` })),
    activities: store.activities.map(a => ({ value: a.id, label: `${a.name} (${a.date})` }))
  };
  $$("select[data-options]").forEach(select => {
    const options = sources[select.dataset.options];
    const kept = select.value;
    select.innerHTML = options.length
      ? options.map(o => `<option value="${o.value}">${esc(o.label)}</option>`).join("")
      : `<option value="">No records available</option>`;
    if (kept) select.value = kept;
  });
}

function renderAll() {
  renderActivities();
  renderDonors();
  renderScreenings();
  renderDonations();
  renderStats();
  renderSelects();
}

/* ---------- data ---------- */
async function refresh() {
  try {
    const names = Object.keys(store);
    const results = await Promise.all(names.map(n => api.list(n)));
    names.forEach((n, i) => (store[n] = results[i]));
    renderAll();
  } catch (err) {
    showError(`Could not load data: ${err.message}`);
  }
}

function bindForm(formId, resource, panelId) {
  $(formId).addEventListener("submit", async event => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await api.create(resource, Object.fromEntries(new FormData(form)));
      form.reset();
      $(panelId).hidden = true;
      await refresh();
    } catch (err) {
      showError(err.message);
    }
  });
}

/* ---------- wiring ---------- */
$$(".menu-item").forEach(b => b.addEventListener("click", () => openView(b.dataset.view)));
$$("[data-jump]").forEach(b => b.addEventListener("click", () => openView(b.dataset.jump)));
$$("[data-reveal]").forEach(b => b.addEventListener("click", () => {
  const panel = document.getElementById(b.dataset.reveal);
  panel.hidden = !panel.hidden;
}));

$("#search-activities").addEventListener("input", renderActivities);
$("#search-donors").addEventListener("input", renderDonors);

bindForm("#activity-form", "activities", "#form-activity");
bindForm("#donor-form", "donors", "#form-donor");
bindForm("#screening-form", "screenings", "#form-screening");
bindForm("#donation-form", "donations", "#form-donation");

$("#print-report").addEventListener("click", () => window.print());
$("#reset-demo").addEventListener("click", async () => {
  if (!confirm("Reset all data back to the original demo records?")) return;
  try {
    await api.reset();
    await refresh();
  } catch (err) {
    showError(err.message);
  }
});

refresh();
