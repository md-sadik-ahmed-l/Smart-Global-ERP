"use client";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export interface FormField {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "tel" | "select" | "textarea" | "date";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  default?: any;
  min?: number;
  step?: number;
}

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export function FormModal({
  open, onOpenChange, title, description, fields, onSubmit, loading, submitLabel = "Save",
}: FormModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values: Record<string, any> = {};
    for (const f of fields) {
      const v = formData.get(f.name);
      if (f.type === "number") {
        const parsed = v ? parseFloat(v as string) : 0;
        values[f.name] = isNaN(parsed) ? 0 : parsed;
      } else {
        values[f.name] = v || "";
      }
    }
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-popover sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.type === "textarea" ? "sm:col-span-2 space-y-1.5" : "space-y-1.5"}>
                <Label htmlFor={f.name} className="text-xs font-medium text-muted-foreground">
                  {f.label} {f.required && <span className="text-rose-400">*</span>}
                </Label>
                {f.type === "select" ? (
                  <Select name={f.name} defaultValue={f.default}>
                    <SelectTrigger className="h-10 border-border bg-card">
                      <SelectValue placeholder={f.placeholder || "Select..."} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : f.type === "textarea" ? (
                  <Textarea
                    id={f.name}
                    name={f.name}
                    placeholder={f.placeholder}
                    defaultValue={f.default}
                    rows={3}
                    className="border-border bg-card text-sm"
                  />
                ) : (
                  <Input
                    id={f.name}
                    name={f.name}
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    defaultValue={f.default}
                    min={f.min}
                    step={f.step}
                    required={f.required}
                    className="h-10 border-border bg-card text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border bg-card text-foreground hover:bg-card/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              {loading ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
