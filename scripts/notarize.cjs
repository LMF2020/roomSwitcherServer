const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  await notarize({
    appBundleId: 'com.bestmac',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'erwangcc@gmail.com',
    appleIdPassword: 'ajjv-bjuw-qerk-efnj',
    teamId: 'BMK6D233Q4'
    // keychainProfile: 'bestmac123' // 使用钥匙串配置
  });
};