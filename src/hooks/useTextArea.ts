import { countWords } from "@/utils/util";
import { useEffect, useState } from "react";

export interface UseTextAreaReturn {
    thoughts: string;
    wordsLeft: number;
    handleThoughtsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface UseTextAreaOptions {
    initialThoughts: string;
    maxWords: number;
}

export function useTextArea({ initialThoughts, maxWords }: UseTextAreaOptions): UseTextAreaReturn {
    const [thoughts, setThoughts] = useState(initialThoughts);

    useEffect(() => {
        setThoughts(initialThoughts);
    }, [initialThoughts]);

    const wordsLeft = maxWords - countWords(thoughts);
    const handleThoughtsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        const words = countWords(val);
        if (words > maxWords) {
            const truncated = val.trim().split(/\s+/).slice(0, maxWords).join(' ');
            setThoughts(truncated);
        } else {
            setThoughts(val);
        }
    };


    return {
        thoughts,
        wordsLeft,
        handleThoughtsChange,
    }
}
