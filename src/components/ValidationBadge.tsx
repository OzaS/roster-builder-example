import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { RosterUnit } from "../types";

type Props = {
  status?: RosterUnit["status"];
  label?: string;
};

export function ValidationBadge({ status = "valid", label }: Props) {
  const Icon = status === "valid" ? CheckCircle2 : status === "warning" ? AlertTriangle : Info;
  const text = label ?? (status === "valid" ? "Valid" : status === "warning" ? "Check" : "Issue");

  return (
    <span className={`validation-badge ${status}`}>
      <Icon size={14} />
      {text}
    </span>
  );
}
