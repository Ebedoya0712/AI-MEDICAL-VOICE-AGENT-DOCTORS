import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/specialities";
import { Stethoscope } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default async function DoctorsPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Find Your Doctor</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Browse by specialty or consult our AI medical assistant for a quick triage and recommendation.
        </p>
      </div>

      {/* AI Doctor CTA */}
      <div className="mb-12">
        <Link href="/ai-consultation">
          <Card className="bg-gradient-to-br from-emerald-900/60 via-emerald-950/40 to-slate-950 border-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden group shadow-2xl">
            <CardContent className="p-0 flex flex-col md:flex-row items-stretch">
              <div className="w-full md:w-1/3 min-h-[240px] relative">
                <Image
                  src="/ai-doctor.png"
                  alt="AI Doctor"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-emerald-950/80 via-transparent to-transparent"></div>
              </div>
              <div className="p-8 md:p-10 flex-1 flex flex-col justify-center text-center md:text-left relative z-10">
                <div className="flex justify-center md:justify-start">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4 px-3 py-1 text-[10px] uppercase tracking-widest font-bold">New Feature</Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">Speak with Dr. AI Assistant</h2>
                <p className="text-emerald-100/60 mb-8 max-w-lg leading-relaxed text-sm md:text-base">
                  Get instant medical triage, symptom analysis, and specialist recommendations using our voice-powered AI. Experience the future of medical diagnostics.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-400 font-bold text-sm tracking-wide group-hover:gap-5 transition-all">
                  CONSULT NOW <div className="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] p-2 rounded-full text-white"><Stethoscope className="h-5 w-5" /></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SPECIALTIES.map((specialty) => (
          <Link key={specialty.name} href={`/doctors/${specialty.name}`}>
            <Card className="hover:border-emerald-700/40 transition-all cursor-pointer border-emerald-900/20 h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mb-4">
                  <div className="text-emerald-400">{specialty.icon}</div>
                </div>
                <h3 className="font-medium text-white">{specialty.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
