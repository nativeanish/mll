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
import BlockForMultiUrl from "./BlockList/BlockForMultiUrl";
import BlockForCommunity from "./BlockList/BlockForCommunity";
import BlockForBazarCollection from "./BlockList/BlockForBazarCollection";
import BlockForBazarProfile from "./BlockList/BlockForBazarProfile";
import BlockForEmailGeneral from "./BlockList/BlockForEmailGeneral";
import BlockForFundMyBrew from "./BlockList/BlockForFundMyBrew";
import BlockForTokenInfo from "./BlockList/BlockForTokenInfo";
import BlockForTokenSwap from "./BlockList/BlockForTokenSwap";

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
        return <BlockForDivider isEdit={isEdit} setError={setError} />;
      case "Text-Card":
        return <BlockForText isEdit={isEdit} setError={setError} />;
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
      case "Twitch":
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
        return <BlockForImage isEdit={isEdit} setError={setError} />;
      case "Maps-Card":
        return <BlockForMap isEdit={isEdit} setError={setError} />;
      case "Calendar-Card":
        return <BlockForCalendar isEdit={isEdit} setError={setError} />;
      case "NewsLetter-Card":
        return <BlockForNewsLetter isEdit={isEdit} setError={setError} />;
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
        return <BlockForNumber isEdit={isEdit} setError={setError} />;
      case "File":
        return <BlockForFile isEdit={isEdit} setError={setError} />;
        return <BlockForMap isEdit={isEdit} setError={setError} />;
      case "Medium-Post":
      case "Paragraph-Post":
      case "Mirror-Post":
      case "Youtube-Video":
      case "Odysee-Video":
      case "Twitter-Post":
      case "Facebook-Post":
      case "Farcaster-Post":
      case "Instagram-Post":
      case "Tweet-Post":
        return <BlockForMultiUrl isEdit={isEdit} setError={setError} />;
      case "Telegram-Community":
      case "Discord-Community":
      case "Reddit-Community":
        return <BlockForCommunity isEdit={isEdit} setError={setError} />;
      case "Bazar-Collection":
        return <BlockForBazarCollection isEdit={isEdit} setError={setError} />;
      case "Bazar-Profile":
        return <BlockForBazarProfile isEdit={isEdit} setError={setError} />;
      case "FundMyBrew-Card":
        return <BlockForFundMyBrew isEdit={isEdit} setError={setError} />;
      case "permaswap-info":
        return <BlockForTokenInfo isEdit={isEdit} setError={setError} />;
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
        return <BlockForText isEdit={isEdit} setError={setError} />;
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
    <Card
      className={
        "transition-all duration-200 border-border hover:border-primary/50"
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={
                "p-2 rounded-lg transition-colors bg-primary/10 text-primary"
              }
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{block.name}</CardTitle>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStats()}
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onToggle}
                  >
                    <div
                      className={`w-4 h-2 rounded-full transition-colors ${
                        block.enabled ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
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
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>Delete block</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{renderBlockContent()}</CardContent>
      <CardFooter>
        <div className="flex w-full justify-between pt-2">
          <div className="flex items-center gap-2">
            {isEdit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEdit(!isEdit)}
                    disabled={error}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  Save changes to block
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEdit(!isEdit)}
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>Edit block</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                block.enabled
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
              }`}
            >
              {block.enabled ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default BlockItem;
