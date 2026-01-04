import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen w-full justify-center">
      <div className="sticky top-0 z-10 flex h-screen w-20 flex-col items-center space-y-3 overflow-hidden border-x">
        {Array.from({ length: 200 }).map((_, index) => (
          <div
            key={index}
            className="bg-border -ml-20 min-h-px w-60 -rotate-45"
          ></div>
        ))}
      </div>
      <div className="w-full max-w-5xl">{children}</div>
      <div className="sticky top-0 z-10 flex h-screen w-20 flex-col items-center space-y-3 overflow-hidden border-x">
        {Array.from({ length: 200 }).map((_, index) => (
          <div
            key={index}
            className="bg-border -ml-20 min-h-px w-60 -rotate-45"
          ></div>
        ))}
      </div>
    </div>
  );
};
