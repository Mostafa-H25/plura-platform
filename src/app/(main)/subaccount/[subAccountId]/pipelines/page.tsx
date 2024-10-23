import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: { subAccountId: string };
};

const PipelinesPage = async ({ params }: Props) => {
  const pipelineExists = await db.pipeline.findFirst({
    where: { subAccountId: params.subAccountId },
  });

  if (pipelineExists)
    redirect(
      `/subaccount/${params.subAccountId}/pipelines/${pipelineExists.id}`
    );

  try {
    const response = await db.pipeline.create({
      data: { name: "First Pipeline", subAccountId: params.subAccountId },
    });
    return redirect(
      `/subaccount/${params.subAccountId}/pipelines/${response.id}`
    );
  } catch (error) {
    console.error(error);
  }

  return <div>PipelinesPage</div>;
};

export default PipelinesPage;
