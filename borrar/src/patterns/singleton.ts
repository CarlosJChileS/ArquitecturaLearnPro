export class AppSettings {
  private static instance: AppSettings;
  private _theme = 'light';

  private constructor() {}

  static getInstance(): AppSettings {
    if (!AppSettings.instance) {
      AppSettings.instance = new AppSettings();
    }
    return AppSettings.instance;
  }

  get theme(): string {
    return this._theme;
  }

  set theme(value: string) {
    this._theme = value;
  }
}
