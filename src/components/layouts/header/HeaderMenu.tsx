"use client";

import Link from "next/link";

import { Button } from "@/components/ui/common/Button";

import { useAuth } from "@/hooks/useAuth";

import ProfileMenu from "./ProfileMenu";

const HeaderMenu = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="ml-auto flex items-center gap-x-4">
      {isAuthenticated ? (
        <ProfileMenu />
      ) : (
        <>
          <Link href="/account/login">
            <Button>Login</Button>
          </Link>
          <Link href="/account/create">
            <Button variant="secondary">Register</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default HeaderMenu;
