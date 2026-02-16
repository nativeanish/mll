import { graphqlEndpoint, hbnode } from "../constant";
import { GetLatestUserProfile } from "../graphql";

interface ProfileAsset {
  id: string;
  quantity: string;
  dateCreated: number;
  lastUpdate: number;
}

interface ProfileData {
  id: string;
  walletAddress: string;
  username: string;
  displayName: string;
  description: string;
  thumbnail: string;
  banner: string;
  assets: ProfileAsset[];
  collections: string[];
}

interface CollectionData {
  id: string;
  title: string;
  description: string;
  creator: string;
  dateCreated: string;
  banner: string;
  thumbnail: string;
  assets: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const readString = (obj: Record<string, unknown>, key: string) =>
  typeof obj[key] === "string" ? (obj[key] as string) : "";

const readNumber = (obj: Record<string, unknown>, key: string) => {
  const value = obj[key];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export async function fetchProfileIdwithGrapqhl(wallet: string) {
  let lastError: Error | null = null;

  for (const endpoint of graphqlEndpoint) {
    try {
      const response = await fetch(`https://${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: GetLatestUserProfile,
          variables: { owner: wallet },
        }),
      });

      if (!response.ok) {
        throw new Error(`Network error from ${endpoint}: ${response.status}`);
      }

      const result = await response.json();
      const id = result?.data?.transactions?.edges?.[0]?.node?.id;

      if (typeof id !== "string" || !id.trim()) {
        throw new Error(`Invalid response shape from ${endpoint}: missing id`);
      }

      return id;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown network error");
    }
  }

  throw new Error(lastError?.message || "fails");
}

export async function fetchProfile(
  wallet: string,
): Promise<ProfileData | null> {
  try {
    const profileId = await fetchProfileIdwithGrapqhl(wallet);

    if (!profileId) {
      throw new Error("Profile id not received");
    }

    let lastError: Error | null = null;

    for (const node of hbnode) {
      try {
        const response = await fetch(
          `https://${node}/${profileId}~process@1.0/now`,
          {
            headers: {
              Accept: "application/json",
              "require-codec": "application/json",
              "accept-bundle": "true",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HB node error from ${node}: ${response.status}`);
        }

        const payload = await response.json();

        if (!isRecord(payload)) {
          throw new Error(`Invalid hb-node payload from ${node}`);
        }

        const zone = isRecord(payload.zone)
          ? payload.zone
          : isRecord(payload.Zone)
            ? payload.Zone
            : null;

        if (!zone) {
          throw new Error(`Missing zone data from ${node}`);
        }

        const walletAddress =
          readString(zone, "owner") || readString(zone, "Owner");

        if (!walletAddress || walletAddress !== wallet) {
          throw new Error(`Wallet mismatch from ${node}`);
        }

        const store = isRecord(zone.store)
          ? zone.store
          : isRecord(zone.Store)
            ? zone.Store
            : {};

        const rawAssets = Array.isArray(zone.assets)
          ? zone.assets
          : Array.isArray(zone.Assets)
            ? zone.Assets
            : [];

        const collections = Array.isArray(store.Collections)
          ? (store.Collections.filter(
              (item) => typeof item === "string",
            ) as string[])
          : Array.isArray(store.collections)
            ? (store.collections.filter(
                (item) => typeof item === "string",
              ) as string[])
            : [];

        const assets: ProfileAsset[] = rawAssets
          .filter((item) => isRecord(item))
          .map((item) => ({
            id: readString(item, "id") || readString(item, "Id"),
            quantity:
              readString(item, "quantity") || readString(item, "Quantity"),
            dateCreated:
              readNumber(item, "dateCreated") ||
              readNumber(item, "DateCreated"),
            lastUpdate:
              readNumber(item, "lastUpdate") || readNumber(item, "LastUpdate"),
          }))
          .filter((item) => item.id.length > 0);

        return {
          id: profileId,
          walletAddress,
          username:
            readString(store, "username") || readString(store, "Username"),
          displayName:
            readString(store, "displayName") ||
            readString(store, "DisplayName"),
          description:
            readString(store, "description") ||
            readString(store, "Description"),
          thumbnail:
            readString(store, "thumbnail") || readString(store, "Thumbnail"),
          banner: readString(store, "banner") || readString(store, "Banner"),
          assets,
          collections,
        };
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(`Unknown hb-node error from ${node}`);
      }
    }

    throw new Error(lastError?.message || "fails");
  } catch (error) {
    console.error("Failed to fetch profile id", error);
    return null;
  }
}

export async function getCollection(id: string) {
  let lastError: Error | null = null;

  try {
    for (const node of hbnode) {
      try {
        const response = await fetch(`https://${node}/${id}~process@1.0/now`, {
          headers: {
            Accept: "application/json",
            "require-codec": "application/json",
            "accept-bundle": "true",
          },
        });
        if (!response.ok) {
          throw new Error(`HB node error from ${node}: ${response.status}`);
        }

        const payload = await response.json();

        if (!isRecord(payload)) {
          throw new Error(`Invalid hb-node payload from ${node}`);
        }

        const rawCollection = payload.collection ?? payload.Collection;
        if (!rawCollection) {
          throw new Error(`Missing collection in payload from ${node}`);
        }

        let collectionValue: unknown = rawCollection;
        if (typeof rawCollection === "string") {
          try {
            collectionValue = JSON.parse(rawCollection);
          } catch {
            throw new Error(`Invalid collection JSON from ${node}`);
          }
        }

        if (!isRecord(collectionValue)) {
          throw new Error(`Invalid collection object from ${node}`);
        }

        const assets = Array.isArray(collectionValue.Assets)
          ? collectionValue.Assets.filter(
              (item): item is string => typeof item === "string",
            )
          : [];

        return {
          id,
          title: readString(collectionValue, "Name"),
          description: readString(collectionValue, "Description"),
          creator: readString(collectionValue, "Creator"),
          dateCreated: readString(collectionValue, "DateCreated"),
          banner: readString(collectionValue, "Banner"),
          thumbnail: readString(collectionValue, "Thumbnail"),
          assets,
        } satisfies CollectionData;
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(`Unknown hb-node error from ${node}`);
      }
    }

    throw new Error(lastError?.message || "fails");
  } catch (error) {
    console.error("Failed to fetch collection", error);
    return null;
  }
}
