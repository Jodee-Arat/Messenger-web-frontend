"use client";

import Image from "next/image";

import GroupsSidebarItem from "./GroupsSidebarItem";
import { Route } from "./route.interface";

const GroupsSidebar = () => {
  const ImageGroup = (
    <Image
      src={"/images/avatar/lega.jpg"}
      alt="frontend"
      width={40}
      height={40}
      className="size-10 rounded-full object-cover"
    />
  );
  const routes: Route[] = [
    {
      label: "Frontend",
      href: "/frontend",
      icon: ImageGroup,
    },
    {
      label: "Backend",
      href: "/backend",
      icon: ImageGroup,
    },
    {
      label: "DevOps",
      href: "/devops",
      icon: ImageGroup,
    },
  ];

  return (
    <div className="mt-[75px] flex w-[75px] flex-col items-center space-y-2">
      {routes.map((route, index) => (
        <GroupsSidebarItem key={index} route={route} />
      ))}
    </div>
  );
};

export default GroupsSidebar;
