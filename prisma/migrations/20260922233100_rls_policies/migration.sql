-- Tapport initial database with tenant isolation and RLS.
create extension if not exists pgcrypto;

-- Prisma creates the canonical schema. This migration documents and enforces
-- the database-level policy requirements expected in production deployments.
-- Run after Prisma migrations or translate into a Prisma migration when desired.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'Company',
    'CompanyUser',
    'MasterDataItem',
    'Operation',
    'PlanningItem',
    'DischargeRecord',
    'AuditLog',
    'PasswordResetToken'
  ]
  loop
    if to_regclass('public."' || table_name || '"') is not null then
      execute format('alter table public.%I enable row level security', table_name);
    end if;
  end loop;
end $$;

do $$
begin
  if to_regclass('public."MasterDataItem"') is not null then
    drop policy if exists tenant_master_data on public."MasterDataItem";
    create policy tenant_master_data on public."MasterDataItem"
      using ("companyId" = current_setting('app.current_company_id', true))
      with check ("companyId" = current_setting('app.current_company_id', true));
  end if;

  if to_regclass('public."Operation"') is not null then
    drop policy if exists tenant_operations on public."Operation";
    create policy tenant_operations on public."Operation"
      using ("companyId" = current_setting('app.current_company_id', true))
      with check ("companyId" = current_setting('app.current_company_id', true));
  end if;

  if to_regclass('public."PlanningItem"') is not null then
    drop policy if exists tenant_planning_items on public."PlanningItem";
    create policy tenant_planning_items on public."PlanningItem"
      using ("companyId" = current_setting('app.current_company_id', true))
      with check ("companyId" = current_setting('app.current_company_id', true));
  end if;

  if to_regclass('public."DischargeRecord"') is not null then
    drop policy if exists tenant_discharge_records on public."DischargeRecord";
    create policy tenant_discharge_records on public."DischargeRecord"
      using ("companyId" = current_setting('app.current_company_id', true))
      with check ("companyId" = current_setting('app.current_company_id', true));
  end if;
end $$;

