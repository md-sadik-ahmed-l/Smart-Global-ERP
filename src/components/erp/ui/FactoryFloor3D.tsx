"use client";

import { motion } from "framer-motion";
import { Factory, Cpu, Activity, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductionStation {
  id: string;
  name: string;
  status: "running" | "idle" | "maintenance" | "error";
  efficiency: number;
  output: number;
  operator?: string;
}

interface FactoryFloorProps {
  workOrders?: any[];
  stations?: ProductionStation[];
}

const defaultStations: ProductionStation[] = [
  { id: "STN-01", name: "Cutting Station A", status: "running", efficiency: 92, output: 145, operator: "Operator 1" },
  { id: "STN-02", name: "Sewing Line 1", status: "running", efficiency: 88, output: 170, operator: "Operator 2" },
  { id: "STN-03", name: "Sewing Line 2", status: "idle", efficiency: 0, output: 0 },
  { id: "STN-04", name: "QC Station", status: "running", efficiency: 95, output: 165, operator: "QC Inspector" },
  { id: "STN-05", name: "Packaging", status: "running", efficiency: 90, output: 160, operator: "Operator 3" },
  { id: "STN-06", name: "Finishing", status: "maintenance", efficiency: 0, output: 0 },
];

const statusConfig = {
  running: { color: "#10b981", label: "Running", icon: Activity },
  idle: { color: "#64748b", label: "Idle", icon: Clock },
  maintenance: { color: "#f59e0b", label: "Maintenance", icon: AlertTriangle },
  error: { color: "#ef4444", label: "Error", icon: AlertTriangle },
};

export function FactoryFloor3D({ workOrders = [], stations = defaultStations }: FactoryFloorProps) {
  const runningCount = stations.filter((s) => s.status === "running").length;
  const avgEfficiency = stations.filter((s) => s.status === "running").reduce((sum, s) => sum + s.efficiency, 0) / (runningCount || 1);

  return (
    <Card className="glass relative overflow-hidden p-6 rounded-xl">
      {/* Mesh background */}
      <div className="absolute inset-0 mesh-bg opacity-50" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Factory Floor — Live 3D View</h3>
              <p className="text-xs text-muted-foreground">
                {runningCount} of {stations.length} stations running · Avg efficiency {avgEfficiency.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              LIVE
            </span>
          </div>
        </div>

        {/* 3D Floor grid */}
        <div className="perspective-1000">
          <div className="preserve-3d grid grid-cols-3 gap-4" style={{ transform: "rotateX(8deg)" }}>
            {stations.map((station, i) => {
              const config = statusConfig[station.status];
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, y: 20, rotateX: -20 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="glass relative rounded-xl p-4"
                  style={{
                    borderColor: `${config.color}30`,
                    boxShadow: `0 8px 24px ${config.color}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
                  }}
                >
                  {/* Glow */}
                  {station.status === "running" && (
                    <div
                      className="absolute -right-4 -top-4 h-16 w-16 rounded-full opacity-30 blur-2xl"
                      style={{ backgroundColor: config.color }}
                    />
                  )}

                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-md"
                          style={{ backgroundColor: `${config.color}20`, color: config.color }}
                        >
                          <Cpu className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{station.id}</p>
                          <p className="text-[10px] text-muted-foreground">{station.name}</p>
                        </div>
                      </div>
                      <StatusIcon className="h-4 w-4" style={{ color: config.color }} />
                    </div>

                    {station.status === "running" ? (
                      <>
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Efficiency</span>
                            <span className="font-semibold" style={{ color: config.color }}>{station.efficiency}%</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${station.efficiency}%` }}
                              transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: config.color }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Output: <span className="font-semibold text-foreground">{station.output}</span></span>
                          <span className="text-muted-foreground truncate ml-2">{station.operator}</span>
                        </div>
                      </>
                    ) : (
                      <div className="py-2 text-center">
                        <p className="text-xs font-medium" style={{ color: config.color }}>
                          {config.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">No production</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Active Work Orders strip */}
        {workOrders.length > 0 && (
          <div className="mt-6 border-t border-border/50 pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Active Work Orders</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {workOrders.slice(0, 4).map((wo: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-shrink-0 rounded-lg border border-border/60 bg-card/50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-indigo-400">{wo.woNumber}</span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      wo.priority === "URGENT" ? "bg-rose-500/20 text-rose-400" :
                      wo.priority === "HIGH" ? "bg-amber-500/20 text-amber-400" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>{wo.priority}</span>
                  </div>
                  <p className="mt-1 text-xs text-foreground">{wo.product}</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{wo.produced}/{wo.planned} units</span>
                      <span className="font-semibold text-foreground">{wo.progress}%</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${wo.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
