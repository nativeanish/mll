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
            className="w-full rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/40 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground h-14 transition-all duration-300 group"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-1.5 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">Add Block</span>
            </div>
          </Button>
        </DialogTrigger>
        <BlockDialog />
      </Dialog>
    </div>
  );
}
