import { createFileRoute } from "@tanstack/react-router";
import { 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Calendar,
  User,
  ArrowRight,
  Activity
} from "lucide-react";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";

export const Route = createFileRoute("/ecommerce/tarefas")({
...
  return (
    <EcommerceLayout>
...
    </EcommerceLayout>
  );
}
