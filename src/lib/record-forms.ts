// Parse decimal text without multiplying a binary floating-point price.
export function parsePriceCents(raw: string) {
  const normalized = raw.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized))
    throw new Error("Informe um preço válido, com até duas casas decimais.");
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 2147483647)
    throw new Error("O preço informado é muito alto.");
  return cents;
}

export function normalizePhone(raw: string) {
  const clean = raw.trim();
  const digits = clean.replace(/\D/g, "");
  const international = clean.startsWith("+")
    ? `+${digits}`
    : digits.length === 10 || digits.length === 11
      ? `+55${digits}`
      : digits.startsWith("55") && [12, 13].includes(digits.length)
        ? `+${digits}`
        : "";
  if (!/^\+[1-9][0-9]{7,14}$/.test(international))
    throw new Error("Informe DDD e telefone ou use o formato internacional com +.");
  return international;
}

export function recordError(error: unknown) {
  const failure = error as { code?: string; message?: string };
  if (["PGRST202", "42883"].includes(failure?.code ?? ""))
    return "Este cadastro ainda precisa ser ativado pelo administrador da plataforma.";
  if (failure?.code === "42501")
    return "Seu acesso não permite salvar estas alterações. Confira o perfil e a empresa selecionada.";
  if (failure?.code === "40001")
    return "O registro foi alterado ou não está mais disponível. Atualize a lista e reabra o cadastro antes de salvar.";
  if (["23514", "22023"].includes(failure?.code ?? ""))
    return "Confira os campos informados e os vínculos com a empresa.";
  if (failure?.code === "23505")
    return "Este registro já existe. Atualize a lista antes de tentar novamente.";
  if (error instanceof Error && !failure.code) return error.message;
  return "Não foi possível confirmar a gravação. Verifique a conexão e tente novamente.";
}
