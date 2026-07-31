import { useEffect } from "react";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";
import { Section } from "./Section";
import { FormikSelect, FormikText, FormikDatePicker } from "@/components/common/sharedfields";
import { useGetClassesDropdownQuery } from "@/services/private/classService";
import { useGetNextRollNoQuery } from "@/services/private/studentService";

export function AcademicInformation() {
  const { data: classesResponse, isLoading, error } = useGetClassesDropdownQuery();
  const { values, setFieldValue, initialValues } = useFormikContext();

  const user = useSelector((state) => state.auth.user);
  const academicSession = user?.academicSession || "";

  // Only query backend if class and section are selected and differ from initial values (e.g. edit mode checks)
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
      // Revert to original roll number if user goes back to original class/section (important in edit mode)
      setFieldValue("rollNo", initialValues.rollNo || "");
    } else if (nextRollData?.rollNo) {
      setFieldValue("rollNo", nextRollData.rollNo);
    }
  }, [nextRollData, values.class, values.section, initialValues.class, initialValues.section, initialValues.rollNo, setFieldValue]);

  const classOptions = classesResponse?.data?.map((c) => ({
    value: c.name,
    label: `${c.name}`,
  })) || [];

  return (
    <Section title="Academic Information" desc="Class assignment and academic history">
      <FormikSelect
        name="class"
        label="Admission Class"
        placeholder={isLoading ? "Loading classes..." : "Select class"}
        required
        disabled={isLoading || !!error}
        options={classOptions}
      />
      <FormikSelect
        name="section"
        label="Section"
        placeholder="Select section"
        required
        options={["A", "B", "C", "D"].map((s) => ({ value: s, label: `Section ${s}` }))}
      />
      <FormikText
        name="rollNo"
        label="Roll Number"
        placeholder="Auto-generated upon class/section selection"
        disabled
      />
      <FormikText
        name="class_fees"
        type="number"
        label="Monthly Class Fees (Rs.)"
        placeholder="e.g. 5000"
        required
      />
      <FormikText name="prevSchool" label="Previous School" placeholder="School name" />
      <FormikText
        name="lastResult"
        type="number"
        label="Last Exam Result (%)"
        placeholder="e.g. 85"
      />
      <FormikDatePicker name="admissionDate" label="Admission Date" />
    </Section>
  );
}
