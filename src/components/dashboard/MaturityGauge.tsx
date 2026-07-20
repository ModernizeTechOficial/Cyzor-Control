import React from "react";
import { motion } from "motion/react";

interface MaturityGaugeProps {
  progress: number;
  score: number;
  level: number;
}

export function MaturityGauge({
  progress,
  score,
  level,
}: MaturityGaugeProps) {
  const radius = 92;
  const stroke = 12;

  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

  const getStatus = () => {
    if (progress < 25)
      return {
        title: "Inicial",
        color: "#ef4444",
        description: "Estrutura empresarial em formação",
      };

    if (progress < 50)
      return {
        title: "Crescimento",
        color: "#f59e0b",
        description: "A empresa está evoluindo",
      };

    if (progress < 75)
      return {
        title: "Consolidada",
        color: "#3b82f6",
        description: "Boa maturidade operacional",
      };

    return {
      title: "Alta Performance",
      color: "#10b981",
      description: "Empresa altamente estruturada",
    };
  };

  const status = getStatus();

  return (
    <div className="relative w-full">

      <div className="relative rounded-3xl border border-slate-200 bg-white p-8 shadow-sm overflow-hidden">

        {/* Background */}

        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -top-32 -right-32 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-72 h-72 rounded-full bg-indigo-500 blur-3xl" />
        </div>

        {/* Header */}

        <div className="relative flex items-center justify-between mb-8">

          <div>

            <div className="text-xs font-semibold tracking-[0.35em] uppercase text-slate-400">
              Business Evolution Score
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              BES da Empresa
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Evolução baseada em todos os módulos da plataforma.
            </p>

          </div>

          <div
            className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
            style={{
              backgroundColor: `${status.color}15`,
              color: status.color,
            }}
          >
            {status.title}
          </div>

        </div>

        {/* Gauge */}

        <div className="flex items-center justify-center">

          <div className="relative w-[260px] h-[260px]">

            {/* Glow */}

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.25, 0.4, 0.25],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: status.color,
              }}
            />

            <svg
              width={260}
              height={260}
              className="-rotate-90"
            >
              <defs>

                <linearGradient
                  id="cyzorGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={status.color} />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>

              </defs>

              <circle
                cx={130}
                cy={130}
                r={normalizedRadius}
                fill="transparent"
                stroke="#edf2f7"
                strokeWidth={stroke}
              />

              <motion.circle
                cx={130}
                cy={130}
                r={normalizedRadius}
                fill="transparent"
                stroke="url(#cyzorGradient)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference}
                animate={{
                  strokeDashoffset,
                }}
                transition={{
                  duration: 1.8,
                  ease: "easeOut",
                }}
              />

            </svg>

            {/* Centro */}

            <div className="absolute inset-0 flex items-center justify-center">

              <div className="w-40 h-40 rounded-full bg-white border border-slate-200 shadow-xl flex flex-col items-center justify-center backdrop-blur">

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="text-5xl font-black tracking-tight text-slate-900">
                    {progress}%
                  </div>

                  <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400 text-center mt-2">
                    Maturidade
                  </div>

                  <div
                    className="mt-4 rounded-full px-3 py-1 text-xs font-bold"
                    style={{
                      background: `${status.color}15`,
                      color: status.color,
                    }}
                  >
                    Nível {level}
                  </div>

                </motion.div>

              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="grid grid-cols-3 gap-5 mt-10">

          <div className="rounded-2xl border border-slate-200 p-5">

            <div className="text-xs uppercase tracking-widest text-slate-400">
              BES Score
            </div>

            <div className="mt-2 text-3xl font-bold">
              {score}
            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 p-5">

            <div className="text-xs uppercase tracking-widest text-slate-400">
              Status
            </div>

            <div
              className="mt-2 font-semibold"
              style={{ color: status.color }}
            >
              {status.title}
            </div>

            <div className="text-sm text-slate-500 mt-1">
              {status.description}
            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 p-5">

            <div className="text-xs uppercase tracking-widest text-slate-400">
              Próxima Meta
            </div>

            <div className="mt-2 font-semibold text-slate-900">
              Evoluir para o Nível {level + 1}
            </div>

            <div className="text-sm text-slate-500 mt-1">
              Continue desenvolvendo os módulos da empresa.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}