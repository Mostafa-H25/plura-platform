import React from "react";
import { getAuthUserDetails } from "@/lib/queries";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subAccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();
  if (!user) return null;
  if (!user.Agency) return null;

  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency?.SubAccount.find((subAccount) => (subAccount.id = id));

  const isWhiteLabeledAgency = user.Agency.whiteLabel;

  if (!details) return;

  let sidebarLogo = user.Agency.agencyLogo || "/assets/plura-logo";

  if (!isWhiteLabeledAgency) {
    if (type === "subAccount") {
      sidebarLogo =
        user?.Agency.SubAccount.find((subAccount) => subAccount.id === id)
          ?.subAccountLogo || user.Agency.agencyLogo;
    }
  }

  const sidebarOpt =
    type === "agency"
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subAccount) => subAccount.id === id)
          ?.SidebarOption || [];

  const subAccounts = user.Agency.SubAccount.filter((subAccount) => {
    user.Permissions.find(
      (permission) =>
        permission.subAccountId === subAccount.id && permission.access
    );
  });

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        subAccounts={subAccounts}
        sidebarOpt={sidebarOpt}
        sidebarLogo={sidebarLogo}
        details={details}
        user={user}
        id={id}
      />
      <MenuOptions
        subAccounts={subAccounts}
        sidebarOpt={sidebarOpt}
        sidebarLogo={sidebarLogo}
        details={details}
        user={user}
        id={id}
      />
    </>
  );
};

export default Sidebar;
