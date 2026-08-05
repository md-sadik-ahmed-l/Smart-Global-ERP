"use client";

import { useState } from "react";
import {
  ArrowLeft, Phone, Mail, MapPin, Users, Building2, CreditCard, FileText,
  PhoneCall, MailPlus, CalendarClock, UserRound, ShoppingCart, StickyNote,
  Activity, History, Trash2, Pencil, Plus, Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable, StatusBadge, statusVariant, type Column } from "../ui/DataTable";
import { fmtBDT } from "@/lib/erp/demo-data";
import {
  useCustomerProfile,
  useAddNote,
  useUpdateNote,
  useDeleteNote,
  useAddActivity,
} from "@/lib/erp/hooks";

const ACTIVITY_TYPES = ["Call", "Email", "Meeting", "Follow-up", "Order"] as const;

const activityIcons: Record<string, any> = {
  Call: PhoneCall,
  Email: MailPlus,
  Meeting: CalendarClock,
  "Follow-up": UserRound,
  Order: ShoppingCart,
};

const timelineIcons: Record<string, any> = {
  CREATE: Building2,
  UPDATE: Pencil,
  DELETE: Trash2,
  NOTE: StickyNote,
  ACTIVITY: Activity,
  ORDER: ShoppingCart,
  LOGIN: History,
};

