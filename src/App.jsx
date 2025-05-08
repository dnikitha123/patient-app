"use client";

import { useState } from "react";
import { DatabaseProvider } from "./context/DBProvider";
import PatientForm from "./components/PatientForm";
import PatientList from "./components/PatientList";
import SQLQueryBox from "./components/SQLQueryBox";
import "./App.css";

const App = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  return (
    <DatabaseProvider>
      <div className="bg-gradient-to-r from-blue-100 via-green-100 to-yellow-100 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-[#455356]">
            🏥 Patient App
          </h1>
          <PatientForm
            selectedPatient={selectedPatient}
            clearSelection={() => setSelectedPatient(null)}
          />
          <PatientList onEdit={setSelectedPatient} />
          <SQLQueryBox />
        </div>
      </div>
    </DatabaseProvider>
  );
};

export default App;
