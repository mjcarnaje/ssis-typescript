import fs from "fs";
import path from "path";

export const getDbCollegePath = (): string => {
  if (!fs.existsSync(path.join(__dirname, "../db/colleges.txt"))) {
    fs.writeFileSync(path.join(__dirname, "../db/colleges.txt"), "");
  }
  return path.join(__dirname, "../db/colleges.txt");
};

export const getDbDepartmentPath = (): string => {
  if (!fs.existsSync(path.join(__dirname, "../db/departments.txt"))) {
    fs.writeFileSync(path.join(__dirname, "../db/departments.txt"), "");
  }
  return path.join(__dirname, "../db/departments.txt");
};

export const getDbStudentPath = (): string => {
  if (!fs.existsSync(path.join(__dirname, "../db/students.txt"))) {
    fs.writeFileSync(path.join(__dirname, "../db/students.txt"), "");
  }
  return path.join(__dirname, "../db/students.txt");
};

export const getStoragePath = (): string => {
  if (!fs.existsSync(path.join(__dirname, "../storage/"))) {
    fs.mkdirSync(path.join(__dirname, "../storage/"));
  }
  return path.join(__dirname, "../storage/");
};
