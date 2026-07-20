declare module "web-push" {
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string,
  ): void;
  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };
  export function sendNotification(
    subscription: unknown,
    payload?: string | Buffer,
    options?: unknown,
  ): Promise<unknown>;
  const _default: {
    setVapidDetails: typeof setVapidDetails;
    generateVAPIDKeys: typeof generateVAPIDKeys;
    sendNotification: typeof sendNotification;
  };
  export default _default;
}
