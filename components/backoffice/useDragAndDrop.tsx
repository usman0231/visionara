import { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface Item {
  id: string;
  sortOrder: number;
}

interface UseDragAndDropProps<T extends Item> {
  items: T[];
  setItems: (items: T[]) => void;
  updateEndpoint: string;
}

export function useDragAndDrop<T extends Item>({
  items,
  setItems,
  updateEndpoint
}: UseDragAndDropProps<T>) {
  const [isReordering, setIsReordering] = useState(false);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setIsReordering(true);

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      // Update sort orders based on new positions
      const updatedItems = reorderedItems.map((item, index) => ({
        ...item,
        sortOrder: index + 1
      }));

      // Update local state immediately for smooth UX
      setItems(updatedItems);

      // Send updates to the server
      try {
        await Promise.all(
          updatedItems.map((item) =>
            fetch(`${updateEndpoint}/${item.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...item,
                sortOrder: item.sortOrder
              }),
            })
          )
        );
      } catch (error) {
        console.error('Failed to update sort orders:', error);
        // Optionally revert the changes or show an error message
        // You might want to add error handling here
      }
    }

    setIsReordering(false);
  };

  return { handleDragEnd, isReordering };
}