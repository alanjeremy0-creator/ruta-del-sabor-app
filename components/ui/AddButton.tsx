"use client";

import { Plus } from "lucide-react";

interface AddButtonProps {
    onClick: () => void;
}

export function AddButton({ onClick }: AddButtonProps) {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-8 right-8 w-14 h-14 btn-fab flex items-center justify-center z-40"
            aria-label="Agregar nuevo plan"
        >
            <Plus className="w-7 h-7 text-base" strokeWidth={3} />
        </button>
    );
}
