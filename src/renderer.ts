import { dialog } from "@electron/remote";
import fs from "fs";
import path from "path";
import CollegeService from "./js/college";
import StudentService, { getFullName } from "./js/student";
import {
  CollegeWithDepartmentsType,
  StudentDocJoinType,
  StudentType,
} from "./js/types";
import { getStoragePath } from "./constant/paths";

enum TabType {
  Student = "student",
  Course = "course",
}

enum ModalType {
  Student = "student",
  College = "college",
  Department = "department",
}

interface GlobalStateType {
  currentTab: TabType;
  modalForm: ModalType | null;
  colleges: CollegeService;
  students: StudentService;
  currentImage: string | null;
}

const gS: GlobalStateType = {
  currentTab: TabType.Student,
  modalForm: null,
  colleges: new CollegeService(),
  students: new StudentService(),
  currentImage: null,
};

function getElById<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as unknown as T;
}

const tabDivs = {
  student: getElById<HTMLDivElement>("student-tab"),
  course: getElById<HTMLDivElement>("course-tab"),
};

const pageDivs = {
  student: getElById<HTMLDivElement>("student-page"),
  course: getElById<HTMLDivElement>("course-page"),
};

const modalDivs = {
  wrapper: getElById<HTMLDivElement>("modal"),
  student: getElById<HTMLDivElement>("student-modal"),
  college: getElById<HTMLDivElement>("college-modal"),
  department: getElById<HTMLDivElement>("department-modal"),
};

const mainDivs = {
  student: {
    add: getElById<HTMLButtonElement>("add-student-btn"),
    list: getElById<HTMLDivElement>("student-list"),
    form: {
      photoWrapper: getElById<HTMLDivElement>("student-photo-wrapper"),
      upload: getElById<HTMLInputElement>("student-upload"),
      studentId: getElById<HTMLInputElement>("student-id"),
      firstName: getElById<HTMLInputElement>("student-firstname"),
      lastName: getElById<HTMLInputElement>("student-lastname"),
      birthday: getElById<HTMLInputElement>("student-birthday"),
      gender: getElById<HTMLSelectElement>("student-gender"),
      college: getElById<HTMLSelectElement>("student-college"),
      department: getElById<HTMLSelectElement>("student-department"),
      year: getElById<HTMLSelectElement>("student-year"),
      submit: getElById<HTMLButtonElement>("student-submit"),
    },
  },
  course: {
    add: getElById<HTMLButtonElement>("add-course-btn"),
    list: getElById<HTMLDivElement>("course-list"),
    form: {
      abbreviation: getElById<HTMLInputElement>("college-abbreviation"),
      name: getElById<HTMLInputElement>("college-name"),
      submit: getElById<HTMLButtonElement>("college-submit"),
    },
  },
  department: {
    form: {
      abbreviation: getElById<HTMLInputElement>("department-abbreviation"),
      name: getElById<HTMLInputElement>("department-name"),
      submit: getElById<HTMLButtonElement>("department-submit"),
    },
  },
};

function changeTab(tab: TabType) {
  console.log("changeTab", tab);

  const activeClasses = [
    "bg-indigo-100",
    "text-indigo-700",
    "rounded-xl",
    "font-semibold",
    "border",
    "border-indigo-200",
  ];

  // Remove underline class from all tabDivs
  Object.values(tabDivs).forEach((tabDiv) => {
    tabDiv.classList.remove(...activeClasses);
  });

  // Add underline class to the active tabDiv
  tabDivs[tab].classList.add(...activeClasses);

  // Hide all pageDivs
  Object.values(pageDivs).forEach((pageDiv) => {
    pageDiv.classList.add("hidden");
    pageDiv.classList.remove("block");
  });

  // Show the active pageDiv
  pageDivs[tab].classList.remove("hidden");
  pageDivs[tab].classList.add("block");

  gS.currentTab = tab;
}

changeTab(gS.currentTab);

tabDivs.student.addEventListener("click", () => changeTab(TabType.Student));
tabDivs.course.addEventListener("click", () => changeTab(TabType.Course));

