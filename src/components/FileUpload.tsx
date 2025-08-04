import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, Image, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileWithPreview extends File {
  preview?: string;
  id: string;
  compressionLevel: number;
  originalSize: number;
  compressedSize?: number;
  isProcessing?: boolean;
}

interface FileUploadProps {
  onFilesAdded: (files: FileWithPreview[]) => void;
  files: FileWithPreview[];
  onRemoveFile: (id: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('document')) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded, files, onRemoveFile }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map((file) => {
      const fileWithPreview = Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        id: Math.random().toString(36).substr(2, 9),
        compressionLevel: 50,
        originalSize: file.size,
        isProcessing: false,
      }) as FileWithPreview;
      return fileWithPreview;
    });
    
    onFilesAdded(filesWithPreview);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive: dzIsDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "glass-card border-2 border-dashed transition-all duration-300 cursor-pointer group",
          "hover:shadow-elevation hover:border-primary/50",
          (isDragActive || dzIsDragActive) && "border-primary bg-primary/5 scale-[1.02]"
        )}
        role="button"
        tabIndex={0}
        aria-label="Upload files by dragging and dropping or clicking to browse"
      >
        <input {...getInputProps()} aria-describedby="upload-description" />
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className={cn(
            "w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
            (isDragActive || dzIsDragActive) && "animate-pulse-glow"
          )}>
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isDragActive || dzIsDragActive ? 'Drop files here' : 'Upload Files'}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-sm" id="upload-description">
            Drag and drop your files here, or click to browse. 
            Supports images, PDFs, and documents up to 50MB each.
          </p>
          <Button variant="outline" size="lg" className="pointer-events-none">
            Browse Files
          </Button>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Uploaded Files ({files.length})</h3>
          <div className="grid gap-3">
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type);
              const compressionSavings = file.compressedSize 
                ? ((file.originalSize - file.compressedSize) / file.originalSize * 100).toFixed(1)
                : null;

              return (
                <Card key={file.id} className="glass-card p-4">
                  <div className="flex items-center space-x-4">
                    {/* File Icon/Preview */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-subtle flex items-center justify-center flex-shrink-0">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <FileIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.originalSize)}</span>
                        {file.compressedSize && (
                          <>
                            <span>→</span>
                            <span className="text-accent">{formatFileSize(file.compressedSize)}</span>
                            <span className="text-accent font-medium">-{compressionSavings}%</span>
                          </>
                        )}
                      </div>
                      {file.isProcessing && (
                        <Progress value={65} className="w-full mt-2 h-1" />
                      )}
                    </div>

                    {/* Remove Button */}
                     <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFile(file.id);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};