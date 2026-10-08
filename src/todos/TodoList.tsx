import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { format, parseISO } from 'date-fns'
import type { Todo } from '../features/todos/types'
import { useTodosContext } from '../features/todos/TodosContext'
import { useAppearance } from '../features/theme/appearance'
import { getTodoEmptyMessage } from '../features/fun/messages'
import { burstConfetti } from '../features/fun/confetti'
import { playPop } from '../features/fun/sound'
import { Mascot } from '../calendar/Mascot'
import './TodoList.css'

const DATE_KEY_FORMAT = 'yyyy-MM-dd'

function byDueDate(a: Todo, b: Todo): number {
  if (a.dueDate && b.dueDate) return a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0
  if (a.dueDate) return -1
  if (b.dueDate) return 1
  return 0
}

function formatDue(dueDate: string, today: string): string {
  if (dueDate === today) return 'Today'
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(parseISO(dueDate))
}

export function TodoList() {
  const { todos, loaded, syncError, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodosContext()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const appearance = useAppearance()

  const today = format(new Date(), DATE_KEY_FORMAT)
  const active = todos.filter((todo) => !todo.done).sort(byDueDate)
  const done = todos.filter((todo) => todo.done)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    addTodo(trimmed, dueDate || undefined)
    setTitle('')
    setDueDate('')
  }

  const handleToggle = (todo: Todo, e: ChangeEvent<HTMLInputElement>) => {
    if (!todo.done) {
      const rect = e.currentTarget.getBoundingClientRect()
      burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
      playPop()
    }
    toggleTodo(todo.id)
  }

  const handleClearCompleted = () => {
    if (window.confirm(`Remove ${done.length} completed ${done.length === 1 ? 'todo' : 'todos'}?`)) {
      clearCompleted()
    }
  }

  const renderItem = (todo: Todo) => {
    const overdue = !todo.done && todo.dueDate !== undefined && todo.dueDate < today
    return (
      <li key={todo.id} className={`todo-item${todo.done ? ' done' : ''}`}>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={(e) => handleToggle(todo, e)}
          aria-label={`Mark "${todo.title}" as ${todo.done ? 'not done' : 'done'}`}
        />
        <span className="todo-title">{todo.title}</span>
        {todo.dueDate && (
          <span className={`todo-due${overdue ? ' overdue' : ''}`}>
            {overdue ? 'Overdue · ' : ''}
            {formatDue(todo.dueDate, today)}
          </span>
        )}
        <button type="button" className="todo-delete" aria-label={`Delete "${todo.title}"`} onClick={() => deleteTodo(todo.id)}>
          ×
        </button>
      </li>
    )
  }

  return (
    <div className="todo-list-page">
      <div className="todo-list">
        <form className="todo-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="todo-form-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a todo"
            aria-label="Todo title"
            maxLength={200}
          />
          <input
            type="date"
            className="todo-form-date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date (optional)"
          />
          <button type="submit" className="primary" disabled={!title.trim()}>
            Add
          </button>
        </form>

        {syncError && <p className="todo-sync-error">{syncError}</p>}

        {loaded && todos.length === 0 && (
          <div className="todo-empty">
            <Mascot />
            <p>{getTodoEmptyMessage(appearance)}</p>
          </div>
        )}

        {active.length > 0 && <ul className="todo-items">{active.map(renderItem)}</ul>}

        {done.length > 0 && (
          <section className="todo-done-section">
            <div className="todo-done-header">
              <h2>Done ({done.length})</h2>
              <button type="button" onClick={handleClearCompleted}>
                Clear completed
              </button>
            </div>
            <ul className="todo-items">{done.map(renderItem)}</ul>
          </section>
        )}
      </div>
    </div>
  )
}
