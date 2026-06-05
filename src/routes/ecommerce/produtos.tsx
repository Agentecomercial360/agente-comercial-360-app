import { createFileRoute } from "@tanstack/react-router";
import { 
  Boxes, 
  ShoppingCart, 
  ArrowRight,
  Layers,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/produtos")({
...
  return (
    <EcommerceLayout>
...
    </EcommerceLayout>
  );
}
