"use client";

import { useState } from "react";

type IncidentKey = "nginx" | "permissions" | "services";

interface IncidentScenario {
  key: IncidentKey;
  tabLabel: string;
  categoryLabel: string;
  title: string;
  description: string;
  command: string;
  errorOutput: string;
  fixCommand: string;
  successOutput: string;
  hint: string;
  masteryLabel: string;
}

const SCENARIOS: Record<IncidentKey, IncidentScenario> = {
  nginx: {
    key: "nginx",
    tabLabel: "NGINX",
    categoryLabel: "DEVOPS · NGINX",
    title: "Fix Broken Nginx Config",
    description:
      "/etc/nginx/nginx.conf contains 'syntax_error_here' blocking startup.",
    command: "nginx -t",
    errorOutput: "nginx: [emerg] unexpected \"syntax_error_here\" in /etc/nginx/nginx.conf",
    fixCommand: "vi /etc/nginx/nginx.conf",
    successOutput: "nginx: configuration file /etc/nginx/nginx.conf test is successful",
    hint: "Remove 'syntax_error_here' and keep 'listen 80'",
    masteryLabel: "BKT Mastery · DevOps",
  },
  permissions: {
    key: "permissions",
    tabLabel: "PERMISSIONS",
    categoryLabel: "SECURITY · LINUX PERMISSIONS",
    title: "Create Executable Script",
    description:
      "/home/user/Projects/deploy.sh requires executable permissions (755).",
    command: "./Projects/deploy.sh",
    errorOutput: "bash: ./Projects/deploy.sh: Permission denied",
    fixCommand: "chmod +x /home/user/Projects/deploy.sh",
    successOutput: "Verified rule: permissions_match (-rwxr-xr-x / 755)",
    hint: "touch /home/user/Projects/deploy.sh && chmod +x ...",
    masteryLabel: "BKT Mastery · Security",
  },
  services: {
    key: "services",
    tabLabel: "SERVICES",
    categoryLabel: "DEVOPS · DOCKER & LOGS",
    title: "Review systemd & Access Logs",
    description:
      "Inspect nginx.service state and trace client hits in access.log.",
    command: "systemctl status nginx.service",
    errorOutput: "Checking /var/log/nginx/access.log for client hits...",
    fixCommand: "cat /var/log/nginx/access.log",
    successOutput: "active (running) · 192.168.1.100 GET / HTTP/1.1 200",
    hint: "systemctl status nginx.service && cat /var/log/nginx/access.log",
    masteryLabel: "BKT Mastery · Interview",
  },
};

export function LinLearnIncidentPreview() {
  const [activeKey, setActiveKey] = useState<IncidentKey>("nginx");
  const scenario = SCENARIOS[activeKey];

  return (
    <div
      className="flex h-full flex-col justify-between gap-2.5 p-3.5 sm:p-4"
      aria-label="LinLearn Incident Lab interactive simulation preview"
    >
      {/* Top Simulation Header & Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-code inline-flex items-center gap-1.5 rounded bg-[#F5D90A] px-2 py-0.5 text-[11px] font-semibold text-[#0B0B0B]">
          INCIDENT SIMULATION
        </span>

        <div
          role="group"
          aria-label="Select simulated incident scenario"
          className="flex items-center gap-1"
        >
          {(["nginx", "permissions", "services"] as const).map((key) => {
            const selected = activeKey === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => setActiveKey(key)}
                className={`font-mono-code min-h-[26px] rounded px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                  selected
                    ? "bg-[#F5F5F0] text-[#0B0B0B]"
                    : "border border-[#2A2A2A] bg-[#141414] text-[#A1A1AA] hover:border-[#F5D90A]/60 hover:text-[#F5F5F0]"
                }`}
              >
                {SCENARIOS[key].tabLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Incident Brief + Simulated Terminal */}
      <div className="rounded-[8px] border border-[#2A2A2A] bg-[#141414] font-mono-code text-[11px] transition-colors duration-200 group-hover:border-[#F5D90A]/35">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242424] px-3 py-1.5 text-[10px]">
          <span className="text-[#F5D90A]">{scenario.categoryLabel}</span>
          <span className="text-[#A1A1AA]">{scenario.title}</span>
        </div>

        <div className="space-y-1.5 px-3 py-2.5 leading-snug">
          <p className="break-words text-[11px] text-[#A1A1AA]">
            {scenario.description}
          </p>
          <p className="break-all text-[#F5F5F0]">
            <span className="text-[#F5D90A]">user@linlearn:~$</span>{" "}
            {scenario.command}
          </p>
          <p className="break-words text-red-400">{scenario.errorOutput}</p>
          <p className="break-all text-[#F5F5F0]">
            <span className="text-[#F5D90A]">user@linlearn:~$</span>{" "}
            {scenario.fixCommand}
          </p>
          <p className="flex items-start gap-1.5 break-words text-emerald-400">
            <span>{scenario.successOutput}</span>
            <span className="terminal-cursor mt-0.5 shrink-0" aria-hidden="true" />
          </p>
        </div>

        <div className="border-t border-[#242424] bg-[#0B0B0B]/70 px-3 py-1 text-[10px] text-[#A1A1AA]">
          <span className="text-[#F5D90A]">Hint:</span> {scenario.hint}
        </div>
      </div>

      {/* Footer Indicators: AI Tutor + Adaptive Mastery */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#242424] pt-2 font-mono-code text-[10px] text-[#A1A1AA]">
        <span className="inline-flex items-center gap-1.5 text-emerald-300">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
          AI Tutor: Available
        </span>
        <span className="text-[#F5D90A]">{scenario.masteryLabel}</span>
      </div>
    </div>
  );
}
