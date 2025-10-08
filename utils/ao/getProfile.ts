import useWallet from "@/store/useWallet";
import { dryrun } from "@permaweb/aoconnect";

interface MessageTag {
  name: string;
  value: string;
}

interface Message {
  Anchor: string;
  Tags: MessageTag[];
  Target: string;
  Data: string;
}

interface RootObject {
  Messages: Message[];
}

interface MessageData {
  name: string;
  startTimestamp: number;
  owner: string;
  processId: string;
}

export interface Profile {
  Name: string;
  Description: string;
  Logo: string;
}

const getProfile = async (): Promise<Profile> => {
  try {
    const address = useWallet.getState().address;
    if (!address) throw new Error("No wallet address found");

    // Step 1: Fetch primary name info
    const res = await fetch(
      "https://cu.ardrive.io/dry-run?process-id=qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Id: "1234",
          Target: "qNvAoz0TgcH7DMg8BCVn8jF32QH5L6T29VjHxhHqqGE",
          Owner: "1234",
          Anchor: "0",
          Data: "1234",
          Tags: [
            { name: "Action", value: "Primary-Name" },
            { name: "Address", value: address },
          ],
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to fetch primary name");

    const resData = (await res.json()) as RootObject;
    const message = resData.Messages?.[0];
    const rawData = message?.Data;

    if (
      !rawData ||
      rawData === '[string ".src.main"]:5111: Primary name data not found'
    ) {
      throw new Error("No profile found");
    }

    // Step 2: Parse primary name message
    let profileData: MessageData;
    try {
      profileData = JSON.parse(rawData);
    } catch {
      throw new Error("Invalid profile data");
    }

    if (!profileData?.processId || profileData.processId.length !== 43) {
      throw new Error("Invalid process ID");
    }

    // Step 3: Fetch detailed profile info
    const infoRes = await dryrun({
      process: profileData.processId,
      tags: [{ name: "Action", value: "Info" }],
    });

    const infoMsg = infoRes?.Messages?.[0]?.Data;
    if (!infoMsg) throw new Error("No detailed profile found");

    let parsedInfo: Partial<Profile>;
    try {
      parsedInfo = JSON.parse(infoMsg);
    } catch {
      parsedInfo = {};
    }

    // Step 4: Return safe, always-defined structure
    return {
      Name: parsedInfo.Name ?? "",
      Description: parsedInfo.Description ?? "",
      Logo: parsedInfo.Logo ?? "",
    };
  } catch (err) {
    console.error("getProfile error:", err);
    return { Name: "", Description: "", Logo: "" };
  }
};

export default getProfile;
