import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Label } from '@radix-ui/react-label';
import { GripVerticalIcon, Trash2Icon } from 'lucide-react';

import type { Task } from '~/types';
import { Card } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';

type SortableItemProps = {
  task: Task;
  deleteTask: (id: string) => void;
  toggleCompleteTask: (id: string) => void;
};

export function SortableItem({ task, deleteTask, toggleCompleteTask }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCursorGrabbing = attributes['aria-pressed'];

  return (
    <div ref={setNodeRef} style={style} key={task.id}>
      <Card className='flex items-start justify-between gap-5 p-2'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id={`task_${task.id}`}
            checked={task.completed}
            onCheckedChange={() => toggleCompleteTask(task.id)}
          />
          <Label htmlFor={`task_${task.id}`}>{task.content}</Label>
        </div>
        <div className='flex items-center justify-center gap-2'>
          <button onClick={() => deleteTask(task.id)}>
            <Trash2Icon className='size-5 text-destructive' />
          </button>
          <button
            {...attributes}
            {...listeners}
            className={` ${isCursorGrabbing ? 'cursor-grabbing' : 'cursor-grab'}`}
            aria-describedby={`DndContext-${task.id}`}
          >
            <GripVerticalIcon className='size-5' />
          </button>
        </div>
      </Card>
    </div>
  );
}
