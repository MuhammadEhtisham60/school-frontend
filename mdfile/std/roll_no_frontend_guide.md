# Frontend Integration Guide - Automatic Roll Number Allocation (Real-Time Auto-Fetch)

Following the implementation of the backend automatic roll number allocation system, the frontend has been updated to automatically fetch and display the next sequential roll number in real-time as soon as the Class and Section are selected.

---

## 1. Update Yup Validation Schema
**File**: `src/pages/Management/Students/admission/util/helpers.js`

Since roll number is managed by the system, it is no longer marked as required:
```javascript
rollNo: Yup.string().nullable(),
```

---

## 2. Declare query hook in `studentService.js`
**File**: `src/services/private/studentService.js`

Inject the `getNextRollNo` RTK query endpoint to fetch the next sequential roll number from the backend:
```javascript
getNextRollNo: builder.query({
  query: (params) => ({
    url: "students/next-roll-no",
    method: "GET",
    params,
  }),
  providesTags: [{ type: "Student", id: "LIST" }],
  keepUnusedDataFor: 0,
}),
```
Export the corresponding hook:
```javascript
export const {
  // ...
  useGetNextRollNoQuery,
} = studentApi;
```

---

## 3. Auto-Fetch and Display Roll Number in UI
**File**: `src/pages/Management/Students/admission/stepcomponent/AcademicInformation.jsx`

Hook into the Formik context, retrieve the active academic session from Redux, and fetch the next roll number when class and section are selected.

### Key Implementation details:
1. **Hook Skip Condition**: The fetch hook will run only if both class and section have non-empty values selected, and they differ from the student's initial class/section (important for edit mode to avoid overwriting current roll number on load).
2. **Reversion Logic**: If the user changes the class or section and then changes them back to their original values in edit mode, the field reverts back to the student's initial roll number.
3. **Form Component UI**: The `rollNo` input field is disabled with a placeholder: `"Auto-generated upon class/section selection"`.

```jsx
import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import { Section } from "./Section";
import { FormikSelect, FormikText } from "@/components/common/sharedfields";
import { useGetNextRollNoQuery } from "@/services/private/studentService";

export function AcademicInformation() {
  const { values, setFieldValue, initialValues } = useFormikContext();
  const user = useSelector((state) => state.auth.user);
  const academicSession = user?.academicSession || "";

  // Only query backend if class and section differ from initial values (e.g., edit mode checks)
  const shouldSkip = !values.class || !values.section || !academicSession || 
    (values.class === initialValues.class && values.section === initialValues.section);

  const { data: nextRollData } = useGetNextRollNoQuery(
    {
      academicSession,
      class: values.class,
      section: values.section,
    },
    { 
      skip: shouldSkip,
      refetchOnMountOrArgChange: true
    }
  );

  useEffect(() => {
    if (values.class === initialValues.class && values.section === initialValues.section) {
      setFieldValue("rollNo", initialValues.rollNo || "");
    } else if (nextRollData?.rollNo) {
      setFieldValue("rollNo", nextRollData.rollNo);
    }
  }, [nextRollData, values.class, values.section, initialValues.class, initialValues.section, initialValues.rollNo, setFieldValue]);

  return (
    // ... select dropdowns
    <FormikText
      name="rollNo"
      label="Roll Number"
      placeholder="Auto-generated upon class/section selection"
      disabled
    />
  );
}
```

---

## 4. Append Active Academic Session in Form Submission
**File**: `src/pages/Management/Students/admission/index.jsx`

Retrieve `academicSession` from the Redux store and append it to `FormData` on submit:
```javascript
const user = useSelector((state) => state.auth.user);
const academicSession = user?.academicSession || "";

// ... inside onSubmit:
formData.append("academicSession", academicSession);
```
