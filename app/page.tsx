'use client';
import { useState } from "react";

export default function Home() {
  const [lines, setLines] = useState<string[]>([]);
  const [editable, setEditable] = useState<string[]>([]);

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

    const lineArr = data.content.split("\n");

    const editCopy = [];
    const permCopy = [];

    for (let i = 0; i < lineArr.length; i++) {
      editCopy.push(lineArr[i].split(',')[0]); // editable copy
      permCopy.push(lineArr[i].split(',')[1]); // permanent copy
    }

    setLines(permCopy);
    setEditable(editCopy); // editable copy
  };

  const handleEdit = (index: number, value: string) => {
    const updated = [...editable];
    updated[index] = value;
    setEditable(updated);
  };

  const downloadFile = () => {
    const blob = new Blob([editable.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "modified_file.txt";
    link.click();
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">ODIN Tuner</h1>

      <input type="file" onChange={handleUpload} className="mb-4" />

      {lines.length > 0 && (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 w-1/2">Original</th>
              <th className="p-2 w-1/2">Editable</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="border-t">
                <td className="p-2 whitespace-pre-wrap">{line}</td>
                <td className="p-2">
                  <input
                    type="text"
                    value={editable[i]}
                    onChange={(e) => handleEdit(i, e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editable.length > 0 && (
        <button
          onClick={downloadFile}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Download Modified File
        </button>
      )}
    </main>
  );
}
