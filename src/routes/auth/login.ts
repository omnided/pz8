import { createFileRoute } from "@tanstack/react-router";
import { AuthUserPage } from "../../pages/authUserPage";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/auth/login")({
  component: AuthUserPage,

  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: search['redirect'] as string | undefined,
    };
  },
});