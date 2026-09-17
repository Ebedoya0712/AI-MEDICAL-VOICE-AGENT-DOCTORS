import React from "react";
import AIConsultationCard from "@/components/ai/AIConsultationCard";
import { PageHeader } from "@/components/page-header";
import { Stethoscope } from "lucide-react";

export const metadata = {
    title: "AI Medical Consultation | Medimeet",
    description: "Consult with our AI medical assistant for initial triage and specialist recommendations.",
};

export default function AIConsultationPage() {
    return (
        <div className="container mx-auto px-4 py-4 md:py-6 max-w-5xl">
            <div className="mb-4">
                <PageHeader
                    icon={<Stethoscope className="text-emerald-400" />}
                    title="AI Medical Assistant"
                    backLink="/doctors"
                    backLabel="Back to Doctors"
                />
            </div>

            <div className="relative">
                {/* Decorative Background Glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <AIConsultationCard />
            </div>

            <div className="mt-10 py-8 border-t border-emerald-500/10">
                <div className="text-center max-w-2xl mx-auto space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-500/60">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="group">
                            <div className="bg-slate-900 shadow-xl w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">1</div>
                            <p className="text-slate-200 text-xs font-semibold uppercase tracking-wider mb-2">Initialize</p>
                            <p className="text-slate-400 text-[13px] leading-relaxed">Start the call to begin your secure session</p>
                        </div>
                        <div className="group">
                            <div className="bg-slate-900 shadow-xl w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">2</div>
                            <p className="text-slate-200 text-xs font-semibold uppercase tracking-wider mb-2">Speak</p>
                            <p className="text-slate-400 text-[13px] leading-relaxed">Discuss your symptoms naturally with the AI</p>
                        </div>
                        <div className="group">
                            <div className="bg-slate-900 shadow-xl w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">3</div>
                            <p className="text-slate-200 text-xs font-semibold uppercase tracking-wider mb-2">Match</p>
                            <p className="text-slate-400 text-[13px] leading-relaxed">Get a triage report and specialist recommendation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
