import { BrowserApiClient } from '@/services/api/browserApiClient';
import { UserService } from '@/modules/users/services/userService';
import { FeatureRequestService } from '@/modules/feature-requests/services/featureRequestService';
import { DashboardService } from '@/modules/dashboard/services/dashboardService';
import { ThemePreferenceService } from '@/modules/settings/services/themePreferenceService';
import { MotionPreferenceService } from '@/modules/settings/services/motionPreferenceService';
import { ChatService } from '@/modules/chat/services/chatService';
export class ClientServiceContainer {
  readonly apiClient = new BrowserApiClient();
  readonly userService = new UserService(this.apiClient);
  readonly featureRequestService = new FeatureRequestService(this.apiClient);
  readonly dashboardService = new DashboardService(this.apiClient);
  readonly themePreferenceService = new ThemePreferenceService();
  readonly motionPreferenceService = new MotionPreferenceService();
  readonly chatService = new ChatService(this.apiClient);
}
