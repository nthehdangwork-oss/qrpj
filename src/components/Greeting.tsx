"use client";
import WaxGreeting from "./WaxGreeting";
import DesignedGreeting from "./DesignedGreeting";
import type { CardContent } from "@/lib/rules";
export { symbols } from "./WaxGreeting";
export default function Greeting(props: {
  content: CardContent;
  defaultOpen?: boolean;
  immersive?: boolean;
}) {
  return props.content.design === "wax" ? (
    <WaxGreeting {...props} />
  ) : (
    <DesignedGreeting {...props} />
  );
}
