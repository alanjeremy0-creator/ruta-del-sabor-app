"use client";

import { Modal } from "./Modal";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    isDestructive = false,
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-6">
                <p className="text-text-secondary leading-relaxed">
                    {message}
                </p>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg font-medium text-text-secondary hover:bg-base transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-opacity disabled:opacity-50 ${isDestructive
                            ? "bg-red-500 hover:opacity-90"
                            : "bg-primary hover:opacity-90"
                            }`}
                    >
                        {isLoading ? "Procesando..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
