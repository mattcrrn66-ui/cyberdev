"use client";

import React, { useState, useEffect, FormEvent } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();
const BUCKET_NAME = "token-images";

type TokenRow = {
  id: string;
  name: string | null;
  symbol: string | null;
  description: string | null;
  image_url: string | null;
  telegram_url: string | null;
  x_url: string | null;
  website_url: string | null;
  created_at: string | null;
};

export default function TokenHubPage() {
  // ---------- AUTH STATE ----------
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // ---------- TOKEN FORM STATE ----------
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState("");

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // ---------- LOAD AUTH STATE ----------
  useEffect(() => {
    const loadUser = async () => {
      setAuthError(null);
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error(error);
        setAuthError(error.message);
      } else {
        setUser(data.user ?? null);
      }
      setAuthChecked(true);
    };

    loadUser();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // ---------- FETCH LATEST TOKENS ----------
  async function fetchTokens() {
    try {
      setLoadingTokens(true);
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error(error);
        setStatus("Error loading tokens: " + error.message);
        setTokens([]);
        return;
      }

      setTokens((data as TokenRow[]) || []);
    } finally {
      setLoadingTokens(false);
    }
  }

  useEffect(() => {
    fetchTokens();
  }, []);

  // ---------- MAGIC LINK LOGIN ----------
  async function handleSendMagicLink(e: FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setLinkSent(false);

    const trimmed = email.trim();
    if (!trimmed) {
      setAuthError("Please enter an email address.");
      return;
    }

    setSendingLink(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    setSendingLink(false);

    if (error) {
      console.error(error);
      setAuthError(error.message || "Failed to send login link.");
      return;
    }

    setLinkSent(true);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  // ---------- IMAGE UPLOAD ----------
  async function uploadImage(file: File): Promise<string | null> {
    try {
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
        return null;
      }

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        setStatus("Upload failed: no public URL returned.");
        return null;
      }

      return data.publicUrl;
    } catch (err: any) {
      console.error(err);
      setStatus("Unexpected error while uploading image.");
      return null;
    }
  }

  // ---------- CREATE TOKEN ----------
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("");

    // Extra safety: do not allow if not logged in
    if (!user) {
      setStatus("You must be logged in to create a token.");
      return;
    }

    setLoading(true);

    try {
      if (!name.trim() || !symbol.trim()) {
        setStatus("Name and Symbol are required.");
        return;
      }

      let finalImageUrl = manualImageUrl.trim();

      if (imageFile) {
        setStatus("Uploading image...");
        const uploadedUrl = await uploadImage(imageFile);
        if (!uploadedUrl) {
          return;
        }
        finalImageUrl = uploadedUrl;
      }

      setStatus("Saving token profile...");

      const { error: insertError } = await supabase.from("tokens").insert({
        name,
        symbol,
        description,
        telegram_url: telegramUrl || null,
        x_url: xUrl || null,
        website_url: websiteUrl || null,
        image_url: finalImageUrl || null,
      });

      if (insertError) {
        console.error(insertError);
        setStatus("Error creating token: " + insertError.message);
        return;
      }

      setStatus("✅ Token profile created successfully!");

      // refresh tokens list
      fetchTokens();

      // clear form
      setName("");
      setSymbol("");
      setDescription("");
      setTelegramUrl("");
      setXUrl("");
      setWebsiteUrl("");
      setManualImageUrl("");
      setImageFile(null);
    } catch (err: any) {
      console.error(err);
      setStatus("Unexpected error creating token.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #0f172a, #020617)",
        padding: 24,
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: 1200,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* TOP: MAIN CARD (FORM + PREVIEW) */}
        <div
          style={{
            background: "#020617",
            padding: 24,
            borderRadius: 16,
            border: "1px solid #1f2937",
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 32,
          }}
        >
          {/* LEFT: AUTH + FORM */}
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 8 }}>
              Cyber Dev Token Hub
            </h1>

            <p style={{ color: "#9ca3af", marginBottom: 12, fontSize: 14 }}>
              Create your token profile below. Upload an image or paste a URL.
            </p>

            {/* AUTH STATUS BAR */}
            <div
              style={{
                marginBottom: 18,
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                alignItems: "center",
                fontSize: 12,
              }}
            >
              {authChecked && user ? (
                <>
                  <span
                    style={{
                      borderRadius: 999,
                      border: "1px solid rgba(16,185,129,0.5)",
                      background: "rgba(6,95,70,0.4)",
                      padding: "4px 10px",
                      color: "#6ee7b7",
                    }}
                  >
                    Logged in as{" "}
                    <span style={{ fontFamily: "monospace" }}>
                      {user.email || user.id.slice(0, 8)}
                    </span>
                  </span>
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#9ca3af",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <span
                  style={{
                    borderRadius: 999,
                    border: "1px solid #374151",
                    background: "#020617",
                    padding: "4px 10px",
                    color: "#e5e7eb",
                  }}
                >
                  Not logged in. Login required to create tokens.
                </span>
              )}

              {authError && (
                <span style={{ color: "#f97373", fontSize: 11 }}>
                  {authError}
                </span>
              )}
            </div>

            {/* LOGIN UI WHEN LOGGED OUT */}
            {!user && (
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid #1f2937",
                  background: "#020617",
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: "#e5e7eb",
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Login to create a token
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    marginBottom: 10,
                  }}
                >
                  Enter your email to receive a magic login link. Once you
                  confirm it, return here and the token form will unlock.
                </p>

                <form
                  onSubmit={handleSendMagicLink}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                  <button
                    type="submit"
                    disabled={sendingLink}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "none",
                      cursor: sendingLink ? "default" : "pointer",
                      fontWeight: 600,
                      background:
                        "linear-gradient(135deg, #22c55e, #22d3ee 40%, #6366f1)",
                      color: "white",
                      opacity: sendingLink ? 0.7 : 1,
                      fontSize: 13,
                    }}
                  >
                    {sendingLink ? "Sending…" : "Send login link"}
                  </button>
                </form>

                {linkSent && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#4ade80",
                    }}
                  >
                    Login link sent. Check your email, click it, and then
                    return to this page.
                  </p>
                )}
              </div>
            )}

            {/* TOKEN FORM - ONLY WHEN LOGGED IN */}
            {user && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Token Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) =>
                      setSymbol(e.target.value.toUpperCase())
                    }
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                <p
                  style={{
                    marginBottom: 8,
                    marginTop: 16,
                    color: "#e5e7eb",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Token Image
                </p>

                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Upload file (recommended)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] ?? null)
                    }
                    style={{ color: "#e5e7eb", fontSize: 12 }}
                  />
                </div>

                <p
                  style={{
                    textAlign: "center",
                    margin: "10px 0",
                    color: "#475569",
                    fontSize: 12,
                  }}
                >
                  — OR —
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Paste Image URL (optional)
                  </label>
                  <input
                    type="text"
                    value={manualImageUrl}
                    onChange={(e) =>
                      setManualImageUrl(e.target.value)
                    }
                    placeholder="https://example.com/image.png"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Telegram URL
                  </label>
                  <input
                    type="text"
                    value={telegramUrl}
                    onChange={(e) =>
                      setTelegramUrl(e.target.value)
                    }
                    placeholder="https://t.me/your_project"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    X (Twitter) URL
                  </label>
                  <input
                    type="text"
                    value={xUrl}
                    onChange={(e) => setXUrl(e.target.value)}
                    placeholder="https://x.com/your_project"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color: "#9ca3af",
                    }}
                  >
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) =>
                      setWebsiteUrl(e.target.value)
                    }
                    placeholder="https://yourproject.xyz"
                    style={inputStyle}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    borderRadius: 999,
                    border: "none",
                    cursor: loading ? "default" : "pointer",
                    fontWeight: 600,
                    background:
                      "linear-gradient(135deg, #22c55e, #22d3ee 40%, #6366f1)",
                    color: "white",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Creating..." : "Create Token Profile"}
                </button>
              </form>
            )}

            {status && (
              <p
                style={{
                  marginTop: 12,
                  color: status.startsWith("✅")
                    ? "#4ade80"
                    : status.startsWith("Error") ||
                      status.startsWith("Upload failed")
                    ? "#f97373"
                    : "#e5e7eb",
                  fontSize: 13,
                }}
              >
                {status}
              </p>
            )}
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div
            style={{
              border: "1px solid #1f2937",
              borderRadius: 16,
              padding: 16,
              background: "#0f172a",
            }}
          >
            <h2
              style={{
                color: "#e5e7eb",
                marginBottom: 12,
                fontSize: 16,
              }}
            >
              Preview
            </h2>

            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                style={{
                  width: "100%",
                  maxWidth: 220,
                  borderRadius: 16,
                  border: "1px solid #374151",
                  marginBottom: 12,
                }}
              />
            ) : manualImageUrl ? (
              <img
                src={manualImageUrl}
                alt="Preview"
                style={{
                  width: "100%",
                  maxWidth: 220,
                  borderRadius: 16,
                  border: "1px solid #374151",
                  marginBottom: 12,
                }}
              />
            ) : (
              <p style={{ color: "#64748b", marginBottom: 12 }}>
                No image selected yet.
              </p>
            )}

            <div>
              <p
                style={{
                  color: "#e5e7eb",
                  fontSize: 15,
                  marginBottom: 4,
                }}
              >
                {name || "Your Token Name"}
              </p>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {symbol || "SYM"}
              </p>
              <p
                style={{
                  color: "#9ca3af",
                  fontSize: 12,
                  marginBottom: 8,
                  minHeight: 36,
                }}
              >
                {description ||
                  "This is where your token description will appear."}
              </p>
              <p style={{ color: "#6b7280", fontSize: 11 }}>
                {telegramUrl && <>TG: {telegramUrl}{"  "}</>}
                {xUrl && <>· X: {xUrl}{"  "}</>}
                {websiteUrl && <>· Site: {websiteUrl}</>}
                {!telegramUrl &&
                  !xUrl &&
                  !websiteUrl &&
                  "No links added yet."}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM: TOKEN LIST */}
        <div
          style={{
            background: "#020617",
            padding: 20,
            borderRadius: 16,
            border: "1px solid #1f2937",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                color: "#e5e7eb",
              }}
            >
              Latest Tokens
            </h2>
            <Link
              href="/directory"
              style={{
                fontSize: 12,
                color: "#22d3ee",
                textDecoration: "underline",
              }}
            >
              View full directory →
            </Link>
          </div>

          {loadingTokens ? (
            <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading...</p>
          ) : tokens.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: 13 }}>
              No tokens created yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {tokens.map((t) => (
                <Link
                  key={t.id}
                  href={`/tokens/${t.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      borderRadius: 12,
                      border: "1px solid #1f2937",
                      padding: 12,
                      background: "#020617",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                      }}
                    >
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={t.name || ""}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            objectFit: "cover",
                            border: "1px solid #374151",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 999,
                            border: "1px solid #374151",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            color: "#6b7280",
                          }}
                        >
                          ?
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#e5e7eb",
                          }}
                        >
                          {t.name || "Unnamed"}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#9ca3af",
                          }}
                        >
                          {t.symbol || "SYM"}
                        </div>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        marginBottom: 8,
                        minHeight: 32,
                      }}
                    >
                      {t.description || "No description provided."}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        fontSize: 11,
                      }}
                    >
                      {t.telegram_url && (
                        <a
                          href={t.telegram_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkPillStyle}
                          onClick={(e) => e.stopPropagation()}
                        >
                          TG
                        </a>
                      )}
                      {t.x_url && (
                        <a
                          href={t.x_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkPillStyle}
                          onClick={(e) => e.stopPropagation()}
                        >
                          X
                        </a>
                      )}
                      {t.website_url && (
                        <a
                          href={t.website_url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkPillStyle}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Site
                        </a>
                      )}
                      {!t.telegram_url &&
                        !t.x_url &&
                        !t.website_url && (
                          <span
                            style={{
                              color: "#6b7280",
                              fontSize: 11,
                            }}
                          >
                            No links
                          </span>
                        )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #374151",
  background: "#020617",
  color: "#e5e7eb",
  fontSize: 13,
};

const linkPillStyle: CSSProperties = {
  padding: "4px 8px",
  borderRadius: 999,
  border: "1px solid #374151",
  color: "#e5e7eb",
  textDecoration: "none",
};
