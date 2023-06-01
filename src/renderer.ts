import CollegeService from "./js/college";
import StudentService, { getFullName, getYearLevel } from "./js/student";
import {
  CollegeWithDepartmentsType,
  StudentDocWithDepartmentType,
  StudentType,
} from "./js/types";

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
}

const gS: GlobalStateType = {
  currentTab: TabType.Student,
  modalForm: null,
  colleges: new CollegeService(),
  students: new StudentService(),
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
  wrapper: getElById<HTMLDivElement>("modal-wrapper"),
  student: getElById<HTMLDivElement>("student-modal"),
  college: getElById<HTMLDivElement>("college-modal"),
  department: getElById<HTMLDivElement>("department-modal"),
};

const mainDivs = {
  student: {
    add: getElById<HTMLButtonElement>("add-student-btn"),
    list: getElById<HTMLDivElement>("student-list"),
    form: {
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

  switch (tab) {
    case TabType.Student:
      tabDivs.student.classList.add("underline");
      tabDivs.course.classList.remove("underline");
      pageDivs.student.classList.remove("block");
      pageDivs.student.classList.remove("hidden");
      pageDivs.course.classList.add("hidden");
      break;
    case TabType.Course:
      tabDivs.student.classList.remove("underline");
      tabDivs.course.classList.add("underline");
      pageDivs.student.classList.add("hidden");
      pageDivs.course.classList.remove("hidden");
      pageDivs.course.classList.add("block");
      break;
  }

  gS.currentTab = tab;
}

changeTab(gS.currentTab);

tabDivs.student.addEventListener("click", () => changeTab(TabType.Student));
tabDivs.course.addEventListener("click", () => changeTab(TabType.Course));

function openModal(modalType: ModalType) {
  console.log("openModal", modalType);

  modalDivs.wrapper.classList.remove("hidden");
  modalDivs.wrapper.classList.add("flex");

  switch (modalType) {
    case ModalType.Student:
      modalDivs.student.classList.remove("hidden");
      modalDivs.student.classList.add("grid");
      loadCourseOptions();
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

  modalDivs.wrapper.classList.add("hidden");
  gS.modalForm = null;
}

mainDivs.student.add.addEventListener("click", () =>
  openModal(ModalType.Student)
);

mainDivs.course.add.addEventListener("click", () =>
  openModal(ModalType.College)
);

modalDivs.wrapper.addEventListener("click", (event) => {
  if (event.target === modalDivs.wrapper) {
    closeModal();
  }
});

function studentJSONToHTML(student: StudentDocWithDepartmentType) {
  const imgEl = student.photo
    ? `<img src="${student.photo}" alt="pic" class="h-full w-full" />`
    : `<div class="h-full w-full flex items-center justify-center text-2xl text-gray-400">No Photo</div>`;

  return `
      <div class="bg-white w-full px-4 py-8 rounded-lg shadow-sm">
        <div class="aspect-square bg-gray-100 border overflow-hidden h-44 mx-auto rounded-full">
          ${imgEl}
        </div>
        <div class="mt-4">
          <h1 class="text-center text-2xl font-medium">${getFullName(
            student
          )}</h1>
          <p class="text-center text-sm">${student.studentId}</p>
          <p class="text-center text-sm">${getYearLevel(student)}</p>
          <p class="text-center text-sm">${student.department.abbreviation}</p>
        </div>
      </div>
  `;
}

function collegeJSONToHTML(college: CollegeWithDepartmentsType) {
  return `<div class="flex flex-col border w-full rounded-lg p-6">
  <div class="flex flex-row w-full justify-between items-center">
    <div class="flex flex-col">
      <span class="text-xl font-semibold">${college.abbreviation}</span>
      <span class="text-lg">${college.name}</span>
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
      class="bg-green-500 mt-4 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
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

mainDivs.student.form.submit.addEventListener("click", (e) => {
  e.preventDefault();
  const studentForm = mainDivs.student.form;
  const studentInput: Record<keyof StudentType, string> = {
    studentId: studentForm.studentId.value,
    firstName: studentForm.firstName.value,
    lastName: studentForm.lastName.value,
    birthday: studentForm.birthday.value,
    gender: studentForm.gender.value,
    departmentId: studentForm.department.value,
    photo: "N/A",
    year: studentForm.year.value,
  };
  if (Object.values(studentInput).some((value) => value === "")) {
    alert("Please fill out all fields");
    return;
  }
  gS.students.addStudent(studentInput);
  gS.colleges.joinDepartmentsToColleges();
  renderStudents();
  closeModal();
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

function loadCourseOptions(): void {
  gS.colleges.data.forEach((college) => {
    const option = document.createElement("option");
    option.value = college.id;
    option.innerText = college.name;
    mainDivs.student.form.college.appendChild(option);
  });

  mainDivs.student.form.college.addEventListener("change", (e) => {
    const collegeId = (e.target as HTMLSelectElement).value;
    const departments = gS.colleges.findDepartmentByCollegeId(collegeId);

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
  });
}

window.addEventListener("load", () => {
  gS.colleges.load();
  gS.students.load();
  renderColleges();
  renderStudents();
});
