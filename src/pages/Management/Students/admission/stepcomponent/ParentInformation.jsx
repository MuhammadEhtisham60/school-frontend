import { Section } from "./Section";
import { FormikText } from "@/components/common/sharedfields";

export function ParentInformation() {
  return (
    <Section title="Parent / Guardian Details" desc="Primary contacts for the student">
      <FormikText name="fatherFullName" label="Father's Name" />
      <FormikText name="fatherCNIC" label="Father's CNIC" placeholder="12345-1234567-1" />
      <FormikText name="occupation" label="Father's Occupation" />
      <FormikText name="fatherPhone" label="Father's Phone" />
      <FormikText name="motherName" label="Mother's Name" />
      <FormikText name="motherPhone" label="Mother's Phone" />
    </Section>
  );
}
