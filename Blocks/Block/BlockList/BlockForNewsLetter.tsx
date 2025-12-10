import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@radix-ui/react-dropdown-menu";
import { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/components/ui/input-group";
import { Command, Mail, Newspaper } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useBlockStore } from "@/store/useBlockStore";
interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}
interface NewsletterData {
  title: string;
  description: string;
  emailPlaceholder: string;
  buttonText: string;
  successTitle: string;
  successDescription: string;
}
function BlockForNewsLetter({ isEdit, uuid }: Props) {
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  const [newsletterData, setNewsletterData] = useState<NewsletterData>({
    title: "Subscribe to our Newsletter",
    description: "Get the latest updates and offers.",
    emailPlaceholder: "Enter your email",
    buttonText: "Subscribe",
    successTitle: "Thanks for joining our list!",
    successDescription: "Expect exclusive updates in your inbox soon.",
  });
  useEffect(() => {
    console.log("Newsletter Data Updated:", newsletterData);
    if (!isEdit) {
      updateBlock(uuid, {
        title: newsletterData.title,
        description: newsletterData.description,
        emailPlaceholder: newsletterData.emailPlaceholder,
        buttonText: newsletterData.buttonText,
        successTitle: newsletterData.successTitle,
        successDescription: newsletterData.successDescription,
      });
    }
  }, [isEdit, newsletterData, updateBlock, uuid]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
              //   htmlFor={`newsletter-title-${data.id}`}>
              >
                Newsletter Title
              </Label>
              <InputGroup>
                <InputGroupInput
                  // id={`image-title-${img.id}`}
                  placeholder="Enter newsletter title"
                  value={newsletterData.title}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
                <InputGroupAddon>
                  <Newspaper className="size-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label
              // htmlFor={`email-placeholder-${data.id}`}
              >
                Email Placeholder Text
              </Label>
              <InputGroup>
                <InputGroupInput
                  // id={`image-title-${img.id}`}
                  value={newsletterData.emailPlaceholder}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      emailPlaceholder: e.target.value,
                    }))
                  }
                  placeholder="Enter email placeholder"
                />
                <InputGroupAddon>
                  <Mail className="size-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label
              // htmlFor={`button-text-${data.id}`}
              >
                Button Text
              </Label>
              <InputGroup>
                <InputGroupInput
                  // id={`image-title-${img.id}`}
                  placeholder="Enter button text"
                  value={newsletterData.buttonText}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      buttonText: e.target.value,
                    }))
                  }
                />
                <InputGroupAddon>
                  <Command className="size-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label
              // htmlFor={`newsletter-desc-${data.id}`}
              >
                Description Title
              </Label>
              <Textarea
                // id={`newsletter-desc-${data.id}`}
                placeholder="Describe your newsletter..."
                value={newsletterData.description}
                onChange={(e) =>
                  setNewsletterData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-20 bg-muted/40"
              />
            </div>

            <div className="space-y-2">
              <Label
              // htmlFor={`newsletter-success-title-${data.id}`}
              >
                Success Title
              </Label>
              <InputGroup>
                <InputGroupInput
                  placeholder="Enter success title"
                  value={newsletterData.successTitle}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      successTitle: e.target.value,
                    }))
                  }
                />
                <InputGroupAddon>
                  <Command className="size-4" />
                </InputGroupAddon>
              </InputGroup>
            </div>

            <div className="space-y-2">
              <Label
              // htmlFor={`newsletter-success-desc-${data.id}`}
              >
                Success Description
              </Label>
              <Textarea
                placeholder="Enter success description"
                value={newsletterData.successDescription}
                onChange={(e) =>
                  setNewsletterData((prev) => ({
                    ...prev,
                    successDescription: e.target.value,
                  }))
                }
                className="min-h-20 bg-muted/40"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 rounded-lg border bg-muted/20">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Mail className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold">
                  {newsletterData.title}
                </h3>
              </div>

              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {newsletterData.description}
              </p>

              {/* Mock Form */}
              <div className="space-y-3 max-w-sm mx-auto">
                <input
                  type="email"
                  placeholder={newsletterData.emailPlaceholder}
                  disabled
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />

                <Button
                  disabled
                  className="w-full bg-primary text-primary-foreground"
                >
                  {newsletterData.buttonText}
                </Button>
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 text-center">
                <p className="text-sm font-semibold text-emerald-700">
                  {newsletterData.successTitle}
                </p>
                <p className="text-xs text-emerald-700/70">
                  {newsletterData.successDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockForNewsLetter;
