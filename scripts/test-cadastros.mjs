// Local-only PostgreSQL tests. Never connect this runner to a hosted database.
// GS_FOUNDATION_SQL_DIR must contain the previously delivered SQLs 1 and 2.
// PGLITE_MODULE_PATH can point to an existing @electric-sql/pglite module.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";
const modulePath = process.env.PGLITE_MODULE_PATH;
const { PGlite } = await import(
  modulePath ? pathToFileURL(path.resolve(modulePath)).href : "@electric-sql/pglite"
);
const gistModule = process.env.PGLITE_BTREE_GIST_PATH;
const { btree_gist } = await import(
  gistModule
    ? pathToFileURL(path.resolve(gistModule)).href
    : "@electric-sql/pglite/contrib/btree_gist"
);
const foundation = process.env.GS_FOUNDATION_SQL_DIR;
if (!foundation) throw Error("Defina GS_FOUNDATION_SQL_DIR para os SQLs 1 e 2 de fundacao.");
const db = new PGlite({ extensions: { btree_gist } });
let checks = 0;
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
async function query(sql, args = []) {
  return (await db.query(sql, args)).rows;
}
async function fails(sql, args, code) {
  try {
    await db.query(sql, args);
    assert.fail("Expected failure " + code);
  } catch (e) {
    assert.equal(e.code, code, e.message);
    checks++;
  }
}
async function as(n, role = "authenticated") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [n ? id(n) : ""]);
  await db.exec("set role " + role);
}
try {
  await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;`);
  for (const file of ["01_estrutura.sql", "02_permissoes_e_funcoes.sql"])
    await db.exec(fs.readFileSync(path.join(foundation, file), "utf8"));
  const sql = fs.readFileSync(new URL("../docs/sql/06_cadastros.sql", import.meta.url), "utf8");
  await db.exec(sql);
  await db.exec(sql);
  checks++; // Applying the complement twice is safe.
  for (let n = 1; n <= 5; n++)
    await db.query("insert into auth.users values($1,$2,now())", [
      id(n),
      `test${n}@example.invalid`,
    ]);
  for (const [n, slug] of [
    [10, "alpha"],
    [20, "beta"],
  ]) {
    await db.query("insert into public.organizations(id,name,slug) values($1,$2,$2)", [
      id(n),
      slug,
    ]);
    await db.query("insert into public.settings(organization_id) values($1)", [id(n)]);
  }
  for (const [org, user, roles] of [
    [10, 1, ["owner"]],
    [20, 2, ["owner"]],
    [10, 3, ["receptionist"]],
    [10, 4, ["professional"]],
    [10, 5, ["manager"]],
  ])
    await db.query(
      "insert into public.memberships(organization_id,user_id,roles) values($1,$2,$3)",
      [id(org), id(user), roles],
    );
  const saveCustomer = "select public.gs_save_customer($1,$2,$3,$4,$5) as id";
  const saveService = "select public.gs_save_service($1,$2,$3,$4,$5,$6,$7,$8) as id";
  const saveProfessional = "select public.gs_save_professional($1,$2,$3,$4,$5,$6) as id";
  await as(1);
  const customer = [id(10), id(100), "Cliente Teste", "+5515999999999", null];
  assert.equal((await query(saveCustomer, customer))[0].id, id(100));
  checks++;
  await query(saveCustomer, customer);
  assert.equal((await query("select count(*)::int as n from public.customers"))[0].n, 1);
  checks++;
  await fails(saveCustomer, [id(10), id(101), "Invalido", "123", null], "22023");
  let version = (
    await query("select updated_at::text as version from public.customers where id=$1", [id(100)])
  )[0].version;
  await query(saveCustomer, [id(10), id(100), "Cliente Editado", "+5515999999999", version]);
  checks++;
  await fails(saveCustomer, [id(10), id(100), "Sobrescrever", "+5515999999999", version], "40001");
  await query(saveCustomer, [id(10), id(102), "Telefone Compartilhado", "+5515999999999", null]);
  checks++;
  await fails(
    "insert into public.customers(id,organization_id,display_name,phone_e164) values($1,$2,$3,$4)",
    [id(103), id(10), "Direto", "+5515999999999"],
    "42501",
  );
  await as(2);
  assert.equal((await query("select * from public.customers")).length, 0);
  checks++;
  await fails(saveCustomer, [id(10), id(104), "Outra empresa", "+5515999999999", null], "42501");
  await as(3);
  await query(saveCustomer, [id(10), id(105), "Recepcao", "+5515988888888", null]);
  checks++;
  await fails(
    saveService,
    [id(10), id(200), "Recepcao proibido", 30, 1000, true, [], null],
    "42501",
  );
  await as(4);
  await fails(
    saveCustomer,
    [id(10), id(106), "Profissional proibido", "+5515999999999", null],
    "42501",
  );
  await as(null, "anon");
  await fails(saveCustomer, customer, "42501");
  await as(1);
  await query(saveProfessional, [id(10), id(300), "Profissional A", true, [], null]);
  checks++;
  await query(saveService, [id(10), id(200), "Servico A", 30, 1234, true, [id(300)], null]);
  checks++;
  assert.equal(
    (await query("select count(*)::int as n from public.professional_services where active"))[0].n,
    1,
  );
  checks++;
  await query(saveService, [id(10), id(200), "Servico A", 30, 1234, true, [id(300)], null]);
  checks++;
  await as(2);
  await query(saveProfessional, [id(20), id(400), "Profissional B", true, [], null]);
  await query(saveService, [id(20), id(500), "Servico B", 30, 2000, true, [], null]);
  await as(1);
  await fails(
    saveService,
    [id(10), id(201), "Vinculo invalido", 30, 1000, true, [id(400)], null],
    "22023",
  );
  assert.equal((await query("select * from public.services where id=$1", [id(201)])).length, 0);
  checks++;
  version = (
    await query("select updated_at::text as version from public.services where id=$1", [id(200)])
  )[0].version;
  await fails(
    saveService,
    [id(10), id(200), "Nao pode mudar", 40, 9999, true, [id(400)], version],
    "22023",
  );
  assert.equal(
    (await query("select name from public.services where id=$1", [id(200)]))[0].name,
    "Servico A",
  );
  checks++;
  await fails(
    saveProfessional,
    [id(10), id(301), "Vinculo invalido", true, [id(500)], null],
    "22023",
  );
  await fails(saveService, [id(10), id(202), "Preco invalido", 30, -1, true, [], null], "22023");
  const proVersion = (
    await query("select updated_at::text as version from public.professionals where id=$1", [
      id(300),
    ])
  )[0].version;
  await query(saveService, [id(10), id(200), "Servico A", 30, 1234, true, [], version]);
  checks++;
  await fails(
    saveProfessional,
    [id(10), id(300), "Edicao obsoleta", true, [id(200)], proVersion],
    "40001",
  );
  assert.equal(
    (
      await query("select active from public.professional_services where service_id=$1", [id(200)])
    )[0].active,
    false,
  );
  checks++;
  version = (
    await query("select updated_at::text as version from public.professionals where id=$1", [
      id(300),
    ])
  )[0].version;
  await query(saveProfessional, [id(10), id(300), "Profissional A", false, [id(200)], version]);
  checks++;
  assert.equal(
    (await query("select active from public.professionals where id=$1", [id(300)]))[0].active,
    false,
  );
  checks++;
  assert.equal(
    (
      await query("select active from public.professional_services where service_id=$1", [id(200)])
    )[0].active,
    true,
  );
  checks++;
  // Existing column grants and RLS also protect the two settings editors.
  await as(3);
  assert.equal(
    (
      await query(
        "update public.settings set buffer_minutes=10 where organization_id=$1 returning organization_id",
        [id(10)],
      )
    ).length,
    0,
  );
  checks++;
  assert.equal(
    (
      await query("update public.organizations set name=$1 where id=$2 returning id", [
        "Recepcao sem permissao",
        id(10),
      ])
    ).length,
    0,
  );
  checks++;
  await as(1);
  await query("update public.settings set buffer_minutes=10 where organization_id=$1", [id(10)]);
  checks++;
  assert.equal(
    (
      await query("select buffer_minutes from public.settings where organization_id=$1", [id(10)])
    )[0].buffer_minutes,
    10,
  );
  checks++;
  await fails(
    "update public.settings set call_response_minutes=10 where organization_id=$1",
    [id(10)],
    "42501",
  );
  await fails(
    "update public.organizations set slug=$1 where id=$2",
    ["outro-slug", id(10)],
    "42501",
  );
  assert.equal(
    (
      await query(
        "update public.settings set buffer_minutes=20 where organization_id=$1 returning organization_id",
        [id(20)],
      )
    ).length,
    0,
  );
  checks++;
  await as(5);
  await query(saveService, [id(10), id(203), "Gestor", 30, 1000, true, [], null]);
  checks++;
  await db.exec("reset role");
  await db.query("update public.organizations set status='suspended' where id=$1", [id(10)]);
  await as(1);
  await fails(saveCustomer, [id(10), id(107), "Suspenso", "+5515999999999", null], "42501");
  await db.exec("reset role");
  assert.ok((await query("select count(*)::int as n from public.audit_logs"))[0].n > 10);
  checks++;
  const grants = await query(
    "select has_function_privilege('anon','public.gs_save_customer(uuid,uuid,text,text,timestamptz)','execute') as anon, has_function_privilege('authenticated','public.gs_save_customer(uuid,uuid,text,text,timestamptz)','execute') as staff",
  );
  assert.equal(grants[0].anon, false);
  assert.equal(grants[0].staff, true);
  checks++;
  console.log(
    JSON.stringify(
      { status: "passed", checks, engine: "PostgreSQL local (PGlite)", production: false },
      null,
      2,
    ),
  );
} finally {
  await db.close();
}
