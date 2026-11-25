import { ArrowRight } from "lucide-react";
import type { ArchitectureFlow, ArchitectureNode } from "@/lib/projects";

interface ArchitectureDiagramProps {
  projectName: string;
  summary: string;
  nodes: ArchitectureNode[];
  flows: ArchitectureFlow[];
}

const layerLabels: Record<ArchitectureNode["layer"], string> = {
  client: "Client / Input",
  api: "API & Security",
  intelligence: "Intelligence / Logic",
  data: "Persistence",
  ops: "DevOps & CI/CD",
};

export function ArchitectureDiagram({
  projectName,
  summary,
  nodes,
  flows,
}: ArchitectureDiagramProps) {
  return (
    <figure className="rounded-[20px] border border-[#242424] bg-[#141414] p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#242424] pb-4">
        <div>
          <span className="font-mono-code text-xs uppercase tracking-wider text-[#F5D90A]">
            System Architecture
          </span>
          <h3 className="text-subhead mt-1 text-[#F5F5F0]">
            {projectName} Component Topology
          </h3>
        </div>
        <span className="font-mono-code rounded border border-[#2A2A2A] bg-[#0B0B0B] px-3 py-1 text-xs text-[#A1A1AA]">
          {nodes.length} Components · {flows.length} Flows
        </span>
      </div>

      {/* Responsive Node Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="flex flex-col justify-between rounded-[12px] border border-[#2A2A2A] bg-[#0B0B0B] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono-code text-[11px] uppercase tracking-wider text-[#F5D90A]">
                {layerLabels[node.layer]}
              </span>
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-[#F5D90A]"
              />
            </div>
            <div className="mt-3">
              <p className="font-display text-base font-bold text-[#F5F5F0]">
                {node.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                {node.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Data & Control Flows */}
      <div className="mt-6 rounded-[12px] border border-[#242424] bg-[#0B0B0B] p-4 sm:p-5">
        <p className="font-mono-code mb-3 text-xs uppercase tracking-wider text-[#A1A1AA]">
          Request &amp; Data Flows
        </p>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {flows.map((flow, index) => (
            <li
              key={`${flow.from}-${flow.to}-${index}`}
              className="flex flex-col gap-1.5 rounded-[8px] border border-[#242424] bg-[#141414] p-3 text-xs"
            >
              <div className="flex flex-wrap items-center gap-1.5 font-medium text-[#F5F5F0]">
                <span>{flow.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#F5D90A]" aria-hidden="true" />
                <span>{flow.to}</span>
              </div>
              <span className="text-[#A1A1AA]">{flow.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <figcaption className="mt-4 text-sm leading-relaxed text-[#A1A1AA]">
        {summary}
      </figcaption>
    </figure>
  );
}
