"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import Link from "next/link";

import { Button } from "@/components/ui/common/Button";

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
            <Button>Войти</Button>
          </Link>
          <Link href="/account/create">
            <Button variant="secondary">Регистрация</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default HeaderMenu;
