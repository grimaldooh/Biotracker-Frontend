export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  isActive: boolean;
  isExpanded?: boolean;
  children?: MenuItem[];
}

export interface SidebarConfig {
  title: string;
  menuItems: MenuItem[];
}