import { Settings2 } from "lucide-react";
import { ReactNode, useState } from "react";

import { Button } from "@/components/ui/common/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/common/Dialog";

type SettingsModalProps = {
  title?: ReactNode | null; // pass null to hide title
  children: ReactNode;

  // control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;

  // trigger
  trigger?: ReactNode; // custom trigger; if not provided, default icon button is used
  icon?: ReactNode; // icon for default trigger
  triggerButtonProps?: React.ComponentProps<typeof Button>; // props for default trigger button

  // styling
  contentClassName?: string;
  titleClassName?: string;
};

const SettingsModal = ({
  title = "Settings",
  children,
  open,
  onOpenChange,
  defaultOpen,
  trigger,
  icon = <Settings2 />,
  triggerButtonProps,
  contentClassName,
  titleClassName,
}: SettingsModalProps) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState<boolean>(
    defaultOpen ?? false
  );
  const currentOpen = isControlled ? (open as boolean) : internalOpen;

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  const {
    className,
    size = "icon",
    variant = "default",
    ...btnRest
  } = triggerButtonProps ?? {};

  return (
    <Dialog open={currentOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          <>{trigger}</>
        ) : (
          <Button
            className={className}
            size={size}
            variant={variant}
            {...btnRest}
          >
            {icon}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={contentClassName}>
        {title !== null && (
          <DialogTitle className={titleClassName}>{title}</DialogTitle>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
