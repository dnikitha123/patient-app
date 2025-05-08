"use client";

import { usePGlite } from "@electric-sql/pglite-react";
import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/outline";
import ConfirmModal from "./ConfirmModal";

const PatientList = ({ onEdit }) => {
  const db = usePGlite();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = async () => {
    if (!db) return;

    try {
      const result = await db.query("SELECT * FROM patients ORDER BY id DESC");
      setPatients(result.rows || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (db) {
      fetchPatients();

      const intervalId = setInterval(fetchPatients, 2000);
      return () => clearInterval(intervalId);
    }
  }, [db]);

  const handleDeleteClick = (patient) => {
    setPatientToDelete(patient);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await db.query("DELETE FROM patients WHERE id = $1", [
        patientToDelete.id,
      ]);
      setPatients((prev) => prev.filter((p) => p.id !== patientToDelete.id));
    } catch (err) {
      console.error("Deletion error:", err);
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setShowConfirm(false);
      setPatientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setPatientToDelete(null);
  };

  if (loading && patients.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Registered Patients</h2>
        <div className="text-center p-4">
          <div className="animate-pulse">Loading patients...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Registered Patients</h2>

      {patients.length === 0 ? (
        <p className="text-center text-gray-500">No patients found</p>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="p-4 bg-white-500 rounded-lg hover:bg-gray-100 hover:p-5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg capitalize">
                    {patient.name}
                  </h3>
                  <p className="text-sm">
                    {patient.gender} | {patient.age} years |{" "}
                    {patient.contact || "No contact"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(patient)}
                    className="flex items-center text-blue-600 hover:text-blue-800 hover:scale-105 transform transition-all duration-300"
                  >
                    <PencilIcon className="w-5 h-5 mr-2" />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(patient)}
                    className="flex items-center text-red-600 hover:text-red-800 hover:scale-105 transform transition-all duration-300"
                  >
                    <TrashIcon className="w-5 h-5 mr-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default PatientList;
