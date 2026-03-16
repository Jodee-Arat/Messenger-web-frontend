import HeaderMenu from "./HeaderMenu";
import Logo from "./Logo";

const Header = () => {
  return (
    <header className="border-border bg-card flex h-full items-center gap-x-4 border-b px-4">
      <Logo />
      <HeaderMenu />
    </header>
  );
};

export default Header;
