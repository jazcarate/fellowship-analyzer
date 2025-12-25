import { useState, useRef } from 'preact/hooks';

interface UploadPageProps {
  onFileSelect: (text: string) => void;
}

export function UploadPage({ onFileSelect }: UploadPageProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    onFileSelect(text);
  };

  const handleFileDrop = async (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);

    const items = event?.dataTransfer?.items;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        if (item.kind === 'string' && item.type.match('^text/plain')) {
          item.getAsString((text) => {
            onFileSelect(text);
          });
          return;
        }
      }
    }

    const file = event?.dataTransfer?.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please drop a .txt file');
      return;
    }

    const text = await file.text();
    onFileSelect(text);
  };

  return (
    <div
      class={`upload-section ${dragging ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={handleFileDrop}
    >
      <input
        type="file"
        id="fileInput"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".txt"
        style={{ display: 'none' }}
      />
      <label for="fileInput" class="upload-label">
        <div class="upload-icon">📊</div>
        <div class="upload-text">Drop your combat log here or click to browse</div>
        <div class="upload-hint">Analyzing Fellowship combat logs</div>
      </label>
    </div>
  );
}
