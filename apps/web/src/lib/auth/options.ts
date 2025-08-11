import DomainModel from "@/models/Domain";
import UserModel from "@/models/User";
import { createUser } from "@/server/api/routers/user/helpers";
import { adminAuth } from "@/server/lib/firebaseAdmin";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import z from "zod";
import { Log } from "../logger";
import { connectToDatabase } from "@workspace/common-logic";

const AuthorizeFirebaseSchema = z.object({
  idToken: z.string().min(1, "ID Token is required"),
});

// Define the NextAuth options
// Dont use default FirestoreAdapter but use custom credentials provider
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "firebase-credentials-provider",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials, req) {
        const domainInfo = req.headers?.["x-domain-identifier"];
        if (!domainInfo) {
          throw new Error("Domain identifier is required");
        }
        await connectToDatabase();
        const domain = await DomainModel.findOne({
          name: domainInfo,
        });
        if (!domain) {
          throw new Error("Domain not found");
        }
        const parsed = AuthorizeFirebaseSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error(parsed.error.message);
        }
        const { idToken } = parsed.data;
        try {
          // Connect to database
          //   await connectToDatabase();
          const decoded = await adminAuth.verifyIdToken(idToken);

          if (!decoded.email_verified) {
            throw new Error("Email is not verified");
          }
          const sanitizedEmail = decoded.email;
          if (!sanitizedEmail) {
            throw new Error("Email is required in ID Token");
          }

          let user = await UserModel.findOne({
            domain: domain._id,
            email: sanitizedEmail,
          });
          if (user && user.invited) {
            user.invited = false;
            await user.save();
          } else if (!user) {
            user = await createUser({
              domain,
              email: sanitizedEmail,
              name: decoded.name || "",
              providerData: {
                provider: "firebase",
                uid: decoded.uid,
                name: decoded.name || "",
              },
            });
            user.avatar = decoded.picture
              ? {
                  storageType: "custom",
                  data: {
                    url: decoded.picture,
                    caption: "Google profile picture",
                  },
                }
              : undefined;
            await user.save();
          }

          if (!user.active) {
            return null;
          }
          return {
            id: user.userId,
            userId: user.userId,
            email: sanitizedEmail,
            name: user.name,
            avatar: user.avatar,
            permissions: user.permissions || [],
            roles: user.roles || [],
            active: user.active,
            lead: user.lead,
            subscribedToUpdates: user.subscribedToUpdates,
            purchases: user.purchases || [],
            tags: user.tags || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        } catch (error) {
          if (error instanceof Error) {
            Log.error("Firebase ID Token verification failed", error);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.user = {
          id: user.id,
          userId: user.userId,
          email: user.email!,
          name: user.name || "",
          avatar: user.avatar,
          permissions: user.permissions || [],
          roles: user.roles || [],
          active: user.active,
          lead: user.lead,
          subscribedToUpdates: user.subscribedToUpdates,
          purchases: user.purchases || [],
          tags: user.tags || [],
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Membership data
          currentMembership: user.currentMembership,
        };
      }

      return token;
    },

    session: async ({ session, token }) => {
      if (token && token.user) {
        session.user = token.user as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface User {
    id: string;
    userId: string;
    email: string;
    name?: string;
    avatar?: {
      storageType: "media" | "custom";
      data: {
        url?: string;
        mediaId?: string;
        originalFileName?: string;
        mimeType?: string;
        size?: number;
        access?: string;
        thumbnail?: string;
        caption?: string;
        file?: string;
      };
    };
    permissions: string[];
    roles: string[];
    active: boolean;
    lead: string;
    subscribedToUpdates: boolean;
    purchases: any[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    // Membership data
    currentMembership?: {
      id: string;
      entityId: string;
      entityType: string;
      role?: string;
      status: string;
    };
  }
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      userId: string;
      email: string;
      name: string;
      avatar?: {
        storageType: "media" | "custom";
        data: {
          url?: string;
          mediaId?: string;
          originalFileName?: string;
          mimeType?: string;
          size?: number;
          access?: string;
          thumbnail?: string;
          caption?: string;
          file?: string;
        };
      };
      permissions: string[];
      roles: string[];
      active: boolean;
      lead: string;
      subscribedToUpdates: boolean;
      purchases: any[];
      tags: string[];
      createdAt: Date;
      updatedAt: Date;
      currentMembership?: {
        id: string;
        entityId: string;
        entityType: string;
        role?: string;
        status: string;
      };
    };
  }
}
