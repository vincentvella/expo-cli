import { readConfigJsonAsync } from '@expo/config';
import { ApiV2, Doctor, User, UserManager } from '@expo/xdl';

import { AppleCtx, authenticate } from '../appleApi';
import { IosApi } from './api';

export interface IView {
  open(ctx: Context): Promise<IView | null>;
}

export class Context {
  _hasProjectContext: boolean = false;
  _user?: User;
  _manifest: any;
  _apiClient?: ApiV2;
  _iosApiClient?: IosApi;
  _appleCtx?: AppleCtx;

  get user(): User {
    return this._user as User;
  }
  get hasProjectContext(): boolean {
    return this._hasProjectContext;
  }
  get manifest(): any {
    return this._manifest;
  }
  get api(): ApiV2 {
    return this._apiClient as ApiV2;
  }
  get ios(): IosApi {
    return this._iosApiClient as IosApi;
  }
  get appleCtx(): AppleCtx {
    if (!this._appleCtx) {
      throw new Error('Apple context not initialized.');
    }
    return this._appleCtx;
  }

  async ensureAppleCtx() {
    if (!this._appleCtx) {
      this._appleCtx = await authenticate();
    }
  }

  async init(projectDir: string) {
    const status = await Doctor.validateLowLatencyAsync(projectDir);
    if (status !== Doctor.FATAL) {
      /* This manager does not need to work in project context */
      const { exp } = await readConfigJsonAsync(projectDir);
      this._manifest = exp;
      this._hasProjectContext = true;
    }

    this._user = await UserManager.ensureLoggedInAsync();
    this._apiClient = ApiV2.clientForUser(this.user);
    this._iosApiClient = new IosApi(this._user);
  }
}
