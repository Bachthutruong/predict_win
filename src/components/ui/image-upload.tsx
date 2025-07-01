'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  placeholder = "Upload an image"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    try {
      // Step 1: Get signature from our API
      const timestamp = Math.round(new Date().getTime() / 1000);
      
      console.log('Getting signature...');
      const signatureResponse = await fetch('/api/cloudinary-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          timestamp,
          folder: 'predict-win'
        }),
      });

      if (!signatureResponse.ok) {
        const errorData = await signatureResponse.text();
        console.error('Signature generation failed:', errorData);
        throw new Error(`Signature failed: ${signatureResponse.status} - ${errorData}`);
      }

      const signatureData = await signatureResponse.json();
      console.log('Signature received:', signatureData);

      // Step 2: Upload with signature
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signatureData.signature);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('api_key', signatureData.apiKey);
      formData.append('folder', signatureData.folder);
      formData.append('use_filename', 'true');
      formData.append('unique_filename', 'false');

      console.log('Uploading to Cloudinary with signature...');
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        console.error('Upload failed:', errorData);
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorData}`);
      }

      const data = await uploadResponse.json();
      console.log('Upload successful:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Upload thất bại';
      alert(`Upload thất bại: ${errorMessage}\n\nVui lòng kiểm tra:\n1. Kết nối internet\n2. Upload preset đã tạo trên Cloudinary\n3. File .env.local đã có đúng thông tin`);
    } finally {
      setIsUploading(false);
      // Reset input value để có thể upload cùng file lại
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onRemove = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      {value ? (
        <div className="relative">
          <div className="relative h-40 w-full rounded-lg overflow-hidden border border-dashed border-gray-300">
            <img
              src={value}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            onClick={onRemove}
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={cn(
            "h-40 w-full rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "border-primary"
          )}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2 mx-auto"></div>
              <p className="text-sm text-muted-foreground">Đang upload...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                <span>{placeholder}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, GIF up to 5MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 