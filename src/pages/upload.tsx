import { useLocation } from 'preact-iso';
import { useState, useRef } from 'preact/hooks';

interface UploadPageProps {
  onFileSelect: (text: string) => void;
}

export function UploadPage({ onFileSelect }: UploadPageProps) {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { route } = useLocation();

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

    if (txtFiles.length === 0) {
      alert('Please select .txt files');
      return;
    }

    const textContents = await Promise.all(txtFiles.map(file => file.text()));
    const combinedText = textContents.join('\n');
    route('/');
    onFileSelect(combinedText);
  };

  const handleFileDrop = async (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);

    const files = event?.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

    if (txtFiles.length === 0) {
      alert('Please drop .txt files');
      return;
    }

    const textContents = await Promise.all(txtFiles.map(file => file.text()));
    const combinedText = textContents.join('\n');
    route('/');
    onFileSelect(combinedText);
  };

  return (
    <div
      style={{
        background: dragging ? 'var(--surface)' : 'var(--offwhite-color)',
        border: `3px dashed ${dragging ? 'var(--highlight-color)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '80px 40px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: dragging ? 'scale(1.02)' : 'scale(1)',
        boxShadow: dragging ? '0 8px 16px rgba(0, 0, 0, 0.1)' : 'none'
      }}
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
        multiple
        style={{ display: 'none' }}
      />
      <label for="fileInput" style={{ cursor: 'pointer', display: 'block' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '12px'
        }}>
          {dragging ? 'Drop your combat logs here' : 'Drop your combat logs here or click to browse'}
        </div>
        <div style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Upload Fellowship combat logs (.txt files) - Multiple files supported
        </div>
      </label>
    </div>
  );
}
