import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubTask {
  _id?: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  type: 'Feature' | 'Bug' | 'Maintenance' | 'Personal';
  priority: 'High' | 'Medium' | 'Low';
  status: 'To Do' | 'In Progress' | 'UAT' | 'PROD' | 'Done';
  effort?: number;
  startDate?: string;
  dueDate?: string;
  milestoneId: mongoose.Types.ObjectId;
  subTasks: ISubTask[];
  dependencies: mongoose.Types.ObjectId[];
  addedToTodoListAt?: Date;
  isArchived: boolean;
}

const SubTaskSchema = new Schema<ISubTask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['Feature', 'Bug', 'Maintenance', 'Personal'], default: 'Feature' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    status: { type: String, enum: ['To Do', 'In Progress', 'UAT', 'PROD', 'Done'], default: 'To Do' },
    effort: { type: Number, min: 0 },
    startDate: String,
    dueDate: String,
    milestoneId: { type: Schema.Types.ObjectId, ref: 'Milestone', required: true },
    subTasks: [SubTaskSchema],
    dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    addedToTodoListAt: { type: Date },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Set addedToTodoListAt automatically when task first enters 'To Do'
TaskSchema.pre('save', async function () {
  if (this.status === 'To Do' && !this.addedToTodoListAt) {
    this.addedToTodoListAt = new Date();
  }
});

const MilestoneSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  targetDate: String,
  isArchived: { type: Boolean, default: false },
});

export const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
export const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', MilestoneSchema);