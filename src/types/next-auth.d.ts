import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "OPERATOR" | "CAPTAIN";
      venueId: string | null;
    } & DefaultSession["user"];
  }
}
