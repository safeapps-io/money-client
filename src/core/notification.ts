export enum NotificationStyles {
  success = 'success',
  danger = 'danger',
  warning = 'warning',
  info = 'info',
}

export const notification = ({
  text,
  type = NotificationStyles.success,
}: {
  text: string;
  type?: NotificationStyles;
}) => ({
  id: Math.random(),
  text,
  type,
  position: 'bottom-right',
  removeAfter: 4000,
});
