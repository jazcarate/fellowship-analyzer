import { html } from 'https://esm.sh/htm/preact';
import { useState, useRef } from 'https://esm.sh/preact/hooks';

/**
 * @param {Object} props
 * @param {(text: string) => void} props.onFileSelect
 */
export function UploadPage({ onFileSelect }) {
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    /**
     * @param {Event} event
     */
    const handleFileUpload = async (event) => {
        const input = /** @type {HTMLInputElement} */ (event.target);
        const file = input.files?.[0];
        if (!file) return;
        const text = await file.text();
        onFileSelect(text);
    };

    /**
     * @param {DragEvent} event
     */
    const handleFileDrop = async (event) => {
        event.preventDefault();
        setDragging(false);

        const items = event?.dataTransfer?.items;

        if (items) {
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
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

    return html`
        <div
            class="upload-section ${dragging ? 'drag-over' : ''}"
            onDragOver=${(/** @type {DragEvent} */ e) => { e.preventDefault(); setDragging(true); }}
            onDragEnter=${(/** @type {DragEvent} */ e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave=${(/** @type {DragEvent} */ e) => { e.preventDefault(); setDragging(false); }}
            onDrop=${handleFileDrop}
        >
            <input
                type="file"
                id="fileInput"
                ref=${fileInputRef}
                onChange=${handleFileUpload}
                accept=".txt"
                style=${{ display: 'none' }}
            />
            <label for="fileInput" class="upload-label">
                <div class="upload-icon">📊</div>
                <div class="upload-text">Drop your combat log here or click to browse</div>
                <div class="upload-hint">Analyzing Fellowship combat logs</div>
            </label>
        </div>
    `;
}