function openModal(modalType: ModalType) {
  console.log("openModal", modalType);

  modalDivs.wrapper.classList.remove("hidden");
  modalDivs.wrapper.classList.add("flex", "animate-fadeIn");

  switch (modalType) {
    case ModalType.Student:
      modalDivs.student.classList.remove("hidden");
      modalDivs.student.classList.add("grid");
      loadCourseOptions(gS.students?.selectedStudent?.collegeId);
      break;
    case ModalType.College:
      modalDivs.college.classList.remove("hidden");
      modalDivs.college.classList.add("grid");
      break;
    case ModalType.Department:
      modalDivs.department.classList.remove("hidden");
      modalDivs.department.classList.add("grid");
      break;
  }

  gS.modalForm = modalType;
}

function closeModal() {
  console.log("closeModal");

  modalDivs.wrapper.classList.add("animate-fadeOut");

  setTimeout(() => {
    modalDivs.wrapper.classList.add("hidden");
    modalDivs.wrapper.classList.remove(
      "flex",
      "animate-fadeIn",
      "animate-fadeOut"
    );

    if (gS.modalForm) {
      switch (gS.modalForm) {
        case ModalType.Student:
          modalDivs.student.classList.add("hidden");
          break;
        case ModalType.College:
          modalDivs.college.classList.add("hidden");
          mainDivs.course.form.abbreviation.value = "";
          mainDivs.course.form.name.value = "";
          break;
        case ModalType.Department:
          modalDivs.department.classList.add("hidden");
          mainDivs.department.form.abbreviation.value = "";
          mainDivs.department.form.name.value = "";
          break;
      }
    }

    gS.modalForm = null;
  }, 500);
}

mainDivs.student.add.addEventListener("click", () => {
  clearStudentFields();
  openModal(ModalType.Student);
});

mainDivs.course.add.addEventListener("click", () =>
  openModal(ModalType.College)
);

modalDivs.wrapper.addEventListener("click", (event) => {
  if (event.target === modalDivs.wrapper) {
    closeModal();
  }
});

function studentJSONToHTML(student: StudentDocJoinType) {
  const fullName = getFullName(student);

  const imgEl =
    student.photo !== "N/A"
      ? `<img src="${student.photo}" alt="pic" class="h-full w-full object-cover" />`
      : `<div class="h-full w-full flex items-center justify-center text-sm text-gray-400">No Photo</div>`;

  return `<div
  class="flex items-center justify-between w-full gap-4 p-5 bg-white border rounded-xl shadow-sm"
>
  <div
    class="overflow-hidden bg-gray-100 border rounded-2xl h-32 aspect-square"
  >
    ${imgEl}
  </div>
  <div class="flex flex-col flex-1 gap-2">
    <div w="full">
      <h3 class="text-2xl font-bold text-gray-800">${fullName}</h3>
      <p class="text-gray-500">
        ${student.studentId}
      </p>
      <p class="text-gray-500">
        ${student.college.abbreviation}-${student.department.abbreviation}
      </p>
    </div>
    <div class="flex flex-row gap-2">
      <button
        id="update-student-${student.studentId}"
        class="px-2 py-1 font-bold text-white bg-yellow-500 rounded hover:bg-yellow-600"
      >
        Update
      </button>

      <button
        id="delete-student-${student.studentId}"
        class="px-2 py-1 font-bold text-white bg-red-500 rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  </div>
</div>
`;
}

function collegeJSONToHTML(college: CollegeWithDepartmentsType) {
  return `<div class="flex flex-col border w-full rounded-lg p-6">
  <div class="flex flex-row w-full justify-between items-center">
    <div class="flex flex-col">
      <span class="text-2xl text-gray-800 font-bold">${college.name}</span>
      <span class="text-lg">${college.abbreviation}</span>
    </div>
    <div class="flex flex-row gap-4">
      <button
        id="update-college-${college.id}"
        class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded"
      >
        Update
      </button>
      <button
        id="delete-college-${college.id}"
        class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
      >
        Delete
      </button>
    </div>
  </div>
  <div class="flex flex-col py-4">
    <span class="text-md mb-2 font-semibold">Departments</span>
    <div class="grid grid-cols-2 gap-4">
      ${college.departments
        .map(
          (department) => `
      <div
        class="flex flex-row border p-2 rounded-md justify-between items-center"
      >
        <span class="text-sm">${department.abbreviation}</span>
        <span class="text-sm">${department.name}</span>

        <div class="flex flex-row gap-4">
          <button
            id="update-department-${department.id}"
            data-college-id="${college.id}"
            class="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded"
          >
            Update
          </button>
          <button
            id="delete-department-${department.id}"
            data-college-id="${college.id}"
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      `
        )
        .join("")}
    </div>

    <button
      id="add-department-${college.id}"
      data-college-id="${college.id}"
      class="bg-green-500 mt-4 hover:bg-green-600 text-white font-bold rounded"
    >
      Add Department
    </button>
  </div>
</div>
`;
}

