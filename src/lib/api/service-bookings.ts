import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface ServiceBookingResponse {
  success: boolean;
  message: string;
  task_id: string;
  status: 'accepted' | 'rejected';
}

export async function respondToServiceBooking(
  taskId: string,
  type: string,
  action: 'accept' | 'reject'
): Promise<ServiceBookingResponse> {
  const params = new URLSearchParams({
    task_id: taskId,
    type: type,
    action: action
  });
  
  return apiClient.get<ServiceBookingResponse>(
    `${ENDPOINTS.SERVICE_BOOKINGS.RESPOND}?${params.toString()}`,
    { skipAuthRedirect: true }
  );
}
