import { createFileRoute } from "@tanstack/react-router";
import { 
  Settings, 
  UserCog, 
  BrainCircuit, 
  RefreshCw, 
  Bell, 
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Plus
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/configuracoes")({
...
  return (
    <EcommerceLayout>
...
    </EcommerceLayout>
  );
}
