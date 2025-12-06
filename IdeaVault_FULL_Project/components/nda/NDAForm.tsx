"use client";

export default function NDAForm({ formData, handleChange, onGenerate }: any) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h2 className="text-lg font-bold mb-4">Fill Out NDA</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          name="recipientName"
          placeholder="Recipient Name"
          value={formData.recipientName}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          type="text"
          name="ownerName"
          placeholder="Owner Name (You)"
          value={formData.ownerName}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <textarea
          name="ideaDescription"
          placeholder="Describe your idea..."
          value={formData.ideaDescription}
          onChange={handleChange}
          className="p-2 border rounded h-24"
        />

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <button
          onClick={onGenerate}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Generate NDA
        </button>
      </div>
    </div>
  );
}
