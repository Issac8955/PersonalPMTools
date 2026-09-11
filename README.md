# Personal Project Management System

A sleek, responsive, single-user Personal Project Management web application built with **Next.js 14 (App Router)**, **MongoDB**, **Tailwind CSS**, and **dnd-kit**. Designed for high productivity with dual Kanban Board and dynamic Gantt Chart views, full milestone tracking, and fluid drag-and-drop task management.

---

## Key Features

* **Interactive Kanban Board:** Drag-and-drop tasks across custom status columns (`To Do`, `In Progress`, `UAT`, `PROD`, `Done`) powered by `dnd-kit`.
* **Screen-Fitting Gantt Chart:** Visual 14-day rolling timeline for tracking task schedules without horizontal scrollbars.
* **Milestone Management:** Create and assign tasks to distinct project milestones with filtered board views.
* **Task Prioritization & Scheduling:** Assign priority levels (`Low`, `Medium`, `High`) and strict due dates to tasks.
* **Archive Attic:** Vault completed or legacy tasks away from active project boards without losing historical data.
* **Server Actions & Optimistic State:** Fast database updates via Next.js Server Actions with automatic UI synchronization.

---

## Tech Stack

* **Framework:** [Next.js 14](https://nextjs.org/) (App Router & Server Actions)
* **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Drag and Drop:** [@dnd-kit](https://dndkit.com/)
* **Date Utilities:** [date-fns](https://date-fns.org/)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js:** v18.0.0 or higher
* **npm** or **yarn** / **pnpm**
* **MongoDB:** A running local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string.