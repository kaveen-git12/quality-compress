import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  FileUp, 
  Settings, 
  Eye, 
  Activity,
  Folder,
  Zap,
  Download,
  Archive
} from 'lucide-react';
import { FileUpload, FileWithPreview } from './FileUpload';
import { CompressionPanel } from './CompressionPanel';
import { PreviewComparison } from './PreviewComparison';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [activePanel, setActivePanel] = useState<'upload' | 'settings' | 'preview'>('upload');

  const handleFilesAdded = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    // Auto-select first file if none selected
    if (!selectedFile && newFiles.length > 0) {
      setSelectedFile(newFiles[0]);
    }
  }, [selectedFile]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    // If removed file was selected, select another one
    if (selectedFile?.id === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId);
      setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
    }
  }, [files, selectedFile]);

  const handleCompressionChange = useCallback((fileId: string, level: number) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, compressionLevel: level } : f
    ));
  }, []);

  const handleProcessFile = useCallback(async (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, isProcessing: true } : f
    ));

    // Simulate compression process
    setTimeout(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileId) {
          // Simulate compression based on level
          const compressionRatio = f.compressionLevel / 100;
          const compressedSize = Math.floor(f.originalSize * (1 - compressionRatio * 0.8));
          return {
            ...f,
            isProcessing: false,
            compressedSize: Math.max(compressedSize, f.originalSize * 0.1) // Minimum 10% of original
          };
        }
        return f;
      }));
    }, 2000);
  }, []);

  const handleDownloadFile = useCallback((fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      // Simulate download
      console.log('Downloading file:', file.name);
    }
  }, [files]);

  const handleDownloadAll = useCallback(() => {
    const processedFiles = files.filter(f => f.compressedSize);
    console.log('Downloading all files:', processedFiles.length);
  }, [files]);

  const handleFileSelect = useCallback((file: FileWithPreview) => {
    setSelectedFile(file);
    setActivePanel('preview');
  }, []);

  const processedFiles = files.filter(f => f.compressedSize);
  const totalOriginalSize = files.reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressedSize = files.reduce((sum, f) => sum + (f.compressedSize || f.originalSize), 0);
  const totalSavings = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Archive className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FileCompress Pro</h1>
                <p className="text-sm text-muted-foreground">
                  Advanced file compression with quality control
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Stats */}
              {files.length > 0 && (
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{files.length}</div>
                    <div className="text-muted-foreground">Files</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-accent">{processedFiles.length}</div>
                    <div className="text-muted-foreground">Processed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-400">{totalSavings}%</div>
                    <div className="text-muted-foreground">Saved</div>
                  </div>
                </div>
              )}
              
              <Button variant="gradient" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Pro
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - File Management */}
          <div className="col-span-4 space-y-6">
            {/* Navigation */}
            <Card className="glass-card p-1">
              <div className="flex rounded-lg overflow-hidden">
                <Button
                  variant={activePanel === 'upload' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel('upload')}
                  className="flex-1 rounded-none"
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button
                  variant={activePanel === 'settings' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel('settings')}
                  className="flex-1 rounded-none"
                  disabled={files.length === 0}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant={activePanel === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActivePanel('preview')}
                  className="flex-1 rounded-none"
                  disabled={!selectedFile}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </Card>

            {/* File List with Selection */}
            {files.length > 0 && (
              <Card className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Files ({files.length})</h3>
                  <Button variant="outline" size="sm">
                    <Folder className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleFileSelect(file)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        selectedFile?.id === file.id && "bg-primary/10 border border-primary/20"
                      )}
                    >
                      <div className="w-8 h-8 bg-gradient-subtle rounded flex items-center justify-center flex-shrink-0">
                        {file.preview ? (
                          <img src={file.preview} alt="" className="w-full h-full object-cover rounded" />
                        ) : (
                          <FileUp className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.compressedSize ? `${totalSavings}% saved` : 'Ready to compress'}
                        </p>
                      </div>
                      {file.compressedSize && (
                        <Badge variant="outline" className="text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Panel Content */}
            {activePanel === 'upload' && (
              <FileUpload
                onFilesAdded={handleFilesAdded}
                files={files}
                onRemoveFile={handleRemoveFile}
              />
            )}

            {activePanel === 'settings' && (
              <CompressionPanel
                selectedFile={selectedFile}
                onCompressionChange={handleCompressionChange}
                onProcessFile={handleProcessFile}
                onDownloadFile={handleDownloadFile}
                onDownloadAll={handleDownloadAll}
                files={files}
              />
            )}
          </div>

          {/* Right Panel - Preview & Analysis */}
          <div className="col-span-8">
            {activePanel === 'preview' ? (
              <PreviewComparison
                file={selectedFile}
                onDownload={() => selectedFile && handleDownloadFile(selectedFile.id)}
                onReset={() => selectedFile && handleCompressionChange(selectedFile.id, 50)}
              />
            ) : (
              /* Welcome/Getting Started */
              <div className="space-y-6">
                {/* Hero Section */}
                <Card className="glass-card overflow-hidden">
                  <div className="relative h-64 bg-gradient-primary flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative text-center text-primary-foreground z-10">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Archive className="w-8 h-8" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2">FileCompress Pro</h2>
                      <p className="text-primary-foreground/90 max-w-md">
                        Advanced file compression with intelligent quality control and real-time preview
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="glass-card p-6 text-center hover:shadow-elevation transition-shadow">
                    <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Eye className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Real-time Preview</h3>
                    <p className="text-sm text-muted-foreground">
                      See before and after comparison with interactive slider
                    </p>
                  </Card>

                  <Card className="glass-card p-6 text-center hover:shadow-elevation transition-shadow">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Smart Controls</h3>
                    <p className="text-sm text-muted-foreground">
                      Fine-tune quality with intelligent compression algorithms
                    </p>
                  </Card>

                  <Card className="glass-card p-6 text-center hover:shadow-elevation transition-shadow">
                    <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Folder className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Batch Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Process multiple files with consistent settings
                    </p>
                  </Card>

                  <Card className="glass-card p-6 text-center hover:shadow-elevation transition-shadow">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">Fast & Secure</h3>
                    <p className="text-sm text-muted-foreground">
                      Client-side processing keeps your files private
                    </p>
                  </Card>
                </div>

                {/* CTA Section */}
                <Card className="glass-card p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Get Started</h3>
                  <p className="text-muted-foreground mb-6">
                    Upload your files and experience the power of intelligent compression
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button 
                      variant="gradient" 
                      size="lg"
                      onClick={() => setActivePanel('upload')}
                      className="animate-pulse-glow"
                    >
                      <FileUp className="w-5 h-5 mr-2" />
                      Upload Files Now
                    </Button>
                    <Button variant="outline" size="lg">
                      <Activity className="w-5 h-5 mr-2" />
                      See Demo
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};