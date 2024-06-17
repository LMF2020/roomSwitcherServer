export type CallbackFunction = (error: Error | null) => void;

export interface ICmdService {
    openApp(appName: string, callback: CallbackFunction): void;
    killApp(appName: string): void;
}