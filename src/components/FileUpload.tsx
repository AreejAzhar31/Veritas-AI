import { useRef, useState } from 'react';
import { Upload, X, FileText, File, Image, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  uploadedFiles: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (id: string) => void;
}

const ACCEPTED_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image size={14} className="text-purple-400" />;
  if (type === 'application/pdf') return <FileText size={14} className="text-red-400" />;
  if (type === 'text/csv') return <FileText size={14} className="text-green-400" />;
  return <File size={14} className="text-blue-400" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function FileUpload({ uploadedFiles, onAddFile, onRemoveFile }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith('.md')) {
      setError(`Unsupported file type: ${file.type || 'unknown'}`);
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`File too large (max 5MB): ${file.name}`);
      return;
    }
    setError(null);

    let content = '';
    if (file.type.startsWith('image/')) {
      content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(`[IMAGE: ${file.name}] (Image content preview — use multimodal processing)`);
        reader.readAsDataURL(file);
      });
    } else {
      content = await file.text();
    }

    const uploadedFile: UploadedFile = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      content,
      uploadedAt: new Date(),
    };
    onAddFile(uploadedFile);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(processFile);
  };

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-indigo-500 bg-indigo-950/30'
            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
        }`}
      >
        <Upload size={20} className="mx-auto text-gray-500 mb-2" />
        <p className="text-xs text-gray-400">
          Drop files or <span className="text-indigo-400">click to upload</span>
        </p>
        <p className="text-xs text-gray-600 mt-0.5">TXT, MD, CSV, JSON, PDF, Images • Max 5MB</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".txt,.md,.csv,.json,.pdf,.png,.jpg,.jpeg,.gif,.webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/30 rounded-lg px-3 py-2">
          <AlertCircle size={12} />
          {error}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-1">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/50 rounded-lg px-3 py-2"
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 truncate">{file.name}</p>
                <p className="text-xs text-gray-600">{formatSize(file.size)}</p>
              </div>
              <button
                onClick={() => onRemoveFile(file.id)}
                className="text-gray-600 hover:text-red-400 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
