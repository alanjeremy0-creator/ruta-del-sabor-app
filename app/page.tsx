import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PlaceCard } from "@/components/ui/PlaceCard";
import { Toast } from "@/components/ui/Toast";
import { PixelConfetti } from "@/components/ui/PixelConfetti";
import { useUser, getAllUsersWithAvatars } from "@/hooks/useUser";
import { FoodIcon } from "@/components/ui/FoodIcons";
import { FoodEmblem } from "@/components/ui/FoodEmblem";
import { PixelHeartAnimated } from "@/components/ui/PixelHeart";
import { useVisits } from "@/hooks/useVisits";
import { deleteAllVisits } from "@/lib/cleanup";
import { PlanStatusCard } from "@/components/ui/PlanStatusCard";
import { RescheduleModal } from "@/components/ui/RescheduleModal";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: userLoading, needsOnboarding } = useUser();
  const { plannedVisits, completedVisits, isLoading: visitsLoading, refreshVisits, confirmVisit, updateVisitDate } = useVisits();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [allUsers, setAllUsers] = useState<Record<string, any>>({});

  // Reschedule Modal State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleVisitId, setRescheduleVisitId] = useState<string | null>(null);
  const [rescheduleCurrentDate, setRescheduleCurrentDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!userLoading && needsOnboarding) {
      router.push("/onboarding");
    }
  }, [userLoading, needsOnboarding, router]);

  // Load all users with their custom avatars
  useEffect(() => {
    setAllUsers(getAllUsersWithAvatars());
  }, [user]); // Re-run when user changes (after onboarding)

  const handleAddPlan = () => {
    router.push("/add");
  };

  const handleRate = (visitId: string) => {
    router.push(`/rate/${visitId}`);
  };

  // --- CONFIRMATION FLOW HANDLERS ---
  const handleConfirmPlan = async (visitId: string) => {
    try {
      await confirmVisit(visitId);
      setToast({ message: "¡Cita confirmada! 🎉", type: "success" });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    } catch (err) {
      setToast({ message: "Error al confirmar", type: "error" });
    }
  };

  const handleOpenReschedule = (visitId: string, currentDate: Date) => {
    setRescheduleVisitId(visitId);
    setRescheduleCurrentDate(currentDate);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (date: string, time: string) => {
    if (!rescheduleVisitId || !user) return;

    try {
      const newDate = new Date(`${date}T${time}`);
      await updateVisitDate(rescheduleVisitId, newDate, user.id);
      setToast({ message: "Propuesta enviada 📨", type: "success" });
    } catch (err) {
      console.error(err)
      setToast({ message: "Error al reagendar", type: "error" });
    }
  };


  // Buffer: 10 minutes after the visit time before showing in "calificar"
  const BUFFER_MINUTES = 10;

  // Auto-refresh: Check every 2 minutes to keep sync with partner's actions
  useEffect(() => {
    const REFRESH_INTERVAL = 2 * 60 * 1000; // 2 minutes

    const interval = setInterval(() => {
      // console.log("🔄 Auto-refreshing dashboard...");
      refreshVisits();
    }, REFRESH_INTERVAL);

    // Initial check is done by useVisits on mount, so we just set the interval
    return () => clearInterval(interval);
  }, [refreshVisits]);

  // Helper: Check if visit is past the buffer time (10 min after scheduled)
  const isVisitPastBuffer = (visitDate: Date) => {
    const bufferTime = new Date(visitDate).getTime() + (BUFFER_MINUTES * 60 * 1000);
    return Date.now() > bufferTime;
  };

  // --- FILTER LOGIC ---

  // 1. Next Visit: Earliest planned visit that is NOT past buffer
  const rawNextVisit = plannedVisits.find(v => !isVisitPastBuffer(new Date(v.visitDate)));

  // Logic: If there is a "Pending" plan, show it. If it's "Confirmed" (or legacy), show the card.
  // The 'rawNextVisit' contains the visit object. We check status in the UI.
  const pendingVisit = rawNextVisit && rawNextVisit.confirmationStatus === 'pending';

  // Only show the Main Card if it's confirmed (or legacy undefined)
  // If it's pending, we show the PlanStatusCard instead (or "Waiting" state)
  const showMainCard = rawNextVisit && (rawNextVisit.confirmationStatus === 'confirmed' || rawNextVisit.confirmationStatus === undefined);

  // BLOCK ADDING NEW PLANS: If there is ANY planned visit (confirmed OR pending), restrict adding another.
  // Exception: If current logic allows multiple planned visits, we should check requirements.
  // User said: "siempre debe de haber una solo plan activo".
  const hasActivePlan = !!rawNextVisit;


  // 2. Visits To Rate:
  //    - Planned visits that ARE past buffer
  //    - Completed visits (someone rated) where CURRENT USER hasn't rated yet
  //    Sorted by most recent
  const visitsToRate = [
    ...plannedVisits.filter((v) => isVisitPastBuffer(new Date(v.visitDate))),
    ...completedVisits.filter((v) => user && v.ratings && !v.ratings[user.id])
  ].sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

  // 3. History:
  const historyVisits = completedVisits;

  const isLoading = userLoading || visitsLoading;

  // Get icon for next visit
  const NextIcon = rawNextVisit ? (
    require("@/components/ui/FoodIcons").categoryIcons[rawNextVisit.place.category] || FoodIcon
  ) : FoodIcon;

  if (isLoading) {
    return (
      <div className="min-h-screen pb-20">
        <Header />
        <main className="max-w-lg mx-auto p-4 space-y-8">
          {/* Skeleton Loaders */}
          <section className="animate-pulse">
            <div className="h-6 w-32 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-800 rounded mb-4"></div>
            <div className="h-32 bg-gray-800 rounded-lg border-2 border-gray-700"></div>
          </section>

          <section className="animate-pulse">
            <div className="h-6 w-40 bg-gray-700 rounded mb-4"></div>
            <div className="h-24 bg-gray-800 rounded mb-4"></div>
            <div className="h-24 bg-gray-800 rounded mb-4"></div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <Header />

      <main className="max-w-lg mx-auto p-4 space-y-8">
        {/* === PRÓXIMA PARADA === */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-space font-bold text-purple text-lg">Próxima Parada</h2>
            <PixelHeartAnimated />
          </div>
          <p className="text-sm text-muted mb-4">
            A donde nos quieres llevar, pero llegas temprano porfis 🙏🏼
          </p>


          {!rawNextVisit ? (
            <div className="card-pixel p-8 text-center border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 bg-surface rounded-full flex items-center justify-center text-3xl">
                🗺️
              </div>
              <div className="mb-4">
                <p className="font-space font-bold text-muted">No hay ningún plan todavía</p>
                <p className="text-xs text-muted opacity-80 mt-1">(agregalo andale 🥺)</p>
              </div>
              <div className="sparkle-button-wrapper">
                <span className="sparkle-star sparkle-star-1" style={{ color: "#22d3d1" }}>✦</span>
                <span className="sparkle-star sparkle-star-2" style={{ color: "#22d3d1" }}>✦</span>
                <span className="sparkle-star sparkle-star-3" style={{ color: "#06b6d4" }}>★</span>
                <span className="sparkle-star sparkle-star-4" style={{ color: "#22d3d1" }}>✦</span>
                <button
                  onClick={handleAddPlan}
                  className="btn-pixel text-sm"
                  style={{ background: "#06b6d4", color: "#0f172a" }}
                >
                  + Agregar plan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* PENDING CONFIRMATION CARD */}
              {pendingVisit && user && (
                <PlanStatusCard
                  visit={rawNextVisit}
                  currentUserId={user.id}
                  onConfirm={handleConfirmPlan}
                  onReschedule={() => handleOpenReschedule(
                    rawNextVisit.id,
                    new Date(rawNextVisit.visitDate)
                  )}
                />
              )}

              {/* MAIN PLAN CARD - Only shows if confirmed OR purely for visibility while waiting (optional) */}
              {/* Decision: If pending, keep showing Main Card underneath but dimmed? Or replace? */}
              {/* User preference: "Always one active plan". If waiting, it's effectively active but blocked. */}
              {/* Let's show it but maybe clearly marked as tentative if pending */}

              <div
                onClick={() => {
                  // If pending, clicking might verify details but not "start"
                  if (showMainCard) router.push(`/place/${rawNextVisit.place.id}`);
                }}
                className={`
                        transition-all duration-300 relative group
                        ${showMainCard ? "cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-purple/20 active:scale-[0.98]" : "opacity-80 pointer-events-none grayscale-[0.3]"}
                    `}
              >
                {/* Custom interactive card for Next Visit */}
                <div className={`
                    card-pixel border-2 relative z-10 bg-surface
                    ${showMainCard ? "border-purple/50 group-hover:border-purple" : "border-border border-dashed"}
                `}>
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-purple/10 rounded-lg text-purple border border-purple/20">
                      <NextIcon size={32} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-white group-hover:text-purple transition-colors truncate">
                        {rawNextVisit.place.name}
                      </h3>
                      <p className="text-xs text-muted mt-1 uppercase tracking-wider line-clamp-2">
                        {rawNextVisit.place.address}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-purple font-bold text-sm">
                        <span>{new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(rawNextVisit.visitDate))}</span>
                        {(() => {
                          if (!showMainCard) return <span className="text-[10px] bg-border text-muted px-2 py-0.5 rounded-full">Por confirmar</span>;

                          const visitTime = new Date(rawNextVisit.visitDate).getTime();
                          const now = Date.now();
                          const diffMinutes = (visitTime - now) / (1000 * 60);

                          // Show "¡Es ahora!" only if within 10 minutes BEFORE the visit time (green)
                          if (diffMinutes > 0 && diffMinutes <= 10) {
                            return <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full animate-pulse">¡Es ahora!</span>;
                          } else if (diffMinutes > 10) {
                            // Show time remaining (yellow) - up to 24 hours before
                            const hours = Math.floor(diffMinutes / 60);
                            const mins = Math.floor(diffMinutes % 60);
                            const timeText = hours > 0
                              ? `En ${hours}h ${mins > 0 ? `${mins}m` : ''}`
                              : `En ${mins}m`;
                            return <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full animate-pulse">{timeText}</span>;
                          } else if (diffMinutes <= 0) {
                            // Time has arrived or passed - enjoying the meal (aqua)
                            return <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full animate-pulse">🍽️ Disfrútalo</span>;
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    {showMainCard && (
                      <div className="text-purple opacity-50 group-hover:opacity-100 transition-opacity">
                        &gt;
                      </div>
                    )}
                  </div>
                </div>
                {showMainCard && (
                  <div className="absolute inset-0 bg-purple/20 blur-xl rounded-lg -z-0 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
              </div>

              {/* BLOCKED 'ADD' BUTTON WITH MESSAGE */}
              {/* Since a plan exists (pending or confirmed), we show a disabled add button or just hide it? */}
              {/* User said: "no se puede generar otro plan mientras no se concrete el que esta activo" */}
              {/* So if `rawNextVisit` exists, we probably shouldn't see the Empty State which contains the add button. */}
              {/* The "Empty State" block above only renders `!rawNextVisit`. */}
              {/* So effectively, the add button IS hidden when a plan exists. Logic holds. */}

            </>
          )}
        </section>

        {/* === ¿QUÉ TAL ESTUVO? === */}
        {visitsToRate.length > 0 && (
          <section>
            <h2 className="font-space font-bold text-pink text-lg mb-2">¿Qué tal estuvo?</h2>
            <p className="text-sm text-muted mb-4">
              Ya disfrutamos la comida, tal vez mamonie, pero ya platicamos nuestra calificación, ahora calificalá aquí 😉 📝
            </p>
            <div className="space-y-4">
              {visitsToRate.map((visit) => (
                <PlaceCard
                  key={visit.id}
                  visit={visit}
                  currentUserId={user?.id}
                  onRate={handleRate}
                  users={allUsers}
                />
              ))}
            </div>
          </section>
        )}

        {/* === NUESTRA RUTA === */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-space font-bold text-gold text-lg">Nuestra Ruta del Sabor</h2>
            <PixelHeartAnimated />
          </div>
          <p className="text-sm text-muted mb-4">
            Aquí está lo que ya hemos visitado 😊
          </p>

          {historyVisits.length === 0 ? (
            <div className="p-8 text-center opacity-50">
              <div className="text-4xl mb-2">🍽️</div>
              <p className="text-sm">Aún no han visitado ningún lugar juntos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyVisits.map((visit) => (
                <PlaceCard
                  key={visit.id}
                  visit={visit}
                  currentUserId={user?.id}
                  users={allUsers}
                // blocked by UI usually
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Toast Notification */}
      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }

      <PixelConfetti isActive={showConfetti} />

      {/* Modals */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSubmit={handleRescheduleSubmit}
        currentDate={rescheduleCurrentDate}
      />

    </div >
  );
}
