'use client';
import { useState } from "react";

export default function Home() {
  const [lines, setLines] = useState<string[]>([]);
  const [editable, setEditable] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("track_day_1");
  const [uploadedFilePath, setUploadedFilePath] = useState<string>("");

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

    // Save path to reuse in download
    setUploadedFilePath(data.originalFilePath || ""); // You need to make sure backend sends this

    const lineArr = data.content.split("\n");

    const editCopy: string[] = [];
    const permCopy: string[] = [];

    for (let i = 0; i < lineArr.length; i++) {
      const [editableVal, originalVal] = lineArr[i].split(',');
      if (!editableVal || !originalVal) continue; // skip broken lines
      editCopy.push(editableVal.trim());
      permCopy.push(originalVal.trim());
    }

    setLines(permCopy);
    setEditable(editCopy);
  };

  const handleEdit = (index: number, value: string) => {
    const updated = [...editable];
    updated[index] = value;
    setEditable(updated);
  };

  const handleDownload = async () => {
    if (!uploadedFilePath) {
      alert("Original file path missing. Re-upload the file.");
      return;
    }

    // Build key:value dictionary
    const valueMap: { [key: string]: string } = {};
    for (let i = 0; i < lines.length; i++) {
      valueMap[lines[i]] = editable[i];
    }

    const res = await fetch("https://odin-tuner-backend.onrender.com/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        originalFilePath: uploadedFilePath,
        newData: valueMap
      })
    });

    const data = await res.json();

    const blob = new Blob([data.content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName.trim() || "new_data"}.odni`;
    link.click();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">ODIN Tuner</h1>

      {/* File Upload */}
      <div className="mb-6">
        <label
          htmlFor="fileUpload"
          className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-gray-400 p-6 text-center hover:border-blue-500 transition"
        >
          <p className="text-lg font-medium text-gray-700">Click or drag a file here to upload</p>
          <p className="text-sm text-gray-500 mt-1">Only ODNI files are supported</p>
          <input
            id="fileUpload"
            type="file"
            accept=".odni"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* File Name Input */}
      {editable.length > 0 && (
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">
            Output File Name:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-full max-w-md border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter filename e.g. track_day_1"
          />
        </div>
      )}

      {/* Table */}
      {lines.length > 0 && (
        <table className="w-full text-left border-collapse shadow-md rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="p-3 w-1/2">Name</th>
              <th className="p-3 w-1/2">Value</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-t">
                <td className="p-3 whitespace-pre-wrap text-sm">{line}</td>
                <td className="p-3">
                  <input
                    type="text"
                    value={editable[i]}
                    onChange={(e) => handleEdit(i, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Download Button */}
      {editable.length > 0 && (
        <button
          onClick={handleDownload}
          className="mt-6 bg-blue-600 text-white py-2 px-5 rounded hover:bg-blue-700 transition"
        >
          Download Modified File
        </button>
      )}
    </main>
  );
}
