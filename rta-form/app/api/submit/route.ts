import { NextResponse } from "next/server";
import { FIELDS, SHOW_CLINICIAN_FIELDS } from "@/lib/fields";

function minutesBetween(t1: string, t2: string) {
  const [h1, m1] = t1.split(":").map(Number);
  const [h2, m2] = t2.split(":").map(Number);
  let d = h2 * 60 + m2 - (h1 * 60 + m1);
  if (d < 0) d += 1440; // arrival after midnight
  return d;
}

export async function POST(req: Request) {
  const body = await req.json();

  // Honeypot: bots fill this hidden field, people don't
  if (body.website) return NextResponse.json({ ok: true });

  if (body.consent !== true) {
    return NextResponse.json({ error: "Consent is required." }, { status: 400 });
  }

  const record: Record<string, unknown> = {};

  for (const f of FIELDS) {
    if (f.computed) continue;
    if (f.clinician && !SHOW_CLINICIAN_FIELDS) continue;
    if (f.showIf && body[f.showIf.name] !== f.showIf.equals) continue;

    const v = body[f.name];
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (empty) {
      if (f.required) {
        return NextResponse.json({ error: `${f.label} is required.` }, { status: 400 });
      }
      continue;
    }

    if (f.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) {
        return NextResponse.json({ error: `${f.label} is not valid.` }, { status: 400 });
      }
      record[f.name] = n;
    } else if (f.type === "select") {
      if (!f.options?.includes(v)) {
        return NextResponse.json({ error: `Invalid value for ${f.label}.` }, { status: 400 });
      }
      record[f.name] = v;
    } else if (f.type === "multiselect") {
      const arr: string[] = Array.isArray(v) ? v : [];
      if (!arr.every((x) => f.options?.includes(x))) {
        return NextResponse.json({ error: `Invalid value for ${f.label}.` }, { status: 400 });
      }
      record[f.name] = arr.join(",");
    } else {
      record[f.name] = String(v).slice(0, 2000);
    }
  }

  // Automatic calculations
  if (record.accident_time && record.arrival_time) {
    record.time_interval_to_hospital = minutesBetween(String(record.accident_time), String(record.arrival_time));
  }
  if (record.accident_date && record.accident_time && record.date_of_death && record.time_of_death) {
    const a = new Date(`${record.accident_date}T${record.accident_time}`);
    const d = new Date(`${record.date_of_death}T${record.time_of_death}`);
    const hours = (d.getTime() - a.getTime()) / 36e5;
    if (!Number.isNaN(hours) && hours >= 0) record.hours_accident_to_death = Math.round(hours * 10) / 10;
  }

  const study_id = `RTA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  record.study_id = study_id;
  record.consent_given = true;

  const res = await fetch(
    `${process.env.NOCODB_URL}/api/v2/tables/${process.env.NOCODB_TABLE_ID}/records`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "xc-token": process.env.NOCODB_TOKEN! },
      body: JSON.stringify(record),
    }
  );

  if (!res.ok) {
    console.error("NocoDB error:", res.status, await res.text());
    return NextResponse.json({ error: "Could not save. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, study_id });
}