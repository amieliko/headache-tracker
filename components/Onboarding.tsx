"use client";

interface OnboardingProps {
  onDismiss: () => void;
}

export function Onboarding({ onDismiss }: OnboardingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-bg/90">
      <div className="w-full max-w-sm bg-bg2 border border-line rounded-2xl p-6
                      animate-[fadeInUp_0.3s_ease-out]">
        <h2 className="font-display text-xl text-text mb-3">
          Your headache tracker
        </h2>
        <div className="space-y-3 text-sm text-muted leading-relaxed">
          <p>
            Tap the orb the moment a headache starts. Tap again when it lifts.
            That&apos;s it.
          </p>
          <p>
            Log pain levels, meds, water, and coffee along the way.
            Everything stays on your device and syncs quietly.
          </p>
          <p>
            Over time, patterns will emerge that you can share with your doctor.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="mt-6 w-full py-3 rounded-full bg-glow/10 border border-glow/20
                     text-glow text-sm transition-all duration-150 active:scale-95
                     hover:bg-glow/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-glow/50"
        >
          got it
        </button>
      </div>
    </div>
  );
}
