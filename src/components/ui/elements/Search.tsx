"use client";

import { SearchIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/common/Button";
import { Input } from "@/components/ui/common/Input";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(searchTerm);
  };

  return (
    <div className="hidden px-2 lg:block">
      <form className="relative flex items-center" onSubmit={onSubmit}>
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="rounded-4xl w-full py-4"
        />
        <Button
          variant="ghost"
          className="rounded-4xl absolute right-1 h-8 hover:bg-transparent"
          type="submit"
        >
          <SearchIcon className="absolute" />
        </Button>
      </form>
    </div>
  );
};

export default Search;
