import { useRef, useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';

interface HeaderProps {
  onFileSelect?: (text: string) => void;
  showUpload?: boolean;
}

export function Header({ onFileSelect, showUpload = false }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { route } = useLocation();
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);

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

    if (onFileSelect) {
      await onFileSelect(combinedText);
    }
  };

  const handleFileDrop = async (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;

    const files = event?.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const txtFiles = Array.from(files).filter(file => file.name.endsWith('.txt'));

    if (txtFiles.length === 0) {
      alert('Please drop .txt files');
      return;
    }

    const textContents = await Promise.all(txtFiles.map(file => file.text()));
    const combinedText = textContents.join('\n');

    if (onFileSelect) {
      await onFileSelect(combinedText);
    }
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!showUpload) return;

    const handleWindowDragEnter = (e: DragEvent) => handleDragEnter(e);
    const handleWindowDragLeave = (e: DragEvent) => handleDragLeave(e);
    const handleWindowDragOver = (e: DragEvent) => handleDragOver(e);
    const handleWindowDrop = (e: DragEvent) => handleFileDrop(e);

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, [showUpload]);

  return (
    <>
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
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              multiple
              style={{ display: 'none' }}
            />
            <button onClick={() => fileInputRef.current?.click()}>
              📁 Upload New Log
            </button>
          </div>
        )}
      </header>

      {showUpload && dragging && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(241, 136, 5, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontSize: '120px', marginBottom: '30px' }}>📊</div>
          <div style={{
            fontSize: '48px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Drop your combat logs here
          </div>
          <div style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center'
          }}>
            Release to upload and analyze • Multiple files supported
          </div>
        </div>
      )}
    </>
  );
}
