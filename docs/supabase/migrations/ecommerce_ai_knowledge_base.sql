-- =============================================================================
-- Base da IA do E-commerce Intelligence — regras estratégicas
-- Rodar UMA VEZ no Supabase (SQL editor) para habilitar a página /ecommerce/base-ia
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ecommerce_ai_knowledge_base (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id   uuid NULL,
  category     text NOT NULL CHECK (category IN ('margem','preco','estoque','ads','prioritarios','observacoes')),
  title        text NOT NULL,
  description  text NOT NULL,
  priority     text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  applies_to_type  text NOT NULL DEFAULT 'operation' CHECK (applies_to_type IN ('operation','category','product','sku','account')),
  applies_to_value text NULL,
  status       text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused')),
  notes        text NULL,
  tags         text[] NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ecommerce_ai_kb_company_idx  ON public.ecommerce_ai_knowledge_base(company_id);
CREATE INDEX IF NOT EXISTS ecommerce_ai_kb_category_idx ON public.ecommerce_ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS ecommerce_ai_kb_status_idx   ON public.ecommerce_ai_knowledge_base(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ecommerce_ai_knowledge_base TO authenticated;
GRANT ALL ON public.ecommerce_ai_knowledge_base TO service_role;

ALTER TABLE public.ecommerce_ai_knowledge_base ENABLE ROW LEVEL SECURITY;

-- SELECT/INSERT/UPDATE/DELETE apenas para membros da própria empresa
CREATE POLICY "eaikb_select_by_company"
  ON public.ecommerce_ai_knowledge_base FOR SELECT TO authenticated
  USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

CREATE POLICY "eaikb_insert_by_company"
  ON public.ecommerce_ai_knowledge_base FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

CREATE POLICY "eaikb_update_by_company"
  ON public.ecommerce_ai_knowledge_base FOR UPDATE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()))
  WITH CHECK (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

CREATE POLICY "eaikb_delete_by_company"
  ON public.ecommerce_ai_knowledge_base FOR DELETE TO authenticated
  USING (company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()));

-- Trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.ecommerce_ai_kb_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS ecommerce_ai_kb_touch_trg ON public.ecommerce_ai_knowledge_base;
CREATE TRIGGER ecommerce_ai_kb_touch_trg
  BEFORE UPDATE ON public.ecommerce_ai_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.ecommerce_ai_kb_touch();
