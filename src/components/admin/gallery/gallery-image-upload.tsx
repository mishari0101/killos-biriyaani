"use client";

import { ImageUpload } from "@/components/admin/image-upload";

interface GalleryImageUploadProps {
  value: string;
  aspect: string;
  onAspectChange: (aspect: string) => void;
  onChange: (url: string) => void;
  error?: string;
  /** Reports the key of the latest uploaded-but-unsaved file (for cancel cleanup). */
  onPendingKeyChange?: (key: string | null) => void;
}

export function GalleryImageUpload({
  value,
  aspect,
  onAspectChange,
  onChange,
  error,
  onPendingKeyChange,
}: GalleryImageUploadProps) {
  return (
    <ImageUpload
      value={value}
      folder="gallery"
      onChange={onChange}
      error={error}
      onPendingKeyChange={onPendingKeyChange}
      onDimensions={(width, height) => onAspectChange(`${width} / ${height}`)}
      onRemove={() => onAspectChange("4 / 3")}
      aspect={aspect}
      altLabel="Gallery photo preview"
    />
  );
}
