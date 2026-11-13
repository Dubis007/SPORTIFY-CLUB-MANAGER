import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  LogOut,
  User as UserIcon,
  Server,
  Lock,
  BarChart3,
  Menu,
  X,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../models';
import {
  microserviceClient,
  type MicroserviceHealthStatus,
  type SessionAuditResponse,
} from '../services/api/microserviceClient';
// Se importa como recurso del código: si el archivo falta, la compilación falla en lugar de mostrar un logo roto
import sportifyLogo from '../assets/sportify-logo.svg';

export interface ErpNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  section?: string;
  badge?: string;
}

interface EnterpriseErpLayoutProps {
  roleTitle: string;
  roleSubtitle: string;
  roleAccentLabel: string;
  navItems: ErpNavItem[];
}

export default function EnterpriseErpLayout({
  roleTitle,
  roleSubtitle,
  roleAccentLabel,
  navItems,
}: EnterpriseErpLayoutProps) {
  const { user, token, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.rol === UserRole.ADMIN || roleAccentLabel === 'ADMIN';

  const [health, setHealth] = useState<MicroserviceHealthStatus | null>(null);
  const [sessionAudit, setSessionAudit] = useState<SessionAuditResponse | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    let mounted = true;

    const runChecks = async () => {
      const status = await microserviceClient.checkEcosystemHealth();
      if (mounted) setHealth(status);

      if (user && token) {
        const audit = await microserviceClient.auditSession({
          userId: String(user.id),
          email: user.correo,
          role: user.rol,
          token,
        });
        if (mounted && audit) setSessionAudit(audit);
      }
    };

    runChecks();
    const interval = setInterval(runChecks, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isAdmin, user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isNavItemActive = (itemTo: string) => {
    const [targetPath, targetSearch] = itemTo.split('?');
    if (location.pathname !== targetPath) return false;

    if (targetSearch) {
      const currentTab = new URLSearchParams(location.search).get('tab');
      const targetTab = new URLSearchParams(targetSearch).get('tab');
      if (!currentTab) {
        return navItems[0]?.to === itemTo;
      }
      return currentTab === targetTab;
    }

    return true;
  };

  const sections = Array.from(new Set(navItems.map((i) => i.section || 'MENÚ PRINCIPAL')));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Enlace de salto al contenido principal para teclado y lectores de pantalla (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-blue-600 focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      {/* Backdrop móvil para cerrar menú cómodamente */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Cerrar fondo de menú"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Fijo Izquierdo */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/90 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera Institucional del Sidebar */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/90 bg-slate-950/40">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <img
                src={sportifyLogo}
                alt="Logotipo institucional de Sportify Club"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm tracking-wider text-slate-100 block truncate">
                SPORTIFY CLUB
              </span>
              <p className="text-[11px] text-slate-300 font-medium truncate">{roleTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-300 hover:text-slate-100 p-1 rounded-lg"
            aria-label="Cerrar menú lateral"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navegación independiente centrada en el rol */}
        <nav
          className="flex-1 overflow-y-auto py-5 px-3 space-y-6"
          aria-label="Navegación principal del módulo"
        >
          {sections.map((section) => (
            <div key={section}>
              <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {section}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter((item) => (item.section || 'MENÚ PRINCIPAL') === section)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        aria-current={active ? 'page' : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-blue-600/15 text-blue-300 border-l-2 border-blue-500 shadow-sm'
                            : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            size={18}
                            aria-hidden="true"
                            className={
                              active
                                ? 'text-blue-400 shrink-0'
                                : 'text-slate-400 group-hover:text-slate-200 shrink-0 transition-colors'
                            }
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Pie del Sidebar: Telemetría técnica solo para ADMIN; estado limpio para los demás roles */}
        {isAdmin ? (
          <div
            data-testid="admin-session-telemetry"
            className="p-3.5 m-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Lock size={13} className="text-emerald-400" aria-hidden="true" /> Control de Sesión
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  health?.ms1Auth.online
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                }`}
              >
                {health?.ms1Auth.online ? 'VERIFICADA' : 'ACTIVA'}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 flex items-center justify-between">
              <span>Perfil: {roleAccentLabel}</span>
              <span>Sesiones: {sessionAudit?.activeSessionCount ?? 1}/2</span>
            </div>
          </div>
        ) : (
          <div className="p-3.5 m-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium truncate">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
              Sesión activa
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold uppercase">
              {roleAccentLabel}
            </span>
          </div>
        )}
      </aside>

      {/* Contenedor derecho (Top Bar + Área Principal) */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Barra Superior Limpia y Centrada en el Usuario */}
        <header className="sticky top-0 z-20 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-slate-100 hover:bg-slate-800"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-300 truncate">
                {roleSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {/* Estado de servicios únicamente para Administrador */}
            {isAdmin && (
              <div
                data-testid="admin-nodes-health"
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs"
                title="Estado de servicios del sistema"
              >
                <Activity size={14} className="text-blue-400" aria-hidden="true" />
                <span className="text-slate-300 font-medium">Servicios:</span>

                <span
                  aria-label={`Core API: ${health?.coreApi.online ? 'En línea' : 'Fuera de línea'}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200"
                >
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full ${
                      health?.coreApi.online ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  Core API
                  <span className="sr-only">
                    {health?.coreApi.online ? '(En línea)' : '(Fuera de línea)'}
                  </span>
                </span>

                <span
                  aria-label={`Servicio Auth: ${health?.ms1Auth.online ? 'En línea' : 'Fuera de línea'}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200"
                >
                  <Server size={11} className="text-blue-400" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full ${
                      health?.ms1Auth.online ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  Auth
                  <span className="sr-only">
                    {health?.ms1Auth.online ? '(En línea)' : '(Fuera de línea)'}
                  </span>
                </span>

                <span
                  aria-label={`Servicio Reportes: ${health?.ms2Reports.online ? 'En línea' : 'Fuera de línea'}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-200"
                >
                  <BarChart3 size={11} className="text-emerald-400" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className={`w-1.5 h-1.5 rounded-full ${
                      health?.ms2Reports.online ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  Reportes
                  <span className="sr-only">
                    {health?.ms2Reports.online ? '(En línea)' : '(Fuera de línea)'}
                  </span>
                </span>
              </div>
            )}

            {/* Identidad del Usuario Activo + Cerrar Sesión */}
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                <UserIcon size={15} aria-hidden="true" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-100 leading-tight">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-[11px] text-slate-300 leading-tight">{user?.correo}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-rose-950/60 text-slate-200 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/60 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={14} aria-hidden="true" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        {/* Área de Contenido Principal */}
        <main
          id="main-content"
          tabIndex={-1}
          className="erp-main-canvas flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto focus:outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
