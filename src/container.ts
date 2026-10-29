import 'server-only';
import { environment } from '@/config/environment';
import { ApiClient } from '@/services/api/apiClient';
import { DemoApiClient } from '@/services/demo/demoApiClient';
import { DemoFirebaseAuthService } from '@/services/demo/demoFirebaseAuthService';
import { FirebaseAuthService } from '@/services/auth/firebaseAuthService';
import { SessionService } from '@/services/session/sessionService';
import { getEffectiveRuntime } from '@/services/demo/demoRuntime';
export class ServiceContainer {
  readonly apiClient = new ApiClient();
  readonly demoApiClient = new DemoApiClient();
  readonly firebaseAuthService;
  readonly sessionService;
  constructor(readonly demoMode = environment.demoMode) {
    this.firebaseAuthService = demoMode
      ? new DemoFirebaseAuthService()
      : new FirebaseAuthService();
    this.sessionService = new SessionService(
      this.firebaseAuthService,
      demoMode,
    );
  }
}
const containers = new Map<boolean, ServiceContainer>();
export async function getContainer() {
  const { demoMode } = await getEffectiveRuntime();
  let container = containers.get(demoMode);
  if (!container) {
    container = new ServiceContainer(demoMode);
    containers.set(demoMode, container);
  }
  return container;
}
