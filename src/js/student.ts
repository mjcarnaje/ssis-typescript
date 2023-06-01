import fs from "fs";
import { DEPARTMENT_TXT_PATH, STUDENT_TXT_PATH } from "../constant/db-path";
import { parser } from "./parser";
import {
  DepartmentType,
  StudentDocWithDepartmentType,
  StudentType,
} from "./types";

export default class StudentService {
  data: StudentDocWithDepartmentType[] = [];
  students: StudentType[] = [];
  departments: DepartmentType[] = [];
  selectedStudent: StudentType | null = null;

  constructor() {
    this.data = [];
  }

  findById(id: string): StudentType {
    return this.students.find((student) => student.studentId === id);
  }

  findDepartmentById(departmentId: string): DepartmentType {
    const department = this.departments.find(
      (department) => department.id === departmentId
    );
    return department;
  }

  setStudent(student: StudentType): void {
    this.selectedStudent = student;
  }

  setSelectedStudentToNull(): void {
    this.selectedStudent = null;
  }

  addStudent(student: StudentType): void {
    if (this.findById(student.studentId)) {
      console.log("Student ID already exists");
      return;
    }

    this.students.push(student);

    this.persist();
  }

  joinDepartmentToStudent(): void {
    this.data = this.students.map((student) => {
      const department = this.findDepartmentById(student.departmentId);
      return {
        ...student,
        department,
      };
    }) as StudentDocWithDepartmentType[];
  }

  load(): void {
    const students = fs.readFileSync(STUDENT_TXT_PATH, "utf-8");
    const departments = fs.readFileSync(DEPARTMENT_TXT_PATH, "utf-8");

    this.departments = parser.parse(departments) as DepartmentType[];
    this.students = parser.parse(students) as StudentType[];

    this.joinDepartmentToStudent();
  }

  persist(): void {
    const students = this.students.map(parser.encode);

    fs.writeFileSync(STUDENT_TXT_PATH, students.join(""));

    this.joinDepartmentToStudent();
  }
}

export const getFullName = (student: StudentType): string => {
  return `${student.firstName} ${student.lastName}`;
};

export const getAge = (student: StudentType): number => {
  const today = new Date();
  const birthday = new Date(student.birthday);
  let age = today.getFullYear() - birthday.getFullYear();
  const month = today.getMonth() - birthday.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }

  return age;
};

export const getYearLevel = (student: StudentType): string => {
  const strs = ["1st", "2nd", "3rd", "4th", "Irregular"];
  const year = parseInt(student.year);
  return strs[year - 1] + " Year";
};
