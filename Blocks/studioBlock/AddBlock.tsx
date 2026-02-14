import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/src/components/ui/dialog";
import BlockDialog from "./BlockDialog";

export default function AddBlock() {
  return (
    <div className="mt-6 w-full max-w-xl">
      <Dialog>
        <DialogTrigger asChild className="w-full">
          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-lg border-2 border-dashed border-border bg-muted/30 hover:bg-accent text-muted-foreground hover:text-foreground h-14 shadow-[3px_3px_0px_var(--border)] hover:shadow-[5px_5px_0px_var(--border)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_var(--border)] transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-accent border-2 border-border p-1.5 shadow-[2px_2px_0px_var(--border)]">
                <Plus className="h-4 w-4 text-foreground" />
              </div>
              <span className="font-black uppercase tracking-wide">
                Add Block
              </span>
            </div>
          </Button>
        </DialogTrigger>
        <BlockDialog />
      </Dialog>
    </div>
  );
}
