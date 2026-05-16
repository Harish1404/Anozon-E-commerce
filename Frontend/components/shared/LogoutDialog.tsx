import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function LogoutDialog({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to log out of your account? You will need to log in again to access your dashboard and preferences.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => {
            onOpenChange(false)
            onConfirm()
          }}>
            Log Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
