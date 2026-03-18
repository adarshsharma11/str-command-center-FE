// Added by Agent 2
export type DispatchStatus = 'pending' | 'accepted' | 'rejected';
export type TaskType = 'cleaning' | 'service';

export interface DispatchTask {
  id: number;
  reservation_id: string;
  property_id?: string;
  service_name?: string;
  scheduled_date?: string;
  service_date?: string;
  time?: string;
  status: DispatchStatus;
  task_type: TaskType;
  created_at: string;
  crew_id?: number;
  crew_name?: string;
  property_name?: string;
}

export interface TaskResponse {
  id: number;
  task_id: string;
  task_type: TaskType;
  response: string;
  created_at: string;
  person_name?: string;
  task_name?: string;
  task_date_time?: string;
}

export interface ServiceCategory {
  id: number;
  category_name: string;
  time: string;
  status: boolean;
  price: string;
  email: string;
  phone: number;
}
