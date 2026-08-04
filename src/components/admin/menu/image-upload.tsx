"use client";

import { useCallback, useRef, useState } from "react";
import { ImageIcon, RefreshIcon, TrashIcon, UploadCloudIcon } from "@/components/ui/icons";
import { deleteUploadedFile, uploadImage } from "@/lib/uploads/client";
import { validateImageFileClient } from "@/lib/uploads/validate";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  /** Reports the key of the latest uploaded-but-unsaved file (for cancel cleanup). */
  onPendingKeyChange?: (key: string | null) => void;
}

export function ImageUpload({ value, onChange, error, onPendingKeyChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const pendingKeyRef = useRef<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const clearObjectUrl = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const validation = validateImageFileClient(file);
      if (validation) {
        setFieldError(validation);
        return;
      }
      setFieldError(null);

      clearObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      previewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      setUploading(true);

      try {
        const { url, key } = await uploadImage(file);
        const previousPending = pendingKeyRef.current;
        if (previousPending && previousPending !== key) {
          void deleteUploadedFile(previousPending);
        }
        pendingKeyRef.current = key;
        onPendingKeyChange?.(key);
        setUploading(false);
        clearObjectUrl();
        onChange(url);
      } catch (err) {
        setUploading(false);
        clearObjectUrl();
        setFieldError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      }
    },
    [clearObjectUrl, onPendingKeyChange, onChange]
  );

  const handleRemove = useCallback(() => {
    const pending = pendingKeyRef.current;
    pendingKeyRef.current = null;
    onPendingKeyChange?.(null);
    if (pending) void deleteUploadedFile(pending);
    clearObjectUrl();
    onChange("");
  }, [clearObjectUrl, onPendingKeyChange, onChange]);

  const showImage = Boolean(previewUrl || value);
  const src = previewUrl || value;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Choose an image"
          disabled={uploading}
          className={`group relative flex h-44 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-[var(--admin-field-bg)] transition-colors disabled:cursor-not-allowed sm:h-36 sm:w-64 ${
            error || fieldError
              ? "border-[var(--brand-cta)]/70"
              : "border-dashed border-[var(--admin-border-strong)] hover:border-[var(--admin-fg-muted)]"
          }`}
        >
          {showImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src ?? undefined}
                alt="Menu item preview"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/55 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fff] px-3 py-1.5 text-[0.75rem] font-medium text-[#1a1a1a]">
                  <RefreshIcon size={13} />
                  Replace image
                </span>
              </span>
            </>
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 text-center text-[var(--admin-fg-muted)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--admin-border-strong)] bg-[var(--admin-card)]">
                <ImageIcon size={18} />
              </span>
              <span className="text-[0.78rem] font-medium leading-snug">
                {uploading ? "Uploading…" : "No image selected"}
              </span>
              <span className="text-[0.7rem]">JPG, PNG or WebP · max 5 MB</span>
            </span>
          )}

          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/45">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#fff]/30 border-t-[#fff]" />
            </span>
          )}
        </button>

        <div className="flex flex-col gap-2 sm:justify-center">
          {!showImage && !uploading ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="admin-btn admin-btn-ghost justify-center text-[0.82rem] font-medium"
            >
              <UploadCloudIcon size={15} />
              Choose Image
            </button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="admin-btn admin-btn-ghost justify-center text-[0.82rem] font-medium disabled:opacity-50"
              >
                <RefreshIcon size={14} />
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="admin-btn admin-btn-danger justify-center text-[0.82rem] font-medium disabled:opacity-50"
              >
                <TrashIcon size={14} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {(error || fieldError) && (
        <p className="admin-field-error" role="alert">
          {error ?? fieldError}
        </p>
      )}
    </div>
  );
}
