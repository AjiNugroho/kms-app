import { Activity, Baby, HeartPulse, Ruler, Scale } from "lucide-react"
import { LoginForm } from "./components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col items-center justify-between overflow-hidden bg-linear-to-br from-teal-800 via-emerald-700 to-teal-900 p-10">
        {/* Subtle background circles */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-1/4 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/3" />
        </div>

        {/* Top: logo + name */}
        <div className="relative z-10 self-start">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Baby className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">KMS Digital</span>
          </div>
        </div>

        {/* Center: main content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20">
            <HeartPulse className="h-12 w-12 text-emerald-200" />
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white">
            Pantau Tumbuh
            <br />
            Kembang Anak
          </h1>
          <p className="mt-3 max-w-xs text-emerald-100/80">
            Rekam dan analisis pertumbuhan anak usia 0–5 tahun sesuai standar
            internasional
          </p>

          {/* Growth chart SVG */}
          <div className="my-8 w-full max-w-xs">
            <svg viewBox="0 0 280 140" className="w-full opacity-75">
              {/* Axes */}
              <line
                x1="36"
                y1="16"
                x2="36"
                y2="118"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
              />
              <line
                x1="36"
                y1="118"
                x2="268"
                y2="118"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
              />

              {/* WHO reference band */}
              <path
                d="M 36 100 C 80 92 120 78 160 65 S 240 46 268 40"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="14"
                fill="none"
                strokeLinecap="round"
              />

              {/* Growth line */}
              <path
                d="M 36 105 C 80 95 120 80 160 67 S 240 48 268 42"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* Data points */}
              {(
                [
                  [60, 102],
                  [100, 91],
                  [140, 79],
                  [180, 67],
                  [220, 56],
                  [258, 44],
                ] as [number, number][]
              ).map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4.5"
                  fill="white"
                  fillOpacity="0.9"
                />
              ))}

              {/* Axis labels */}
              <text
                x="152"
                y="136"
                textAnchor="middle"
                fill="rgba(255,255,255,0.55)"
                fontSize="9"
              >
                Usia (bulan)
              </text>
              <text
                x="10"
                y="68"
                textAnchor="middle"
                fill="rgba(255,255,255,0.55)"
                fontSize="9"
                transform="rotate(-90,10,68)"
              >
                BB (kg)
              </text>

              {/* Month markers */}
              {[60, 100, 140, 180, 220, 258].map((x, i) => (
                <g key={x}>
                  <line
                    x1={x}
                    y1="116"
                    x2={x}
                    y2="122"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y="131"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.5)"
                    fontSize="8"
                  >
                    {(i + 1) * 12}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* 3 indicator pills */}
          <div className="flex gap-3">
            {[
              { icon: Scale, label: "Berat Badan" },
              { icon: Ruler, label: "Tinggi Badan" },
              { icon: Activity, label: "Lingkar Kepala" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15 backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-emerald-200" />
                <span className="text-center text-[10px] leading-tight text-emerald-100/80">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: WHO badge */}
        <div className="relative z-10 self-end">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/15 backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-300" />
            <span className="text-xs text-emerald-100">Standar WHO 2006</span>
          </div>
        </div>
      </div>

      {/* ── Right login panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
              <Baby className="h-7 w-7 text-white" />
            </div>
            <span className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              KMS Digital
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Selamat Datang!
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <LoginForm />

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} KMS Digital &middot; Sistem Pemantauan
            Tumbuh Kembang Anak
          </p>
        </div>
      </div>
    </div>
  )
}
