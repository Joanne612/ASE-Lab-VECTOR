"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { register } from "@/app/actions/auth";
import FieldError from "@/components/FieldError";
import { useToday } from "@/lib/use-today";

const PANEL_TOP = "363px";
const COLUMN = "mx-auto h-full w-full max-w-[480px] sm:max-w-[560px] md:max-w-[640px]";

/* LAYER 1 — BACKGROUND */
function BackgroundLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#F1E9E8]">
      {/* fade out ke bawah */}
      <div
        className="absolute left-0 right-0 top-0 h-[400px]"
        style={{
          backgroundImage: `url(/login-mobile-atas.webp)`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
          WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
        }}
      />

      {/* fade di atas dan kiri */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[320px]"
        style={{
          backgroundImage: `url(/login-mobile-bawah.webp)`,
          backgroundSize: "70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          opacity: 0.2,
          WebkitMaskImage:
            "linear-gradient(to top, #000 50%, transparent 100%), linear-gradient(to left, #000 50%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskImage:
            "linear-gradient(to top, #000 50%, transparent 100%), linear-gradient(to left, #000 50%, transparent 100%)",
          maskComposite: "intersect",
        }}
      />
    </div>
  );
}

/* LAYER 2 — PANEL PUTIH */
function PanelLayer() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      <div className={`relative ${COLUMN}`}>
        <div
          style={{ top: PANEL_TOP }}
          className="absolute inset-x-0 bottom-0 rounded-t-[30px] bg-white/80 shadow-[0_-5px_30px_rgba(90,80,120,0.06)] backdrop-blur-xl sm:rounded-[30px]"
        />
        <div className="absolute bottom-0 left-0 right-0 h-[320px]" style={{
          backgroundImage : `url(/login-mobile-bawah.webp)`,
          backgroundSize: "70%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom right",
          opacity: 0.2,
        }}></div>
      </div>
    </div>
  );
}

/* LAYER 3 — TULISAN & TOMBOL */
const INPUT_CLASS =
  "h-[49px] w-full rounded-[10px] border border-white/40 bg-[#DDE6F5]/15 px-3 text-[16px] text-[#6A6E79] shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_-2px_6px_rgba(255,255,255,0.6),inset_0_2px_8px_rgba(154,168,189,0.2)] outline-none backdrop-blur-[10px] placeholder:text-[#6A6E79]/50 sm:px-4";

function TextLayer() {
  const [showPassword, setShowPassword] = useState(false);
  // Register berjalan di Server Action; kalau berhasil user langsung masuk ke /homepage.
  const [state, formAction, pending] = useActionState(register, undefined);
  const today = useToday();
  const errors = state?.fieldErrors;

  return (
    <div className="relative z-20 min-h-screen">
      <div className={`${COLUMN} flex flex-col px-4 sm:px-6 md:px-8`}>
        {/* Heading */}
        <header style={{ height: PANEL_TOP }} className="flex shrink-0 flex-col justify-end pb-9 text-right">
          <h1 className="text-[26px] font-bold leading-tight tracking-[-0.5px] text-[#6A6E79] sm:text-[30px]">
            Impian besar, mulai dari sini.
          </h1>
          <p className="mt-1 text-[18px] leading-tight text-[#6A6E79] sm:text-[19px]">
            Atur uangmu, capai tujuanmu!
          </p>
        </header>

        {/* Card */}
        <section className="pb-10 pt-7">
          <h2 className="text-[23px] font-bold tracking-[-0.3px] text-[#686B78] sm:text-[25px]">
            Yuk, mulai perjalananmu!
          </h2>

          {/* Form */}
          <form className="mt-5 space-y-3" action={formAction}>
            <div>
              <input
                type="text"
                name="username"
                autoComplete="username"
                defaultValue={state?.values?.username}
                placeholder="Nama panggilan"
                aria-label="Nama panggilan"
                aria-invalid={Boolean(errors?.username)}
                aria-describedby="register-username-hint"
                required
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_]+"
                title="3–30 karakter: huruf, angka, atau garis bawah (_), tanpa spasi"
                className={INPUT_CLASS}
              />
              {errors?.username ? (
                <FieldError id="register-username-hint" messages={errors.username} />
              ) : (
                <p id="register-username-hint" className="mt-1 px-1 text-[13px] text-[#6A6E79]/70">
                  3–30 karakter: huruf, angka, atau _ (tanpa spasi)
                </p>
              )}
            </div>

            <div>
              <input
                type="email"
                name="email"
                autoComplete="email"
                defaultValue={state?.values?.email}
                placeholder="Email"
                aria-label="Email"
                aria-invalid={Boolean(errors?.email)}
                aria-describedby="register-email-error"
                required
                className={INPUT_CLASS}
              />
              <FieldError id="register-email-error" messages={errors?.email} />
            </div>

            {/* Kata sandi */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Kata sandi (min. 8 karakter)"
                aria-label="Kata sandi"
                aria-invalid={Boolean(errors?.password)}
                aria-describedby="register-password-error"
                required
                minLength={8}
                maxLength={128}
                className={`${INPUT_CLASS} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#B6B6C0] transition hover:bg-gray-100">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.99 0 1.953-.138 2.86-.396M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 01-4.293 5.142M6.228 6.228L3 3m3.228 3.228l3.37 3.37m0 0a3 3 0 104.243 4.243m-4.243-4.243L3 3m3.228 3.228l3.37 3.37m6.598 6.598L21 21" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            <FieldError id="register-password-error" messages={errors?.password} />

            <div>
              <input
                type="date"
                name="dateOfBirth"
                defaultValue={state?.values?.dateOfBirth}
                // Tanggal lokal; toISOString() memakai UTC dan bisa bergeser sehari.
                max={today ?? undefined}
                aria-label="Tanggal lahir"
                aria-invalid={Boolean(errors?.dateOfBirth)}
                aria-describedby="register-dob-error"
                required
                className={INPUT_CLASS}
              />
              <FieldError id="register-dob-error" messages={errors?.dateOfBirth} />
            </div>

            {state?.message ? (
              <p role="alert" className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {state.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="mt-5 h-[49px] w-full rounded-full border border-white/30 bg-[#9D86C4] text-[18px] font-medium text-white shadow-[0_8px_20px_rgba(110,90,160,0.25),inset_0_0_12px_rgba(255,255,255,0.35)] [text-shadow:0_0_8px_rgba(255,255,255,0.6)] transition hover:brightness-75 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[53px]"
            >
              {pending ? "Memproses..." : "Buat akun"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#C9C9CF]" />
            <span className="text-[18px] text-[#9B9BA5]">Atau</span>
            <div className="h-px flex-1 bg-[#C9C9CF]" />
          </div>

          {/* Social login */}
          <div className="flex items-center justify-center gap-9 sm:gap-12">
            <svg viewBox="0 0 24 24" fill="#9697A0" className="h-6 w-6">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <svg viewBox="0 0 24 24" fill="#9697A0" className="h-6 w-6">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
            </svg>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9697A0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.6" fill="#9697A0" />
            </svg>
            <svg viewBox="0 0 24 24" fill="#9697A0" className="h-6 w-6">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
            </svg>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[16px] text-[#9B9BA5]">Sudah punya akun?</p>
            <Link href="/" className="mt-1 inline-block text-[16px] font-medium text-[#C7A3E9] hover:text-[#7A53B1] transition">
              Masuk sekarang
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-r from-[#E1DCE3] to-[#F1E9E8]">
      <BackgroundLayer />
      <PanelLayer />
      <TextLayer />
    </main>
  );
}