import { useEffect, useRef, useState } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { Task } from '~/types';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { SortableItem } from '~/components/sortable-item';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(JSON.parse(localStorage.getItem('tasks') ?? '[]') as Task[]);
  const [input, setInput] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setTasks(prevItems => {
        const oldIndex = prevItems.findIndex(item => item.id === active.id);
        const newIndex = prevItems.findIndex(item => item.id === over?.id);
        return arrayMove(prevItems, oldIndex, newIndex);
      });
    }
  }

  function toggleCompleteTask(id: string) {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  return (
    <main className='mx-auto max-w-2xl px-4 py-10 sm:px-8'>
      <h1 className='mb-5 text-center text-4xl font-bold leading-tight'>Checklist App</h1>
      <form
        ref={formRef}
        className='mb-4 space-y-2'
        onSubmit={e => {
          e.preventDefault();
          if (input === '') {
            return;
          }
          const inputs = input.split('\n').filter(el => el !== '');
          setTasks(prev => [
            ...prev,
            ...inputs.map((el, index) => ({
              id: (new Date().getTime() + index).toString(),
              content: el,
              completed: false,
            })),
          ]);
          setInput('');
        }}
      >
        <label className='sr-only'>Task</label>
        <Textarea
          placeholder='Type here...'
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
        <Button>Add</Button>
        <div className='flex justify-end'></div>
      </form>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <div className='space-y-2'>
            {tasks.map(task => (
              <SortableItem key={task.id} task={task} deleteTask={deleteTask} toggleCompleteTask={toggleCompleteTask} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
