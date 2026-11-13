import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthProvider";
import { useOrganization } from "@/components/layout/OrganizationProvider";
import { recordError } from "@/lib/record-forms";

export function useRecordSave() {
  const { organization, refresh } = useOrganization();
  const { session } = useAuth();
  const cache = useQueryClient();
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function save(
    operation: () => Promise<void>,
    onSaved: () => void,
    success = "Alterações salvas.",
  ) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await operation();
      onSaved();
      setMessage(success);
      refresh();
      void cache.invalidateQueries({ queryKey: ["customers", session?.user.id, organization.id] });
      void cache.invalidateQueries({
        queryKey: ["customer-history", session?.user.id, organization.id],
      });
      void cache.invalidateQueries({ queryKey: ["public-catalog", organization.slug] });
    } catch (failure) {
      setError(recordError(failure));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return {
    save,
    pending,
    error,
    message,
    clear: () => {
      setError("");
      setMessage("");
    },
  };
}