function fmtDate(value: string | Date) {
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

function fmtDateTime(value: string | Date) {
  try {
    return new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

interface CustomerProfileProps {
  customerId: string;
  onBack: () => void;
  onEdit?: (customer: any) => void;
}

interface OrderRow {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

const orderColumns: Column<OrderRow>[] = [
  { key: "orderNumber", header: "Order #", render: (r) => <span className="font-mono text-xs font-semibold text-indigo-400">{r.orderNumber}</span> },
  { key: "orderDate", header: "Date", render: (r) => <span className="text-xs text-muted-foreground">{fmtDate(r.orderDate)}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <StatusBadge variant={statusVariant(r.status)} dot>{r.status}</StatusBadge> },
  { key: "totalAmount", header: "Total", align: "right", render: (r) => <span className="font-semibold">{fmtBDT(r.totalAmount)}</span> },
  { key: "dueAmount", header: "Due", align: "right", render: (r) => <span className={r.dueAmount > 0 ? "font-semibold text-rose-400" : "text-emerald-400"}>{r.dueAmount > 0 ? fmtBDT(r.dueAmount) : "—"}</span> },
];

function LoadingBlock({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {subtitle && <p className="max-w-xs text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function CustomerProfile({ customerId, onBack, onEdit }: CustomerProfileProps) {
  const { data, isLoading, isError, error, refetch } = useCustomerProfile(customerId);

  const addNote = useAddNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const addActivity = useAddActivity();

  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  const [activityType, setActivityType] = useState<string>("Call");
  const [activityDesc, setActivityDesc] = useState("");

  const customer = data?.customer;
  const orders: OrderRow[] = data?.orders || [];
  const activities = data?.activities || [];
  const notes = data?.notes || [];
  const timeline = data?.timeline || [];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate({ id: customerId, note: newNote.trim() }, {
      onSuccess: () => setNewNote(""),
    });
  };

  const handleSaveNote = (note: any) => {
    updateNote.mutate({ id: note.id, customerId, note: editNoteText.trim() }, {
      onSuccess: () => setEditNoteId(null),
    });
  };

  const handleAddActivity = () => {
    if (!activityDesc.trim() && activityType !== "Order") return;
    addActivity.mutate({ id: customerId, type: activityType, description: activityDesc.trim() || undefined }, {
      onSuccess: () => setActivityDesc(""),
    });
  };

  if (isLoading) return <LoadingBlock label="Loading customer profile..." />;

  if (isError || !customer) {
    return (
      <Card className="border-border bg-card p-8">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">Failed to load customer profile</p>
          <p className="max-w-sm text-xs text-muted-foreground">{isError ? (error as any)?.message || "Something went wrong" : "Customer not found"}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
            </Button>
            <Button variant="outline" size="sm" className="h-9 border-border bg-card text-foreground hover:bg-card/80" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const totalValue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalDue = orders.reduce((s, o) => s + o.dueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9 border-border bg-card text-muted-foreground hover:bg-card/80" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-sm font-bold text-indigo-400">
            {customer.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
              <StatusBadge variant={statusVariant(customer.status)} dot>{customer.status}</StatusBadge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {customer.code} · {customer.segment.charAt(0) + customer.segment.slice(1).toLowerCase()} segment
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onEdit && (
            <Button size="sm" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onEdit(customer)}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><ShoppingCart className="h-3.5 w-3.5" /> Total Orders</div>
          <p className="mt-2 text-xl font-bold text-foreground">{orders.length}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><CreditCard className="h-3.5 w-3.5" /> Lifetime Value</div>
          <p className="mt-2 text-xl font-bold text-foreground">{fmtBDT(totalValue)}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><FileText className="h-3.5 w-3.5" /> Notes</div>
          <p className="mt-2 text-xl font-bold text-foreground">{notes.length}</p>
        </Card>
        <Card className="border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><History className="h-3.5 w-3.5" /> Due</div>
          <p className={`mt-2 text-xl font-bold ${totalDue > 0 ? "text-rose-400" : "text-emerald-400"}`}>{totalDue > 0 ? fmtBDT(totalDue) : "—"}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Information */}
        <Card className="border-border bg-card p-5 lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-indigo-400" /> Customer Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{customer.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{customer.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Address</p>
                <p className="font-medium text-foreground">{customer.address || "—"}</p>
                <p className="text-xs text-muted-foreground">{customer.country || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Segment</p>
                <Badge variant="outline" className="mt-0.5 border-border text-foreground">{customer.segment}</Badge>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Credit Limit</p>
                <p className="font-medium text-foreground">{fmtBDT(customer.creditLimit || 0)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap text-foreground">{customer.notes || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <History className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[11px] text-muted-foreground">Created</p>
                <p className="font-medium text-foreground">{fmtDate(customer.createdAt)}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {/* Orders */}
          <Card className="border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShoppingCart className="h-4 w-4 text-indigo-400" /> Orders
              <span className="ml-auto text-xs font-normal text-muted-foreground">{orders.length} orders</span>
            </h3>
            {orders.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No orders yet" subtitle="Orders placed by this customer will appear here." />
            ) : (
              <DataTable columns={orderColumns} data={orders} maxHeight="320px" />
            )}
          </Card>

          {/* Activities */}
          <Card className="border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Activity className="h-4 w-4 text-indigo-400" /> Activities
              <span className="ml-auto text-xs font-normal text-muted-foreground">{activities.length} activities</span>
            </h3>

            <div className="mb-4 flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-3 sm:flex-row">
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger className="h-9 w-full border-border bg-card text-sm sm:w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-popover">
                  {ACTIVITY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={activityDesc}
                onChange={(e) => setActivityDesc(e.target.value)}
                placeholder="Describe the activity (e.g. discussed new order)"
                className="h-9 flex-1 border-border bg-card text-sm"
              />
              <Button size="sm" className="h-9 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddActivity} disabled={addActivity.isPending}>
                {addActivity.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Log
              </Button>
            </div>

            {activities.length === 0 ? (
              <EmptyState icon={Activity} title="No activities yet" subtitle="Log calls, emails, meetings, follow-ups or orders." />
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {activities.map((a: any) => {
                  const Icon = activityIcons[a.type] || Activity;
                  return (
                    <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/30 p-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{a.type}</p>
                          <span className="text-[11px] text-muted-foreground">{fmtDateTime(a.createdAt)}</span>
                        </div>
                        {a.description && <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{a.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card className="border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <StickyNote className="h-4 w-4 text-indigo-400" /> Notes
              <span className="ml-auto text-xs font-normal text-muted-foreground">{notes.length} notes</span>
            </h3>

            <div className="mb-4 flex flex-col gap-2 rounded-lg border border-border bg-card/40 p-3">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note about this customer..."
                rows={2}
                className="border-border bg-card text-sm"
              />
              <div className="flex justify-end">
                <Button size="sm" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAddNote} disabled={addNote.isPending || !newNote.trim()}>
                  {addNote.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Add Note
                </Button>
              </div>
            </div>

            {notes.length === 0 ? (
              <EmptyState icon={StickyNote} title="No notes yet" subtitle="Add internal notes to remember important details about this customer." />
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {notes.map((n: any) => (
                  <div key={n.id} className="rounded-lg border border-border/60 bg-card/30 p-3">
                    {editNoteId === n.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          rows={2}
                          className="border-border bg-card text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 border-border bg-card text-foreground hover:bg-card/80" onClick={() => setEditNoteId(null)}>Cancel</Button>
                          <Button size="sm" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => handleSaveNote(n)} disabled={updateNote.isPending}>
                            {updateNote.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className="whitespace-pre-wrap text-sm text-foreground">{n.note}</p>
                          <div className="flex flex-shrink-0 gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => { setEditNoteId(n.id); setEditNoteText(n.note); }}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-rose-400" onClick={() => deleteNote.mutate({ id: n.id, customerId })}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">{fmtDateTime(n.createdAt)}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card className="border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <History className="h-4 w-4 text-indigo-400" /> Timeline
              <span className="ml-auto text-xs font-normal text-muted-foreground">Newest first</span>
            </h3>
            {timeline.length === 0 ? (
              <EmptyState icon={History} title="No activity yet" subtitle="Customer creation, updates, notes, orders and activities appear here." />
            ) : (
              <div className="max-h-80 space-y-0 overflow-y-auto pr-1">
                {timeline.map((t: any, idx: number) => {
                  const Icon = timelineIcons[t.type] || History;
                  const isLast = idx === timeline.length - 1;
                  return (
                    <div key={t.id} className="relative flex gap-3 pb-4">
                      {!isLast && <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-border bg-card/50 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{t.title}</p>
                          <span className="text-[11px] text-muted-foreground">{fmtDateTime(t.createdAt)}</span>
                        </div>
                        {t.description && <p className="mt-0.5 whitespace-pre-wrap text-xs text-muted-foreground">{t.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
