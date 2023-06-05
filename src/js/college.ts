import fs from "fs";
import { getDbCollegePath, getDbDepartmentPath } from "../constant/paths";
import { parser } from "./parser";
import {
  CollegeInputType,
  CollegeType,
  CollegeWithDepartmentsType,
  DepartmentInputType,
  DepartmentType,
} from "./types";
import { generateId } from "./utils";

export default class CollegeService {
  data: CollegeWithDepartmentsType[] = [];
  colleges: CollegeType[] = [];
  departments: DepartmentType[] = [];
  selectedCollege: CollegeType | null = null;
  selectedDepartment: DepartmentType | null = null;

  constructor() {
    this.data = [];
    this.colleges = [];
    this.departments = [];
    this.selectedCollege = null;
    this.selectedDepartment = null;
  }

  findById(id: string): CollegeType {
    return this.colleges.find((college) => college.id === id);
  }

  findByName(name: string): CollegeType {
    return this.colleges.find((college) => college.name === name);
  }

  findByAbbreviation(abbreviation: string): CollegeType {
    return this.colleges.find(
      (college) => college.abbreviation === abbreviation
    );
  }

  findDepartmentById(departmentId: string): DepartmentType {
    const department = this.departments.find(
      (department) => department.id === departmentId
    );
    return department;
  }

  findDepartmentByCollegeId(collegeId: string): DepartmentType[] {
    return this.departments.filter(
      (department) => department.collegeId === collegeId
    );
  }

  addCollege(input: CollegeInputType): CollegeType {
    const newCollege: CollegeType = {
      id: generateId(),
      name: input.name,
      abbreviation: input.abbreviation,
    };

    if (this.findByName(newCollege.name)) {
      console.log("College name already exists");
      return;
    }

    if (this.findByAbbreviation(newCollege.abbreviation)) {
      console.log("College abbreviation already exists");
      return;
    }

    this.colleges.push(newCollege);

    this.persist();

    return newCollege;
  }

  updateCollege(id: string, input: CollegeInputType): CollegeType {
    const college = this.findById(id);

    if (!college) {
      throw new Error("College not found");
    }

    Object.assign(college, input);

    this.persist();

    return college;
  }

  deleteCollege(id: string): CollegeType {
    const college = this.findById(id);

    if (!college) {
      throw new Error("College not found");
    }

    this.colleges = this.colleges.filter((college) => college.id !== id);
    this.persist();

    return college;
  }

  addDepartment(collegeId: string, input: DepartmentInputType): DepartmentType {
    const newDepartment: DepartmentType = {
      id: generateId(),
      name: input.name,
      abbreviation: input.abbreviation,
      collegeId,
    };

    if (this.findDepartmentById(newDepartment.id)) {
      console.log("Department already exists");
      return;
    }

    this.departments.push(newDepartment);
    this.persist();

    return newDepartment;
  }

  updateDepartment(
    departmentId: string,
    input: DepartmentInputType
  ): DepartmentType {
    const department = this.findDepartmentById(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    Object.assign(department, input);

    this.persist();

    return department;
  }

  deleteDepartment(departmentId: string): DepartmentType {
    const department = this.findDepartmentById(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    this.departments = this.departments.filter(
      (department) => department.id !== departmentId
    );

    this.persist();

    return department;
  }

  setSelectedCollege(id: string): CollegeType {
    const college = this.findById(id);

    if (!college) {
      throw new Error("College not found");
    }

    this.selectedCollege = college;

    return college;
  }

  setSelectedDepartment(departmentId: string): DepartmentType {
    const department = this.findDepartmentById(departmentId);

    if (!department) {
      throw new Error("Department not found");
    }

    this.selectedDepartment = department;

    return department;
  }

  setSelectedCollegeToNull(): void {
    this.selectedCollege = null;
  }

  setSelectedDepartmentToNull(): void {
    this.selectedDepartment = null;
  }

  joinDepartmentsToColleges(): void {
    this.data = this.colleges.map((college) => {
      return {
        id: college.id,
        abbreviation: college.abbreviation,
        name: college.name,
        departments: this.findDepartmentByCollegeId(college.id),
      };
    });
  }

  load(): void {
    const colleges = fs.readFileSync(getDbCollegePath(), "utf-8");
    const departments = fs.readFileSync(getDbDepartmentPath(), "utf-8");

    this.colleges = parser.parse(colleges) as CollegeType[];
    this.departments = parser.parse(departments) as DepartmentType[];

    this.joinDepartmentsToColleges();
  }

  persist(): void {
    const colleges = this.colleges.map(parser.encode);
    const departments = this.departments.map(parser.encode);

    fs.writeFileSync(getDbCollegePath(), colleges.join(""));
    fs.writeFileSync(getDbDepartmentPath(), departments.join(""));

    this.joinDepartmentsToColleges();
  }
}
