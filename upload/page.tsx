"use client";

import React, { useState, FormEvent } from "react";
import { createClient } from "@/lib/supabaseClient"; // use createClient, not supabase

// Create a Supabase client instance for this component
const supabase = createClient();

// Change if your bucket name is different
const BUCKET_NAME = "token-images";

export default function UploadImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setStatus("Please choose a file first.");
      return;
    }

    try {
      setStatus("Uploading...");

      const ext = file.name.split(".").pop() || "png";
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error(uploadError);
        setStatus("Upload failed: " + uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
      setStatus("Upload successful! Copy the URL below.");
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error while uploading.");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #1f2937",
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            marginBottom: 12,
            color: "#e5e7eb",
          }}
        >
          Upload Token Image
        </h1>
        <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 16 }}>
          Choose an image file, upload it to Supabase, and get a public URL to
          paste into your token form.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="file"
              style={{
                display: "block",
                marginBottom: 6,
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              Image file
            </label>
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ color: "#e5e7eb", fontSize: 12 }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 999,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, #22c55e, #22d3ee 40%, #6366f1)",
              color: "white",
            }}
          >
            Upload
          </button>
        </form>

        {status && (
          <p
            style={{
              marginTop: 14,
              color: status.startsWith("Upload successful")
                ? "#4ade80"
                : "#f97373",
              fontSize: 13,
            }}
          >
            {status}
          </p>
        )}

        {imageUrl && (
          <div style={{ marginTop: 16 }}>
            <label
              htmlFor="imageUrl"
              style={{
                display: "block",
                marginBottom: 6,
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              Public Image URL
            </label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              readOnly
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #374151",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: 12,
              }}
              onFocus={(e) => e.target.select()}
            />

            <div
              style={{
                marginTop: 12,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={imageUrl}
                alt="Uploaded preview"
                style={{
                  maxWidth: 160,
                  maxHeight: 160,
                  borderRadius: 16,
                  objectFit: "cover",
                  border: "1px solid #374151",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
