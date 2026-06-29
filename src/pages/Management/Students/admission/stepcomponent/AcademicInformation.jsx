import { Section } from "./Section";
import { FormikSelect, FormikText, FormikDatePicker } from "@/components/common/sharedfields";
import { useGetClassesDropdownQuery } from "@/services/private/classService";

export function AcademicInformation() {
  const { data: classesResponse, isLoading, error } = useGetClassesDropdownQuery();

  const classOptions = classesResponse?.data?.map((c) => ({
    value: c.name,
    label: `Class ${c.name}`,
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
      <FormikText name="rollNo" label="Roll Number" placeholder="Auto / Manual" />
      <FormikText
        name="class_fees"
        type="number"
        label="Monthly Class Fees (Rs.)"
        placeholder="e.g. 5000"
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
