import { Metadata } from "next";

import CreateAccountForm from "@/components/features/auth/forms/CreateAccountForm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Create Account",
    description: "Create a new account",
  };
}

export default function CreateAccountPage() {
  return <CreateAccountForm />;
}
