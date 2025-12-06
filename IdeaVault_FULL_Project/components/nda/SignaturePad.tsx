"use client";

import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

export default function SignaturePad({ label, sigRef }: any) {
  return (
    <div className="mb-6">
      <label className="block mb-1 text-sm text-gray-300">{label}</label>

      <div className="border border-zinc-700 rounded bg-zinc-800">
        <SignatureCanvas
          ref={sigRef}
          penColor="yellow"
          canvasProps={{
            width: 400,
            height: 150,
            className: "rounded bg-zinc-900",
          }}
        />
      </div>

      <button
        className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
        onClick={() => sigRef.current?.clear()}
      >
        Clear Signature
      </button>
    </div>
  );
}
