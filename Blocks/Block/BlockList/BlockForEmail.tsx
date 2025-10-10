import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Copy, Mail } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
function BlockForEmail({ isEdit, setError }: Props) {
  const [email, setEmail] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  useEffect(() => {
    if (email && email.length > 0) {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(email)) {
        setError(true);
        setEmailError("Enter a valid email address, eg: user@example.com");
        return;
      }
    }
    setError(false);
    setEmailError("");
  }, [email, setError]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              //  htmlFor={`email-${data.id}`}
              className="text-sm font-medium"
            >
              Email Address
            </Label>
            <Input
              //   id={`email-${data.id}`}
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`bg-muted/40`}
            />
          </div>
          <div className="space-y-2">
            <Label
              // htmlFor={`description-${data.id}`}
              className="text-sm font-medium"
            >
              Description (tooltip)
            </Label>
            <Textarea
              // id={`description-${data.id}`}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>
          {emailError && emailError.length > 0 && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {emailError}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {email ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 dark:bg-muted/30 bg-black/20 rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium break-all">{email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    navigator.clipboard.writeText(email);
                    toast.success("Email address copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  window.open(`mailto:${email}`, "_self");
                  toast.success("Opening email client...");
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {description && description.length > 0 && (
                <div>
                  <span className="text-xs dark:text-muted-foreground">
                    Description (tooltip):
                  </span>
                  <p className="text-sm dark:text-foreground">{description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 dark:bg-muted/30 bg-black/20 rounded-lg text-center">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm dark:text-muted-foreground">
                No email address set
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForEmail;
