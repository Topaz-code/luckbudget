import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ConfigContext, ExpoConfig } from 'expo/config';

const existingFile = (environmentPath: string | undefined, localPath: string): string | undefined => {
  if (environmentPath) return environmentPath;
  return existsSync(resolve(__dirname, localPath)) ? localPath : undefined;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const base = config;
  const androidServices = existingFile(
    process.env.GOOGLE_SERVICES_JSON,
    './google-services.json',
  );
  const iosServices = existingFile(
    process.env.GOOGLE_SERVICES_INFO_PLIST,
    './GoogleService-Info.plist',
  );
  const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return {
    ...base,
    android: {
      ...base.android,
      ...(androidServices ? { googleServicesFile: androidServices } : {}),
    },
    ios: {
      ...base.ios,
      ...(iosServices ? { googleServicesFile: iosServices } : {}),
    },
    ...(easProjectId
      ? {
          extra: {
            ...base.extra,
            eas: { projectId: easProjectId },
          },
        }
      : {}),
  };
};
