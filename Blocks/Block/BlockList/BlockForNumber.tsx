import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { Copy, Phone } from "lucide-react";
interface NumberBlockData {
  description: string;
  countryCode: string;
  phoneNumber: string;
  selectedCountry?: CountryData;
}
interface CountryData {
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  name: {
    common: string;
    official: string;
    nativeName?: {
      [languageCode: string]: {
        official: string;
        common: string;
      };
    };
  };
  idd: {
    root: string;
    suffixes?: string[];
  };
  timezones?: string[];
}
function BlockForNumber({ isEdit, setError }: Props) {
  const [description, setDescription] = useState("");
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{
    countryCode: string;
    selectedCountry: CountryData;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showError, setShowError] = useState(false);
  const [blockData, setBlockData] = useState<NumberBlockData>(() => {
    return {
      description: "",
      countryCode: selectedCountry?.countryCode || "",
      phoneNumber: "",
      selectedCountry: selectedCountry?.selectedCountry || undefined,
    };
  });
  useEffect(() => {
    console.log("Block Data:", blockData);
  }, [blockData]);
  useEffect(() => {
    if (blockData.phoneNumber && blockData.phoneNumber.length > 0) {
      const test = /^\d{7,15}$/;
      if (!test.test(blockData.phoneNumber)) {
        setError(true);
        setShowError(true);
        return;
      }
    }
    setError(false);
    setShowError(false);
  }, [blockData.phoneNumber, setError]);

  const { data, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<CountryData[]> => {
      const res = await fetch(
        "https://arweave.net/oXwiC2jv9AILJsnVpPoSH4X6rbhY-NJmP752vyd7W1Y"
      );
      return res.json();
    },
    enabled: true,
  });
  useEffect(() => {
    if (data) {
      setCountries(
        data.sort((a, b) => a.name.common.localeCompare(b.name.common))
      );
    }
  }, [data]);
  const handleCountrySelect = (countryName: string) => {
    const country = countries.find((c) => c.name.common === countryName);
    if (country) {
      const code =
        country.idd.suffixes && country.idd.suffixes.length > 1
          ? country.idd.root
          : `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;
      setBlockData((prev) => ({
        ...prev,
        countryCode: code,
        selectedCountry: country,
      }));
      setSelectedCountry({ countryCode: code, selectedCountry: country });
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Country</Label>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading countries...
              </div>
            ) : (
              <Select
                // value={blockData.selectedCountry?.name.common || ""}
                onValueChange={handleCountrySelect}
              >
                <SelectTrigger className="bg-muted/40">
                  <SelectValue placeholder="Select country">
                    {blockData.selectedCountry && (
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://arweave.net/${blockData.selectedCountry.flags.svg}`}
                          alt={blockData.selectedCountry.name.common}
                          className="w-5 h-3 object-cover rounded"
                        />
                        <span>{blockData.selectedCountry.name.common}</span>
                        <span className="text-muted-foreground">
                          ({blockData.countryCode})
                        </span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1.5">
                    <Input
                      placeholder="Search country..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCountries.map((country) => {
                      const code =
                        country.idd.suffixes && country.idd.suffixes.length > 1
                          ? country.idd.root
                          : `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;

                      return (
                        <SelectItem
                          key={country.name.common}
                          value={country.name.common}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://arweave.net/${country.flags.svg}`}
                              alt={country.name.common}
                              className="w-5 h-3 object-cover rounded"
                            />
                            <span>{country.name.common}</span>
                            <span className="text-muted-foreground">
                              ({code})
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </div>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label
              // htmlFor={`phone-${data.id}`}
              className="text-sm font-medium"
            >
              Phone Number
            </Label>
            <div className="flex gap-2">
              {selectedCountry?.countryCode &&
                selectedCountry.selectedCountry && (
                  <div className="flex items-center px-3 bg-muted/40 border rounded-md min-w-fit">
                    <span className="text-sm font-medium">
                      {selectedCountry.countryCode}
                    </span>
                  </div>
                )}
              <Input
                // id={`phone-${data.id}`}
                placeholder="Enter phone number"
                value={blockData.phoneNumber}
                onChange={(e) =>
                  setBlockData((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className={`bg-muted/40`}
              />
            </div>
            {showError && (
              <div className="text-sm mt-4 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                Phone number must contain only digits, no spaces or special
                characters.
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label
              //   htmlFor={`description-${data.id}`}
              className="text-sm font-medium"
            >
              Description (optional)
            </Label>
            <Textarea
              //   id={`description-${data.id}`}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {blockData.selectedCountry && blockData.phoneNumber ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <img
                  src={`https://arweave.net/${blockData.selectedCountry.flags.svg}`}
                  alt={blockData.selectedCountry.name.common}
                  className="w-8 h-5 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {blockData.selectedCountry.name.common}
                  </p>
                  <p className="text-lg font-semibold">
                    {`${blockData.countryCode} ${blockData.phoneNumber}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    const fullNumber = `${blockData.countryCode} ${blockData.phoneNumber}`;
                    navigator.clipboard.writeText(fullNumber);
                    toast.success("Phone number copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  window.open(
                    `tel:${blockData.countryCode} ${blockData.phoneNumber}`,
                    "_self"
                  );
                  toast.success("Initiating call...");
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-muted/30 rounded-lg text-center">
              <Phone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No phone number set
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForNumber;
