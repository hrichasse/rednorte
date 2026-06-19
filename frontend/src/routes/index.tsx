import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  Users,
  RefreshCw,
  Shield,
  TrendingDown,
  ClipboardList,
  Search,
  Bell,
  Stethoscope,
  BarChart3,
  Activity,
  Lock,
  Zap,
  Database,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RedNorte — Gestión de Lista de Espera Médica" },
      {
        name: "description",
        content:
          "Portal digital del Servicio Público de Salud RedNorte. Consulta tu posición en lista de espera médica en el Norte de Chile.",
      },
      {
        property: "og:title",
        content: "RedNorte — Gestión de Lista de Espera Médica",
      },
      {
        property: "og:description",
        content: "Servicio Público de Salud RedNorte — Norte de Chile",
      },
    ],
  }),
  component: LandingPage,
});

/* ---------- Interactive axons hero canvas ---------- */

function AxonsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef<{ x: number; y: number; active: boolean }>({
    x: -1000,
    y: -1000,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: P[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(110, Math.floor((width * height) / 12000));
      nodes = Array.from({ length: density }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onLeave = () => {
      mouse.current.active = false;
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // background subtle gradient overlay handled by parent; canvas is transparent
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const mActive = mouse.current.active;

      // update positions, mouse repulsion / attraction
      for (const n of nodes) {
        if (mActive) {
          const dx = n.x - mx;
          const dy = n.y - my;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140 && d2 > 0.01) {
            const f = (140 - Math.sqrt(d2)) / 140;
            n.vx += (dx / Math.sqrt(d2)) * f * 0.25;
            n.vy += (dy / Math.sqrt(d2)) * f * 0.25;
          }
        }
        n.vx *= 0.97;
        n.vy *= 0.97;
        // keep a baseline drift
        if (Math.abs(n.vx) < 0.15) n.vx += (Math.random() - 0.5) * 0.05;
        if (Math.abs(n.vy) < 0.15) n.vy += (Math.random() - 0.5) * 0.05;

        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0) {
          n.x = 0;
          n.vx *= -1;
        }
        if (n.x > width) {
          n.x = width;
          n.vx *= -1;
        }
        if (n.y < 0) {
          n.y = 0;
          n.vy *= -1;
        }
        if (n.y > height) {
          n.y = height;
          n.vy *= -1;
        }
      }

      // draw connections (axons)
      const maxDist = 130;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i],
            b = nodes[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.55;
            // glow stronger near mouse
            let highlight = 0;
            if (mActive) {
              const mxd = (a.x + b.x) / 2 - mx;
              const myd = (a.y + b.y) / 2 - my;
              const md = Math.sqrt(mxd * mxd + myd * myd);
              if (md < 160) highlight = (1 - md / 160) * 0.7;
            }
            ctx.strokeStyle = `rgba(${Math.round(0 + highlight * 100)}, ${Math.round(180 + highlight * 60)}, ${Math.round(200 + highlight * 55)}, ${alpha})`;
            ctx.lineWidth = 0.6 + highlight * 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw nodes
      for (const n of nodes) {
        let glow = 0;
        if (mActive) {
          const dx = n.x - mx,
            dy = n.y - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) glow = 1 - d / 160;
        }
        ctx.beginPath();
        ctx.fillStyle = `rgba(144, 220, 235, ${0.7 + glow * 0.3})`;
        ctx.arc(n.x, n.y, n.r + glow * 1.6, 0, Math.PI * 2);
        ctx.fill();
        if (glow > 0.2) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(0, 200, 220, ${glow * 0.18})`;
          ctx.arc(n.x, n.y, 10 + glow * 14, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050B1A] text-white">
      {/* Top nav */}
      <header className="relative z-20 border-b border-white/10 bg-[#050B1A]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img
              src="/images/isotipo_minsal.jpg"
              alt="RedNorte"
              className="h-9 w-9 rounded-lg object-cover shadow-[0_0_20px_rgba(0,131,143,0.6)]"
            />
            <span className="text-lg font-bold tracking-tight">RedNorte</span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium text-white/70 md:flex">
            <a href="#como-funciona" className="transition hover:text-white">
              ¿Cómo funciona?
            </a>
            <a href="#para-quien" className="transition hover:text-white">
              ¿Para quién es?
            </a>
            <a href="#caracteristicas" className="transition hover:text-white">
              Características
            </a>
            <Link to="/login" className="transition hover:text-white">
              Funcionarios
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero with interactive axons */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0F2D5A_0%,#050B1A_70%)]" />
        <AxonsCanvas />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#050B1A]" />

        <div className="relative mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1.5 text-xs font-semibold text-[#7FE7F0] backdrop-blur">
            <Shield className="h-3.5 w-3.5" />
            SERVICIO PÚBLICO DE SALUD · NORTE DE CHILE
          </div>
          <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Gestiona tu posición en
            <br />
            <span className="bg-gradient-to-r from-[#7FE7F0] via-[#00C8DC] to-[#00838F] bg-clip-text text-transparent">
              lista de espera médica
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Portal digital del Servicio Público de Salud RedNorte — Norte de
            Chile. Consulta tu estado, recibe notificaciones y conoce tu
            posición actual.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/portal"
              className="group inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,131,143,0.5)] transition hover:bg-teal/90 hover:shadow-[0_0_40px_rgba(0,200,220,0.7)]"
            >
              <Search className="h-4 w-4" />
              Consultar mi estado
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              Acceso funcionarios
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 text-sm text-white/70 sm:grid-cols-3">
            <div>
              <span className="font-bold text-white">42.000</span> pacientes en
              seguimiento
            </div>
            <div>
              <span className="font-bold text-white">16</span> establecimientos
            </div>
            <div>
              Meta: reducir tiempos{" "}
              <span className="font-bold text-white">30%</span>
            </div>
          </div>
          <p className="mt-6 text-[11px] uppercase tracking-widest text-white/40">
            Mueve el cursor sobre la red para interactuar
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-[#070F22] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Users,
                value: "42.000",
                label: "Pacientes en seguimiento activo",
                color: "text-[#7FE7F0]",
              },
              {
                icon: RefreshCw,
                value: "12–18%",
                label: "Cupos recuperados automáticamente",
                color: "text-teal",
              },
              {
                icon: Shield,
                value: "99,5%",
                label: "Disponibilidad del sistema",
                color: "text-[#86EFAC]",
              },
              {
                icon: TrendingDown,
                value: "30%",
                label: "Reducción de tiempos de espera (meta)",
                color: "text-[#FDBA74]",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-teal/40 hover:bg-white/[0.07] hover:shadow-[0_0_30px_rgba(0,131,143,0.25)]"
              >
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 ${s.color}`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="mt-1 text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="bg-[#050B1A] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Tecnología al servicio de la salud pública
            </h2>
            <p className="mt-3 text-white/60">
              Una plataforma robusta, segura y diseñada para la red asistencial
              chilena.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Activity,
                title: "Datos en tiempo real",
                desc: "KPIs y métricas actualizados al instante en todos los establecimientos.",
              },
              {
                icon: Zap,
                title: "Reasignación automática",
                desc: "Algoritmo de priorización clínica que recupera cupos cancelados.",
              },
              {
                icon: Lock,
                title: "Seguridad nivel hospital",
                desc: "Datos cifrados y cumplimiento de normativa MINSAL.",
              },
              {
                icon: Database,
                title: "Integración SIDRA",
                desc: "Compatible con sistemas existentes del sector salud.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 transition hover:border-teal/40"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-teal/10 text-teal">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="bg-[#070F22] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              ¿Cómo funciona?
            </h2>
            <p className="mt-3 text-white/60">
              Tres pasos simples para conocer tu estado en la lista de espera.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                n: "1",
                icon: ClipboardList,
                title: "Tu médico te deriva",
                desc: "El médico genera la derivación y el sistema te registra automáticamente en la lista de espera.",
              },
              {
                n: "2",
                icon: Search,
                title: "Consulta tu estado",
                desc: "Ingresa con tu RUT y código de derivación para ver tu posición actual en la lista.",
              },
              {
                n: "3",
                icon: Bell,
                title: "Recibe notificaciones",
                desc: "Te avisamos cuando tu cita esté disponible o cuando se libere un cupo cancelado.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-teal/40"
              >
                <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-teal text-sm font-bold text-white shadow-[0_0_20px_rgba(0,131,143,0.6)]">
                  {s.n}
                </div>
                <s.icon className="mb-4 h-8 w-8 text-teal" />
                <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-white/60">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For who */}
      <section id="para-quien" className="bg-[#050B1A] py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              ¿Para quién es?
            </h2>
            <p className="mt-3 text-white/60">
              Una plataforma diseñada para pacientes, equipos clínicos y
              dirección.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Pacientes",
                items: [
                  "Consulta de estado en línea",
                  "Notificaciones de citas",
                  "Actualización de datos de contacto",
                ],
              },
              {
                icon: Stethoscope,
                title: "Personal médico",
                items: [
                  "Priorización clínica automática",
                  "Dashboard de carga de pacientes",
                  "Historial de derivaciones integrado",
                ],
              },
              {
                icon: BarChart3,
                title: "Dirección",
                items: [
                  "KPIs en tiempo real",
                  "Reportes para MINSAL",
                  "Gestión de toda la red de establecimientos",
                ],
              },
            ].map((g) => (
              <div
                key={g.title}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition hover:border-teal/50 hover:shadow-[0_0_40px_rgba(0,131,143,0.2)]"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal text-white shadow-[0_0_20px_rgba(0,131,143,0.5)]">
                  <g.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-white">{g.title}</h3>
                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {g.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#0F2D5A] via-[#0B1E3F] to-[#0F2D5A] py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            ¿Tienes una derivación médica?
          </h2>
          <p className="mt-3 text-white/70">
            Consulta tu estado en segundos con tu RUT y código de derivación.
          </p>
          <Link
            to="/portal"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(0,131,143,0.5)] transition hover:bg-teal/90"
          >
            <Search className="h-4 w-4" /> Consultar mi estado
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030712] py-10 text-center text-sm text-white/60">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-2 flex items-center justify-center gap-2">
            <img
              src="/images/isotipo_minsal.jpg"
              alt="RedNorte"
              className="h-5 w-5 rounded object-cover"
            />
            <span className="font-bold text-white">RedNorte</span>
          </div>
          <p>RedNorte © 2026 — Servicio Público de Salud — Norte de Chile</p>
          <p className="mt-1 text-xs text-white/40">
            Desarrollado por Hernan Richasse y Cristian Velásquez — GPY1101
            DuocUC
          </p>
        </div>
      </footer>
    </div>
  );
}
