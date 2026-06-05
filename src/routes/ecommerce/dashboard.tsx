import { createFileRoute } from "@tanstack/react-router";
import { 
  Store, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  ShieldAlert, 
  Boxes, 
  Zap, 
  Activity, 
  BrainCircuit, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  BarChart3,
  Percent,
  Search
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/dashboard")({
...
  return (
    <EcommerceLayout>
...
    </EcommerceLayout>
  );
}
