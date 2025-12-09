"use client";
import { useState } from "react";
import axios from "axios";

export default function TestUploadPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !image) {
      alert("All fields are required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("image", image); // MUST match multer field name "image"

      const res = await axios.post(
        "http://localhost:7000/api/cms/hero/add", // your backend
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResponse(res.data);
    } catch (err) {
      console.error(err);
      setResponse(err.response?.data || { message: "Upload failed" });
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-4">
        Test Before-Footer Upload API
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="border p-2 rounded"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded"
        >
          Upload
        </button>
      </form>

      {response && (
        <pre className="mt-6 p-3 bg-gray-100 rounded text-sm">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
