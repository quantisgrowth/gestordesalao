-- Complemento aos SQLs 1 e 2. Aplicar no projeto correto após revisão.
-- Não expor gs_private na Data API. Não concede escrita direta em customers.
-- Funções públicas invoker; escrita privilegiada privada exige usuário/papel/empresa ativa.
begin;

create or replace function gs_private.save_customer(
 p_organization_id uuid,p_id uuid,p_name text,p_phone text,p_expected_updated_at timestamptz default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if auth.uid() is null or not gs_private.has_org_role(p_organization_id,array['owner','manager','receptionist']) then
  raise exception using errcode='42501',message='Sem permissao para cadastrar clientes nesta empresa.';
 end if;
 if p_id is null or p_name is null or length(btrim(p_name)) not between 1 and 100
 or p_phone is null or p_phone !~ '^\+[1-9][0-9]{7,14}$' then
  raise exception using errcode='22023',message='Informe nome e telefone internacional validos.';
 end if;
 if p_expected_updated_at is null then
  insert into public.customers(id,organization_id,display_name,phone_e164)
  values(p_id,p_organization_id,btrim(p_name),p_phone)
  on conflict(id) do nothing returning id into v_id;
  if v_id is null then
   if exists(select 1 from public.customers where id=p_id and organization_id=p_organization_id
     and display_name=btrim(p_name) and phone_e164=p_phone) then return p_id;end if;
   raise exception using errcode='40001',message='Atualize a lista antes de reenviar este cadastro.';
  end if;
 else
  update public.customers set display_name=btrim(p_name),phone_e164=p_phone
  where organization_id=p_organization_id and id=p_id and updated_at=p_expected_updated_at
  returning id into v_id;
  if v_id is null then raise exception using errcode='40001',message='Registro alterado ou indisponivel. Reabra o cadastro antes de salvar.';end if;
 end if;
 return v_id;
end $$;

create or replace function gs_private.save_service(
 p_organization_id uuid,p_id uuid,p_name text,p_duration_minutes integer,p_price_cents integer,
 p_active boolean,p_professional_ids uuid[],p_expected_updated_at timestamptz default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_ids uuid[];v_old_ids uuid[];
begin
 if auth.uid() is null or not gs_private.has_org_role(p_organization_id,array['owner','manager']) then
  raise exception using errcode='42501',message='Sem permissao para gerenciar servicos nesta empresa.';
 end if;
 if p_id is null or p_name is null or length(btrim(p_name)) not between 1 and 120
 or p_duration_minutes is null or p_duration_minutes not between 1 and 1440
 or p_price_cents is null or p_price_cents<0 or p_active is null
 or p_professional_ids is null or array_position(p_professional_ids,null) is not null
 or cardinality(p_professional_ids)>500 then
  raise exception using errcode='22023',message='Confira nome, duracao, preco e profissionais do servico.';
 end if;
 -- Serializa edições de vínculos feitas pelos dois lados do catálogo.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text,0));
 select coalesce(array_agg(distinct x order by x),'{}'::uuid[]) into v_ids from unnest(p_professional_ids) x;
 if (select count(*) from public.professionals where organization_id=p_organization_id and id=any(v_ids))<>cardinality(v_ids) then
  raise exception using errcode='22023',message='Profissional invalido para esta empresa.';
 end if;
 select coalesce(array_agg(professional_id order by professional_id),'{}'::uuid[]) into v_old_ids
 from public.professional_services where organization_id=p_organization_id and service_id=p_id and active;
 if p_expected_updated_at is null then
  insert into public.services(id,organization_id,name,duration_minutes,price_cents,active)
  values(p_id,p_organization_id,btrim(p_name),p_duration_minutes,p_price_cents,p_active)
  on conflict(id) do nothing returning id into v_id;
  if v_id is null then
   if v_ids=v_old_ids and exists(select 1 from public.services where id=p_id and organization_id=p_organization_id
    and name=btrim(p_name) and duration_minutes=p_duration_minutes and price_cents=p_price_cents and active=p_active) then return p_id;end if;
   raise exception using errcode='40001',message='Atualize a lista antes de reenviar este cadastro.';
  end if;
 else
  update public.services set name=btrim(p_name),duration_minutes=p_duration_minutes,price_cents=p_price_cents,active=p_active
  where organization_id=p_organization_id and id=p_id and updated_at=p_expected_updated_at returning id into v_id;
  if v_id is null then raise exception using errcode='40001',message='Registro alterado ou indisponivel. Reabra o cadastro antes de salvar.';end if;
 end if;
 update public.professional_services set active=false where organization_id=p_organization_id and service_id=p_id and active and not(professional_id=any(v_ids));
 insert into public.professional_services(organization_id,professional_id,service_id,active)
 select p_organization_id,x,p_id,true from unnest(v_ids) x
 on conflict(organization_id,professional_id,service_id) do update set active=true where not public.professional_services.active;
 -- Invalida a versão da outra ponta se a habilitação mudou.
 if v_ids<>v_old_ids then
  update public.professionals set updated_at=now() where organization_id=p_organization_id
   and id in((select unnest(v_ids) except select unnest(v_old_ids)) union (select unnest(v_old_ids) except select unnest(v_ids)));
 end if;
 return v_id;
end $$;

