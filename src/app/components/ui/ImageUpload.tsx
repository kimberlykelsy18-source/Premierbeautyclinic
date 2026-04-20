import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  token: string | null;
  sessionId: string | null;
  folder?: string;
  aspectClass?: string; // e.g. 'aspect-video', 'aspect-square'
  placeholder?: string;
}

export function ImageUpload({
  value,
  onChange,
  token,
  sessionId,
  folder = 'general',
  aspectClass = 'aspect-video',
  placeholder = 'Click or drag to upload',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('Image must be under 8 MB'); return; }

    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { url } = await apiFetch('/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ data: base64, filename: file.name, folder }),
      }, token, sessionId);

      onChange(url);
      toast.success('Image uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="relative">
      {value ? (
        <div className={`relative rounded-xl overflow-hidden ${aspectClass} group bg-gray-100`}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${aspectClass} border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#6D4C91]/50 hover:bg-[#6D4C91]/4 transition-all text-gray-400 hover:text-[#6D4C91]`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-[#6D4C91] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5" />
              <span className="text-xs font-semibold">{placeholder}</span>
              <span className="text-[10px] opacity-60">PNG, JPG, WebP · max 8 MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
