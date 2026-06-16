# Result API Frontend Integration Guide

This guide details how to integrate the backend **Result/Academic Record API** with the frontend using **Redux Toolkit Query (RTK Query)**.

---

## 1. API Overview

All result endpoints require authentication. The request header must include:
```http
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints List

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/api/results` | Get results list with query filters |
| **GET** | `/api/results/:id` | Get details of a specific academic record |
| **GET** | `/api/results/student/:studentId` | Get the academic history of a student |
| **POST** | `/api/results` | Create a new academic record with term results |
| **PUT** | `/api/results/:id` | Update general record details or term results |
| **DELETE** | `/api/results/:id` | Delete an entire academic record |
| **DELETE** | `/api/results/:id/terms/:termName` | Delete a single term result (e.g., "First Term") |

---

## 2. Data Structures & Schemas

### A. Creation Payload (`POST /api/results`)
* Valid term names: `"First Term"`, `"Mid Term"`, `"Final Term"`.
* Each term has an array of `subjects` and an optional `remarks` field.
* Marks, positions, percentages, and GPAs are computed automatically by the backend based on subject marks, but the backend accepts them in this format:

```json
{
  "studentId": "uuid-of-student",
  "academicYear": "2023-2024",
  "class": "10",
  "section": "A",
  "rollNo": "12",
  "promotionStatus": "Promoted", 
  "terms": {
    "First Term": {
      "remarks": "Excellent term performance",
      "subjects": [
        {
          "subjectName": "Mathematics",
          "totalMarks": 100,
          "obtainedMarks": 92,
          "remarks": "A+"
        },
        {
          "subjectName": "English",
          "totalMarks": 100,
          "obtainedMarks": 85,
          "remarks": "A"
        }
      ]
    }
  }
}
```

### B. Update Payload (`PUT /api/results/:id`)
* Identifiers like `studentId`, `academicYear`, and `class` **cannot** be updated.
* You can update `rollNo`, `promotionStatus`, `section`, and the `terms` object.

```json
{
  "rollNo": "15",
  "promotionStatus": "Promoted",
  "section": "B",
  "terms": {
    "First Term": {
      "remarks": "Updated remarks",
      "subjects": [
        {
          "subjectName": "Mathematics",
          "totalMarks": 100,
          "obtainedMarks": 95
        }
      ]
    }
  }
}
```

### C. Standard Response Payload
A detailed academic record contains the student details along with term summaries and subject breakdowns:

```json
{
  "success": true,
  "message": "Result details retrieved successfully.",
  "data": {
    "id": 1,
    "studentId": {
      "id": "student-uuid",
      "name": "Jane Doe",
      "admissionNo": "student-uuid",
      "class": "10",
      "section": "A",
      "rollNumber": "12"
    },
    "academicYear": "2023-2024",
    "class": "10",
    "section": "A",
    "rollNo": "12",
    "promotionStatus": "Promoted",
    "terms": {
      "First Term": {
        "id": 1,
        "totalMarks": 200,
        "obtainedMarks": 177,
        "percentage": 88.5,
        "grade": "A+",
        "gpa": 4,
        "position": 1,
        "remarks": "Excellent term performance",
        "resultStatus": "Pass",
        "subjects": [
          {
            "id": 1,
            "subjectName": "Mathematics",
            "totalMarks": 100,
            "obtainedMarks": 92,
            "grade": "A+",
            "gpa": 4,
            "status": "Pass",
            "remarks": "A+"
          },
          {
            "id": 2,
            "subjectName": "English",
            "totalMarks": 100,
            "obtainedMarks": 85,
            "grade": "A",
            "gpa": 4,
            "status": "Pass",
            "remarks": "A"
          }
        ]
      }
    },
    "createdAt": "2026-06-16T05:00:00.000Z",
    "updatedAt": "2026-06-16T05:10:00.000Z"
  }
}
```

---

## 3. Frontend RTK Query Implementation

