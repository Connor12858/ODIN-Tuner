'use client';
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [modified, setModified] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("https://odin-tuner-backend.onrender.com/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setContent(data.content);
    setModified(data.content);
  };

  const downloadFile = () => {
    const blob = new Blob([modified], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modified_file.txt";
    link.click();
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ODIN Tuner</h1>

      <input type="file" onChange={handleUpload} className="mb-4" />

      <textarea
        className="w-full h-64 border p-2 rounded"
        value={modified}
        onChange={(e) => setModified(e.target.value)}
      />

      <button
        onClick={downloadFile}
        className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Download Modified File
      </button>
    </main>
  );
}
