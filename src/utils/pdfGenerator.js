import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const SCHOOL_NAME = "THE FORCE SCHOOL SYSTEM";
const SCHOOL_TAGLINE = "Excellence in Academics, Character & Leadership";
const SCHOOL_CONTACT = "Main Campus · The Force School System · Official Academic & Finance Portal";

function sanitizeFilename(str) {
  return String(str || "document")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function computeGradeFromPct(pct) {
  if (pct >= 90) return { grade: "A+", gpa: 4.0 };
  if (pct >= 80) return { grade: "A", gpa: 3.7 };
  if (pct >= 70) return { grade: "B", gpa: 3.2 };
  if (pct >= 60) return { grade: "C", gpa: 2.5 };
  if (pct >= 50) return { grade: "D", gpa: 2.0 };
  return { grade: "F", gpa: 0.0 };
}

function drawSchoolHeader(doc, title, subtitle = "") {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 34, "F");

  // Accent Stripe
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 34, pageWidth, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(SCHOOL_NAME, pageWidth / 2, 13, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(SCHOOL_TAGLINE, pageWidth / 2, 19.5, { align: "center" });
  doc.text(SCHOOL_CONTACT, pageWidth / 2, 25, { align: "center" });

  // Document Title Pill
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 41, pageWidth - 28, subtitle ? 16 : 12, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text(title.toUpperCase(), pageWidth / 2, 48.5, { align: "center" });

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(subtitle, pageWidth / 2, 54, { align: "center" });
    return 62;
  }

  return 58;
}

