import { Section } from "./Section";
import { FormikFile } from "@/components/common/sharedfields";

export function Documents() {
  const docs = [
    { key: "studentPhoto", label: "Student Photo" },
    { key: "bFormCopy", label: "B-Form Copy" },
    { key: "prevResultCard", label: "Previous Result Card" },
    { key: "guardianCnic", label: "Guardian CNIC" },
  ];
  return (
    <Section title="Documents Upload" desc="Attach the required documents">
      {docs.map((d) => (
        <FormikFile
          key={d.key}
          name={d.key}
          label={d.label}
          placeholder={`Click to upload ${d.label}`}
          maxSizeText="PDF, PNG, JPG up to 10MB"
          compact
          optional
        />
      ))}
    </Section>
  );
}
