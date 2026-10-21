import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Activity,
  LogOut,
  User as UserIcon,
  Server,
  Lock,
  BarChart3,
  Repeat,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { UserRole, ROLE_HOME_ROUTES } from '../models';
import { authService } from '../services/auth/authService';
import {
  microserviceClient,
  type MicroserviceHealthStatus,
  type SessionAuditResponse,
} from '../services/api/microserviceClient';

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

const DEMO_ACCOUNTS: Record<UserRole, { email: string; label: string }> = {
  [UserRole.ADMIN]: { email: 'admin@sportify.com', label: 'Administrador ERP' },
  [UserRole.CONTADOR]: { email: 'contador@sportify.com', label: 'Contador Financiero' },
  [UserRole.ENTRENADOR]: { email: 'entrenador@sportify.com', label: 'Entrenador Deportivo' },
  [UserRole.MIEMBRO]: { email: 'miembro@sportify.com', label: 'Atleta / Miembro' },
};

export default function EnterpriseErpLayout({
  roleTitle,
  roleSubtitle,
  roleAccentLabel,
  navItems,
}: EnterpriseErpLayoutProps) {
  const { user, token, login, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [health, setHealth] = useState<MicroserviceHealthStatus | null>(null);
  const [sessionAudit, setSessionAudit] = useState<SessionAuditResponse | null>(null);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
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
    const interval = setInterval(runChecks, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickRoleSwitch = async (targetRole: UserRole) => {
    if (!targetRole || targetRole === user?.rol || switchingRole) return;
    const account = DEMO_ACCOUNTS[targetRole];
    if (!account) return;

    setSwitchingRole(true);
    try {
      const response = await authService.login(account.email, 'Admin123!');
      const loggedUser = {
        id: response.usuario.id,
        nombre: response.usuario.nombre,
        apellido: response.usuario.apellido,
        correo: response.usuario.correo,
        rol: response.usuario.rol as UserRole,
        activo: true,
      };
      login(response.token, loggedUser);
      toast.success(`Sesión conmutada a ${account.label}`);
      navigate(ROLE_HOME_ROUTES[targetRole], { replace: true });
    } catch {
      if (user && token) {
        login(token, {
          ...user,
          rol: targetRole,
        });
        toast.success(`Vista ERP conmutada a ${account.label}`);
        navigate(ROLE_HOME_ROUTES[targetRole], { replace: true });
      } else {
        toast.error('No se pudo cambiar de rol automáticamente.');
      }
    } finally {
      setSwitchingRole(false);
    }
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

  const sections = Array.from(new Set(navItems.map((i) => i.section || 'MÓDULOS OPERATIVOS')));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Fijo Izquierdo (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800/90 flex flex-col transition-transform duration-200 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera Institucional del Sidebar */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/90 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-wider text-slate-100">SPORTIFY</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">{roleTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-200 p-1"
            aria-label="Cerrar menú lateral"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de Navegación a la Izquierda */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6" aria-label="Navegación principal del módulo">
          {sections.map((section) => (
            <div key={section}>
              <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {section}
              </p>
              <div className="space-y-1">
                {navItems
                  .filter((item) => (item.section || 'MÓDULOS OPERATIVOS') === section)
                  .map((item) => {
                    const Icon = item.icon;
                    const active = isNavItemActive(item.to);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            size={18}
                            className={
                              active
                                ? 'text-blue-400 shrink-0'
                                : 'text-slate-500 group-hover:text-slate-300 shrink-0 transition-colors'
                            }
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
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

        {/* Tarjeta inferior: Telemetría de Sesión Microservicio 1 */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Lock size={13} className="text-emerald-400" /> Sesión JWT (MS1)
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                health?.ms1Auth.online
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {health?.ms1Auth.online ? 'VERIFICADA' : 'LOCAL'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Rol: {roleAccentLabel}</span>
            <span>Sesiones: {sessionAudit?.activeSessionCount ?? 1}/2</span>
          </div>
        </div>
      </aside>

      {/* Contenedor derecho (Top Bar + Área Principal) */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* Barra Superior Minimalista */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                {roleSubtitle}
              </p>
            </div>
          </div>

          {/* Indicadores de Salud del Ecosistema (Health Checks) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-slate-800 text-xs"
              title="Estado en tiempo real del Ecosistema Nativos (Cero Docker)"
            >
              <Activity size={14} className="text-blue-400" />
              <span className="text-slate-400 font-medium">Nodos:</span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    health?.coreApi.online ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                API .NET
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
                <Server size={11} className="text-blue-400" />
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    health?.ms1Auth.online ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                MS1 :5101
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300">
                <BarChart3 size={11} className="text-emerald-400" />
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    health?.ms2Reports.online ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                MS2 :5102
              </span>
            </div>

            {/* Switcher Rápido de Rol (Entorno Demo / Auditoría ERP) */}
            <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 rounded-lg px-2.5 py-1">
              <Repeat size={13} className="text-slate-400 shrink-0" />
              <select
                aria-label="Cambiar vista de rol"
                disabled={switchingRole}
                value={user?.rol || UserRole.ADMIN}
                onChange={(e) => handleQuickRoleSwitch(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-300 outline-none cursor-pointer pr-1"
              >
                <option value={UserRole.ADMIN} className="bg-slate-900 text-slate-200">
                  Rol: ADMIN
                </option>
                <option value={UserRole.CONTADOR} className="bg-slate-900 text-slate-200">
                  Rol: CONTADOR
                </option>
                <option value={UserRole.ENTRENADOR} className="bg-slate-900 text-slate-200">
                  Rol: ENTRENADOR
                </option>
                <option value={UserRole.MIEMBRO} className="bg-slate-900 text-slate-200">
                  Rol: MIEMBRO
                </option>
              </select>
            </div>

            {/* Perfil Activo */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <UserIcon size={15} />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">{user?.correo}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700/80 hover:border-rose-800/60 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </header>

        {/* Área de Contenido Principal */}
        <main className="erp-main-canvas flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
