"use client"

import { useState, useTransition } from "react"
import { uploadMediaAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"

type State = { success?: string; error?: string };

export function MediaUploadForm() {
  const [state, setState] = useState<State>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await uploadMediaAction(formData);
      setState(result);
    });
  };

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-background/90 p-6 shadow-lg"
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground">Upload Media</h3>
        <p className="text-xs text-muted-foreground">
          Supported formats: .jpg, .jpeg, .png, .webp, .avif
        </p>
      </div>

      <input
        type="file"
        name="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        multiple
        required
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
      <p className="text-xs text-muted-foreground">
        You can select up to 100 files at once (Hold Ctrl/Cmd or Shift to select multiple)
      </p>

      <input
        type="text"
        name="alt"
        placeholder="Alt text (optional)"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading..." : "Upload"}
      </Button>

      {state.error && (
        <p className="text-sm text-red-500 mt-2">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-500 mt-2">{state.success}</p>
      )}
    </form>
  )
}