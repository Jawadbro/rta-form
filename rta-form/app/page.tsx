"use client";
import { useState } from "react";
import { FIELDS, SHOW_CLINICIAN_FIELDS, Field } from "@/lib/fields";

type Values = Record<string, string | string[]>;

export default function Home() {
  const [values, setValues] = useState<Values>({});
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const shown = (f: Field) => !f.computed && (SHOW_CLINICIAN_FIELDS || !f.clinician);
  const visible = (f: Field) => shown(f) && (!f.showIf || values[f.showIf.name] === f.showIf.equals);
  const sections = Array.from(new Set(FIELDS.filter(shown).map((f) => f.section)));

  const set = (name: string, v: string | string[]) => setValues((p) => ({ ...p, [name]: v }));
  const toggle = (name: string, option: string) => {
    const cur = (values[name] as string[]) ?? [];
    set(name, cur.includes(option) ? cur.filter((x) => x !== option) : [...cur, option]);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.study_id ?? "");
      } else {
        setStatus("error");
        setMessage(typeof data.error === "string" ? data.error : "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <main style={{ maxWidth: 680, margin: "40px auto", padding: 16 }}>
        <h1>Thank you</h1>
        <p>Your response has been recorded. Reference ID: <b>{message}</b></p>
      </main>
    );
  }

  const input = { width: "100%", padding: 10, fontSize: 16, marginTop: 4, boxSizing: "border-box" as const };

  return (
    <main style={{ maxWidth: 680, margin: "24px auto", padding: 16 }}>
      <h1>Road Traffic Accident Study</h1>
      <p>Please fill in what you know. Choose &quot;Unknown&quot; or leave a question blank if you are unsure.</p>

      <form onSubmit={submit}>
        {sections.map((s) => (
          <fieldset key={s} style={{ margin: "20px 0", padding: 16 }}>
            <legend><b>{s}</b></legend>
            {FIELDS.filter((f) => shown(f) && f.section === s && visible(f)).map((f) => (
              <div key={f.name} style={{ marginBottom: 14 }}>
                {f.type === "multiselect" ? (
                  <div>
                    <div>{f.label}{f.required && " *"}</div>
                    {f.options!.map((o) => (
                      <label key={o} style={{ display: "block", padding: "4px 0" }}>
                        <input
                          type="checkbox"
                          checked={((values[f.name] as string[]) ?? []).includes(o)}
                          onChange={() => toggle(f.name, o)}
                        />{" "}
                        {o}
                      </label>
                    ))}
                  </div>
                ) : (
                  <label>
                    {f.label}{f.required && " *"}
                    {f.type === "select" ? (
                      <select style={input} required={f.required} value={(values[f.name] as string) ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                        <option value="">Select...</option>
                        {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <textarea style={input} rows={3} required={f.required} value={(values[f.name] as string) ?? ""} onChange={(e) => set(f.name, e.target.value)} />
                    ) : (
                      <input
                        style={input}
                        type={f.type}
                        min={f.min}
                        max={f.max}
                        required={f.required}
                        value={(values[f.name] as string) ?? ""}
                        onChange={(e) => set(f.name, e.target.value)}
                      />
                    )}
                  </label>
                )}
              </div>
            ))}
          </fieldset>
        ))}

        {/* Honeypot: hidden from people */}
        <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} onChange={(e) => set("website", e.target.value)} />

        <p style={{ fontSize: 14 }}>
          <b>Confidentiality:</b> An anonymous Study ID will be used in place of the patient&apos;s name wherever possible; personally identifying information will be collected and retained only where required and permitted by the relevant hospital/institutional ethics and data-protection procedures.
        </p>

        <label style={{ display: "block", margin: "16px 0" }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />{" "}
          I have read the study information and agree to take part. (Replace with your IRB-approved consent text.)
        </label>

        {status === "error" && <p style={{ color: "crimson" }}>{message}</p>}
        <button type="submit" disabled={status === "sending"} style={{ padding: "12px 24px", fontSize: 16 }}>
          {status === "sending" ? "Submitting..." : "Submit"}
        </button>
      </form>
    </main>
  );
}