function drawSignatureFooter(doc, startY, labels = ["Class Teacher", "Controller of Exams", "Principal"]) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = Math.max(startY + 18, pageHeight - 32);
  if (y > pageHeight - 18) {
    doc.addPage();
    y = 35;
  }

  const colWidth = (pageWidth - 28) / labels.length;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);

  labels.forEach((label, idx) => {
    const centerX = 14 + colWidth * idx + colWidth / 2;
    doc.line(centerX - 24, y, centerX + 24, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(label, centerX, y + 5, { align: "center" });
  });

  // Footer timestamp
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated on ${new Date().toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })} · ${SCHOOL_NAME}`,
    pageWidth / 2,
    pageHeight - 7,
    { align: "center" }
  );
}

/**
 * 1. Download Single Month Fee Receipt PDF
 */
export function downloadFeeReceiptPDF(fee, studentOverride = null) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const studentInfo = studentOverride || fee?.studentId || {};
  const studentName = studentInfo.fullName || studentInfo.name || "Student";
  const fatherName = studentInfo.fatherName || studentInfo.father_name || "—";
  const studentClass = studentInfo.class || "—";
  const section = studentInfo.section || "—";
  const rollNo = studentInfo.rollNo || studentInfo.rollNumber || "N/A";
  const mobile = studentInfo.mobile || studentInfo.contact || "—";
  const admissionNo = studentInfo.admissionNo || `ADM-${studentInfo.id || fee?.id || "001"}`;

  const receiptNo = `RCP-${String(fee?.id || "001").toUpperCase()}-${String(fee?.month || "FEE")
    .slice(0, 3)
    .toUpperCase()}`;
  const isPaid = String(fee?.status || "Paid").toLowerCase() === "paid";
  const amount = Number(fee?.amount || 0);

  let y = drawSchoolHeader(
    doc,
    "Official Fee Payment Receipt",
    `Receipt No: ${receiptNo}   |   Issue Date: ${new Date().toISOString().split("T")[0]}`
  );

  // Student Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, "FD");

  doc.setFontSize(9);
  const leftX = 18;
  const rightX = pageWidth / 2 + 4;

  const drawField = (label, value, x, rowY) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "—"), x + 32, rowY);
  };

  drawField("Student Name", studentName, leftX, y + 8);
  drawField("Father's Name", fatherName, leftX, y + 16);
  drawField("Contact No", mobile, leftX, y + 24);

  drawField("Admission ID", admissionNo, rightX, y + 8);
  drawField("Class & Section", `Class ${studentClass} - ${section}`, rightX, y + 16);
  drawField("Roll Number", `#${rollNo}`, rightX, y + 24);

  y += 36;

  // Fee Breakdown Table
  autoTable(doc, {
    startY: y,
    head: [["S.No", "Fee Particulars / Billing Month", "Payment Method", "Payment Date", "Status", "Amount (Rs.)"]],
    body: [
      [
        "1",
        `Monthly Tuition & Academic Fee - ${fee?.month || "N/A"}`,
        fee?.paymentMethod || "Cash",
        fee?.paymentDate || "—",
        (fee?.status || "Pending").toUpperCase(),
        `Rs. ${amount.toLocaleString()}`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42],
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 14 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 30 },
      3: { halign: "center", cellWidth: 28 },
      4: {
        halign: "center",
        cellWidth: 24,
        fontStyle: "bold",
        textColor: isPaid ? [22, 163, 74] : [217, 119, 6],
      },
      5: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Summary Box
  const summaryWidth = 82;
  const summaryX = pageWidth - 14 - summaryWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, y, summaryWidth, 28, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Total Billed:", summaryX + 5, y + 8);
  doc.text("Amount Paid:", summaryX + 5, y + 15.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Balance Due:", summaryX + 5, y + 23.5);

  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${amount.toLocaleString()}`, summaryX + summaryWidth - 5, y + 8, { align: "right" });
  doc.setTextColor(22, 163, 74);
  doc.text(
    `Rs. ${(isPaid ? amount : 0).toLocaleString()}`,
    summaryX + summaryWidth - 5,
    y + 15.5,
    { align: "right" }
  );
  doc.setTextColor(isPaid ? 15 : 220, isPaid ? 23 : 38, isPaid ? 42 : 38);
  doc.text(
    `Rs. ${(isPaid ? 0 : amount).toLocaleString()}`,
    summaryX + summaryWidth - 5,
    y + 23.5,
    { align: "right" }
  );

  // Remarks on Left
  if (fee?.remarks) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Remarks / Notes:", 14, y + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const splitRemarks = doc.splitTextToSize(String(fee.remarks), pageWidth - summaryWidth - 36);
    doc.text(splitRemarks, 14, y + 12);
  }

  drawSignatureFooter(doc, y + 40, ["Depositor Signature", "Cashier / Accountant", "School Stamp"]);

  doc.save(`Fee_Receipt_${sanitizeFilename(studentName)}_${sanitizeFilename(fee?.month || "Month")}.pdf`);
}

/**
 * 1B. Download Complete Student Fee Statement PDF (All Months for a Student)
 */
export function downloadStudentFeeStatementPDF(student, feeRecords = []) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const studentName = student?.fullName || student?.name || "Student";
  let y = drawSchoolHeader(
    doc,
    "Student Annual Fee Statement",
    `Student: ${studentName} (Class ${student?.class || "—"}-${student?.section || "—"}, Roll #${student?.rollNo || "N/A"})`
  );

  const totalBilled = feeRecords.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  const totalPaid = feeRecords.reduce(
    (acc, f) => acc + (String(f.status).toLowerCase() === "paid" ? Number(f.amount) || 0 : 0),
    0
  );
  const totalDue = totalBilled - totalPaid;

  // Summary KPI Row
  const boxW = (pageWidth - 36) / 3;
  const kpis = [
    { label: "TOTAL BILLED", val: `Rs. ${totalBilled.toLocaleString()}`, color: [30, 41, 59] },
    { label: "TOTAL PAID", val: `Rs. ${totalPaid.toLocaleString()}`, color: [22, 163, 74] },
    { label: "BALANCE DUE", val: `Rs. ${totalDue.toLocaleString()}`, color: totalDue > 0 ? [220, 38, 38] : [71, 85, 105] },
  ];

  kpis.forEach((k, i) => {
    const bx = 14 + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, y, boxW, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, bx + boxW / 2, y + 6.5, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(...k.color);
    doc.text(k.val, bx + boxW / 2, y + 14, { align: "center" });
  });

  y += 24;

  autoTable(doc, {
    startY: y,
    head: [["#", "Month", "Status", "Amount (Rs.)", "Payment Date", "Method", "Remarks"]],
    body: feeRecords.map((f, idx) => [
      idx + 1,
      f.month || "—",
      (f.status || "Pending").toUpperCase(),
      `Rs. ${Number(f.amount || 0).toLocaleString()}`,
      f.paymentDate || "—",
      f.paymentMethod || "—",
      f.remarks || "—",
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
    },
    margin: { left: 14, right: 14 },
  });

  drawSignatureFooter(doc, doc.lastAutoTable.finalY + 15, ["Parent / Guardian", "Accounts Office", "Principal"]);
  doc.save(`Fee_Statement_${sanitizeFilename(studentName)}.pdf`);
}

/**
 * 2A. Download Single Term Result Card PDF (Separately Term-wise)
 */
export function downloadTermResultCardPDF(record, termName, studentOverride = null) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const studentInfo = studentOverride || record?.studentId || {};
  const studentName = studentInfo.fullName || studentInfo.name || record?.studentName || "Student";
  const fatherName = studentInfo.fatherName || studentInfo.father_name || "—";
  const studentClass = record?.class || studentInfo.class || "—";
  const section = record?.section || studentInfo.section || "—";
  const rollNo = record?.rollNo || studentInfo.rollNo || "N/A";
  const academicYear = record?.academicYear || "2026-2027";

  const termDetails = record?.terms?.[termName] || record || {};
  const subjects = termDetails.subjects || [];

  let y = drawSchoolHeader(
    doc,
    `${termName} Examination Result Card`,
    `Academic Session: ${academicYear}`
  );

  // Student Profile Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, "FD");

  const leftX = 18;
  const rightX = pageWidth / 2 + 4;
  doc.setFontSize(9);

  const drawField = (label, value, x, rowY) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "—"), x + 32, rowY);
  };

  drawField("Student Name", studentName, leftX, y + 7.5);
  drawField("Father's Name", fatherName, leftX, y + 14.5);
  drawField("Exam Term", termName, leftX, y + 21);

  drawField("Roll Number", `#${rollNo}`, rightX, y + 7.5);
  drawField("Class & Section", `Class ${studentClass} - Section ${section}`, rightX, y + 14.5);
  drawField("Academic Year", academicYear, rightX, y + 21);

  y += 30;

  const totalMarksSum = subjects.reduce((acc, s) => acc + (Number(s.totalMarks) || 0), 0);
  const obtainedMarksSum = subjects.reduce((acc, s) => acc + (Number(s.obtainedMarks) || 0), 0);
  const overallPct =
    termDetails.percentage !== undefined
      ? Number(termDetails.percentage)
      : totalMarksSum > 0
      ? Number(((obtainedMarksSum / totalMarksSum) * 100).toFixed(1))
      : 0;
  const { grade: computedGrade, gpa: computedGpa } = computeGradeFromPct(overallPct);
  const overallGrade = termDetails.grade || computedGrade;
  const overallGpa = termDetails.gpa ?? computedGpa;
  const overallStatus = termDetails.resultStatus || (overallPct >= 40 ? "Pass" : "Fail");

  // Subject Marks Table
  autoTable(doc, {
    startY: y,
    head: [["S.No", "Subject", "Total Marks", "Obtained Marks", "Percentage", "Grade", "Status", "Remarks"]],
    body: [
      ...subjects.map((subj, idx) => {
        const tot = Number(subj.totalMarks) || 100;
        const obt = Number(subj.obtainedMarks) || 0;
        const pct = tot > 0 ? ((obt / tot) * 100).toFixed(1) : "0.0";
        const g = subj.grade || computeGradeFromPct(Number(pct)).grade;
        const st = subj.status || (Number(pct) >= 40 ? "Pass" : "Fail");
        return [
          idx + 1,
          subj.subjectName || "Subject",
          tot,
          obt,
          `${pct}%`,
          g,
          st.toUpperCase(),
          subj.remarks || "—",
        ];
      }),
      [
        "",
        "TOTAL / OVERALL",
        totalMarksSum,
        obtainedMarksSum,
        `${overallPct}%`,
        overallGrade,
        overallStatus.toUpperCase(),
        `GPA: ${overallGpa}`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 3.2,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 13 },
      1: { halign: "left", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 23 },
      3: { halign: "center", cellWidth: 26, fontStyle: "bold" },
      4: { halign: "center", cellWidth: 23 },
      5: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      6: { halign: "center", cellWidth: 20, fontStyle: "bold" },
      7: { halign: "left" },
    },
    didParseCell: (data) => {
      if (data.row.index === subjects.length) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Performance Summary Strip
  const boxW = (pageWidth - 40) / 4;
  const summaryCards = [
    { label: "MARKS OBTAINED", val: `${obtainedMarksSum} / ${totalMarksSum}` },
    { label: "PERCENTAGE", val: `${overallPct}%` },
    { label: "GRADE / GPA", val: `${overallGrade} (${overallGpa})` },
    { label: "RESULT STATUS", val: overallStatus.toUpperCase() },
  ];

  summaryCards.forEach((c, i) => {
    const bx = 14 + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, y, boxW, 17, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(c.label, bx + boxW / 2, y + 6, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(String(c.val), bx + boxW / 2, y + 13, { align: "center" });
  });

  y += 23;

  if (termDetails.remarks) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Teacher's Remarks: `, 14, y);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(15, 23, 42);
    doc.text(String(termDetails.remarks), 46, y);
  }

  drawSignatureFooter(doc, y + 12, ["Class Teacher", "Controller of Examinations", "Principal"]);

  doc.save(
    `Result_Card_${sanitizeFilename(studentName)}_${sanitizeFilename(termName)}_${sanitizeFilename(academicYear)}.pdf`
  );
}

/**
 * 2B. Download Complete 3-Terms Consolidated Result Card PDF
 */
export function downloadCompleteThreeTermsResultCardPDF(record, studentOverride = null) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const studentInfo = studentOverride || record?.studentId || {};
  const studentName = studentInfo.fullName || studentInfo.name || "Student";
  const fatherName = studentInfo.fatherName || studentInfo.father_name || "—";
  const studentClass = record?.class || studentInfo.class || "—";
  const section = record?.section || studentInfo.section || "—";
  const rollNo = record?.rollNo || studentInfo.rollNo || "N/A";
  const academicYear = record?.academicYear || "2026-2027";
  const promotionStatus = record?.promotionStatus || "Promoted";

  const termsObj = record?.terms || {};
  const orderedTermNames = ["First Term", "Mid Term", "Final Term"];
  // Also include any custom term names if present
  Object.keys(termsObj).forEach((k) => {
    if (!orderedTermNames.includes(k)) orderedTermNames.push(k);
  });

  let y = drawSchoolHeader(
    doc,
    "Consolidated Final Result Card (All 3 Terms)",
    `Academic Session: ${academicYear}   |   Promotion Status: ${promotionStatus.toUpperCase()}`
  );

  // Student Profile Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, "FD");

  const leftX = 18;
  const rightX = pageWidth / 2 + 4;
  doc.setFontSize(9);

  const drawField = (label, value, x, rowY) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "—"), x + 32, rowY);
  };

  drawField("Student Name", studentName, leftX, y + 7.5);
  drawField("Father's Name", fatherName, leftX, y + 14.5);
  drawField("Terms Completed", `${Object.keys(termsObj).length} / 3 Terms`, leftX, y + 21);

  drawField("Roll Number", `#${rollNo}`, rightX, y + 7.5);
  drawField("Class & Section", `Class ${studentClass} - Section ${section}`, rightX, y + 14.5);
  drawField("Promotion Status", promotionStatus, rightX, y + 21);

  y += 30;

  // Collect all unique subjects across the 3 terms
  const subjectNames = [];
  orderedTermNames.slice(0, 3).forEach((tName) => {
    const tData = termsObj[tName];
    (tData?.subjects || []).forEach((s) => {
      const name = (s.subjectName || "Subject").trim();
      if (!subjectNames.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
        subjectNames.push(name);
      }
    });
  });

  const findSubjectInTerm = (tName, subName) => {
    const list = termsObj[tName]?.subjects || [];
    return list.find((s) => (s.subjectName || "").trim().toLowerCase() === subName.toLowerCase());
  };

  let grandTotalMarks = 0;
  let grandObtainedMarks = 0;

  const subjectRows = subjectNames.map((subName, idx) => {
    const t1 = findSubjectInTerm("First Term", subName);
    const t2 = findSubjectInTerm("Mid Term", subName);
    const t3 = findSubjectInTerm("Final Term", subName);

    const t1Tot = t1 ? Number(t1.totalMarks || 0) : 0;
    const t1Obt = t1 ? Number(t1.obtainedMarks || 0) : 0;

    const t2Tot = t2 ? Number(t2.totalMarks || 0) : 0;
    const t2Obt = t2 ? Number(t2.obtainedMarks || 0) : 0;

    const t3Tot = t3 ? Number(t3.totalMarks || 0) : 0;
    const t3Obt = t3 ? Number(t3.obtainedMarks || 0) : 0;

    const combinedTot = t1Tot + t2Tot + t3Tot;
    const combinedObt = t1Obt + t2Obt + t3Obt;
    grandTotalMarks += combinedTot;
    grandObtainedMarks += combinedObt;

    const combinedPct = combinedTot > 0 ? Number(((combinedObt / combinedTot) * 100).toFixed(1)) : 0;
    const { grade } = computeGradeFromPct(combinedPct);
    const status = combinedPct >= 40 ? "PASS" : "FAIL";

    return [
      idx + 1,
      subName,
      t1 ? `${t1Obt} / ${t1Tot}` : "—",
      t2 ? `${t2Obt} / ${t2Tot}` : "—",
      t3 ? `${t3Obt} / ${t3Tot}` : "—",
      combinedTot,
      combinedObt,
      `${combinedPct}%`,
      grade,
      status,
    ];
  });

  const overallPct =
    grandTotalMarks > 0 ? Number(((grandObtainedMarks / grandTotalMarks) * 100).toFixed(1)) : 0;
  const { grade: finalGrade, gpa: finalGpa } = computeGradeFromPct(overallPct);
  const finalStatus = overallPct >= 40 ? "PASS" : "FAIL";

  // Combined 3-Terms Subject Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Subject-Wise Consolidated Performance (First, Mid & Final Term)", 14, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [
      [
        "#",
        "Subject",
        "First Term\n(Obt/Tot)",
        "Mid Term\n(Obt/Tot)",
        "Final Term\n(Obt/Tot)",
        "Grand\nTotal",
        "Grand\nObtained",
        "Overall\n%",
        "Grade",
        "Status",
      ],
    ],
    body: [
      ...subjectRows,
      [
        "",
        "GRAND TOTAL (ALL 3 TERMS)",
        "",
        "",
        "",
        grandTotalMarks,
        grandObtainedMarks,
        `${overallPct}%`,
        finalGrade,
        finalStatus,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.8,
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2.6,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 9 },
      1: { halign: "left", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 21 },
      3: { halign: "center", cellWidth: 21 },
      4: { halign: "center", cellWidth: 21 },
      5: { halign: "center", cellWidth: 16 },
      6: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      7: { halign: "center", cellWidth: 16, fontStyle: "bold" },
      8: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      9: { halign: "center", cellWidth: 16, fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.row.index === subjectRows.length) {
        data.cell.styles.fillColor = [241, 245, 249];
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Term-by-Term Summary Breakdown Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Term-by-Term Progression Summary", 14, y);
  y += 3;

  const termSummaryRows = ["First Term", "Mid Term", "Final Term"].map((tName) => {
    const t = termsObj[tName];
    if (!t) {
      return [tName, "—", "—", "—", "—", "—", "Not Recorded"];
    }
    const tot = (t.subjects || []).reduce((a, s) => a + (Number(s.totalMarks) || 0), 0);
    const obt = (t.subjects || []).reduce((a, s) => a + (Number(s.obtainedMarks) || 0), 0);
    const pct = t.percentage ?? (tot > 0 ? Number(((obt / tot) * 100).toFixed(1)) : 0);
    const g = t.grade || computeGradeFromPct(pct).grade;
    const gpa = t.gpa ?? computeGradeFromPct(pct).gpa;
    const st = (t.resultStatus || (pct >= 40 ? "Pass" : "Fail")).toUpperCase();
    return [tName, tot, obt, `${pct}%`, `${g} (${gpa})`, st, t.remarks || "—"];
  });

  termSummaryRows.push([
    "COMPLETE 3-TERMS CUMULATIVE",
    grandTotalMarks,
    grandObtainedMarks,
    `${overallPct}%`,
    `${finalGrade} (${finalGpa} GPA)`,
    finalStatus,
    `Promotion: ${promotionStatus}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Examination Term", "Total Marks", "Obtained Marks", "Percentage", "Grade / GPA", "Status", "Remarks"]],
    body: termSummaryRows,
    theme: "grid",
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 46 },
      1: { halign: "center", cellWidth: 22 },
      2: { halign: "center", cellWidth: 25, fontStyle: "bold" },
      3: { halign: "center", cellWidth: 22, fontStyle: "bold" },
      4: { halign: "center", cellWidth: 24, fontStyle: "bold" },
      5: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      6: { halign: "left" },
    },
    didParseCell: (data) => {
      if (data.row.index === termSummaryRows.length - 1) {
        data.cell.styles.fillColor = [238, 242, 255];
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawSignatureFooter(doc, doc.lastAutoTable.finalY + 14, [
    "Class Teacher",
    "Controller of Examinations",
    "Principal",
  ]);

  doc.save(
    `Complete_3_Terms_Result_Card_${sanitizeFilename(studentName)}_${sanitizeFilename(academicYear)}.pdf`
  );
}

/**
 * 3. Download Student List PDF with Fees Status
 */
export function downloadStudentListWithFeesPDF(studentsList = [], filters = {}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const classLabel = filters.classFilter && filters.classFilter !== "all" ? `Class ${filters.classFilter}` : "All Classes";
  const sectionLabel =
    filters.sectionFilter && filters.sectionFilter !== "all" ? `Section ${filters.sectionFilter}` : "All Sections";
  const feeLabel =
    filters.feeStatusFilter && filters.feeStatusFilter !== "all"
      ? `Fee Status: ${filters.feeStatusFilter}`
      : "All Fee Statuses";

  let y = drawSchoolHeader(
    doc,
    "Enrolled Students Directory & Fee Status Report",
    `${classLabel}   |   ${sectionLabel}   |   ${feeLabel}   |   Total Records: ${studentsList.length}`
  );

  const totalStudents = studentsList.length;
  const activeCount = studentsList.filter((s) => s.is_active !== false).length;
  const paidCount = studentsList.filter((s) => String(s.feeStatus || "Paid").toLowerCase() === "paid").length;
  const pendingCount = totalStudents - paidCount;
  const totalMonthlyFee = studentsList.reduce(
    (sum, s) => sum + (Number(s.classFees ?? s.class_fees) || 0),
    0
  );

  // Summary Strip
  const boxW = (pageWidth - 44) / 5;
  const stats = [
    { label: "TOTAL STUDENTS", val: totalStudents, color: [30, 41, 59] },
    { label: "ACTIVE STUDENTS", val: activeCount, color: [37, 99, 235] },
    { label: "FEES PAID", val: paidCount, color: [22, 163, 74] },
    { label: "FEES PENDING", val: pendingCount, color: [217, 119, 6] },
    { label: "MONTHLY FEE SUM", val: `Rs. ${totalMonthlyFee.toLocaleString()}`, color: [79, 70, 229] },
  ];

  stats.forEach((st, i) => {
    const bx = 14 + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, y, boxW, 16, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label, bx + boxW / 2, y + 6, { align: "center" });
    doc.setFontSize(10.5);
    doc.setTextColor(...st.color);
    doc.text(String(st.val), bx + boxW / 2, y + 13, { align: "center" });
  });

  y += 22;

  autoTable(doc, {
    startY: y,
    head: [
      [
        "S.No",
        "Roll No",
        "Student Name",
        "Father's Name",
        "Class & Section",
        "Gender",
        "Contact / Mobile",
        "Monthly Fee (Rs.)",
        "Fee Status",
        "Student Status",
      ],
    ],
    body: studentsList.map((s, idx) => {
      const feeStatus = s.feeStatus || "Paid";
      const monthlyFee = Number(s.classFees ?? s.class_fees ?? 0);
      return [
        idx + 1,
        `#${s.rollNo || "N/A"}`,
        s.fullName || s.name || "—",
        s.fatherName || "—",
        `Class ${s.class || "—"}-${s.section || "—"}`,
        s.gender || "—",
        s.mobile || s.contact || "—",
        `Rs. ${monthlyFee.toLocaleString()}`,
        feeStatus.toUpperCase(),
        s.is_active !== false ? "ACTIVE" : "INACTIVE",
      ];
    }),
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8.2,
      textColor: [15, 23, 42],
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 13 },
      1: { halign: "center", cellWidth: 22, fontStyle: "bold" },
      2: { halign: "left", fontStyle: "bold" },
      3: { halign: "left" },
      4: { halign: "center", cellWidth: 28 },
      5: { halign: "center", cellWidth: 18 },
      6: { halign: "center", cellWidth: 32 },
      7: { halign: "right", cellWidth: 30, fontStyle: "bold" },
      8: { halign: "center", cellWidth: 24, fontStyle: "bold" },
      9: { halign: "center", cellWidth: 24 },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 8) {
        const val = String(data.cell.raw || "").toLowerCase();
        if (val === "paid") {
          data.cell.styles.textColor = [22, 163, 74];
          data.cell.styles.fillColor = [240, 253, 244];
        } else {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fillColor = [254, 252, 232];
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  drawSignatureFooter(doc, doc.lastAutoTable.finalY + 14, [
    "Prepared By",
    "Accounts Officer",
    "Principal",
  ]);

  const suffix =
    filters.classFilter && filters.classFilter !== "all" ? `_Class_${filters.classFilter}` : "_All_Classes";
  doc.save(`Student_List_With_Fee_Status${sanitizeFilename(suffix)}.pdf`);
}

/**
 * 6. Download Faculty Directory & Payroll Status PDF
 */
export function downloadTeacherListPDF(teachersList = [], filters = {}) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const filterDescParts = [];
  if (filters.departmentFilter && filters.departmentFilter !== "all") {
    filterDescParts.push(`Department: ${filters.departmentFilter}`);
  }
  if (filters.classFilter && filters.classFilter !== "all") {
    filterDescParts.push(`Class: ${filters.classFilter}`);
  }
  if (filters.typeFilter && filters.typeFilter !== "all") {
    filterDescParts.push(`Type: ${filters.typeFilter}`);
  }
  if (filters.statusFilter && filters.statusFilter !== "all") {
    filterDescParts.push(`Status: ${filters.statusFilter}`);
  }
  const subtitle =
    filterDescParts.length > 0
      ? `Filtered By: ${filterDescParts.join("  |  ")}  |  Total Faculty: ${teachersList.length}`
      : `All Faculty Directory & Payroll Status  |  Total Faculty: ${teachersList.length}`;

  let y = drawSchoolHeader(doc, "Faculty Directory & Monthly Payroll Register", subtitle);

  const totalTeachers = teachersList.length;
  const activeCount = teachersList.filter((t) => String(t.status || "Active").toLowerCase() === "active").length;
  const fullTimeCount = teachersList.filter((t) => String(t.employmentType || t.type || "").toLowerCase() === "full-time").length;
  const paidCount = teachersList.filter((t) => String(t.salaryStatus || "Paid").toLowerCase() === "paid").length;
  const totalMonthlyPayroll = teachersList.reduce((sum, t) => sum + (Number(t.salary) || 0), 0);

  const boxW = (pageWidth - 44) / 5;
  const stats = [
    { label: "TOTAL FACULTY", val: totalTeachers, color: [30, 41, 59] },
    { label: "ACTIVE FACULTY", val: activeCount, color: [37, 99, 235] },
    { label: "FULL-TIME STAFF", val: fullTimeCount, color: [22, 163, 74] },
    { label: "SALARY PAID", val: `${paidCount} / ${totalTeachers}`, color: [217, 119, 6] },
    { label: "MONTHLY PAYROLL", val: `Rs. ${totalMonthlyPayroll.toLocaleString()}`, color: [79, 70, 229] },
  ];

  stats.forEach((st, i) => {
    const bx = 14 + i * (boxW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(bx, y, boxW, 16, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label, bx + boxW / 2, y + 6, { align: "center" });
    doc.setFontSize(10.5);
    doc.setTextColor(...st.color);
    doc.text(String(st.val), bx + boxW / 2, y + 13, { align: "center" });
  });

  y += 22;

  autoTable(doc, {
    startY: y,
    head: [
      [
        "S.No",
        "Emp ID",
        "Teacher Name",
        "Department & Subject",
        "Qualification & Exp",
        "Assigned Classes",
        "Contact",
        "Type",
        "Net Salary (Rs.)",
        "Payroll",
        "Status",
      ],
    ],
    body: teachersList.map((t, idx) => [
      idx + 1,
      t.employeeId || `EMP-${t.id}`,
      t.fullName || t.name || "—",
      `${t.department || "General"} · ${t.subject || "—"}`,
      `${t.qualification || "—"} (${t.experience || 0}y)`,
      (t.classes || []).length > 0 ? t.classes.map((c) => `Class ${c}`).join(", ") : "—",
      t.phone || "—",
      t.employmentType || t.type || "Full-time",
      `Rs. ${Number(t.salary || 0).toLocaleString()}`,
      (t.salaryStatus || "Paid").toUpperCase(),
      (t.status || "Active").toUpperCase(),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 2.8,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 11 },
      1: { halign: "center", cellWidth: 20, fontStyle: "bold" },
      2: { halign: "left", fontStyle: "bold" },
      8: { halign: "right", fontStyle: "bold" },
      9: { halign: "center", fontStyle: "bold" },
      10: { halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  drawSignatureFooter(doc, doc.lastAutoTable.finalY + 14, [
    "HR Coordinator",
    "Accounts Officer",
    "Principal",
  ]);

  doc.save(`Faculty_Directory_Payroll_Register.pdf`);
}

/**
 * 7. Download Teacher Monthly Salary Slip PDF
 */
export function downloadTeacherSalarySlipPDF(salary, teacherOverride = null) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const teacherInfo = teacherOverride || salary?.teacherId || {};
  const teacherName = teacherInfo.fullName || teacherInfo.name || "Teacher";
  const empId = teacherInfo.employeeId || `EMP-${teacherInfo.id || "101"}`;
  const designation = teacherInfo.designation || "Faculty Member";
  const department = teacherInfo.department || "Academics";
  const subject = teacherInfo.subject || "—";
  const cnic = teacherInfo.cnic || "—";
  const bankName = teacherInfo.bankName || "—";
  const bankAcc = teacherInfo.bankAccountNo || "—";

  const slipNo = `SLP-${String(salary?.id || "01").toUpperCase()}-${String(salary?.month || "SAL")
    .slice(0, 3)
    .toUpperCase()}-${salary?.year || "2026"}`;
  const isPaid = String(salary?.status || "Paid").toLowerCase() === "paid";

  let y = drawSchoolHeader(
    doc,
    `Official Faculty Salary Slip — ${salary?.month || ""} ${salary?.year || "2026"}`,
    `Slip No: ${slipNo}   |   Payment Date: ${salary?.paymentDate || new Date().toISOString().split("T")[0]}`
  );

  // Faculty Info Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 36, 2, 2, "FD");

  doc.setFontSize(9);
  const leftX = 18;
  const rightX = pageWidth / 2 + 4;

  const drawField = (label, value, x, rowY) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, x, rowY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(String(value || "—"), x + 34, rowY);
  };

  drawField("Employee Name", teacherName, leftX, y + 8);
  drawField("Employee ID", empId, leftX, y + 16);
  drawField("Designation", designation, leftX, y + 24);
  drawField("CNIC Number", cnic, leftX, y + 32);

  drawField("Department", `${department} (${subject})`, rightX, y + 8);
  drawField("Payment Mode", salary?.paymentMethod || "Bank Transfer", rightX, y + 16);
  drawField("Bank & A/C", `${bankName} ${bankAcc}`, rightX, y + 24);
  drawField("Payroll Status", (salary?.status || "Paid").toUpperCase(), rightX, y + 32);

  y += 42;

  const basic = Number(salary?.basicSalary || salary?.netAmount || 0);
  const allowances = Number(salary?.allowances || 0);
  const bonus = Number(salary?.bonus || 0);
  const deductions = Number(salary?.deductions || 0);
  const gross = basic + allowances + bonus;
  const net = Number(salary?.netAmount || salary?.amount || Math.max(0, gross - deductions));

  autoTable(doc, {
    startY: y,
    head: [["S.No", "Compensation & Deduction Head", "Category", "Amount (Rs.)"]],
    body: [
      ["1", "Basic Monthly Salary", "Earnings (+)", `Rs. ${basic.toLocaleString()}`],
      ["2", "House Rent / Medical / Conveyance Allowances", "Earnings (+)", `Rs. ${allowances.toLocaleString()}`],
      ["3", "Performance Bonus / Extra Duty Allowance", "Earnings (+)", `Rs. ${bonus.toLocaleString()}`],
      ["4", "Gross Earnings", "Subtotal", `Rs. ${gross.toLocaleString()}`],
      ["5", "Tax / Provident Fund / Leave Deductions", "Deductions (-)", `Rs. ${deductions.toLocaleString()}`],
      ["6", "Net Payable / Disbursed Salary", "NET PAYABLE", `Rs. ${net.toLocaleString()}`],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [15, 23, 42],
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 16 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 36, fontStyle: "bold" },
      3: { halign: "right", cellWidth: 40, fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "body" && data.row.index === 5) {
        data.cell.styles.fillColor = isPaid ? [240, 253, 244] : [254, 252, 232];
        data.cell.styles.textColor = isPaid ? [22, 163, 74] : [217, 119, 6];
        data.cell.styles.fontStyle = "bold";
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  if (salary?.remarks || salary?.transactionRef) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Transaction Ref: ${salary?.transactionRef || "N/A"}   |   Remarks: ${salary?.remarks || "—"}`,
      14,
      y
    );
  }

  drawSignatureFooter(doc, y + 18, ["Employee Signature", "Finance Manager", "Principal"]);

  doc.save(`Salary_Slip_${sanitizeFilename(teacherName)}_${sanitizeFilename(salary?.month || "Month")}.pdf`);
}

/**
 * 8. Download Teacher Full Salary Statement PDF
 */
export function downloadTeacherSalaryStatementPDF(teacher, salaryRecords = []) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const teacherName = teacher?.fullName || teacher?.name || "Teacher";
  let y = drawSchoolHeader(
    doc,
    "Faculty Annual Salary & Payroll Statement",
    `Employee: ${teacherName} (${teacher?.employeeId || "EMP"})   |   Department: ${teacher?.department || "Academics"}`
  );

  const totalPaid = salaryRecords
    .filter((s) => String(s.status || "").toLowerCase() === "paid")
    .reduce((acc, s) => acc + Number(s.netAmount || s.amount || 0), 0);
  const totalPending = salaryRecords
    .filter((s) => String(s.status || "").toLowerCase() === "pending")
    .reduce((acc, s) => acc + Number(s.netAmount || s.amount || 0), 0);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Monthly Package: Rs. ${Number(teacher?.salary || 0).toLocaleString()}`, 20, y + 12);
  doc.setTextColor(22, 163, 74);
  doc.text(`Total Disbursed: Rs. ${totalPaid.toLocaleString()}`, pageWidth / 2 - 20, y + 12);
  doc.setTextColor(217, 119, 6);
  doc.text(`Pending Dues: Rs. ${totalPending.toLocaleString()}`, pageWidth - 75, y + 12);

  y += 26;

  autoTable(doc, {
    startY: y,
    head: [["S.No", "Month & Year", "Basic", "Allowances", "Bonus", "Deductions", "Net Salary", "Payment Date", "Status"]],
    body: salaryRecords.map((s, idx) => [
      idx + 1,
      `${s.month} ${s.year || "2026"}`,
      `Rs. ${Number(s.basicSalary || 0).toLocaleString()}`,
      `Rs. ${Number(s.allowances || 0).toLocaleString()}`,
      `Rs. ${Number(s.bonus || 0).toLocaleString()}`,
      `Rs. ${Number(s.deductions || 0).toLocaleString()}`,
      `Rs. ${Number(s.netAmount || s.amount || 0).toLocaleString()}`,
      s.paymentDate || "—",
      (s.status || "Paid").toUpperCase(),
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [15, 23, 42],
      cellPadding: 3.5,
    },
    margin: { left: 14, right: 14 },
  });

  drawSignatureFooter(doc, doc.lastAutoTable.finalY + 16, [
    "Faculty Member",
    "Accounts Officer",
    "Principal",
  ]);

  doc.save(`Salary_Statement_${sanitizeFilename(teacherName)}.pdf`);
}

/**
 * 9. Download Teacher Profile & Timetable Dossier PDF
 */
export function downloadTeacherProfilePDF(teacher) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const teacherName = teacher?.fullName || teacher?.name || "Teacher";

  let y = drawSchoolHeader(
    doc,
    "Official Faculty Service Profile & Dossier",
    `Employee ID: ${teacher?.employeeId || "EMP"}   |   Status: ${teacher?.status || "Active"}   |   Joined: ${teacher?.joiningDate || "—"}`
  );

  autoTable(doc, {
    startY: y,
    head: [["Field", "Details", "Field", "Details"]],
    body: [
      ["Full Name", teacherName, "Father / Spouse", teacher?.fatherOrSpouseName || "—"],
      ["Designation", teacher?.designation || "—", "Department", teacher?.department || "—"],
      ["Primary Subject", teacher?.subject || "—", "Other Subjects", (teacher?.secondarySubjects || []).join(", ") || "—"],
      ["Qualification", teacher?.qualification || "—", "Specialization", teacher?.specialization || "—"],
      ["University", teacher?.university || "—", "Experience", `${teacher?.experience || 0} Years`],
      ["CNIC No", teacher?.cnic || "—", "Date of Birth", teacher?.dob || "—"],
      ["Phone", teacher?.phone || "—", "Email", teacher?.email || "—"],
      ["Assigned Classes", (teacher?.classes || []).map((c) => `Class ${c}`).join(", ") || "—", "Class Teacher Of", teacher?.classTeacherOf || "—"],
      ["Employment Type", teacher?.employmentType || teacher?.type || "Full-time", "Net Monthly Salary", `Rs. ${Number(teacher?.salary || 0).toLocaleString()}`],
      ["Bank Name", teacher?.bankName || "—", "Account / IBAN", teacher?.bankAccountNo || teacher?.iban || "—"],
      ["Address", teacher?.address || "—", "City", teacher?.city || "Lahore"],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 3.2,
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 35 },
      1: { cellWidth: 56 },
      2: { fontStyle: "bold", fillColor: [248, 250, 252], cellWidth: 35 },
      3: { cellWidth: 56 },
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  if (Array.isArray(teacher?.schedule) && teacher.schedule.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("ASSIGNED WEEKLY TEACHING SCHEDULE", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["Day", "Period", "Time", "Class & Section", "Subject", "Room"]],
      body: teacher.schedule.map((slot) => [
        slot.day || "—",
        slot.period || "—",
        `${slot.startTime || ""} - ${slot.endTime || ""}`,
        `Class ${slot.className || "—"}-${slot.section || "A"}`,
        slot.subject || teacher?.subject || "—",
        slot.room || "—",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  drawSignatureFooter(doc, y + 10, ["Faculty Signature", "HR Department", "Principal"]);
  doc.save(`Teacher_Profile_${sanitizeFilename(teacherName)}.pdf`);
}


