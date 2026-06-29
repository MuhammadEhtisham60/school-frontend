import * as Yup from "yup";

export const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const initialValues = {
  fullName: "",
  fatherName: "",
  rollNo: "",
  dob: "",
  gender: "",
  cnic: "",
  photo: null,
  class: "",
  class_fees: "",
  section: "",
  prevSchool: "",
  lastResult: "",
  admissionDate: getTodayDateString(),
  mobile: "",
  altContact: "",
  email: "",
  city: "",
  address: "",
  fatherFullName: "",
  fatherCNIC: "",
  occupation: "",
  fatherPhone: "",
  motherName: "",
  motherPhone: "",
  blood: "",
  emergency: "",
  medical: "",
  disability: "",
  transport: false,
  busRoute: "",
  hostel: false,
  is_active: true,
  studentPhoto: null,
  bFormCopy: null,
  prevResultCard: null,
  guardianCnic: null,
};

export const validationSchema = Yup.object().shape({
  // Step 1: Basic Info
  fullName: Yup.string()
    .required("Full name is required")
    .min(3, "Name must be at least 3 characters"),
  fatherName: Yup.string()
    .required("Father's name is required")
    .min(3, "Father's name must be at least 3 characters"),
  dob: Yup.string().required("Date of birth is required"),
  gender: Yup.string().required("Gender is required"),
  cnic: Yup.string()
    .required("B-Form / CNIC is required")
    .transform((curr, orig) => (orig === "" ? null : curr)),
  photo: Yup.mixed().required("Profile photo is required"),
  is_active: Yup.boolean().required("Active status is required"),

  // Step 2: Academic
  class: Yup.string().required("Admission class is required"),
  section: Yup.string().required("Section is required"),
  rollNo: Yup.string().nullable().required("Roll No is required"),
  class_fees: Yup.number()
    .typeError("Must be a number")
    .required("Class fees is required")
    .min(0, "Cannot be negative")
    .transform((curr, orig) => (orig === "" ? null : curr)),
  prevSchool: Yup.string().nullable(),
  lastResult: Yup.number()
    .typeError("Must be a number")
    .min(0, "Min result is 0%")
    .max(100, "Max result is 100%")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  admissionDate: Yup.string().nullable(),

  // Step 3: Contact
  mobile: Yup.string()
    .required("Mobile number is required")
    .matches(/^[0-9+-\s()]*$/, "Invalid phone number format"),
  altContact: Yup.string().nullable(),
  email: Yup.string().email("Invalid email address").nullable(),
  city: Yup.string().nullable(),
  address: Yup.string().nullable(),

  // Step 4: Guardian
  fatherFullName: Yup.string().nullable(),
  fatherCNIC: Yup.string()
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  occupation: Yup.string().nullable(),
  fatherPhone: Yup.string().nullable(),
  motherName: Yup.string().nullable(),
  motherPhone: Yup.string().nullable(),

  // Step 5: Health
  blood: Yup.string().nullable(),
  emergency: Yup.string().nullable(),
  medical: Yup.string().nullable(),
  disability: Yup.string().nullable(),

  // Step 6: Transport
  transport: Yup.boolean(),
  busRoute: Yup.string().when("transport", {
    is: true,
    then: (schema) => schema.required("Bus route is required"),
    otherwise: (schema) => schema.nullable(),
  }),
  hostel: Yup.boolean(),

  // Step 7: Documents
  studentPhoto: Yup.mixed().nullable(),
  bFormCopy: Yup.mixed().nullable(),
  prevResultCard: Yup.mixed().nullable(),
  guardianCnic: Yup.mixed().nullable(),
});
