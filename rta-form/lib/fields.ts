export type Field = {
  section: string;
  name: string; // must match the NocoDB column name
  label: string;
  type: "text" | "number" | "date" | "time" | "select" | "multiselect" | "textarea";
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  clinician?: boolean; // filled from medical record / clinician
  computed?: boolean; // calculated automatically, not shown in the form
  showIf?: { name: string; equals: string };
};

// Set to false to hide the clinician-assigned fields (GCS, ISS, shock, etc.)
export const SHOW_CLINICIAN_FIELDS = true;

const YN = ["Yes", "No"];
const YNU = ["Yes", "No", "Unknown"];
const YNUN = ["Yes", "No", "Unknown", "Not applicable"];

const S1 = "4.4.1 Identification & Sociodemographic";
const S2 = "4.4.2 Accident / Technical Details";
const S3 = "4.4.3 Safety Measures";
const S4 = "4.4.4 Pre-hospital & Treatment";
const S5 = "4.4.5 Injury & Severity Assessment";
const S6 = "4.4.6 Management & Outcome";

export const FIELDS: Field[] = [
  // ---------- 4.4.1 ----------
  { section: S1, name: "age", label: "Age (years)", type: "number", min: 0, max: 120, required: true },
  { section: S1, name: "sex", label: "Sex", type: "select", options: ["Male", "Female", "Other"], required: true },
  { section: S1, name: "occupation", label: "Occupation", type: "select", options: ["Student", "Service", "Business", "Driver", "Worker", "Other"] },
  { section: S1, name: "residence", label: "Residence", type: "select", options: ["Urban", "Rural"] },
  { section: S1, name: "district", label: "District of residence", type: "text" },

  // ---------- 4.4.2 ----------
  { section: S2, name: "accident_date", label: "Date of accident", type: "date", required: true },
  { section: S2, name: "condition_on_arrival", label: "Condition on Arrival", type: "select", options: ["Brought dead", "Expired"] },
  { section: S2, name: "day_of_week", label: "Day of week", type: "text" },
  { section: S2, name: "accident_time", label: "Time of accident (24-hour)", type: "time" },
  { section: S2, name: "arrival_time", label: "Time of arrival at hospital (24-hour)", type: "time" },
  { section: S2, name: "accident_location", label: "Accident location", type: "text" },
  { section: S2, name: "location_type", label: "Location type", type: "select", options: ["Intersection", "Straight road", "Curve", "Bridge", "Other"] },
  { section: S2, name: "road_type", label: "Road type", type: "select", options: ["Highway", "Arterial", "Local/urban road", "Other"] },
  { section: S2, name: "lighting_condition", label: "Lighting condition", type: "select", options: ["Daylight", "Night with street lighting", "Night without adequate lighting"] },
  { section: S2, name: "weather", label: "Weather", type: "select", options: ["Clear", "Rainy", "Foggy", "Other"] },
  { section: S2, name: "road_surface", label: "Road surface", type: "select", options: ["Dry", "Wet", "Damaged/poor", "Other"] },
  {
    section: S2, name: "road_user_type", label: "Road-user type (victim)", type: "select",
    options: [
      "Pedestrian", "Motorcycle rider", "Motorcycle passenger", "Rickshaw rider", "Rickshaw passenger",
      "CNG/auto-rickshaw driver", "CNG/auto-rickshaw passenger", "Car driver", "Car passenger",
      "Bus driver", "Bus passenger", "Truck/lorry driver", "Truck/lorry passenger", "Other",
    ],
  },
  { section: S2, name: "number_of_vehicles", label: "Number of vehicles involved", type: "number", min: 0, max: 50 },
  { section: S2, name: "vehicle_1", label: "Vehicle 1 (vehicle type)", type: "text" },
  { section: S2, name: "vehicle_2", label: "Vehicle 2 (vehicle type)", type: "text" },
  { section: S2, name: "collision_type", label: "Collision type", type: "select", options: ["Vehicle–pedestrian", "Vehicle–vehicle", "Vehicle–motorcycle", "Vehicle–rickshaw", "Vehicle–fixed object", "Other"] },
  { section: S2, name: "single_vehicle_crash", label: "Single-vehicle crash?", type: "select", options: YN },
  { section: S2, name: "victim_was", label: "Victim was", type: "select", options: ["Driver", "Passenger", "Pedestrian"] },
  { section: S2, name: "suspected_speeding", label: "Suspected speeding involved?", type: "select", options: YNU },
  { section: S2, name: "wrong_way_driving", label: "Wrong-way driving involved?", type: "select", options: YNU },
  { section: S2, name: "overtaking", label: "Overtaking involved?", type: "select", options: YNU },

  // ---------- 4.4.3 ----------
  { section: S3, name: "helmet_used", label: "Helmet used (motorcycle)", type: "select", options: YNUN },
  { section: S3, name: "helmet_properly_worn", label: "Helmet properly worn", type: "select", options: YNUN },
  { section: S3, name: "seat_belt_used", label: "Seat belt used (car/bus)", type: "select", options: YNUN },
  { section: S3, name: "pedestrian_crossing_used", label: "Designated pedestrian crossing used", type: "select", options: YNUN },

  // ---------- 4.4.4 ----------
  { section: S4, name: "time_interval_to_hospital", label: "Time interval to hospital (minutes)", type: "number", computed: true },
  { section: S4, name: "delay_cause", label: "Possible cause of delay to avail tertiary care", type: "textarea" },
  { section: S4, name: "transport_to_hospital", label: "Transport to hospital", type: "select", options: ["Ambulance", "Private vehicle", "CNG", "Other"] },
  { section: S4, name: "first_aid_received", label: "First aid received before hospital?", type: "select", options: YNU },
  { section: S4, name: "first_aid_place", label: "Place of First Aid", type: "text" },
  { section: S4, name: "first_aid_provider", label: "First Aid provider", type: "select", options: ["Hospital", "Pharmacy", "Medical College", "Others"] },
  { section: S4, name: "referred_from_another_hospital", label: "Referred from another hospital?", type: "select", options: YN },
  { section: S4, name: "icu_admission", label: "ICU admission", type: "select", options: YN },
  { section: S4, name: "surgery_required", label: "Surgery required", type: "select", options: YN },
  { section: S4, name: "blood_transfusion", label: "Blood transfusion", type: "select", options: YN },
  { section: S4, name: "blood_transfusion_count", label: "No. of Blood Transfusion", type: "text" },

  // ---------- 4.4.5 ----------
  {
    section: S5, name: "major_injury_types", label: "Major injury type(s)", type: "multiselect",
    options: ["Head/brain", "Facial", "Neck/spinal", "Chest", "Abdominal", "Pelvic", "Upper limb", "Lower limb", "Fracture", "Multiple injuries", "Other"],
  },
  { section: S5, name: "shock_type", label: "Treatment of shock", type: "select", clinician: true, options: ["Hemorrhagic", "Hypovolemic", "Obstructive", "Neurogenic"] },
  { section: S5, name: "gcs_admission", label: "GCS at admission (3–15)", type: "number", min: 3, max: 15, clinician: true },
  { section: S5, name: "iss", label: "ISS, if available (0–75)", type: "number", min: 0, max: 75, clinician: true },
  { section: S5, name: "major_body_region", label: "Major body region injured", type: "text" },
  { section: S5, name: "multiple_injuries", label: "Multiple injuries", type: "select", options: YN },
  { section: S5, name: "surgery_performed", label: "Surgery performed", type: "select", options: YN },

  // ---------- 4.4.6 ----------
  { section: S6, name: "final_outcome", label: "Final outcome", type: "select", options: ["Survived", "Died"], required: true },
  { section: S6, name: "date_of_death", label: "Date of death", type: "date", showIf: { name: "final_outcome", equals: "Died" } },
  { section: S6, name: "time_of_death", label: "Time of death (24-hour)", type: "time", showIf: { name: "final_outcome", equals: "Died" } },
  { section: S6, name: "place_of_death", label: "Place of death", type: "select", options: ["Accident scene", "During transport", "Emergency department", "Ward", "ICU"], showIf: { name: "final_outcome", equals: "Died" } },
  { section: S6, name: "hours_accident_to_death", label: "Time from accident to death (hours)", type: "number", computed: true },
  { section: S6, name: "cause_of_death", label: "Cause of death", type: "text", showIf: { name: "final_outcome", equals: "Died" } },
  { section: S6, name: "cause_of_death_certified_by", label: "Cause of death certified by", type: "select", options: ["Physician", "Medical record"], clinician: true, showIf: { name: "final_outcome", equals: "Died" } },
];