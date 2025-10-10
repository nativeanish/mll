import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

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
interface NumberBlockData {
  title: string;
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
  };
  idd: {
    root: string;
    suffixes?: string[];
  };
}
function BlockForNumber({ isEdit, setError }: Props) {
  const [description, setDescription] = useState("");
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<{
    countryCode: string;
    selectedCountry: CountryData;
  }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [blockData, setBlockData] = useState<NumberBlockData>(() => {
    try {
      if (data.urls && data.urls.length > 0) {
        return JSON.parse(data.urls[0]);
      }
    } catch {
      // ignore
    }

    return {
      title: data.title || "",
      description: data.customDescription || "",
      countryCode: "",
      phoneNumber: "",
      selectedCountry: undefined,
    };
  });

  const { data, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async (): Promise<CountryData[]> => {
      const res = await fetch("https://restcountries.com/v3.1/all");
      return res.json();
    },
    enabled: false,
  });
  useEffect(() => {
    if (blockData) {
      setCountries(
        blockData.sort((a, b) => a.name.common.localeCompare(b.name.common))
      );
    }
  }, [blockData]);
  const handleCountrySelect = (countryName: string) => {
    const country = countries.find((c) => c.name.common === countryName);
    if (country) {
      const code =
        country.idd.suffixes && country.idd.suffixes.length > 1
          ? country.idd.root
          : `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;

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
            <Label
              //   htmlFor={`description-${data.id}`}
              className="text-sm font-medium"
            >
              Description
            </Label>
            <Textarea
              //   id={`description-${data.id}`}
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 bg-muted/40"
            />
          </div>

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
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default BlockForNumber;
