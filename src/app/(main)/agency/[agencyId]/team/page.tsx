import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Plus } from "lucide-react";
import DataTable from "./_components/data-table";
import { columns } from "./_components/columns";
import SendInvitation from "@/components/forms/send-invitation";

type Props = {
  params: {
    agencyId: string;
  };
};

const TeamsPage = async ({ params }: Props) => {
  const authUser = await currentUser();

  if (!authUser) return null;

  const agencyDetails = await db.agency.findUnique({
    where: { id: params.agencyId },
    include: { SubAccount: true },
  });
  if (!agencyDetails) return;

  const teamMembers = await db.user.findMany({
    where: { Agency: { id: params.agencyId } },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  });
  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={params.agencyId} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    />
  );
};

export default TeamsPage;
