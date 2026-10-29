import CryptoJS from "crypto-js";
import jwt from "jwt-simple";

export const readJwt = (token) => {
  let value = [];

  const secret = process.env.REACT_APP_SECRET;

  value = jwt.decode(token, secret);

  return value.data;
};

// export const readJwt = (token) => {
//   try {
//     return JSON.parse(atob(token.split(".")[1]));
//   } catch (e) {
//     return null;
//   }
// };
export function getEmploymentType(code) {
  const types = {
    0: "Permanent",
    1: "Temporary",
    2: "Voluntary",
    3: "Contract",
    4: "Interns",
    5: "Casuals",
  };

  return types[code] || "Invalid code";
}

export const swapSlashes = (str, char) => {
  if (char === "/") {
    // Convert all "/" to "_"
    return str.replace(/\//g, "_");
  } else if (char === "_") {
    // Convert all "_" to "/"
    return str.replace(/_/g, "/");
  } else {
    throw new Error("Invalid character. Use '/' or '_'.");
  }
};

// This recovered source tree has no .env, so REACT_APP_SECRET is undefined
// at runtime. The production portal encrypted its cookies with "kimiko", so
// fall back to that same secret (mirrors jwtSecret in GlobalState.js).
const storageSecret = () => process.env.REACT_APP_SECRET || "kimiko";

export const encryptData = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    storageSecret()
  ).toString();

  return ciphertext;
};

export const decryptData = (ciphertext) => {
  var bytes = CryptoJS.AES.decrypt(ciphertext, storageSecret());
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

  return decryptedData;
};

// Resolves a display name from any of the profile objects the portal keeps
// (user_info, user_info_to_update, NAV employee headers, etc.). Different
// endpoints use different casing / casing conventions, and some wrap the
// real object in `data`.
export const getEmployeeName = (...sources) => {
  const values = [];

  sources.filter(Boolean).forEach((source) => {
    if (source.data && typeof source.data === "object") values.push(source.data);
    values.push(source);
  });

  const readValue = (keys) => {
    for (const source of values) {
      for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null && String(value).trim()) {
          return String(value).trim();
        }
      }
    }
    return "";
  };

  const fullName = readValue([
    "FullName",
    "fullName",
    "full_name",
    "Full Name",
    "EmployeeName",
    "employeeName",
    "employee_name",
    "Employee Name",
    "Name",
    "name",
  ]);

  if (fullName) return fullName;

  return [
    readValue(["FirstName", "firstName", "first_name"]),
    readValue(["MiddleName", "middleName", "middle_name"]),
    readValue(["LastName", "lastName", "last_name"]),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
};

export const position = ["Manager", "Employee", "Team Leader"];

export const marital_status = [
  { name: "Single", value: 1 },
  { name: "Married", value: 2 },
  { name: "Separated", value: 3 },
  { name: "Divorced", value: 4 },
  { name: "Other", value: 5 },
];

export const job_titles = [
  "HR manager",
  "Reception",
  "Chief Operations Officer",
  "Claims Manager",
  "Claims Assistant",
  "Claims Analyist",
  "Network Administrator",
  "Care Manager",
  "Business Development Trainee",
  "Business Development Director",
  "Business Development Executive",
  "Business Development Manager",
  "IT Manager",
  "Operations Manager",
  "Software Developer",
  "Head of Finance",
  "Policy Admin",
  "Accounts",
  "General Manager",
  "Supporting Staff",
  "Group Marketing Manager",
  "Creative Coordinator",
  "Client Executive",
  "Senior Client Executive",
  "Head of Finance",
];

export const qualification_type = [
  "Other",
  "Academic",
  "Professional",
  "Technical",
];

export const course_type = ["Short course", "Long course"];

export const annual_leave_guidelines = [
  "Leave must be applied in advance unless it is an emergency",
  "Incase of misapplication send an email to HR",
];

export const sick_leave_guidelines = [
  "Must be certified by a competent medical authority",
  "No accumulation of sick leave is permitted",
  "An employee must inform their supervisor as early as possible on the first day of sickness by telephone if possible and when they are expected to return to work",
  "Incase of misapplication send an email to HR",
];

export const maternity_leave_guidelines = [
  "Give a notice in writing of not less than 7 days in advance.",
  "Incase of misapplication send an email to HR",
];

export const paternity_leave_guidelines = [
  "Give a notice in writing of not less than 7 days in advance",
  "Paternity leave must be taken within two months of baby being born",
  "Proof of paternity will be required either birth certificate or birth notification",
  "Paternity shall be taken in respect of the children of the registered Spouse",
  "Incase of misapplication send an email to HR",
];

export const out_of_office_guidelines = [
  "Inform your team leader on time",
  "Indicate the time one will be out of office i.e., if you go for a meeting or conference",
  "Indicate the number of days one will be out of office",
  "Indicate the office one will be working from i.e. Aga Kan, Uganda, Tanzania or Mombasa",
  "Incase of misapplication send an email to HR",
];
