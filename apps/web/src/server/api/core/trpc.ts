import { authOptions } from "@/lib/auth/options";
import { getDomainData, getDomainHeaders } from "@/lib/domain";
import { Log } from "@/lib/logger";
import { initTRPC } from "@trpc/server";
import { getServerSession } from "next-auth";
import superjson from "superjson";
import { APIException } from "./exceptions";
import z, { ZodError } from "zod";

export async function createTRPCContext() {
  const session = await getServerSession(authOptions);
  const domainHeaders = await getDomainHeaders();
  const domainData = await getDomainData(domainHeaders);
  return {
    session,
    domainData,
    domainHeaders,
  };
}
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  // errorFormatter({ shape }) {
  //   return shape;
  // },
  errorFormatter: ({ shape, error }) => {
    console.error(
      "[errorBoundary]TRPC Error:",
      // { ...error.cause },
      // typeof error.cause,
      // error instanceof APIException,
      error.code,
      "|",
      typeof error.cause,
      error.cause instanceof ZodError,
      error instanceof APIException,
      "|",
      error.cause
    );
    if (error instanceof APIException) {
      // shape = {
      //   ...shape,
      //   data: {
      //     ...shape.data,
      //     error: error.cause,
      //   },
      // };
    }
    if (error.code === "BAD_REQUEST") {
      // if (error.cause instanceof ZodError) {
        return {
          ...shape,
          data: {
            ...shape.data,
            zodError:
              error.cause instanceof z.ZodError ? error.cause.issues : null,
            stack:
              process.env.NODE_ENV === "development" ? error.stack : undefined,
            code: error.code,
            message: error.message,
            name: "Custom"
            // Add custom error codes mapping
            // errorCode: mapErrorCode(error.code),
          },
          // data: {
          //   ...shape.data,
          //   zodError: error.cause.flatten(),
          // },
        };
      // }
    }
    return shape;
  },
});

export const router = t.router;
export const rootProcedure = t.procedure; //.use(errorBoundary);
