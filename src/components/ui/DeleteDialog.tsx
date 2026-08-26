"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Popup } from "./Popup";

type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  title?: string;
  description?: React.ReactNode;
};

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  itemName,
  title = "Delete this item?",
  description,
}: DeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Popup open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {description ??
            (itemName ? (
              <>
                This will permanently remove{" "}
                <span className="font-medium text-slate-700">{itemName}</span>.
                This action can&lsquo;t be undone.
              </>
            ) : (
              "This action can't be undone."
            ))}
        </p>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Popup>
  );
}
