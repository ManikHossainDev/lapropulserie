'use client';
import React, { useEffect, useState } from 'react';
import { Button, Upload } from 'antd';

/**
 * Mentor profile photo picker (onboarding + Mon compte).
 * Parent receives the File via onChange; upload happens on form save.
 */
const PhotoUpload = ({ onChange, avatarUrl, disabled = false }) => {
  const [preview, setPreview] = useState(avatarUrl || null);

  useEffect(() => {
    if (!avatarUrl) return;
    // Don't overwrite a freshly picked local preview with the old server URL
    setPreview((current) => {
      if (current && String(current).startsWith('data:')) return current;
      return avatarUrl;
    });
  }, [avatarUrl]);

  const handleBeforeUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onChange?.(file);
    return false;
  };

  return (
    <div className="flex items-center gap-5 mb-6">
      <div className="w-20 h-20 rounded-full border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        {preview ? (
          <img src={preview} alt="profile" className="w-full h-full object-cover" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-indigo-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1">Photo de profil</p>
        <p className="text-xs text-gray-400 mb-3">
          {disabled
            ? 'Cliquez sur Modifier pour changer votre photo.'
            : 'Ajoutez ou remplacez une photo professionnelle.'}
        </p>
        {!disabled && (
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleBeforeUpload}>
            <Button
              style={{
                backgroundColor: '#3730a3',
                borderColor: '#3730a3',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            >
              {preview ? 'Remplacer la photo' : 'Téléverser une photo'}
            </Button>
          </Upload>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