function renderColleges() {
  mainDivs.course.list.innerHTML = "";
  gS.colleges.data.forEach((college) => {
    mainDivs.course.list.innerHTML += collegeJSONToHTML(college);
  });
}

function renderStudents() {
  mainDivs.student.list.innerHTML = "";
  gS.students.data.forEach((student) => {
    mainDivs.student.list.innerHTML += studentJSONToHTML(student);
  });
}

mainDivs.course.form.submit.addEventListener("click", (e) => {
  e.preventDefault();
  const abbreviation = mainDivs.course.form.abbreviation.value;
  const name = mainDivs.course.form.name.value;

  if (gS.colleges.selectedCollege) {
    gS.colleges.updateCollege(gS.colleges.selectedCollege.id, {
      name,
      abbreviation,
    });
    gS.colleges.setSelectedCollegeToNull();
  } else {
    gS.colleges.addCollege({ name, abbreviation });
  }

  renderColleges();
  closeModal();
});

mainDivs.department.form.submit.addEventListener("click", (e) => {
  e.preventDefault();
  const abbreviation = mainDivs.department.form.abbreviation.value;
  const name = mainDivs.department.form.name.value;

  if (gS.colleges.selectedCollege && !gS.colleges.selectedDepartment) {
    gS.colleges.addDepartment(gS.colleges.selectedCollege.id, {
      name,
      abbreviation,
    });
    gS.colleges.setSelectedCollegeToNull();
  }

  if (gS.colleges.selectedCollege && gS.colleges.selectedDepartment) {
    gS.colleges.updateDepartment(gS.colleges.selectedDepartment.id, {
      name,
      abbreviation,
    });
    gS.colleges.setSelectedCollegeToNull();
    gS.colleges.setSelectedDepartmentToNull();
  }

  renderColleges();
  closeModal();
});

function saveToStorage(studentId: string, photo: string): string {
  const newName = `${studentId}.jpg`;

  const newPath = path.join(getStoragePath(), newName);

  fs.copyFileSync(photo, newPath);

  return newPath;
}

function clearStudentFields() {
  const studentForm = mainDivs.student.form;

  studentForm.studentId.value = "";
  studentForm.firstName.value = "";
  studentForm.lastName.value = "";
  studentForm.birthday.value = "";
  studentForm.gender.value = "";
  studentForm.department.value = "";
  studentForm.college.value = "";
  studentForm.year.value = "";
  mainDivs.student.form.photoWrapper.innerHTML = "";

  gS.currentImage = null;
}

mainDivs.student.form.submit.addEventListener("click", (e) => {
  e.preventDefault();
  const studentForm = mainDivs.student.form;
  const studentInput: Record<keyof StudentType, string> = {
    studentId: studentForm.studentId.value,
    firstName: studentForm.firstName.value,
    lastName: studentForm.lastName.value,
    birthday: studentForm.birthday.value,
    gender: studentForm.gender.value,
    collegeId: studentForm.college.value,
    departmentId: studentForm.department.value,
    photo: "N/A",
    year: studentForm.year.value,
  };
  if (Object.values(studentInput).some((value) => value === "")) {
    alert("Please fill out all fields");
    return;
  }
  if (gS.currentImage) {
    studentInput.photo = saveToStorage(studentInput.studentId, gS.currentImage);
  }

  if (gS.students.selectedStudent) {
    gS.students.updateStudent(
      gS.students.selectedStudent.studentId,
      studentInput
    );
    gS.students.setSelectedStudentToNull();
  } else {
    gS.students.addStudent(studentInput);
  }
  gS.colleges.joinDepartmentsToColleges();
  renderStudents();
  clearStudentFields();
  closeModal();
});

mainDivs.student.form.upload.addEventListener("click", async () => {
  const filePaths = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Images", extensions: ["jpg", "png"] }],
    buttonLabel: "Upload",
    message: "Upload a photo",
  });
  const filePath = filePaths.filePaths[0];
  gS.currentImage = filePath;
  setStudentPhotoModal(filePath);
});

