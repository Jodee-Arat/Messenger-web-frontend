import { cn } from "@/shared/utils/tw-merge";
import { type VariantProps, cva } from "class-variance-authority";

const headingSizes = cva("", {
  variants: {
    size: {
      sm: "text-lg",
      default: "text-xl sm:text-2xl",
      lg: "text-3xl sm:text-4xl",
      xl: "text-4xl sm:text-5xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface HeadingProps extends VariantProps<typeof headingSizes> {
  title: string;
  description?: string;
}

const Heading = ({ size, title, description }: HeadingProps) => {
  return (
    <div className="min-w-0 space-y-2">
      <h1
        className={cn(
          "text-foreground break-words font-semibold",
          headingSizes({ size }),
        )}
      >
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground break-words">{description}</p>
      )}
    </div>
  );
};

export default Heading;
