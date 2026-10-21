import {
  CreditCard,
  PlusCircle,
  Users,
  BarChart3,
  UserCheck,
} from 'lucide-react';
import EnterpriseErpLayout, { type ErpNavItem } from '../EnterpriseErpLayout';

const ACCOUNTANT_NAV_ITEMS: ErpNavItem[] = [
  {
    label: 'Auditoría de Pagos',
    to: '/accountant/dashboard?tab=pagos',
    icon: CreditCard,
    section: 'TESORERÍA Y RECAUDO',
  },
  {
    label: 'Registrar Pago Manual',
    to: '/accountant/dashboard?tab=manual',
    icon: PlusCircle,
    section: 'TESORERÍA Y RECAUDO',
  },
  {
    label: 'Gestión de Membresías',
    to: '/accountant/dashboard?tab=membresias',
    icon: Users,
    section: 'TESORERÍA Y RECAUDO',
  },
  {
    label: 'Analítica Financiera (MS2)',
    to: '/accountant/dashboard?tab=analitica',
    icon: BarChart3,
    section: 'REPORTES Y AUDITORÍA',
    badge: 'MS2',
  },
  {
    label: 'Mi Perfil Contable',
    to: '/accountant/dashboard?tab=perfil',
    icon: UserCheck,
    section: 'CUENTA',
  },
];

export default function AccountantLayout() {
  return (
    <EnterpriseErpLayout
      roleTitle="Módulo Contable"
      roleSubtitle="Tesorería, Conciliación de Comprobantes y Reportes Financieros"
      roleAccentLabel="CONTADOR"
      navItems={ACCOUNTANT_NAV_ITEMS}
    />
  );
}
