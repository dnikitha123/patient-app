"use client";

import { usePGlite } from "@electric-sql/pglite-react";
import { useEffect, useState } from "react";

const PatientForm = ({ selectedPatient, clearSelection }) => {
  const db = usePGlite();
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    contact: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedPatient) {
      setForm({
        name: selectedPatient.name || "",
        age: selectedPatient.age ? selectedPatient.age.toString() : "",
        gender: selectedPatient.gender || "",
        contact: selectedPatient.contact || "",
      });
    } else {
      setForm({
        name: "",
        age: "",
        gender: "",
        contact: "",
      });
    }
  }, [selectedPatient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const age = Number.parseInt(form.age);
      if (isNaN(age) || age < 0 || age > 120) {
        throw new Error("Age must be between 0 and 120");
      }

      if (selectedPatient) {
        // Update existing patient
        await db.query(
          `UPDATE patients SET 
           name = $1, 
           age = $2, 
           gender = $3, 
           contact = $4
           WHERE id = $5`,
          [form.name, age, form.gender, form.contact, selectedPatient.id]
        );
      } else {
        // Insert new patient
        await db.query(
          `INSERT INTO patients (name, age, gender, contact)
           VALUES ($1, $2, $3, $4)`,
          [form.name, age, form.gender, form.contact]
        );
      }

      // Reset form and selection
      setForm({ name: "", age: "", gender: "", contact: "" });
      clearSelection();
    } catch (err) {
      console.error("Form submission error:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="transition-all duration-500 ease-in-out bg-white p-4 rounded-lg shadow hover:shadow-xl"
    >
      <h2 className="text-2xl font-bold">
        {selectedPatient ? "Edit Patient" : "New Patient Registration"}
      </h2>

      <div className="space-y-3 my-2">
        <input
          className="w-full p-2 border rounded"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 border rounded"
          name="age"
          type="number"
          placeholder="Age"
          min="0"
          max="120"
          value={form.age}
          onChange={handleChange}
          required
        />
        <select
          className="w-full p-2 border rounded"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          className="w-full p-2 border rounded"
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
          type="number"
          required
          pattern="^[0-9]{8,}$"
          title="Contact number must be at least 8 digits"
        />
      </div>

      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-white rounded bg-blue-500 hover:bg-blue-600 hover:scale-105 transform transition-all duration-300"
        >
          {isSubmitting ? "Saving..." : selectedPatient ? "Update" : "Register"}
        </button>

        {selectedPatient && (
          <button
            type="button"
            onClick={clearSelection}
            className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PatientForm;
