import React from 'react';
import {
  Users,
  CreditCard,
  CalendarCheck,
  Clock,
  Workflow,
  GraduationCap,
  TrendingUp,
  Briefcase,
  MessageSquareText,
  FileText,
  Timer,
  UserCheck,
  BarChart3,
  Smartphone,
  CheckCheck,
  LayoutGrid,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Users,
  CreditCard,
  CalendarCheck,
  Clock,
  Workflow,
  GraduationCap,
  TrendingUp,
  Briefcase,
  MessageSquareText,
  FileText,
  Timer,
  UserCheck,
  BarChart3,
  Smartphone,
  CheckCheck,
  LayoutGrid,
};

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent {...props} />;
};
