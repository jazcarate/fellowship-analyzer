import { useRef } from 'preact/hooks';
import { useLocation } from 'preact-iso';

interface HeaderProps {
  onFileSelect?: (text: string) => void;
  showUpload?: boolean;
}

export function Header({ onFileSelect, showUpload = false }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { route } = useLocation();

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please select a .txt file');
      return;
    }

    const text = await file.text();
    onFileSelect?.(text);
  };

  const handleFileDrop = async (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event?.dataTransfer?.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt')) {
      alert('Please drop a .txt file');
      return;
    }

    const text = await file.text();
    onFileSelect?.(text);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    if (!showUpload) {
      route('/');
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '20px 0',
      borderBottom: '2px solid var(--border)'
    }}>
      <h1
        onClick={() => route('/')}
        style={{
          fontSize: '24px',
          margin: 0,
          cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--highlight-color)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
      >
        📊 Fellowship Log Analyzer
      </h1>

      {showUpload && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleFileDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt"
            style={{ display: 'none' }}
          />
          <button onClick={handleClick}>
            📁 Upload New Log
          </button>
        </div>
      )}
    </header>
  );
}