create or replace function gs_private.save_professional(
 p_organization_id uuid,p_id uuid,p_name text,p_active boolean,p_service_ids uuid[],p_expected_updated_at timestamptz default null
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;v_ids uuid[];v_old_ids uuid[];
begin
 if auth.uid() is null or not gs_private.has_org_role(p_organization_id,array['owner','manager']) then
  raise exception using errcode='42501',message='Sem permissao para gerenciar profissionais nesta empresa.';
 end if;
 if p_id is null or p_name is null or length(btrim(p_name)) not between 1 and 100 or p_active is null
 or p_service_ids is null or array_position(p_service_ids,null) is not null or cardinality(p_service_ids)>500 then
  raise exception using errcode='22023',message='Confira nome e servicos do profissional.';
 end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_organization_id::text,0));
 select coalesce(array_agg(distinct x order by x),'{}'::uuid[]) into v_ids from unnest(p_service_ids) x;
 if (select count(*) from public.services where organization_id=p_organization_id and id=any(v_ids))<>cardinality(v_ids) then
  raise exception using errcode='22023',message='Servico invalido para esta empresa.';
 end if;
 select coalesce(array_agg(service_id order by service_id),'{}'::uuid[]) into v_old_ids
 from public.professional_services where organization_id=p_organization_id and professional_id=p_id and active;
 if p_expected_updated_at is null then
  insert into public.professionals(id,organization_id,name,active) values(p_id,p_organization_id,btrim(p_name),p_active)
  on conflict(id) do nothing returning id into v_id;
  if v_id is null then
   if v_ids=v_old_ids and exists(select 1 from public.professionals where id=p_id and organization_id=p_organization_id and name=btrim(p_name) and active=p_active) then return p_id;end if;
   raise exception using errcode='40001',message='Atualize a lista antes de reenviar este cadastro.';
  end if;
 else
  update public.professionals set name=btrim(p_name),active=p_active
  where organization_id=p_organization_id and id=p_id and updated_at=p_expected_updated_at returning id into v_id;
  if v_id is null then raise exception using errcode='40001',message='Registro alterado ou indisponivel. Reabra o cadastro antes de salvar.';end if;
 end if;
 update public.professional_services set active=false where organization_id=p_organization_id and professional_id=p_id and active and not(service_id=any(v_ids));
 insert into public.professional_services(organization_id,professional_id,service_id,active)
 select p_organization_id,p_id,x,true from unnest(v_ids) x
 on conflict(organization_id,professional_id,service_id) do update set active=true where not public.professional_services.active;
 if v_ids<>v_old_ids then
  update public.services set updated_at=now() where organization_id=p_organization_id
   and id in((select unnest(v_ids) except select unnest(v_old_ids)) union (select unnest(v_old_ids) except select unnest(v_ids)));
 end if;
 return v_id;
end $$;

create or replace function public.gs_save_customer(p_organization_id uuid,p_id uuid,p_name text,p_phone text,p_expected_updated_at timestamptz default null)
returns uuid language sql security invoker set search_path='' as $$
 select gs_private.save_customer(p_organization_id,p_id,p_name,p_phone,p_expected_updated_at)
$$;
create or replace function public.gs_save_service(p_organization_id uuid,p_id uuid,p_name text,p_duration_minutes integer,p_price_cents integer,p_active boolean,p_professional_ids uuid[],p_expected_updated_at timestamptz default null)
returns uuid language sql security invoker set search_path='' as $$
 select gs_private.save_service(p_organization_id,p_id,p_name,p_duration_minutes,p_price_cents,p_active,p_professional_ids,p_expected_updated_at)
$$;
create or replace function public.gs_save_professional(p_organization_id uuid,p_id uuid,p_name text,p_active boolean,p_service_ids uuid[],p_expected_updated_at timestamptz default null)
returns uuid language sql security invoker set search_path='' as $$
 select gs_private.save_professional(p_organization_id,p_id,p_name,p_active,p_service_ids,p_expected_updated_at)
$$;

revoke all on function gs_private.save_customer(uuid,uuid,text,text,timestamptz),public.gs_save_customer(uuid,uuid,text,text,timestamptz),
 gs_private.save_service(uuid,uuid,text,integer,integer,boolean,uuid[],timestamptz),public.gs_save_service(uuid,uuid,text,integer,integer,boolean,uuid[],timestamptz),
 gs_private.save_professional(uuid,uuid,text,boolean,uuid[],timestamptz),public.gs_save_professional(uuid,uuid,text,boolean,uuid[],timestamptz)
 from public,anon,authenticated;
grant execute on function gs_private.save_customer(uuid,uuid,text,text,timestamptz),public.gs_save_customer(uuid,uuid,text,text,timestamptz),
 gs_private.save_service(uuid,uuid,text,integer,integer,boolean,uuid[],timestamptz),public.gs_save_service(uuid,uuid,text,integer,integer,boolean,uuid[],timestamptz),
 gs_private.save_professional(uuid,uuid,text,boolean,uuid[],timestamptz),public.gs_save_professional(uuid,uuid,text,boolean,uuid[],timestamptz)
 to authenticated;
notify pgrst,'reload schema';
commit;

select 'Funcoes de cadastro instaladas. Confira as permissoes com o SQL 7.' as resultado;
