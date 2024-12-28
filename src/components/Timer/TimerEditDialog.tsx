import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TimerEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editName: string;
  editNotes: string;
  onNameChange: (name: string) => void;
  onNotesChange: (notes: string) => void;
}

export default function TimerEditDialog({
  open,
  onOpenChange,
  editName,
  editNotes,
  onNameChange,
  onNotesChange,
}: TimerEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Timer Entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Entry name (optional)"
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>
          <div>
            <Textarea
              placeholder="Notes (optional)"
              value={editNotes}
              onChange={(e) => onNotesChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => onOpenChange(false)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}