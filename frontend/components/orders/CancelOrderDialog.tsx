"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CancelOrderDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPending: boolean
  title: string
  description: string
  confirmText: string
}

export function CancelOrderDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isPending,
  title,
  description,
  confirmText,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            className="rounded-xl" 
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Keep Order
          </Button>
          <Button 
            variant="destructive" 
            className="rounded-xl" 
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