Follow these steps to wire up the API in the React frontend codebase.

### Step 1: Register tags in the base API
Open [src/services/index.js](file:///c:/Users/l/Documents/MARN/school-frontend/src/services/index.js) and add `"Result"` and `"StudentResultHistory"` to the `tagTypes` array:

```javascript
// src/services/index.js
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_APP_API_URL || "http://localhost:5000/api/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Student", "StudentFees", "Fee", "StudentFeesList", "Result", "StudentResultHistory"],
  endpoints: () => ({}),
});
```

### Step 2: Create the RTK Query endpoints definition file
Create a new file [src/services/private/resultService.js](file:///c:/Users/l/Documents/MARN/school-frontend/src/services/private/resultService.js) and copy the following service code:

```javascript
import { baseApi } from "../index";

export const resultApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/results?academicYear=...&class=...&section=...&studentId=...&term=...
    getResults: builder.query({
      query: (params) => ({
        url: "results",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Result", id })),
              { type: "Result", id: "LIST" },
            ]
          : [{ type: "Result", id: "LIST" }],
    }),

    // GET /api/results/:id
    getResultDetails: builder.query({
      query: (id) => ({
        url: `results/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Result", id }],
    }),

    // GET /api/results/student/:studentId
    getStudentHistory: builder.query({
      query: (studentId) => ({
        url: `results/student/${studentId}`,
        method: "GET",
      }),
      providesTags: (result, error, studentId) => [
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // POST /api/results
    createResult: builder.mutation({
      query: (body) => ({
        url: "results",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Result", id: "LIST" },
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // PUT /api/results/:id
    updateResult: builder.mutation({
      query: ({ id, body }) => ({
        url: `results/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, studentId }) => [
        { type: "Result", id },
        { type: "Result", id: "LIST" },
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // DELETE /api/results/:id
    deleteResult: builder.mutation({
      query: ({ id, studentId }) => ({
        url: `results/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { studentId }) => [
        { type: "Result", id: "LIST" },
        { type: "StudentResultHistory", id: studentId },
      ],
    }),

    // DELETE /api/results/:id/terms/:termName
    deleteTermResult: builder.mutation({
      query: ({ id, termName }) => ({
        url: `results/${id}/terms/${termName}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Result", id },
        { type: "Result", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetResultsQuery,
  useGetResultDetailsQuery,
  useGetStudentHistoryQuery,
  useCreateResultMutation,
  useUpdateResultMutation,
  useDeleteResultMutation,
  useDeleteTermResultMutation,
} = resultApi;
```

---

## 4. Frontend Component Integration Examples

### Example A: Fetching and Rendering Student History in Student Details Page
Insert this logic inside your student details component (e.g., student profile, progress card):

```jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetStudentHistoryQuery } from '../../../services/private/resultService';
import { Spin, Alert, Card, Table } from 'antd';

export const StudentProgressReport = () => {
  const { id: studentId } = useParams();
  
  const { data: historyResponse, isLoading, error } = useGetStudentHistoryQuery(studentId);
  const historyData = historyResponse?.data || [];

  if (isLoading) return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;
  if (error) return <Alert message="Error fetching academic results" type="error" showIcon />;

  return (
    <div style={{ padding: '20px 0' }}>
      <h2>Academic Records & Term Results</h2>
      {historyData.map((record) => (
        <Card 
          key={record.id} 
          title={`Class ${record.class} - ${record.academicYear}`} 
          extra={`Promotion: ${record.promotionStatus || 'Pending'}`}
          style={{ marginBottom: 20 }}
        >
          {Object.entries(record.terms).map(([termName, termDetails]) => (
            <div key={termName} style={{ marginBottom: 20 }}>
              <h3>{termName} Details</h3>
              <p>
                <strong>Term Grade:</strong> {termDetails.grade} ({termDetails.percentage}%) | 
                <strong> GPA:</strong> {termDetails.gpa} | 
                <strong> Class Position:</strong> {termDetails.position || 'N/A'} | 
                <strong> Status:</strong> {termDetails.resultStatus}
              </p>
              
              <Table
                dataSource={termDetails.subjects}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Subject', dataIndex: 'subjectName', key: 'subjectName' },
                  { title: 'Total Marks', dataIndex: 'totalMarks', key: 'totalMarks' },
                  { title: 'Obtained Marks', dataIndex: 'obtainedMarks', key: 'obtainedMarks' },
                  { title: 'Grade', dataIndex: 'grade', key: 'grade' },
                  { title: 'Status', dataIndex: 'status', key: 'status' },
                  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
                ]}
              />
            </div>
          ))}
        </Card>
      ))}
    </div>
  );
};
```

### Example B: Add or Update Result Form Modal
Here's how to structure the state to handle dynamic subjects input when creating or editing results:

```jsx
import React, { useState } from 'react';
import { Form, Input, Button, Select, Space, InputNumber, message } from 'antd';
import { useCreateResultMutation } from '../../../services/private/resultService';

export const AddResultModal = ({ studentId, currentClass, currentSection, onCancel }) => {
  const [createResult, { isLoading }] = useCreateResultMutation();
  const [form] = Form.useForm();
  
  const handleFinish = async (values) => {
    // Structure the raw form data into the backend-expected format
    const payload = {
      studentId,
      academicYear: values.academicYear,
      class: currentClass,
      section: currentSection,
      terms: {
        [values.termName]: {
          remarks: values.remarks,
          subjects: values.subjects.map(subj => ({
            subjectName: subj.subjectName,
            totalMarks: Number(subj.totalMarks),
            obtainedMarks: Number(subj.obtainedMarks),
            remarks: subj.remarks || ''
          }))
        }
      }
    };

    try {
      await createResult(payload).unwrap();
      message.success('Result successfully saved!');
      form.resetFields();
      if (onCancel) onCancel();
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || 'Failed to save result record.');
    }
  };

  return (
    <Form 
      form={form} 
      layout="vertical" 
      onFinish={handleFinish} 
      initialValues={{ academicYear: '2026-2027', subjects: [{}] }}
    >
      <Form.Item name="academicYear" label="Academic Year" rules={[{ required: true }]}>
        <Input placeholder="e.g. 2026-2027" />
      </Form.Item>
      
      <Form.Item name="termName" label="Term" rules={[{ required: true }]}>
        <Select options={[
          { label: 'First Term', value: 'First Term' },
          { label: 'Mid Term', value: 'Mid Term' },
          { label: 'Final Term', value: 'Final Term' }
        ]} />
      </Form.Item>

      <Form.Item name="remarks" label="Overall Term Remarks">
        <Input.TextArea rows={2} />
      </Form.Item>

      <h3>Subjects Marks</h3>
      <Form.List name="subjects">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Form.Item
                  {...restField}
                  name={[name, 'subjectName']}
                  rules={[{ required: true, message: 'Subject name is required' }]}
                >
                  <Input placeholder="Subject Name" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'totalMarks']}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber min={1} placeholder="Total Marks" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'obtainedMarks']}
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber min={0} placeholder="Obtained Marks" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'remarks']}
                >
                  <Input placeholder="Remarks" />
                </Form.Item>
                {fields.length > 1 && (
                  <Button type="link" onClick={() => remove(name)} danger>Remove</Button>
                )}
              </Space>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} block>
                Add Subject Mark
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isLoading}>Save Results</Button>
      </div>
    </Form>
  );
};
```

---

## 5. Verification Checklist

Before wrapping up, verify that:
1. [ ] JWT Token headers are sent correctly inside `baseQuery` (handles standard token verification).
2. [ ] Validation errors from backend are captured and mapped correctly to corresponding UI input warnings.
3. [ ] Automatic UI cache updates occur successfully (e.g., when adding a term result, does the student history table automatically re-render without reloading the page?).
