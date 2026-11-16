import { useState } from "react";

export const defaultSiteContent = {
  hero: {
    badge: "Smart Campus • Powered by EduPulse ERP",
    title: "Modern Education Meets",
    titleAccent: "Intelligent School ERP.",
    subtitle:
      "A future-ready K–12 institution powered by an all-in-one digital School ERP — unifying admissions, smart attendance, PKR fee billing, timetables, exams, results, and campus communication.",
    primaryCta: "Apply Online",
    secondaryCta: "Explore ERP Modules",
  },
  stats: [
    { v: "18+", l: "Integrated ERP Modules" },
    { v: "100%", l: "PKR Automated Billing" },
    { v: "PDF & XLS", l: "Instant Report Exports" },
    { v: "24/7", l: "Real-Time Campus Sync" },
  ],
  promise: {
    eyebrow: "Modern Era Campus",
    title: "One unified platform for",
    titleAccent: "every school workflow.",
    description:
      "From the moment a student applies for admission to daily attendance, class routines, exams, result ledgers, and PKR fee collection — every department works in real time.",
    bullets: [
      "Class-wise daily attendance (Present, Absent, Leave with optional reason)",
      "Automated PKR fee vouchers, receipts, and accountant payroll ledgers",
      "Real-time exam date-sheets, result grading, and instant PDF/Excel exports",
      "Dynamic class routines, subject allocation, and question paper bank",
      "Role-based access for Admins, Teachers, Accountants, and Staff",
    ],
  },
  contact: {
    address: "Main Boulevard, Faisalabad, Pakistan",
    phone: "+92 300 0000000",
    email: "hello@edupulse.edu.pk",
    hours: "Mon – Sat, 8:00 AM – 4:00 PM",
  },
  footer: {
    tagline:
      "Empowering modern schools with academic excellence and a complete, real-time School Management ERP.",
  },
  brand: { name: "EduPulse", sub: "Smart School & ERP" },
};

export function useSiteContent() {
  const [content, setContent] = useState(defaultSiteContent);
  return [content, setContent];
}
