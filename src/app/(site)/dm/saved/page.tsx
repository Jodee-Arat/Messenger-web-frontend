import { Metadata } from "next";

import SavedSecretChat from "@/components/features/saved/SavedSecretChat";
import RouteAccessGuard from "@/components/ui/elements/RouteAccessGuard";

export const metadata: Metadata = {
  title: "Saved messages",
  description: "Secret saved messages bridge between web and mobile",
};

const SavedDirectMessagesPage = () => {
  return (
    <RouteAccessGuard scope="auth" fallbackHref="/dm">
      <SavedSecretChat />
    </RouteAccessGuard>
  );
};

export default SavedDirectMessagesPage;
