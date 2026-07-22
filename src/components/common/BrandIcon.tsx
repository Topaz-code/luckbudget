import type { ComponentProps } from 'react';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const aliases: Record<string, ComponentProps<typeof Feather>['name']> = {
  'account-plus-outline': 'user-plus',
  'account-check-outline': 'user-check',
  'account-off-outline': 'user-x',
  'alert-circle-outline': 'alert-circle',
  'arrow-left': 'arrow-left',
  'arrow-right': 'arrow-right',
  'bank-outline': 'briefcase',
  'calendar-alert': 'calendar',
  'calendar-check-outline': 'calendar',
  'calendar-clock': 'calendar',
  'calendar-today': 'calendar',
  'chart-box-outline': 'bar-chart-2',
  'chart-donut': 'pie-chart',
  'check-circle': 'check-circle',
  'check-circle-outline': 'check-circle',
  'clipboard-check-outline': 'clipboard',
  'cloud-alert-outline': 'cloud-off',
  'cloud-check-outline': 'cloud',
  'cog-outline': 'settings',
  'content-copy': 'copy',
  'content-save-outline': 'save',
  'delete-outline': 'trash-2',
  'eye-off-outline': 'eye-off',
  'eye-outline': 'eye',
  'information-outline': 'info',
  'lightbulb-on-outline': 'sun',
  'lock-check-outline': 'lock',
  'lock-open-outline': 'unlock',
  'lock-open-variant-outline': 'unlock',
  'login': 'log-in',
  'logout': 'log-out',
  'magnify': 'search',
  'pencil-outline': 'edit-2',
  'refresh': 'refresh-cw',
  'shield-check-outline': 'shield',
  'shield-lock-outline': 'shield',
  'target': 'target',
  'view-dashboard-outline': 'grid',
  'wallet-outline': 'credit-card',
};

interface BrandIconProps {
  name: string;
  color?: string;
  size: number;
  direction?: 'rtl' | 'ltr';
  testID?: string;
}

export function BrandIcon({ name, color = '#111827', size, testID }: BrandIconProps) {
  const featherName = aliases[name] ??
    (name in Feather.glyphMap ? (name as ComponentProps<typeof Feather>['name']) : undefined);
  if (featherName) return <Feather name={featherName} color={color} size={size} testID={testID} />;
  return (
    <MaterialCommunityIcons
      name={name as ComponentProps<typeof MaterialCommunityIcons>['name']}
      color={color}
      size={size}
      testID={testID}
    />
  );
}
