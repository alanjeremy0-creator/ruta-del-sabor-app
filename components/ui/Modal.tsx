"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    return (
        <div
            className={`fixed inset-0 z-50 modal-overlay flex items-end sm:items-center justify-center transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"
                }`}
            onClick={onClose}
            onTransitionEnd={() => !isOpen && setIsAnimating(false)}
        >
            <div
                className={`bg-surface w-full sm:max-w-md sm:rounded-xl rounded-t-xl max-h-[90vh] overflow-y-auto transition-transform duration-200 ${isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-4"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-surface border-b border-border p-4 flex items-center justify-between">
                    <h2 className="font-space font-bold text-lg">
                        {title || "Modal"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-base flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
