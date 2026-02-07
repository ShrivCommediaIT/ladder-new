
"use client";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ImageUpload from "./ImageUpload";
export const DraggablePlayerList = ({ players, setPlayers }) => {
  // Drag and drop reorder handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(players);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setPlayers(reordered);
  };
  // Image update handler
  const handleImageChange = (index, imageUrl) => {
    const updated = [...players];
    updated[index].image = imageUrl;
    setPlayers(updated);
  };
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="playerList">
        {(provided) => (
          <div
            className="grid grid-cols-3 gap-2"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {players.map((player, index) => (
              <Draggable
                key={player.id}
                draggableId={player.id.toString()}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-blue-100 border rounded-xl shadow p-2 flex items-center gap-2 cursor-move"
                  >
                    <span className="text-blue-800 font-bold w-10">
                      {String(index + 1).padStart(3, "0")}
                    </span>
                    <ImageUpload
                      player={player}
                      index={index}
                      onImageChange={handleImageChange}
                    />
                    <span className="truncate">{player.name}</span>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}