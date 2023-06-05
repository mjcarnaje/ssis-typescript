export interface DepartmentType {
  id: string;
  name: string;
  abbreviation: string;
  collegeId: string;
}

export interface CollegeType {
  id: string;
  name: string;
  abbreviation: string;
}

export interface CollegeWithDepartmentsType extends CollegeType {
  departments: DepartmentType[];
}

export interface CollegeInputType {
  name: string;
  abbreviation?: string;
}

export interface DepartmentInputType {
  name: string;
  abbreviation: string;
}

export interface StudentType {
  studentId: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthday: string;
  photo: string;
  collegeId: string;
  departmentId: string;
  year: string;
}

export interface StudentDocJoinType extends StudentType {
  department: DepartmentType;
  college: CollegeType;
}
