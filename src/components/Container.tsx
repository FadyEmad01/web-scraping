import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PropContainerType {
  className?: string;
  children: ReactNode;
}

export const Container = (props: PropContainerType) => {
  return (
    <div
      className={cn(
        "h-full mx-auto w-full max-w-screen-2xl px-5 sm:px-8 md:px-20",
        props.className
      )}
    >
      {props.children}
    </div>
  );
};
