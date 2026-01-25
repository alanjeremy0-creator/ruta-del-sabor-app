"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
    message: string;
    type?: "success" | "error" | "info";
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-sage" />,
        error: <AlertCircle className="w-5 h-5 text-salmon" />,
        info: <AlertCircle className="w-5 h-5 text-secondary" />,
    };

    const bgColors = {
        success: "bg-sage/10 border-sage",
        error: "bg-salmon/10 border-salmon",
        info: "bg-base border-border",
    };

    return (
        <div
            className={`fixed bottom-24 left-4 right-4 mx-auto max-w-sm z-50 toast transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            <div className={`${bgColors[type]} border rounded-lg p-4 flex items-center gap-3 shadow-lg`}>
                {icons[type]}
                <p className="flex-1 text-sm font-medium text-primary">{message}</p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 200);
                    }}
                    className="text-secondary hover:text-primary"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
