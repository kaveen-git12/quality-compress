import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Download, 
  Play, 
  Info, 
  Zap, 
  Shield, 
  Image,
  FileText,
  Maximize2,
  RotateCcw
} from 'lucide-react';
import { FileWithPreview } from './FileUpload';
import { cn } from '@/lib/utils';

interface CompressionPanelProps {
  selectedFile: FileWithPreview | null;
  onCompressionChange: (fileId: string, level: number) => void;
  onProcessFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
  onDownloadAll: () => void;
  files: FileWithPreview[];
}

const getQualityLabel = (level: number) => {
  if (level <= 20) return { label: 'Highest Quality', color: 'text-red-400', desc: 'Minimal compression, largest files' };
  if (level <= 40) return { label: 'High Quality', color: 'text-orange-400', desc: 'Light compression, good balance' };
  if (level <= 60) return { label: 'Balanced', color: 'text-yellow-400', desc: 'Moderate compression, decent quality' };
  if (level <= 80) return { label: 'High Compression', color: 'text-blue-400', desc: 'Strong compression, smaller files' };
  return { label: 'Maximum Compression', color: 'text-green-400', desc: 'Highest compression, smallest files' };
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const CompressionPanel: React.FC<CompressionPanelProps> = ({
  selectedFile,
  onCompressionChange,
  onProcessFile,
  onDownloadFile,
  onDownloadAll,
  files
}) => {
  const [batchMode, setBatchMode] = useState(false);
  const [losslessMode, setLosslessMode] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [batchLevel, setBatchLevel] = useState(50);

  const handleSliderChange = useCallback((value: number[]) => {
    const level = value[0];
    if (batchMode) {
      setBatchLevel(level);
      files.forEach(file => {
        onCompressionChange(file.id, level);
      });
    } else if (selectedFile) {
      onCompressionChange(selectedFile.id, level);
    }
  }, [batchMode, selectedFile, files, onCompressionChange]);

  const handleProcessAll = () => {
    files.forEach(file => {
      onProcessFile(file.id);
    });
  };

  const currentLevel = batchMode ? batchLevel : (selectedFile?.compressionLevel || 50);
  const qualityInfo = getQualityLabel(currentLevel);
  const processedFiles = files.filter(f => f.compressedSize);
  const totalOriginalSize = files.reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressedSize = files.reduce((sum, f) => sum + (f.compressedSize || f.originalSize), 0);
  const totalSavings = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-semibold">Compression Settings</h2>
        </div>
        {files.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Batch Mode</span>
            <Switch checked={batchMode} onCheckedChange={setBatchMode} />
          </div>
        )}
      </div>

      {/* Current File Info */}
      {(selectedFile || batchMode) && (
        <Card className="glass-card p-6">
          <div className="space-y-4">
            {/* File Display */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-subtle flex items-center justify-center">
                {batchMode ? (
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">{files.length}</span>
                  </div>
                ) : selectedFile?.preview ? (
                  <img 
                    src={selectedFile.preview} 
                    alt={selectedFile.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Image className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {batchMode ? `${files.length} Files Selected` : selectedFile?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {batchMode ? `Total size: ${formatFileSize(totalOriginalSize)}` : 
                   selectedFile ? formatFileSize(selectedFile.originalSize) : ''}
                </p>
              </div>
            </div>

            {/* Quality Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Compression Level</label>
                <Badge variant="outline" className={qualityInfo.color}>
                  {qualityInfo.label}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Slider
                  value={[currentLevel]}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>High Quality</span>
                  <span className="font-medium">{currentLevel}%</span>
                  <span>High Compression</span>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 p-3 rounded-lg bg-muted/50">
                <Info className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">{qualityInfo.desc}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Advanced Options */}
      <Card className="glass-card p-6">
        <h3 className="font-semibold mb-4">Advanced Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-sm">Lossless Compression</span>
            </div>
            <Switch checked={losslessMode} onCheckedChange={setLosslessMode} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm">Auto-optimize Format</span>
            </div>
            <Switch checked={autoOptimize} onCheckedChange={setAutoOptimize} />
          </div>
        </div>
      </Card>

      {/* Stats */}
      {processedFiles.length > 0 && (
        <Card className="glass-card p-6">
          <h3 className="font-semibold mb-4">Compression Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-subtle">
              <div className="text-2xl font-bold text-primary">{totalSavings}%</div>
              <div className="text-sm text-muted-foreground">Space Saved</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-subtle">
              <div className="text-2xl font-bold text-accent">{processedFiles.length}</div>
              <div className="text-sm text-muted-foreground">Files Processed</div>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {formatFileSize(totalOriginalSize)} → {formatFileSize(totalCompressedSize)}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {batchMode ? (
          <Button 
            onClick={handleProcessAll}
            disabled={files.length === 0}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Process All Files
          </Button>
        ) : (
          <Button 
            onClick={() => selectedFile && onProcessFile(selectedFile.id)}
            disabled={!selectedFile}
            variant="gradient"
            size="lg"
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            Apply Compression
          </Button>
        )}

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => selectedFile && onDownloadFile(selectedFile.id)}
            disabled={!selectedFile?.compressedSize}
            variant="accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          
          <Button 
            onClick={onDownloadAll}
            disabled={processedFiles.length === 0}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>
    </div>
  );
};