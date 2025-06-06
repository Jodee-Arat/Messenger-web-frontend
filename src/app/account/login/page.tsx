import { Metadata } from "next";

import LoginAccountForm from "@/components/features/auth/forms/LoginAccountForm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Login",
    description: "Login to your account",
  };
}

export default function LoginPage() {
  return <LoginAccountForm />;
}