mainDivs.course.list.addEventListener("click", (event) => {
  if (event.target instanceof HTMLButtonElement) {
    if (event.target.id.includes("delete-college")) {
      const collegeId = event.target.id.split("-")[2];
      gS.colleges.deleteCollege(collegeId);
      renderColleges();
      return;
    }

    if (event.target.id.includes("update-college")) {
      openModal(ModalType.College);
      const collegeId = event.target.id.split("-")[2];
      const college = gS.colleges.setSelectedCollege(collegeId);
      mainDivs.course.form.abbreviation.value = college.abbreviation;
      mainDivs.course.form.name.value = college.name;
      return;
    }

    if (event.target.id.includes("add-department")) {
      openModal(ModalType.Department);
      const collegeId = event.target.dataset.collegeId;
      gS.colleges.setSelectedCollege(collegeId);
      return;
    }

    if (event.target.id.includes("delete-department")) {
      const departmentId = event.target.id.split("-")[2];
      gS.colleges.deleteDepartment(departmentId);
      renderColleges();
      return;
    }

    if (event.target.id.includes("update-department")) {
      openModal(ModalType.Department);
      const departmentId = event.target.id.split("-")[2];
      const collegeId = event.target.dataset.collegeId;
      gS.colleges.setSelectedCollege(collegeId);
      const department = gS.colleges.setSelectedDepartment(departmentId);
      mainDivs.department.form.abbreviation.value = department.abbreviation;
      mainDivs.department.form.name.value = department.name;
      return;
    }
  }
});

function setStudentPhotoModal(imgPath: string): void {
  const img = document.createElement("img");
  img.src = imgPath;
  img.className = "object-cover w-full h-full rounded-full";
  mainDivs.student.form.photoWrapper.innerHTML = "";
  mainDivs.student.form.photoWrapper.appendChild(img);
}

mainDivs.student.list.addEventListener("click", (event) => {
  if (event.target instanceof HTMLButtonElement) {
    if (event.target.id.includes("delete-student")) {
      const studentId = event.target.id.replace("delete-student-", "");
      console.log(studentId);
      gS.students.deleteStudent(studentId);
      renderStudents();
      return;
    }

    if (event.target.id.includes("update-student")) {
      const studentId = event.target.id.replace("update-student-", "");
      const student = gS.students.setStudent(studentId);
      openModal(ModalType.Student);
      const studentForm = mainDivs.student.form;
      studentForm.studentId.value = student.studentId;
      studentForm.firstName.value = student.firstName;
      studentForm.lastName.value = student.lastName;
      studentForm.birthday.value = student.birthday;
      studentForm.gender.value = student.gender;
      studentForm.college.value = student.collegeId;
      studentForm.department.value = student.departmentId;
      studentForm.year.value = student.year;
      gS.currentImage = student.photo;
      setStudentPhotoModal(student.photo);
      return;
    }
  }
});

function loadCourseOptions(currentCollegeId?: string | null) {
  mainDivs.student.form.college.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.innerText = "Select College";
  mainDivs.student.form.college.appendChild(option);

  gS.colleges.data.forEach((college) => {
    const option = document.createElement("option");
    option.value = college.id;
    option.innerText = college.name;
    mainDivs.student.form.college.appendChild(option);
  });

  mainDivs.student.form.college.addEventListener("change", (e) => {
    const collegeId = (e.target as HTMLSelectElement).value;
    loadDepartmentOptions(collegeId);
  });

  if (currentCollegeId) {
    loadDepartmentOptions(currentCollegeId);
  }
}

function loadDepartmentOptions(id: string) {
  const departments = gS.colleges.findDepartmentByCollegeId(id);
  mainDivs.student.form.department.innerHTML = "";
  const option = document.createElement("option");
  option.value = "";
  option.innerText = "Select Department";
  mainDivs.student.form.department.appendChild(option);

  departments.forEach((department) => {
    const option = document.createElement("option");
    option.value = department.id;
    option.innerText = department.name;
    mainDivs.student.form.department.appendChild(option);
  });
}

window.addEventListener("load", () => {
  gS.colleges.load();
  gS.students.load();
  renderColleges();
  renderStudents();
});
