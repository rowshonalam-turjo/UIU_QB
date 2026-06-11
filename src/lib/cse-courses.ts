export type CSECourse = { code: string; title: string; credit?: number; category?: string };

export const CSE_COURSES: CSECourse[] = [
  // Language
  { code: "ENG 1011", title: "Intensive English I", credit: 3, category: "Language" },
  { code: "ENG 1013", title: "Intensive English II", credit: 3, category: "Language" },

  // General Education - Compulsory
  { code: "SOC 2101", title: "Society, Environment and Engineering Ethics", credit: 3, category: "General Education" },
  { code: "PMG 4101", title: "Project Management", credit: 3, category: "General Education" },
  { code: "BDS 1201", title: "History of the Emergence of Bangladesh", credit: 2, category: "General Education" },

  // General Education - Optional
  { code: "ECO 4101", title: "Economics", credit: 3, category: "General Education" },
  { code: "SOC 4101", title: "Introduction to Sociology", credit: 3, category: "General Education" },
  { code: "ACT 2111", title: "Financial and Managerial Accounting", credit: 3, category: "General Education" },
  { code: "IPE 3401", title: "Industrial and Operational Management", credit: 3, category: "General Education" },
  { code: "TEC 2499", title: "Technology Entrepreneurship", credit: 3, category: "General Education" },
  { code: "PSY 2101", title: "Psychology", credit: 3, category: "General Education" },
  { code: "BDS 2201", title: "Bangladesh Studies", credit: 3, category: "General Education" },
  { code: "BAN 2501", title: "Bangla", credit: 3, category: "General Education" },

  // Basic Sciences
  { code: "PHY 2105", title: "Physics", credit: 3, category: "Basic Sciences" },
  { code: "PHY 2106", title: "Physics Laboratory", credit: 1, category: "Basic Sciences" },
  { code: "BIO 3105", title: "Biology for Engineers", credit: 3, category: "Basic Sciences" },

  // Mathematics
  { code: "MATH 1151", title: "Fundamental Calculus", credit: 3, category: "Mathematics" },
  { code: "MATH 2183", title: "Calculus and Linear Algebra", credit: 3, category: "Mathematics" },
  { code: "MATH 2201", title: "Coordinate Geometry and Vector Analysis", credit: 3, category: "Mathematics" },
  { code: "MATH 2205", title: "Probability and Statistics", credit: 3, category: "Mathematics" },

  // Other Engineering
  { code: "EEE 2113", title: "Electrical Circuits", credit: 3, category: "Other Engineering" },
  { code: "EEE 2123", title: "Electronics", credit: 3, category: "Other Engineering" },
  { code: "EEE 2124", title: "Electronics Laboratory", credit: 1, category: "Other Engineering" },
  { code: "EEE 4261", title: "Green Computing", credit: 3, category: "Other Engineering" },

  // Core - Programming Compulsory
  { code: "CSE 1110", title: "Introduction to Computer Systems", credit: 1, category: "Core - Programming" },
  { code: "CSE 1111", title: "Structured Programming Language", credit: 3, category: "Core - Programming" },
  { code: "CSE 1112", title: "Structured Programming Language Laboratory", credit: 1, category: "Core - Programming" },
  { code: "CSE 1115", title: "Object Oriented Programming", credit: 3, category: "Core - Programming" },
  { code: "CSE 1116", title: "Object Oriented Programming Laboratory", credit: 1, category: "Core - Programming" },
  { code: "CSE 2118", title: "Advanced Object Oriented Programming Lab", credit: 1, category: "Core - Programming" },

  // Core - Hardware
  { code: "CSE 1325", title: "Digital Logic Design", credit: 3, category: "Core - Hardware" },
  { code: "CSE 1326", title: "Digital Logic Design Laboratory", credit: 1, category: "Core - Hardware" },
  { code: "CSE 3313", title: "Computer Architecture", credit: 3, category: "Core - Hardware" },
  { code: "CSE 4325", title: "Microprocessors and Microcontrollers", credit: 3, category: "Core - Hardware" },
  { code: "CSE 4326", title: "Microprocessors and Microcontrollers Laboratory", credit: 1, category: "Core - Hardware" },

  // Core - Logics and Algorithms
  { code: "CSE 2213", title: "Discrete Mathematics", credit: 3, category: "Core - Logics and Algorithms" },
  { code: "CSE 2215", title: "Data Structure and Algorithms I", credit: 3, category: "Core - Logics and Algorithms" },
  { code: "CSE 2216", title: "Data Structure and Algorithms I Laboratory", credit: 1, category: "Core - Logics and Algorithms" },
  { code: "CSE 2217", title: "Data Structure and Algorithms II", credit: 3, category: "Core - Logics and Algorithms" },
  { code: "CSE 2218", title: "Data Structure and Algorithms II Laboratory", credit: 1, category: "Core - Logics and Algorithms" },
  { code: "CSE 2233", title: "Theory of Computation", credit: 3, category: "Core - Logics and Algorithms" },

  // Core - Software Engineering
  { code: "CSE 3411", title: "System Analysis and Design", credit: 3, category: "Core - Software Engineering" },
  { code: "CSE 3412", title: "System Analysis and Design Laboratory", credit: 1, category: "Core - Software Engineering" },
  { code: "CSE 3421", title: "Software Engineering", credit: 3, category: "Core - Software Engineering" },
  { code: "CSE 3422", title: "Software Engineering Laboratory", credit: 1, category: "Core - Software Engineering" },

  // Core - Systems
  { code: "CSE 4531", title: "Computer Security", credit: 3, category: "Core - Systems" },
  { code: "CSE 3521", title: "Database Management Systems", credit: 3, category: "Core - Systems" },
  { code: "CSE 3522", title: "Database Management Systems Laboratory", credit: 1, category: "Core - Systems" },
  { code: "CSE 4509", title: "Operating Systems", credit: 3, category: "Core - Systems" },
  { code: "CSE 4510", title: "Operating Systems Laboratory", credit: 1, category: "Core - Systems" },
  { code: "CSE 3711", title: "Computer Networks", credit: 3, category: "Core - Systems" },
  { code: "CSE 3712", title: "Computer Networks Laboratory", credit: 1, category: "Core - Systems" },
  { code: "CSE 3811", title: "Artificial Intelligence", credit: 3, category: "Core - Systems" },
  { code: "CSE 3812", title: "Artificial Intelligence Laboratory", credit: 1, category: "Core - Systems" },

  // Optional - Computational Theory
  { code: "CSE 4601", title: "Mathematical Analysis for Computer Science", credit: 3, category: "Computational Theory" },
  { code: "CSE 4633", title: "Basic Graph Theory", credit: 3, category: "Computational Theory" },
  { code: "CSE 4655", title: "Algorithm Engineering", credit: 3, category: "Computational Theory" },
  { code: "CSE 4611", title: "Compiler Design", credit: 3, category: "Computational Theory" },
  { code: "CSE 4613", title: "Computational Geometry", credit: 3, category: "Computational Theory" },
  { code: "CSE 4621", title: "Computer Graphics", credit: 3, category: "Computational Theory" },

  // Optional - Network and Communications
  { code: "CSE 3715", title: "Data Communication", credit: 3, category: "Network and Communications" },
  { code: "CSE 4759", title: "Wireless and Cellular Communication", credit: 3, category: "Network and Communications" },
  { code: "CSE 4793", title: "Advanced Network Services and Management", credit: 3, category: "Network and Communications" },
  { code: "CSE 4783", title: "Cryptography", credit: 3, category: "Network and Communications" },
  { code: "CSE 4777", title: "Networks Security", credit: 3, category: "Network and Communications" },
  { code: "CSE 4763", title: "Electronic Business", credit: 3, category: "Network and Communications" },

  // Optional - Systems
  { code: "CSE 4547", title: "Multimedia Systems Design", credit: 3, category: "Systems" },
  { code: "CSE 4519", title: "Distributed Systems", credit: 3, category: "Systems" },
  { code: "CSE 4523", title: "Simulation and Modeling", credit: 3, category: "Systems" },
  { code: "CSE 4521", title: "Computer Graphics", credit: 3, category: "Systems" },
  { code: "CSE 4587", title: "Cloud Computing", credit: 3, category: "Systems" },
  { code: "CSE 4567", title: "Advanced Database Management Systems", credit: 3, category: "Systems" },

  // Optional - Data Science
  { code: "CSE 4889", title: "Machine Learning", credit: 3, category: "Data Science" },
  { code: "CSE 4891", title: "Data Mining", credit: 3, category: "Data Science" },
  { code: "CSE 4893", title: "Introduction to Bioinformatics", credit: 3, category: "Data Science" },
  { code: "CSE 4883", title: "Digital Image Processing", credit: 3, category: "Data Science" },
  { code: "CSE 4817", title: "Big Data Analytics", credit: 3, category: "Data Science" },

  // Optional - Software Engineering
  { code: "CSE 4451", title: "Human Computer Interaction", credit: 3, category: "Software Engineering" },
  { code: "CSE 4435", title: "Software Architecture", credit: 3, category: "Software Engineering" },
  { code: "CSE 4165", title: "Web Programming", credit: 3, category: "Software Engineering" },
  { code: "CSE 4181", title: "Mobile Application Development", credit: 3, category: "Software Engineering" },
  { code: "CSE 4495", title: "Software Testing and Quality Assurance", credit: 3, category: "Software Engineering" },
  { code: "CSE 4485", title: "Game Design and Development", credit: 3, category: "Software Engineering" },

  // Optional - Hardware
  { code: "CSE 4329", title: "Digital System Design", credit: 3, category: "Hardware" },
  { code: "CSE 4379", title: "Real-time Embedded Systems", credit: 3, category: "Hardware" },
  { code: "CSE 4327", title: "VLSI Design", credit: 3, category: "Hardware" },
  { code: "CSE 4337", title: "Robotics", credit: 3, category: "Hardware" },
  { code: "CSE 4397", title: "Interfacing", credit: 3, category: "Hardware" },

  // Optional - ICT
  { code: "CSE 4941", title: "Enterprise Systems: Concepts and Practice", credit: 3, category: "ICT" },
  { code: "CSE 4943", title: "Web Application Security", credit: 3, category: "ICT" },
  { code: "CSE 4463", title: "Electronic Business", credit: 3, category: "ICT" },
  { code: "CSE 4945", title: "UI: Concepts and Design", credit: 3, category: "ICT" },
  { code: "CSE 4949", title: "IT Audit: Concepts and Practice", credit: 3, category: "ICT" },

  // University Required
  { code: "URC 1103", title: "Life Skills for Success", credit: 2, category: "University Required" },

  // Final Year Design Project
  { code: "CSE 4000A", title: "Final Year Design Project – I", credit: 2, category: "Final Year Design Project" },
  { code: "CSE 4000B", title: "Final Year Design Project – II", credit: 2, category: "Final Year Design Project" },
  { code: "CSE 4000C", title: "Final Year Design Project – III", credit: 2, category: "Final Year Design Project" },
];

export const BASE_UPLOAD_TYPES = ["CT", "Mid", "Final", "Assignment"] as const;
export const LAB_EXTRA_TYPES = ["Lab Report", "Project"] as const;
export const UPLOAD_TYPES = [...BASE_UPLOAD_TYPES, ...LAB_EXTRA_TYPES] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];

export function isLabCourse(code: string): boolean {
  const c = CSE_COURSES.find((x) => x.code.toLowerCase() === code.toLowerCase());
  if (!c) return /lab/i.test(code);
  return /lab/i.test(c.title) || /lab/i.test(c.code);
}

export function getUploadTypesFor(code: string): readonly UploadType[] {
  return isLabCourse(code) ? UPLOAD_TYPES : BASE_UPLOAD_TYPES;
}
