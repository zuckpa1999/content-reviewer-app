import { ImageIcon, Upload, Link } from 'lucide-react';

interface ImageSectionProps {
    imageUrl: string;
    imageError: boolean;
    imageSource: 'url' | 'file';
    fileInputRef: React.RefObject<HTMLInputElement>;
    onImageUrlChange: (url: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSourceSwitch: (source: 'url' | 'file') => void;
}

export function ImageSection({
    imageUrl,
    imageError,
    imageSource,
    fileInputRef,
    onImageUrlChange,
    onFileUpload,
    onSourceSwitch,
}: ImageSectionProps) {
    return (
        <>
            {/* Image preview */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-dark-700 border border-dark-600/50">
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => { }} // Error is handled by parent
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-dark-400">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-sm">Image preview</span>
                    </div>
                )}
            </div>

            {/* Image source toggle */}
            <div className="space-y-2">
                <div className="flex rounded-xl overflow-hidden border border-dark-600 bg-dark-700">
                    <button
                        type="button"
                        onClick={() => onSourceSwitch('url')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors
                        ${imageSource === 'url' ? 'bg-accent text-white' : 'text-dark-300 hover:text-white'}`}
                    >
                        <Link className="w-3.5 h-3.5" /> URL
                    </button>
                    <button
                        type="button"
                        onClick={() => onSourceSwitch('file')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors
                        ${imageSource === 'file' ? 'bg-accent text-white' : 'text-dark-300 hover:text-white'}`}
                        disabled
                    >
                        <Upload className="w-3.5 h-3.5" /> Upload
                    </button>
                </div>

                {imageSource === 'url' ? (
                    <input
                        id="imageUrl"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                            onImageUrlChange(e.target.value);
                        }}
                        placeholder="https://example.com/poster.jpg"
                        className="w-full px-4 py-3 rounded-xl bg-dark-700 border border-dark-600
                       text-white placeholder:text-dark-400 text-sm
                       focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40
                       transition-colors"
                    />
                ) : (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onFileUpload}
                            className="hidden"
                            id="fileUpload"
                        />
                        <label
                            htmlFor="fileUpload"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl
                         bg-dark-700 border border-dashed border-dark-500 text-dark-300 text-sm
                         hover:border-accent/60 hover:text-white cursor-pointer transition-colors"
                        >
                            <Upload className="w-4 h-4" />
                            {imageUrl ? 'Change image…' : 'Choose image from device…'}
                        </label>
                    </div>
                )}
            </div>
        </>
    );
}
