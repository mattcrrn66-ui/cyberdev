'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '../supabaseClients'; // adjust if your file path is different

// Change if your bucket name is different
const BUCKET_NAME = 'token-images';

export default function TokenHubPage() {
  // form state
  const [tokenName, setTokenName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');
  const [xUrl, setXUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [manualImageUrl, setManualImageUrl] = useState('');

  // file upload state
  const [imageFile, setImageFile] = useState<File | null>(null);

  // ui state
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      if (!tokenName.trim() || !symbol.trim()) {
        setStatus('Token name and symbol are required.');
        setLoading(false);
        return;
      }

      // 1) Decide what image URL we will store
      let finalImageUrl = manualImageUrl.trim();

      // 2) If user selected a file, upload it to Supabase and get a URL
      if (imageFile) {
        const ext = imageFile.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;
        const filePath = `logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, imageFile);

        if (uploadError) {
          console.error(uploadError);
          setStatus('Image upload failed: ' + uploadError.message);
          setLoading(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        finalImageUrl = publicData.publicUrl;
      }

      // 3) Insert token profile into the "tokens" table
      const { error: insertError } = await supabase.from('tokens').insert({
        name: tokenName,
        symbol,
        description,
        telegram_url: telegramUrl,
        x_url: xUrl,
        website_url: websiteUrl,
        image_url: finalImageUrl || null, // can be null if none
      });

      if (insertError) {
        console.error(insertError);
        setStatus('Error creating token: ' + insertError.message);
        setLoading(false);
        return;
      }

      // 4) Clear form
      setTokenName('');
      setSymbol('');
      setDescription('');
      setTelegramUrl('');
      setXUrl('');
      setWebsiteUrl('');
      setManualImageUrl('');
      setImageFile(null);

      setStatus('Token profile created successfully!');
    } catch (err: any) {
      console.error(err);
      setStatus('Unexpected error creating token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #0f172a, #020617)',
        padding: 24,
      }}
    >
      <div
        style={{
          background: '#020617',
          borderRadius: 24,
          padding: 24,
          border: '1px solid #1f2937',
          width: '100%',
          maxWidth: 960,
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* LEFT: form */}
        <div>
          <h1 style={{ fontSize: 26, marginBottom: 8, color: '#e5e7eb' }}>
            Cyber Dev Token Hub
          </h1>
          <p style={{ color: '#9ca3af', marginBottom: 24 }}>
            Register your token profile and get visible before launch.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Token name */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{ display: 'block', marginBottom: 4, color: '#9ca3af' }}
              >
                Token Name *
              </label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Symbol */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{ display: 'block', marginBottom: 4, color: '#9ca3af' }}
              >
                Symbol *
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{ display: 'block', marginBottom: 4, color: '#9ca3af' }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* IMAGE AREA */}
            <div
              style={{
                marginTop: 18,
                marginBottom: 8,
                padding: 12,
                borderRadius: 12,
                border: '1px solid #1f2937',
                background: '#020617',
              }}
            >
              <p
                style={{
                  marginBottom: 8,
                  color: '#e5e7eb',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Token Image
              </p>

              {/* File upload */}
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    color: '#9ca3af',
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
                  style={{ color: '#e5e7eb', fontSize: 12 }}
                />
              </div>

              <div
                style={{
                  textAlign: 'center',
                  margin: '6px 0',
                  fontSize: 11,
                  color: '#6b7280',
                }}
              >
                — or —
              </div>

              {/* Manual URL */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    color: '#9ca3af',
                  }}
                >
                  Paste Image URL (optional)
                </label>
                <input
                  type="text"
                  value={manualImageUrl}
                  onChange={(e) => setManualImageUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* LINKS */}
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <label
                style={{ display: 'block', marginBottom: 4, color: '#9ca3af' }}
              >
                Telegram URL
              </label>
              <input
                type="text"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                placeholder="https://t.me/your_project"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label
                style={{ display: 'block', marginBottom: 4, color: '#9ca3af' }}
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

            <div style={{ marginBottom: 18 }}>
              <label
                style={{ display: 'block', marginBottom: 4, color: '#9ca3af' }}
              >
                Website URL
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourproject.xyz"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: 999,
                border: 'none',
                cursor: loading ? 'default' : 'pointer',
                fontWeight: 600,
                background:
                  'linear-gradient(135deg, #22c55e, #22d3ee 40%, #6366f1)',
                opacity: loading ? 0.7 : 1,
                color: 'white',
              }}
            >
              {loading ? 'Creating…' : 'Create Token Profile'}
            </button>

            {status && (
              <p
                style={{
                  marginTop: 12,
                  color: status.includes('successfully')
                    ? '#4ade80'
                    : '#f97373',
                  fontSize: 13,
                }}
              >
                {status}
              </p>
            )}
          </form>
        </div>

        {/* RIGHT: simple preview / placeholder */}
        <div
          style={{
            borderRadius: 16,
            border: '1px solid #1f2937',
            padding: 16,
            background:
              'radial-gradient(circle at top left, #1d283a, #020617)',
          }}
        >
          <p style={{ color: '#9ca3af', marginBottom: 12, fontSize: 13 }}>
            Live Preview
          </p>

          <div
            style={{
              borderRadius: 16,
              border: '1px solid #1f2937',
              padding: 16,
              background: '#020617',
              minHeight: 240,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 12,
            }}
          >
            {/* Image preview */}
            {imageFile ? (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  objectFit: 'cover',
                  border: '2px solid #22c55e',
                }}
              />
            ) : manualImageUrl ? (
              <img
                src={manualImageUrl}
                alt="preview"
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  objectFit: 'cover',
                  border: '2px solid #22c55e',
                }}
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 999,
                  border: '1px dashed #374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4b5563',
                  fontSize: 12,
                }}
              >
                No image
              </div>
            )}

            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#e5e7eb',
                }}
              >
                {tokenName || 'Your Token Name'}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: '#9ca3af',
                  marginTop: 4,
                }}
              >
                {symbol || 'SYM'}
              </div>
            </div>

            <p
              style={{
                fontSize: 12,
                color: '#9ca3af',
                maxWidth: 260,
                marginTop: 4,
              }}
            >
              {description ||
                'This is where your token description will appear for devs and early investors.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid #374151',
  background: '#020617',
  color: '#e5e7eb',
  fontSize: 13,
};
