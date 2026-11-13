export function SaveFeedback({ error, message }: { error?: string; message?: string }) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-card p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mb-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
          {message}
        </p>
      )}
    </>
  );
}
