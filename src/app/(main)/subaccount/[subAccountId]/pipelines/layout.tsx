import BlurPage from "@/components/global/blur-page";
import React, { ReactNode } from "react";

type Props = { children: ReactNode };

const layout = ({ children }: Props) => {
  return <BlurPage>{children}</BlurPage>;
};

export default layout;
