"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  File,
  FileText,
  Image,
  FileArchive,
  MoreVertical,
  Download,
  Trash2,
  Search,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface TripFile {
  id: string;
  name: string;
  file_type: string;
  file_size: number | null;
  storage_path: string;
  url: string;
  category: string;
  uploaded_by: string | null;
  description: string | null;
  created_at: string;
}

interface FilesTabProps {
  tripId?: string;
  files: TripFile[];
  onAddFile?: (file: Partial<TripFile>, fileData: File) => Promise<void>;
  onDeleteFile?: (id: string) => Promise<void>;
}

const DEFAULT_FILES: TripFile[] = [
  {
    id: '1',
    name: 'Flight Confirmation.pdf',
    file_type: 'application/pdf',
    file_size: 1228800, // 1.2 MB
    storage_path: '/files/flight-confirmation.pdf',
    url: '#',
    category: 'documents',
    uploaded_by: 'Miguel',
    description: 'JFK to NRT flight confirmation',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Hotel Booking.pdf',
    file_type: 'application/pdf',
    file_size: 870400, // 850 KB
    storage_path: '/files/hotel-booking.pdf',
    url: '#',
    category: 'documents',
    uploaded_by: 'Camille',
    description: 'Hyatt Regency booking confirmation',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Inspiration_1.jpg',
    file_type: 'image/jpeg',
    file_size: 3565158, // 3.4 MB
    storage_path: '/files/inspiration-1.jpg',
    url: '#',
    category: 'images',
    uploaded_by: 'Camille',
    description: 'Tokyo street photography inspiration',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Inspiration_2.jpg',
    file_type: 'image/jpeg',
    file_size: 2202010, // 2.1 MB
    storage_path: '/files/inspiration-2.jpg',
    url: '#',
    category: 'images',
    uploaded_by: 'Miguel',
    description: null,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Visa Requirements.docx',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_size: 15360, // 15 KB
    storage_path: '/files/visa-requirements.docx',
    url: '#',
    category: 'documents',
    uploaded_by: 'Camille',
    description: 'Visa requirements for Japan',
    created_at: new Date().toISOString()
  }
];

const FILE_CATEGORIES = [
  { value: 'all', label: 'All Files' },
  { value: 'images', label: 'Images' },
  { value: 'documents', label: 'Documents' },
  { value: 'other', label: 'Other' }
];

export function FilesTab({
  tripId,
  files: initialFiles = [],
  onAddFile,
  onDeleteFile
}: FilesTabProps) {
  const [files, setFiles] = useState<TripFile[]>(
    initialFiles.length > 0 ? initialFiles : DEFAULT_FILES
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-8 w-8" />;
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return <FileArchive className="h-8 w-8" />;
    } else {
      return <File className="h-8 w-8" />;
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'IMG';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'DOC';
    if (fileType.includes('sheet') || fileType.includes('excel')) return 'XLS';
    if (fileType.includes('zip')) return 'ZIP';
    return 'FILE';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getCategoryFromType = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'images';
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('word')) {
      return 'documents';
    }
    return 'other';
  };

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (file.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadingFiles(newFiles);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUploadFiles = async () => {
    for (const fileData of uploadingFiles) {
      const newFile: TripFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: fileData.name,
        file_type: fileData.type,
        file_size: fileData.size,
        storage_path: `/files/${fileData.name}`,
        url: URL.createObjectURL(fileData), // Create temporary URL for demo
        category: getCategoryFromType(fileData.type),
        uploaded_by: 'You',
        description: null,
        created_at: new Date().toISOString()
      };

      setFiles(prev => [...prev, newFile]);

      if (onAddFile) {
        try {
          await onAddFile(newFile, fileData);
        } catch (error) {
          console.error("Failed to upload file:", error);
        }
      }
    }

    setUploadingFiles([]);
    setIsUploadDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (id: string) => {
    setFiles(files.filter(f => f.id !== id));

    if (onDeleteFile) {
      try {
        await onDeleteFile(id);
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    }

    setDeleteFileId(null);
  };

  const handleDownload = (file: TripFile) => {
    // In a real implementation, this would download from storage
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Files & Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Store and manage all your trip-related files
          </p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {FILE_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat.label}
              {cat.value === 'all' && ` (${files.length})`}
              {cat.value !== 'all' && ` (${files.filter(f => f.category === cat.value).length})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No files found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Upload your first file to get started'}
          </p>
          {!searchQuery && (
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.id}
              className="group border rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer bg-background relative aspect-square"
            >
              {/* File Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteFileId(file.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* File Icon/Preview */}
              {file.file_type.startsWith('image/') ? (
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground">IMG</div>';
                    }}
                  />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    {getFileIcon(file.file_type)}
                    <Badge variant="outline" className="mt-2 text-xs">
                      {getFileTypeLabel(file.file_type)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="text-center w-full">
                <p className="text-sm font-medium truncate px-2" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.file_size)}
                </p>
                {file.uploaded_by && (
                  <p className="text-xs text-muted-foreground mt-1">
                    by {file.uploaded_by}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''} selected
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadingFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="text-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsUploadDialogOpen(false);
              setUploadingFiles([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}>
              Cancel
            </Button>
            <Button onClick={handleUploadFiles}>
              Upload {uploadingFiles.length} File{uploadingFiles.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteFileId} onOpenChange={() => setDeleteFileId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this file. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFileId && handleDeleteFile(deleteFileId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
