import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useState, useEffect } from "react";
import { Coffee, Coins } from "lucide-react";
import useWallet from "@/store/useWallet";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}

interface TipAmount {
  value: number;
  label: string;
}

const DEFAULT_TIP_AMOUNTS: TipAmount[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
];

const SUPPORTED_CHAINS = [
  { value: "AO", label: "AO", symbol: "AO" },
  { value: "ARIO", label: "ARIO", symbol: "ARIO" },
  { value: "AR", label: "Arweave", symbol: "AR" },
  { value: "wAR", label: "wAR", symbol: "wAR" },
];

interface FundMyBrewData {
  title: string;
  description: string;
  buttonName: string;
  paymentAddress: string;
  selectedChain: string;
  tipAmounts: TipAmount[];
  customAmount: string;
}

function BlockForFundMyBrew({ isEdit, setError }: Props) {
  const { address } = useWallet();
  const theme = useTheme().theme;
  const renderChainLogo = (label: string) => {
    const commonCls = "inline h-4 w-4 mr-2";
    if (label === "ARIO") {
      return (
        <img
          src="https://arweave.net/GIayVyo49wof1hOtgLcJ_XAE6OuF5MeYiYsgu3z4gxk"
          alt="ARIO"
          className={commonCls}
        />
      );
    }
    if (label === "AO") {
      const src =
        theme === "dark"
          ? "https://arweave.net/UVK6iwKDIqAo_vfWIMqIiwV7Qp4mY4y8QPyi2sdrCeo"
          : "https://arweave.net/O-DVZ_sUmrNdZKhgoPrACAsApCUTvMmeyjH_Et_UWi8";
      return <img src={src} alt="AO" className={commonCls} />;
    }
    if (label === "Arweave") {
      const src =
        theme === "dark"
          ? "https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
          : "https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E";
      return <img src={src} alt="Arweave" className={commonCls} />;
    }
    if (label === "wAR") {
      return (
        <img
          src="https://arweave.net/L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs"
          alt="wAR"
          className={commonCls}
        />
      );
    }
    return null;
  };
  const [blockData, setBlockData] = useState<FundMyBrewData>({
    title: "Fund My Brew",
    description: "",
    buttonName: "Buy me a coffee",
    paymentAddress: address || "",
    selectedChain: "AO",
    tipAmounts: DEFAULT_TIP_AMOUNTS,
    customAmount: "",
  });

  const [showCustomAmount, setShowCustomAmount] = useState(false);

  useEffect(() => {
    if (address && !blockData.paymentAddress) {
      setBlockData((prev) => ({ ...prev, paymentAddress: address }));
    }
  }, [address, blockData.paymentAddress]);

  useEffect(() => {
    if (
      !blockData.title ||
      !blockData.paymentAddress ||
      !blockData.selectedChain
    ) {
      setError(true);
    } else {
      setError(false);
    }
  }, [
    blockData.title,
    blockData.paymentAddress,
    blockData.selectedChain,
    setError,
  ]);

  const handleTipAmountToggle = (value: number) => {
    setBlockData((prev) => {
      const exists = prev.tipAmounts.find((amt) => amt.value === value);
      if (exists) {
        return {
          ...prev,
          tipAmounts: prev.tipAmounts.filter((amt) => amt.value !== value),
        };
      } else {
        return {
          ...prev,
          tipAmounts: [
            ...prev.tipAmounts,
            { value, label: value.toString() },
          ].sort((a, b) => a.value - b.value),
        };
      }
    });
  };

  const handleAddCustomAmount = () => {
    const customValue = parseFloat(blockData.customAmount);
    if (!customValue || customValue <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const exists = blockData.tipAmounts.find(
      (amt) => amt.value === customValue
    );
    if (exists) {
      toast.warning("This amount already exists");
      return;
    }

    setBlockData((prev) => ({
      ...prev,
      tipAmounts: [
        ...prev.tipAmounts,
        { value: customValue, label: customValue.toString() },
      ].sort((a, b) => a.value - b.value),
      customAmount: "",
    }));
    setShowCustomAmount(false);
    toast.success("Custom amount added");
  };

  const handleRemoveTipAmount = (value: number) => {
    setBlockData((prev) => ({
      ...prev,
      tipAmounts: prev.tipAmounts.filter((amt) => amt.value !== value),
    }));
  };

  const getChainSymbol = () => {
    const chain = SUPPORTED_CHAINS.find(
      (c) => c.value === blockData.selectedChain
    );
    return chain?.symbol || "Token";
  };

  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Title</Label>
            <Input
              placeholder="e.g., Fund My Brew"
              value={blockData.title}
              onChange={(e) =>
                setBlockData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-muted/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Description (Goal)</Label>
            <Textarea
              placeholder="Tell people why you're collecting tips..."
              value={blockData.description}
              onChange={(e) =>
                setBlockData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-20 bg-muted/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Button Name</Label>
            <Input
              placeholder="e.g., Buy me a coffee"
              value={blockData.buttonName}
              onChange={(e) =>
                setBlockData((prev) => ({
                  ...prev,
                  buttonName: e.target.value,
                }))
              }
              className="bg-muted/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Token</Label>
            <Select
              value={blockData.selectedChain}
              onValueChange={(value) =>
                setBlockData((prev) => ({ ...prev, selectedChain: value }))
              }
            >
              <SelectTrigger className="bg-muted/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CHAINS.map((chain) => (
                  <SelectItem key={chain.value} value={chain.value}>
                    {chain.label === "ARIO" && (
                      <img
                        src="https://arweave.net/GIayVyo49wof1hOtgLcJ_XAE6OuF5MeYiYsgu3z4gxk"
                        alt="ARIO"
                        className="inline h-4 w-4 mr-2"
                      />
                    )}

                    {chain.label === "AO" && (
                      <div>
                        {theme === "dark" ? (
                          <img
                            src="https://arweave.net/UVK6iwKDIqAo_vfWIMqIiwV7Qp4mY4y8QPyi2sdrCeo"
                            className="inline h-4 w-4 mr-2"
                          />
                        ) : (
                          <img
                            src="https://arweave.net/O-DVZ_sUmrNdZKhgoPrACAsApCUTvMmeyjH_Et_UWi8"
                            className="inline h-4 w-4 mr-2"
                          />
                        )}
                      </div>
                    )}

                    {chain.label === "Arweave" && (
                      <div>
                        {theme === "dark" ? (
                          <img
                            src="https://arweave.net/r6TvdrKbdBtWUaCs_m1sT9ce1JWxE4lhJlOOixb_INw"
                            className="inline h-4 w-4 mr-2"
                          />
                        ) : (
                          <img
                            src="https://arweave.net/ntfnBJCwLW8nFY083UJCcGYCZt5uUuRBd3szkGoAE6E"
                            className="inline h-4 w-4 mr-2"
                          />
                        )}
                      </div>
                    )}
                    {chain.label === "wAR" && (
                      <img
                        src="https://arweave.net/L99jaxRKQKJt9CqoJtPaieGPEhJD3wNhR4iGqc8amXs"
                        className="inline h-4 w-4 mr-2"
                      />
                    )}
                    {chain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which token to receive tips on
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Payment Address</Label>
            <Input
              placeholder="Enter payment address"
              value={blockData.paymentAddress}
              onChange={(e) =>
                setBlockData((prev) => ({
                  ...prev,
                  paymentAddress: e.target.value,
                }))
              }
              className="bg-muted/40 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {address
                ? "Using your connected wallet address"
                : "Please connect your wallet or enter an address manually"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Tip Amounts ({getChainSymbol()})
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {blockData.tipAmounts.map((amount) => {
                const isSelected = blockData.tipAmounts.some(
                  (amt) => amt.value === amount.value
                );
                return (
                  <Button
                    key={amount.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTipAmountToggle(amount.value)}
                  >
                    {amount.value} {getChainSymbol()}
                  </Button>
                );
              })}
            </div>

            {showCustomAmount ? (
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={blockData.customAmount}
                  onChange={(e) =>
                    setBlockData((prev) => ({
                      ...prev,
                      customAmount: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                  min="0"
                  step="0.01"
                />
                <Button type="button" onClick={handleAddCustomAmount}>
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowCustomAmount(false);
                    setBlockData((prev) => ({ ...prev, customAmount: "" }));
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCustomAmount(true)}
                className="w-full"
              >
                Add Custom Amount
              </Button>
            )}

            {blockData.tipAmounts.length > 0 && (
              <div className="p-3 border rounded-lg bg-muted/40 space-y-2">
                <Label className="text-xs font-medium">Selected Amounts:</Label>
                <div className="flex flex-wrap gap-2">
                  {blockData.tipAmounts.map((amt) => (
                    <div
                      key={amt.value}
                      className="flex items-center gap-1 px-2 py-1 bg-background rounded text-sm"
                    >
                      <span>
                        {amt.value} {getChainSymbol()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTipAmount(amt.value)}
                        className="ml-1 text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Select preset amounts or add custom amounts for tips
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {blockData.title ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">{blockData.title}</h3>
                </div>
                {blockData.description && (
                  <p className="text-sm text-muted-foreground">
                    {blockData.description}
                  </p>
                )}
              </div>

              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Chain:</span>
                  <div className="flex items-center">
                    {renderChainLogo(
                      SUPPORTED_CHAINS.find(
                        (c) => c.value === blockData.selectedChain
                      )?.label || ""
                    )}
                    <span className="font-medium">
                      {
                        SUPPORTED_CHAINS.find(
                          (c) => c.value === blockData.selectedChain
                        )?.label
                      }
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-mono text-xs">
                    {blockData.paymentAddress.slice(0, 8)}...
                    {blockData.paymentAddress.slice(-6)}
                  </span>
                </div>
              </div>

              {blockData.tipAmounts.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Amount</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {blockData.tipAmounts.map((amt) => (
                      <Button
                        key={amt.value}
                        variant="outline"
                        className="flex flex-col items-center py-3 h-auto"
                      >
                        <Coins className="h-4 w-4 mb-1" />
                        <span className="text-sm font-semibold">
                          {amt.value} {getChainSymbol()}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" size="lg">
                <Coffee className="h-4 w-4 mr-2" />
                {blockData.buttonName || "Buy me a coffee"}
              </Button>
            </>
          ) : (
            <div className="p-6 bg-muted/30 rounded-lg text-center">
              <Coffee className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No tip configuration set
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BlockForFundMyBrew;
