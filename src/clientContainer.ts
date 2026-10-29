import { BrowserApiClient } from '@/services/api/browserApiClient';
import { UserService } from '@/modules/users/services/userService';
import { FeatureRequestService } from '@/modules/feature-requests/services/featureRequestService';
import { DashboardService } from '@/modules/dashboard/services/dashboardService';
import { ThemePreferenceService } from '@/modules/settings/services/themePreferenceService';
import { MotionPreferenceService } from '@/modules/settings/services/motionPreferenceService';
import { ChatService } from '@/modules/chat/services/chatService';
import { PortalService } from '@/modules/portal/services/portalService';
import { AdminService } from '@/modules/portal/services/adminService';
import { BlogService } from '@/modules/blog/services/blogService';
import { DevSettingsService } from '@/modules/dev-settings/services/devSettingsService';
import { DocumentVaultService } from '@/modules/documents/services/documentVaultService';
import { CommunityService } from '@/modules/community/services/communityService';
import { PollService } from '@/modules/polls/services/pollService';
import { EditorialService } from '@/modules/editorial/services/editorialService';
import { EngagementService } from '@/modules/engagement/services/engagementService';
import { MilestoneAdminService } from '@/modules/milestone-admin/services/milestoneAdminService';
import { AccountToolsService } from '@/modules/account-tools/services/accountToolsService';
import { CommercialService } from '@/modules/commercial/services/commercialService';
import { NotificationInboxService } from '@/modules/notification-inbox/services/notificationInboxService';
export class ClientServiceContainer {
  readonly apiClient = new BrowserApiClient();
  readonly userService = new UserService(this.apiClient);
  readonly featureRequestService = new FeatureRequestService(this.apiClient);
  readonly dashboardService = new DashboardService(this.apiClient);
  readonly themePreferenceService = new ThemePreferenceService();
  readonly motionPreferenceService = new MotionPreferenceService();
  readonly chatService = new ChatService(this.apiClient);
  readonly portalService = new PortalService(this.apiClient);
  readonly adminService = new AdminService(this.apiClient);
  readonly blogService = new BlogService(this.apiClient);
  readonly documentVaultService = new DocumentVaultService(this.apiClient);
  readonly communityService = new CommunityService(this.apiClient);
  readonly pollService = new PollService(this.apiClient);
  readonly editorialService = new EditorialService(this.apiClient);
  readonly engagementService = new EngagementService(this.apiClient);
  readonly milestoneAdminService = new MilestoneAdminService(this.apiClient);
  readonly accountToolsService = new AccountToolsService(this.apiClient);
  readonly commercialService = new CommercialService(this.apiClient);
  readonly notificationInboxService = new NotificationInboxService(
    this.apiClient,
  );
  readonly devSettingsService = new DevSettingsService(
    new BrowserApiClient('/api/dev-settings'),
  );
}
