import {
  CreditCard,
  Activity,
  User,
} from 'lucide-react';
import EnterpriseErpLayout, { type ErpNavItem } from '../EnterpriseErpLayout';

const MEMBER_NAV_ITEMS: ErpNavItem[] = [
  {
    label: 'Membresías y Pagos',
    to: '/member/dashboard?tab=membresias',
    icon: CreditCard,
    section: 'PORTAL DEL ATLETA',
  },
  {
    label: 'Mis Actividades y Torneos',
    to: '/member/dashboard?tab=actividades',
    icon: Activity,
    section: 'PORTAL DEL ATLETA',
  },
  {
    label: 'Mi Perfil Personal',
    to: '/member/dashboard?tab=perfil',
    icon: User,
    section: 'CUENTA',
  },
];

export default function MemberLayout() {
  return (
    <EnterpriseErpLayout
      roleTitle="Portal del Miembro"
      roleSubtitle="Estado de Membresía, Comprobantes y Agenda Deportiva"
      roleAccentLabel="MIEMBRO"
      navItems={MEMBER_NAV_ITEMS}
    />
  );
}
