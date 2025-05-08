"use client"

import { useState } from "react"
import { usePGlite } from "@electric-sql/pglite-react"

const SQLQueryBox = () => {
  const db = usePGlite()
  const [query, setQuery] = useState("SELECT * FROM patients;")
  const [result, setResult] = useState([])
  const [error, setError] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const executeQuery = async () => {
    if (!db || isExecuting) return

    setIsExecuting(true)
    try {
      setError(null)
      const response = await db.query(query)
      setResult(response.rows || [])
    } catch (err) {
      console.error("SQL query error:", err)
      setError(err.message)
      setResult([])
    } finally {
      setIsExecuting(false)
    }
  }

  const sampleQueries = [
    { name: "All Patients", query: "SELECT * FROM patients;" },
    { name: "Count by Gender", query: "SELECT gender, COUNT(*) as count FROM patients GROUP BY gender;" },
    { name: "Oldest Patients", query: "SELECT * FROM patients ORDER BY age DESC LIMIT 5;" },
  ]

  

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-3">SQL Query Interface</h2>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 mb-2">
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              onClick={() => setQuery(sample.query)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
            >
              {sample.name}
            </button>
          ))}
        </div>

        <input
          className="w-full p-2 border rounded font-mono text-sm"
          rows={3}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={executeQuery}
          disabled={isExecuting}
          className={`px-4 py-2 text-white rounded ${isExecuting ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
        >
          {isExecuting ? "Executing..." : "Execute Query"}
        </button>

        {error && <div className="p-3 text-red-600 bg-red-50 rounded">Error: {error}</div>}

        {result.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  {Object.keys(result[0]).map((key) => (
                    <th key={key} className="p-2 border text-left capitalize">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.map((row, i) => (
                  <tr key={i} className="even:bg-gray-100">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="p-2 border">
                        {value === null ? "NULL" : String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && !isExecuting && <div className="p-3 text-gray-500">No results to display</div>
        )}
      </div>
    </div>
  )
}

export default SQLQueryBox
