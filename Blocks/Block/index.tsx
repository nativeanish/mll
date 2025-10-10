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
import { Edit3, Eye, MousePointerClick, Save, Trash2 } from "lucide-react";
import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import BlockForCommunity from "./BlockList/BlockForCommunity";

function Block() {
  const [isEdit, setIsEdit] = React.useState(false);
  const [error, setError] = React.useState(false);
  return (
    <div className="mt-8 max-w-xl">
      <Card
        className={
          "transition-all duration-200 border-border hover:border-primary/50"
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            {/** Icon Title */}
            <div className="flex items-center gap-3">
              {/** Icon */}
              <div
                className={
                  "p-2 rounded-lg transition-colors bg-primary/10 text-primary"
                }
              >
                <FaXTwitter className="h-5 w-5" />
              </div>
              {/** Title */}
              <div>
                <CardTitle className="text-base">Twitter</CardTitle>
              </div>
            </div>
            {/**Stats, Disable, Delete  */}
            <div className="flex items-center gap-2">
              {/** Stats */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          <span>0 clicks</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={4}>
                        0 clicks in Total
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>0 views</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={4}>
                        0 views in Total
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              {/**Action Button */}
              <div className="flex items-center gap-1">
                {/* Toggle enable/disable with tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <div
                        className={`w-4 h-2 rounded-full transition-colors bg-green-500`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={4}>Disable block</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
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
        <CardContent className="pt-0">
          <BlockForCommunity isEdit={isEdit} setError={setError} />
        </CardContent>
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
                className={`text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`}
              >
                Active
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Block;
