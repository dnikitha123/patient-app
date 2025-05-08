import { PGliteWorker } from "@electric-sql/pglite/worker";
import { PGliteProvider } from "@electric-sql/pglite-react";
import { useEffect, useState } from "react";

let dbInstance = null;

export const DatabaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        if (dbInstance) {
          setDb(dbInstance);
          setLoading(false);
          return;
        }

        const worker = new Worker(new URL('./pglite-worker.js', import.meta.url), {
          type: 'module',
        });

        const pg = new PGliteWorker(worker, {
          dataDir: "idb://patient-db", 
          meta: { dbName: 'patient-db' } 
        });

        await pg.exec(`
          CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            contact TEXT
          );
        `);

        dbInstance = pg;
        setDb(pg);
      } catch (err) {
        console.error("Database initialization failed:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeDB();

    return () => {
      if (dbInstance) {
        dbInstance.close();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <h2 className="text-xl font-bold">Database Error</h2>
        <p>{error}</p>
        <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse">⚡ Initializing Database...</div>
      </div>
    );
  }

  return <PGliteProvider db={db}>{children}</PGliteProvider>;
};
