"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableRow({
  id,
  children,
  enabled,
}: {
  id: number;
  children: React.ReactNode;
  enabled: boolean;
})
{
  const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  transition,
} = useSortable({
  id,
  disabled: !enabled,
});

  const style = {
    transform:
      CSS.Transform.toString(
        transform
      ),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        border-b
        border-zinc-800
        ${
            enabled
            ? "cursor-grab"
            : ""
        }
        `}
    >
      {children}
    </tr>
  );
}