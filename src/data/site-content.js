import { useEffect, useState } from "react";
export const defaultSiteContent = {
  hero: {
    badge: "Admissions 2025–26 Now Open",
    title: "Where curious minds become",
    titleAccent: "confident leaders.",
    subtitle:
      "An award-winning K–12 academy blending rigorous academics, creativity and character — preparing students for a world that hasn't been invented yet.",
    primaryCta: "Start Application",
    secondaryCta: "Discover EduPulse",
  },
  stats: [
    { v: "26", l: "Years of Excellence" },
    { v: "2,400+", l: "Happy Students" },
    { v: "180+", l: "Expert Teachers" },
    { v: "98%", l: "University Placement" },
  ],
  promise: {
    eyebrow: "Our Promise",
    title: "Education that",
    titleAccent: "thinks ahead.",
    description:
      "We blend timeless values with future-ready skills — small class sizes, project-based learning and a faculty that genuinely loves teaching.",
    bullets: [
      "Average class size of 18 students",
      "1:1 device program from Grade 4",
      "Mandarin, French & Spanish from Grade 1",
      "Counselling, wellbeing & life-skills program",
      "International exchanges & MUN",
    ],
  },
  contact: {
    address: "Main Boulevard, Faisalabad, Pakistan",
    phone: "+92 300 0000000",
    email: "hello@edupulse.edu",
    hours: "Mon – Fri, 8:00 – 16:00",
  },
  footer: {
    tagline: "Nurturing curious minds and confident leaders since 1998.",
  },
  brand: { name: "EduPulse", sub: "Academy of Excellence" },
};
const KEY = "edupulse:site-content:v1";
export function loadSiteContent() {
  if (typeof window === "undefined") return defaultSiteContent;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSiteContent;
    return { ...defaultSiteContent, ...JSON.parse(raw) };
  } catch {
    return defaultSiteContent;
  }
}
export function saveSiteContent(c) {
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent("site-content-change"));
}
export function useSiteContent() {
  const [content, setContent] = useState(defaultSiteContent);
  useEffect(() => {
    setContent(loadSiteContent());
    const onChange = () => setContent(loadSiteContent());
    window.addEventListener("site-content-change", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("site-content-change", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const update = (c) => {
    setContent(c);
    saveSiteContent(c);
  };
  return [content, update];
}
