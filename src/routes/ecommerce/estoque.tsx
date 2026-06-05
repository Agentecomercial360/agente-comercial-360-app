import { createFileRoute } from "@tanstack/react-router";
import { 
  Boxes, 
  AlertTriangle, 
  ShieldAlert, 
  DollarSign, 
  TrendingDown,
  ArrowRight,
  TrendingUp,
  Clock
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/estoque")({
...
  return (
    <EcommerceLayout>
...
    </EcommerceLayout>
  );
}
