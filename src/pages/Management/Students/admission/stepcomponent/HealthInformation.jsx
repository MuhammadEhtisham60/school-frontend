import { Section } from "./Section";
import { FormikSelect, FormikText, FormikTextArea } from "@/components/common/sharedfields";

export function HealthInformation() {
  return (
    <Section title="Health Information" desc="Medical and emergency details">
      <FormikSelect
        name="blood"
        label="Blood Group"
        placeholder="Select"
        options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]}
      />
      <FormikText name="emergency" label="Emergency Contact" />
      <FormikTextArea
        name="medical"
        label="Medical Conditions"
        placeholder="Allergies, chronic conditions, etc."
        full
      />
      <FormikText
        name="disability"
        label="Disability (if any)"
        placeholder="None / specify"
        full
      />
    </Section>
  );
}
