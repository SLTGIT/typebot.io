import { TextLink } from "@/components/TextLink";
import { ParentModalProvider } from "@/features/graph/providers/ParentModalProvider";
import { useUser } from "@/features/user/hooks/useUser";
import type { WorkspaceInApp } from "@/features/workspace/WorkspaceProvider";
import { toast } from "@/lib/toast";
import { trpc } from "@/lib/trpc";
import { HStack, Stack, Text } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { Plan } from "@typebot.io/prisma/enum";
import { useState } from "react";
import type { PreCheckoutModalProps } from "./PreCheckoutModal";
import { PreCheckoutModal } from "./PreCheckoutModal";
import { ProPlanPricingCard } from "./ProPlanPricingCard";
import { StarterPlanPricingCard } from "./StarterPlanPricingCard";
import { StripeClimateLogo } from "./StripeClimateLogo";

type Props = {
  workspace: WorkspaceInApp;
  currentUserMode?: "guest" | "read" | "write";
  excludedPlans?: ("STARTER" | "PRO")[];
};

export const ChangePlanForm = ({
  workspace,
  currentUserMode,
  excludedPlans,
}: Props) => {
  const { t } = useTranslate();

  const { user } = useUser();
  const [preCheckoutPlan, setPreCheckoutPlan] =
    useState<PreCheckoutModalProps["selectedSubscription"]>();

  const trpcContext = trpc.useContext();

  const { data, refetch } = trpc.billing.getSubscription.useQuery({
    workspaceId: workspace.id,
  });

  const { mutate: updateSubscription, isLoading: isUpdatingSubscription } =
    trpc.billing.updateSubscription.useMutation({
      onError: (error) => {
        toast({
          description: error.message,
        });
      },
      onSuccess: ({ workspace, checkoutUrl }) => {
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        }
        refetch();
        trpcContext.workspace.getWorkspace.invalidate();
        toast({
          status: "success",
          description: t("billing.updateSuccessToast.description", {
            plan: workspace?.plan,
          }),
        });
      },
    });

  const handlePayClick = async (plan: "STARTER" | "PRO") => {
    if (!user) return;

    const newSubscription = {
      plan,
      workspaceId: workspace.id,
    } as const;
    if (workspace.stripeId) {
      updateSubscription({
        ...newSubscription,
        returnUrl: window.location.href,
      });
    } else {
      setPreCheckoutPlan(newSubscription);
    }
  };

  if (
    data?.subscription?.cancelDate ||
    data?.subscription?.status === "past_due"
  )
    return null;

  const isSubscribed =
    (workspace.plan === Plan.STARTER || workspace.plan === Plan.PRO) &&
    workspace.stripeId;

  if (workspace.plan !== Plan.FREE && !isSubscribed) return null;

  if (currentUserMode !== "write")
    return (
      <Text>
        Only workspace admins can change the subscription plan. Contact your
        workspace admin to change the plan.
      </Text>
    );

  return (
    <></>
  );
};
