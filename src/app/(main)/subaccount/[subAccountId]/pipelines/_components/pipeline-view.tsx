"use client";
import LaneForm from "@/components/forms/lane-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import {
  LaneDetail,
  PipelineDetailsWithLanesCardsTagsTickets,
  TicketAndTags,
} from "@/lib/types";
import { useModal } from "@/providers/modal-provider";
import { Lane, Ticket } from "@prisma/client";
import { Flag, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import PipelineLane from "./pipeline-lane";

type Props = {
  lanes: LaneDetail[];
  pipelineId: string;
  subAccountId: string;
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
  updateLanesOrder: (lanes: Lane[]) => Promise<void>;
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>;
};

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subAccountId,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const { setOpen } = useModal();
  const router = useRouter();
  const [allLanes, setAllLanes] = useState<LaneDetail[]>([]);

  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);

  const ticketsFromAllLanes: TicketAndTags[] = [];
  lanes.forEach((lane) => {
    lane.Tickets.forEach((ticket) => {
      ticketsFromAllLanes.push(ticket);
    });
  });

  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes);

  const handleAddLane = () => {
    setOpen(
      <CustomModal
        title=" Create A Lane"
        subheading="Lanes allow you to group tickets"
      >
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    );
  };

  const onDragEnd = (dropResult: DropResult) => {
    const { destination, source, type } = dropResult;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    switch (type) {
      case "lane": {
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, idx) => ({ ...lane, order: idx }));

        setAllLanes(newLanes);
        updateLanesOrder(newLanes);
        break;
      }
      case "ticket": {
        console.log("first");
        let newLanes = [...allLanes];
        const originLane = newLanes.find(
          (lane) => lane.id === source.droppableId
        );
        const destinationLane = newLanes.find(
          (lane) => lane.id === destination.droppableId
        );

        if (!originLane || !destinationLane) return;
        if (source.droppableId === destination.droppableId) {
          const newOrderTickets = [...originLane?.Tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.Tickets[source.index])
            .map((item, idx) => ({ ...item, order: idx }));
          originLane.Tickets = newOrderTickets;
          setAllLanes(newLanes);
          updateTicketsOrder(newOrderTickets);
          router.refresh();
        } else {
          const [currentTicket] = originLane.Tickets.splice(source.index, 1);
          originLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });
          destinationLane.Tickets.splice(destination.index, 0, {
            ...currentTicket,
            laneId: destination.droppableId,
          });
          destinationLane.Tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });
          setAllLanes(newLanes);
          updateTicketsOrder([
            ...destinationLane.Tickets,
            ...originLane.Tickets,
          ]);
          router.refresh();
        }
        break;
      }

      default:
        break;
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails.name}</h1>
          <Button onClick={handleAddLane} className="flex items-center gap-4">
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
        <Droppable
          droppableId="lane"
          type="lane"
          direction="horizontal"
          key="lanes"
        >
          {(provided) => (
            <div
              className="flex items-center gap-x-2 overflow-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex mt-4">
                {allLanes.map((lane, index) => (
                  <PipelineLane
                    allTickets={allTickets}
                    setAllTickets={setAllTickets}
                    subAccountId={subAccountId}
                    pipelineId={pipelineId}
                    tickets={lane.Tickets}
                    laneDetails={lane}
                    index={index}
                    key={lane.id}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
        {allLanes.length === 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <Flag width="100" height="100" className="text-muted-foreground" />
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default PipelineView;
