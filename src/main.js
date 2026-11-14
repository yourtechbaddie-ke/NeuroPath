import "./styles/tokens.css";
import "./styles/app.css";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db, ready } from "./firebase.js";
import { deidentify, buildBrief } from "./ai.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const list = (items = [], cls) => items.map((i) => `<div class="${cls}">${esc(i)}</div>`).join("") || `<p class="note">None found.</p>`;
let current = null;

$("build").onclick = async () => {
  const text = $("statement").value.trim();
  if (!text) return;
  $("build").disabled = true;
  $("out").innerHTML = "<p>Removing identifiers, then building the brief…</p>";
  try {
    await ready;
    const clean = await deidentify(text);
    const brief = await buildBrief(clean.text);
    current = { brief, privacySource: clean.source };
    $("out").innerHTML = `
      <span class="badge">Identifiers removed ${clean.source === "on_device" ? "on your device" : "(cloud fallback)"}</span>
      <h2>Urgency: ${esc(brief.urgency)}</h2><p>${esc(brief.summary)}</p>
      <h2>Red flags</h2>${list(brief.redFlags, "flag")}
      <h2>Missing information</h2>${list(brief.missingInfo, "gap")}
      <h2>Questions for the surgeon</h2>${list(brief.questionsForSurgeon, "gap")}
      <button id="save" class="ghost">Approve and save to my case</button>`;
    $("save").onclick = save;
  } catch (err) {
    $("out").innerHTML = `<p class="flag">Could not build the brief: ${esc(err.message)}. Check your Firebase keys and App Check token.</p>`;
  } finally { $("build").disabled = false; }
};

async function save() {
  await addDoc(collection(db, "cases"), {
    patientId: auth.currentUser.uid, consent: true, status: "new",
    brief: current.brief, privacySource: current.privacySource, createdAt: serverTimestamp(),
  });
  $("save").textContent = "Saved";
  $("save").disabled = true;
}