import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  ChartCandlestick,
  Edit3,
  Eye,
  MousePointerClick,
  Save,
  Trash2,
} from "lucide-react";
import React, { useEffect } from "react";
import type { BlockData } from "@/store/useBlockStore";
import BlockForDivider from "./BlockList/BlockForDivider";
import BlockForText from "./BlockList/BlockForText";
import BlockForSocial from "./BlockList/BlockForSocial";
import BlockForUrl from "./BlockList/BlockForUrl";
import BlockForImage from "./BlockList/BlockForImage";
import BlockForMap from "./BlockList/BlockForMap";
import BlockForCalendar from "./BlockList/BlockForCalendar";
import BlockForNewsLetter from "./BlockList/BlockForNewsLetter";
import BlockForEmail from "./BlockList/BlockForEmail";
import BlockForNumber from "./BlockList/BlockForNumber";
import BlockForFile from "./BlockList/BlockForFile";
import BlockForCommunity from "./BlockList/BlockForCommunity";
import BlockForBazarCollection from "./BlockList/BlockForBazarCollection";
import BlockForBazarProfile from "./BlockList/BlockForBazarProfile";
import BlockForEmailGeneral from "./BlockList/BlockForEmailGeneral";
import BlockForFundMyBrew from "./BlockList/BlockForFundMyBrew";
import BlockForTokenInfo from "./BlockList/BlockForTokenInfo";
import BlockForTokenSwap from "./BlockList/BlockForTokenSwap";
import BlockForSocialPost from "./BlockList/BlockForSocialPost";

interface BlockItemProps {
  block: BlockData;
  onToggle: () => void;
  onDelete: () => void;
}

function BlockItem({ block, onToggle, onDelete }: BlockItemProps) {
  const [isEdit, setIsEdit] = React.useState(false);
  const [error, setError] = React.useState(false);

  const IconComponent = block.icon as React.ComponentType<{
    className?: string;
  }>;
  useEffect(() => {
    console.log("BlockItem mounted or updated:", block);
  }, [block]);
  const renderBlockContent = () => {
    switch (block.alt) {
      case "Divider":
        return (
          <BlockForDivider
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
          />
        );
      case "Text-Card":
        return (
          <BlockForText isEdit={isEdit} setError={setError} uuid={block.id} />
        );
      case "Twitter":
      case "Telegram":
      case "Discord":
      case "Farcaster":
      case "Medium":
      case "Mirror":
      case "Youtube":
      case "Github":
      case "Instagram":
      case "Facebook":
      case "Linkedin":
      case "Reddit":
      case "Snapchat":
      case "BlueSky":
      case "Odysee":
      case "Url":
        return (
          <BlockForSocial
            isEdit={isEdit}
            setError={setError}
            alt={block.alt}
            placeholder={block.placeholder}
            uuid={block.id}
          />
        );
      case "Url-Card":
        return (
          <BlockForUrl uuid={block.id} isEdit={isEdit} setError={setError} />
        );
      case "Image-Card":
        return (
          <BlockForImage isEdit={isEdit} setError={setError} uuid={block.id} />
        );
      case "Maps-Card":
        return (
          <BlockForMap isEdit={isEdit} setError={setError} uuid={block.id} />
        );
      case "Calendar-Card":
        return (
          <BlockForCalendar
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
          />
        );
      case "NewsLetter-Card":
        return (
          <BlockForNewsLetter
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
          />
        );
      case "Email-Card":
        return (
          <BlockForEmailGeneral
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
          />
        );
      case "Email":
        return (
          <BlockForEmail isEdit={isEdit} setError={setError} uuid={block.id} />
        );
      case "Phone-Card":
        return (
          <BlockForNumber isEdit={isEdit} setError={setError} uuid={block.id} />
        );
      case "File":
        return (
          <BlockForFile isEdit={isEdit} setError={setError} uuid={block.id} />
        );
      case "Medium-Post":
      case "Paragraph-Post":
      case "Youtube-Video":
      case "Odysee-Video":
      case "Twitch-Video":
        return (
          <BlockForSocial
            isEdit={isEdit}
            setError={setError}
            alt={block.alt}
            uuid={block.id}
          />
        );

      case "Twitter-Post":
      case "Farcaster-Post":
      case "Reddit-Post":
      case "Bluesky-Post":
        return (
          <BlockForSocialPost
            isEdit={isEdit}
            setError={setError}
            alt={block.alt}
            placeholder={block.placeholder}
            uuid={block.id}
          />
        );
      case "Telegram-Community":
      case "Discord-Community":
      case "Reddit-Community":
        return (
          <BlockForCommunity
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
            alt={block.alt}
          />
        );
      case "Bazar-Collection":
        return <BlockForBazarCollection isEdit={isEdit} setError={setError} />;
      case "Bazar-Profile":
        return (
          <BlockForBazarProfile
            uuid={block.id}
            isEdit={isEdit}
            setError={setError}
          />
        );
      case "FundMyBrew-Card":
        return (
          <BlockForFundMyBrew
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
          />
        );
      case "permaswap-info":
        return (
          <BlockForTokenInfo
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
          />
        );
      case "permaswap-swap":
        return (
          <BlockForTokenSwap
            isEdit={isEdit}
            setError={setError}
            uuid={block.id}
            onExitEdit={() => setIsEdit(false)}
          />
        );
      default:
        return (
          <BlockForText isEdit={isEdit} setError={setError} uuid={block.id} />
        );
    }
  };

  const renderStats = () => {
    const displayArray = Array.isArray(block.display)
      ? block.display
      : [block.display];

    return (
      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
        {displayArray.includes("Click") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{block.clicks} clicks</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.clicks} clicks in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("View") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{block.views} views</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.views} views in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Subscribe") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{block.subscribers} subscribers</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.subscribers} subscribers in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Join") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{block.join} joins</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.join} joins in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Read") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{block.read} reads</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.read} reads in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Download") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{block.download} downloads</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.download} downloads in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Schedule") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{block.schedule} scheduled</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.schedule} scheduled in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Tip") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  <span>{block.tip} tips</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.tip} tips in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
        {displayArray.includes("Trade") && (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <ChartCandlestick className="h-3 w-3" />
                  <span>0 {block.trade}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.trade} trades in Total
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="transition-all duration-300 border-border/50 hover:border-border bg-card/50 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md group/card overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/5 text-primary ring-1 ring-primary/10 transition-colors group-hover/card:bg-primary/10">
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold">
                {block.name}
              </CardTitle>
              <span
                className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full transition-colors ${
                  block.enabled
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {block.enabled ? "Active" : "Off"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg"
                  onClick={onToggle}
                >
                  <div
                    className={`relative w-7 h-4 rounded-full transition-colors ${
                      block.enabled
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                        block.enabled ? "translate-x-3.5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>
                {block.enabled ? "Disable" : "Enable"} block
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={4}>Delete block</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-5 pt-0 pb-2">
        {renderBlockContent()}
      </CardContent>

      <CardFooter className="px-4 sm:px-5 pb-3 pt-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsEdit(!isEdit)}
                disabled={error}
                className="rounded-lg h-8 text-xs font-medium shadow-sm"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEdit(!isEdit)}
                className="rounded-lg h-8 text-xs font-medium border-border/50 hover:bg-muted/50"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
          <div className="hidden sm:flex items-center">{renderStats()}</div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BlockItem;
