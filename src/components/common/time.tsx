function formatTime(seconds: number): string {
    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const secs = wholeSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

interface TimeProps {
    seconds: number;
}

export function Time({ seconds }: TimeProps) {
    return (
        <span>{formatTime(seconds)}</span>
    );
}
