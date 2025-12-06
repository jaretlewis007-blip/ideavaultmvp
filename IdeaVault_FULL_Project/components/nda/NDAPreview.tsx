"use client";

export default function NDAPreview({ ndaText }: any) {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow h-full overflow-auto">
      <h2 className="text-lg font-bold mb-4">NDA Preview</h2>

      {!ndaText ? (
        <p className="text-gray-500">Your NDA will appear here once generated.</p>
      ) : (
        <pre className="whitespace-pre-wrap">{ndaText}</pre>
      )}
    </div>
  );
}
