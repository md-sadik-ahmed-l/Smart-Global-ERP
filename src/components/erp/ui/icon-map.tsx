"use client";

import {
  LayoutDashboard, Users, Handshake, Store, Package, ShoppingCart,
  Truck, Warehouse, CreditCard, Globe, Factory, Shirt, FlaskConical,
  ShieldCheck, UserCog, CalendarCheck, Banknote, Landmark, FolderArchive,
  Boxes, Headphones, KanbanSquare, Building2, GitBranch, Languages, Repeat,
  Brain, BarChart3, Plug, Workflow, Bell, ScrollText, DatabaseBackup,
  Smartphone, Cpu, Server, Settings, Bot, Zap, Gift, Share2, DoorOpen,
  FileSignature, Leaf, MessagesSquare, LucideIcon, DoorClosed, FileText,
  AlertTriangle, AlertCircle, UserX, UserCheck, Clock, CalendarClock,
  TrendingUp, TrendingDown, Wallet, Target, FileText as FileTextIcon,
  PackageCheck, XCircle, FolderTree, Tag, ReceiptText, ShoppingBag,
  FileSpreadsheet, type LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Users, Handshake, Store, Package, ShoppingCart,
  Truck, Warehouse, CreditCard, Globe, Factory, Shirt, FlaskConical,
  ShieldCheck, UserCog, CalendarCheck, Banknote, Landmark, FolderArchive,
  Boxes, Headphones, KanbanSquare, Building2, GitBranch, Languages, Repeat,
  Brain, BarChart3, Plug, Workflow, Bell, ScrollText, DatabaseBackup,
  Smartphone, Cpu, Server, Settings, Bot, Zap, Gift, Share2, DoorOpen,
  FileSignature, Leaf, MessagesSquare,
  // extras used by stat cards and module health panels
  TrendingUp, TrendingDown, Wallet, Target, PackageCheck, XCircle,
  AlertTriangle, AlertCircle, UserX, UserCheck, Clock, CalendarClock,
  FolderTree, Tag, ReceiptText, ShoppingBag, FileText,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? LayoutDashboard;
}

export type { LucideProps };
