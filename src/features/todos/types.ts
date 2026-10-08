export interface Todo {
  id: string
  title: string
  done: boolean
  /** Calendar date as `yyyy-MM-dd` (no time zone), or undefined for no due date. */
  dueDate?: string
}
