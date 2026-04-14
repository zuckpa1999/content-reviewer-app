import { useState, useRef } from 'react';

export interface UseImageUploadReturn {
    imageUrl: string;
    imageError: boolean;
    imageSource: 'url' | 'file';
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleImageUrlChange: (url: string) => void;
    switchSource: (source: 'url' | 'file') => void;
}

interface UseImageUploadOptions {
    initialImageUrl?: string;
    initialIsFile?: boolean;
}

export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadReturn {
    const initialImageUrl = options?.initialImageUrl ?? '';
    const initialIsFile = options?.initialIsFile ?? false;

    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [imageError, setImageError] = useState(false);
    const [imageSource, setImageSource] = useState<'url' | 'file'>(initialIsFile ? 'file' : 'url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageUrl(reader.result as string);
            setImageError(false);
        };
        reader.onerror = () => {
            setImageError(true);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUrlChange = (url: string) => {
        setImageUrl(url);
        setImageError(false);
    };

    const switchSource = (source: 'url' | 'file') => {
        setImageSource(source);
        setImageUrl('');
        setImageError(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return {
        imageUrl,
        imageError,
        imageSource,
        fileInputRef,
        handleFileUpload,
        handleImageUrlChange,
        switchSource,
    };
}
