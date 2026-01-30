import { AlertTriangle } from "lucide-react";

export default function MaintenanceScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6 bg-base text-primary">
            <div className="rounded-full bg-red-500/10 p-6">
                <AlertTriangle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">404</h1>
            <h2 className="text-xl font-medium text-gray-400">
                Página no encontrada temporalmente
            </h2>
            <p className="max-w-md text-gray-500">
                Estamos realizando actualizaciones importantes. El servicio no está disponible en este momento. Por favor intenta más tarde.
            </p>
        </div>
    );
}
