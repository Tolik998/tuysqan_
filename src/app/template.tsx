import { ViewTransition } from "react";

export default function RootTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div className="page-shell min-h-screen">{children}</div>
    </ViewTransition>
  );
}
