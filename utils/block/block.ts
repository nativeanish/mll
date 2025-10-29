import {
  MessageCircle,
  AlignCenter,
  Users,
  Clapperboard,
  File,
  Repeat,
  BookCheck,
  Link,
  Image,
  Link2,
  Map,
  Calendar,
  Newspaper,
  Images,
  User,
  Mail,
  Phone,
  SquareSplitVertical,
  Coffee,
  BadgeCent,
} from "lucide-react";
import { SiFarcaster } from "react-icons/si";
import Paragraph from "@/assets/Paragraph";
import Odysee from "@/assets/Odysee";
import Mirror from "@/assets/Mirror";
import {
  FaDiscord,
  FaFacebook,
  FaFile,
  FaInstagram,
  FaMedium,
  FaReddit,
  FaRetweet,
  FaTelegram,
  FaTwitch,
  FaYoutube,
} from "react-icons/fa";
import { RiNftFill } from "react-icons/ri";
import social from "./social";
import Permaswap from "@/assets/Permaswap";
export const node = {
  nav: [
    { name: "Social", icon: MessageCircle, node: social },
    {
      name: "General",
      icon: Link,
      node: [
        {
          name: "Image",
          alt: "Image-Card",
          icon: Image,
          description: "Upload and display images in your profile",
          display: "View",
        },
        {
          name: "Url",
          alt: "Url-Card",
          icon: Link2,
          description: "Add custom links to any website or resource",
          display: ["View", "Click"],
        },
        {
          name: "Maps",
          alt: "Maps-Card",
          icon: Map,
          description: "Add a map to your profile",
          display: ["View", "Click"],
        },
        {
          name: "Calendar",
          alt: "Calendar-Card",
          icon: Calendar,
          description: "Add a calendar to your profile to schedule events",
          display: ["View", "Sechedule"],
        },
        {
          name: "NewsLetter",
          alt: "NewsLetter-Card",
          icon: Newspaper,
          description:
            "Add a newsletter subscription to your profile to grow your audience",
          display: ["View", "Subscribe"],
        },
        {
          name: "Email",
          alt: "Email-Card",
          icon: Mail,
          description:
            "Add your email address to your profile for direct contact",
          display: ["View", "Click"],
        },
        {
          name: "Phone",
          alt: "Phone-Card",
          icon: Phone,
          description:
            "Add your phone number to your profile for direct contact",
          display: ["View", "Click"],
        },
        {
          name: "Divider",
          alt: "Divider",
          icon: SquareSplitVertical,
          description: "Add a visual divider",
          display: ["View"],
        },
        {
          name: "Fund My Brew",
          alt: "FundMyBrew-Card",
          icon: Coffee,
          description: "Accept tips and donations from your supporters",
          display: ["View", "Tip"],
        },
      ],
    },
    {
      name: "Text",
      icon: AlignCenter,
      node: [
        {
          name: "Text",
          alt: "Text-Card",
          icon: AlignCenter,
          description: "Add formatted text blocks and paragraphs",
          display: "View",
        },
      ],
    },
    {
      name: "File",
      icon: File,
      node: [
        {
          name: "File",
          alt: "File",
          icon: FaFile,
          description: "Upload and share various file types",
          display: ["View", "Download"],
        },
      ],
    },
    {
      name: "Publishing",
      icon: BookCheck,
      node: [
        {
          name: "Medium",
          alt: "Medium-Post",
          icon: FaMedium,
          description: "Feature your Medium articles and stories",
          display: ["View", "Read"],
        },
        {
          name: "Paragraph",
          alt: "Paragraph-Post",
          icon: Paragraph,
          description: "Share your Paragraph blog posts",
          display: ["View", "Read"],
        },
        {
          name: "Mirror",
          alt: "Mirror-Post",
          icon: Mirror,
          description: "Display your Mirror publications",
          display: ["View", "Read"],
        },
      ],
    },
    {
      name: "Video",
      icon: Clapperboard,
      node: [
        {
          name: "Youtube Video",
          alt: "Youtube-Video",
          icon: FaYoutube,
          description: "Embed YouTube videos and playlists",
          display: ["View", "Click"],
        },
        {
          name: "Odysee Video",
          alt: "Odysee-Video",
          icon: Odysee,
          description: "Share videos from Odysee platform",
          display: ["View", "Click"],
        },
        {
          name: "Twitch-Video",
          alt: "Twitch",
          icon: FaTwitch,
          description: "Feature Twitch clips and highlights",
          display: ["View", "Click"],
        },
      ],
    },
    {
      name: "Post",
      icon: Repeat,
      node: [
        {
          name: "Tweet",
          alt: "Twitter-Post",
          icon: FaRetweet,
          description: "Embed specific tweets and Twitter posts",
          display: ["View", "Click"],
        },
        {
          name: "Facebook Post",
          alt: "Facebook-Post",
          icon: FaFacebook,
          description: "Share Facebook posts and updates",
          display: ["View", "Click"],
        },
        {
          name: "Farcaster",
          alt: "Farcaster-Post",
          icon: SiFarcaster,
          description: "Display Farcaster casts and content",
          display: ["View", "Click"],
        },
        {
          name: "Instagram Post",
          alt: "Instagram-Post",
          icon: FaInstagram,
          description: "Feature Instagram posts and reels",
          display: ["View", "Click"],
        },
      ],
    },
    {
      name: "Community",
      icon: Users,
      node: [
        {
          name: "Telegram",
          alt: "Telegram-Community",
          icon: FaTelegram,
          description: "Link to Telegram groups and channels",
          display: ["View", "Join"],
        },
        {
          name: "Discord",
          alt: "Discord-Community",
          icon: FaDiscord,
          description: "Connect Discord servers and communities",
          display: ["View", "Join"],
        },
        {
          name: "Reddit",
          alt: "Reddit-Community",
          icon: FaReddit,
          description: "Share Reddit communities and discussions",
          display: ["View", "Join"],
        },
      ],
    },
    {
      name: "NFT",
      icon: RiNftFill,
      node: [
        {
          name: "Bazar Collection",
          alt: "Bazar-Collection",
          icon: Images,
          description: "A collection of your unique digital assets",
          display: ["View", "Click"],
        },
        {
          name: "Bazar Profile",
          alt: "Bazar-Profile",
          icon: User,
          description: "A profile showcasing your unique digital assets",
          display: ["View", "Click"],
        },
      ],
    },
    {
      name: "Coin",
      icon: BadgeCent,
      node: [
        {
          name: "Permaswap",
          alt: "permaswap",
          icon: Permaswap,
          description: "A Unified Financial Protocol on Permaweb",
          display: ["View", "Trade"],
        },
      ],
    },
  ],
};
