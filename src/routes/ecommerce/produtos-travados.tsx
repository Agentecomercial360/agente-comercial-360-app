import { createFileRoute } from "@tanstack/react-router";
import { 
  ShieldAlert, 
  Search, 
  Zap, 
  Boxes, 
  TrendingDown, 
  MessageSquare, 
  ArrowRight,
  Filter
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/produtos-travados")({
...
  return (
    <EcommerceLayout>
...
    </EcommerceLayout>
  );
}
