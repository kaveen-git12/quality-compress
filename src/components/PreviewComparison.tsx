import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Maximize2, 
  Download, 
  RotateCcw, 
  Eye, 
  FileText,
  Image as ImageIcon,
  Move3D
} from 'lucide-react';
import { FileWithPreview } from './FileUpload';
import { cn } from '@/lib/utils';

interface PreviewComparisonProps {
  file: FileWithPreview | null;
  onDownload?: () => void;
  onReset?: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const PreviewComparison: React.FC<PreviewComparisonProps> = ({
  file,
  onDownload,
  onReset
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!file) {
    return (
      <Card className="glass-card p-8 h-full min-h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No File Selected</h3>
          <p className="text-sm">Select a file from the upload panel to see the preview</p>
        </div>
      </Card>
    );
  }

  const compressionSavings = file.compressedSize 
    ? ((file.originalSize - file.compressedSize) / file.originalSize * 100).toFixed(1)
    : null;

  const isImage = file.type.startsWith('image/');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Preview & Analysis</h2>
          <p className="text-sm text-muted-foreground">{file.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Maximize2 className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatFileSize(file.originalSize)}
            </div>
            <div className="text-sm text-muted-foreground">Original Size</div>
          </div>
        </Card>
        
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {file.compressedSize ? formatFileSize(file.compressedSize) : '—'}
            </div>
            <div className="text-sm text-muted-foreground">Compressed Size</div>
          </div>
        </Card>
        
        <Card className="glass-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {compressionSavings ? `${compressionSavings}%` : '—'}
            </div>
            <div className="text-sm text-muted-foreground">Space Saved</div>
          </div>
        </Card>
      </div>

      {/* Preview Comparison */}
      <Card className="glass-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Before vs After Comparison</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">Quality: {file.compressionLevel}%</Badge>
              {file.isProcessing && (
                <Badge variant="outline" className="animate-pulse">
                  Processing...
                </Badge>
              )}
            </div>
          </div>

          {isImage && file.preview ? (
            /* Image Comparison with Slider */
            <div 
              ref={containerRef}
              className="relative h-80 bg-gradient-subtle rounded-lg overflow-hidden cursor-col-resize"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Original Image */}
              <img 
                src={file.preview} 
                alt="Original"
                className="absolute inset-0 w-full h-full object-contain"
              />
              
              {/* Compressed Image Overlay */}
              <div 
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img 
                  src={file.preview} // This would be the compressed version
                  alt="Compressed"
                  className="w-full h-full object-contain opacity-90"
                />
              </div>

              {/* Slider */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg cursor-col-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Move3D className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-medium">
                Original
              </div>
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm font-medium">
                Compressed
              </div>
            </div>
          ) : (
            /* Non-Image File Preview */
            <div className="h-80 bg-gradient-subtle rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {file.type.includes('pdf') ? (
                    <FileText className="w-10 h-10 text-primary" />
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h4 className="font-medium mb-2">{file.type.toUpperCase()} File</h4>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Preview not available for this file type. 
                  Compression analysis available after processing.
                </p>
              </div>
            </div>
          )}

          {/* Compression Details */}
          <div className="space-y-3">
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-medium">{file.type}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Compression:</span>
                <span className="ml-2 font-medium">{file.compressionLevel}% Level</span>
              </div>
              {isImage && (
                <>
                  <div>
                    <span className="text-muted-foreground">Estimated Quality:</span>
                    <span className="ml-2 font-medium">
                      {file.compressionLevel <= 20 ? 'Excellent' : 
                       file.compressionLevel <= 50 ? 'Good' : 
                       file.compressionLevel <= 80 ? 'Fair' : 'Compressed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Optimization:</span>
                    <span className="ml-2 font-medium">WebP Recommended</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {file.compressedSize && onDownload && (
            <div className="pt-4">
              <Button onClick={onDownload} variant="gradient" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Compressed File
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};