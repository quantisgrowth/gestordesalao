-- Somente consultas; executar depois do SQL 6.
with functions(signature) as (values
 ('public.gs_save_customer(uuid,uuid,text,text,timestamptz)'),
 ('public.gs_save_service(uuid,uuid,text,integer,integer,boolean,uuid[],timestamptz)'),
 ('public.gs_save_professional(uuid,uuid,text,boolean,uuid[],timestamptz)')
)
select signature as funcao,
 case when to_regprocedure(signature) is null then 'AUSENTE'
 when has_function_privilege('anon',to_regprocedure(signature),'EXECUTE') then 'REVISAR'
 when not has_function_privilege('authenticated',to_regprocedure(signature),'EXECUTE') then 'REVISAR'
 else 'OK' end as resultado
from functions;

select case when not has_table_privilege('authenticated','public.customers','INSERT')
 and not has_table_privilege('authenticated','public.customers','UPDATE')
 and not has_table_privilege('anon','public.customers','SELECT')
 then 'OK' else 'REVISAR' end as escrita_direta_e_acesso_publico;

select n.nspname as schema,p.proname,p.prosecdef as security_definer,p.proconfig
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('gs_private','public') and p.proname in
 ('save_customer','save_service','save_professional','gs_save_customer','gs_save_service','gs_save_professional')
order by n.nspname,p.proname;
