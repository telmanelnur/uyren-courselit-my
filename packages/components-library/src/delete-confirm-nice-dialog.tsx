"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import NiceModal, { NiceModalHocProps } from "./nice-modal";

export interface DeleteConfirmDialogProps<T = any> extends NiceModalHocProps {
  title?: string;
  message?: string;
  data?: T;
}

export const DeleteConfirmNiceDialog = NiceModal.create<
  DeleteConfirmDialogProps<any>,
  { reason: "cancel"; data: null } | { reason: "confirm"; data: any }
>(
  ({
    title = "Delete Item",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    data,
  }) => {
    const { visible, hide, resolve } = NiceModal.useModal();

    const handleClose = () => {
      resolve({ reason: "cancel", data: null });
      hide();
    };

    const handleConfirm = () => {
      resolve({ reason: "confirm", data });
      hide();
    };

    return (
      <Dialog
        open={visible}
        onOpenChange={(v) => {
          if (!v) {
            handleClose();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  },
);
