import { Section } from "./Section";
import { FormikSelect, FormikText, FormikDatePicker } from "@/components/common/sharedfields";

export function AcademicInformation() {
  return (
    <Section title="Academic Information" desc="Class assignment and academic history">
      <FormikSelect
        name="class"
        label="Admission Class"
        placeholder="Select class"
        required
        options={[
          "Nursery",
          "KG",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "12",
        ].map((c) => ({ value: c, label: `Class ${c}` }))}
      />
      <FormikSelect
        name="section"
        label="Section"
        placeholder="Select section"
        required
        options={["A", "B", "C", "D"].map((s) => ({ value: s, label: `Section ${s}` }))}
      />
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
