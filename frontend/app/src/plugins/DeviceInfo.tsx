function isObject(val: any): boolean {
  if (val !== null && typeof val === "object" && val.constructor === Object) {
    return true;
  }
  return false;
}

function nullToString(dict: any): any {
  if (isObject(dict)) {
    for (const key in dict) {
      dict[key] = nullToString(dict[key]);
    }
    return dict;
  } else {
    return dict || `${dict}`;
  }
}

export function getDeviceInfo(): any {
  const navigator = window.navigator;
  const info = {
    navigator: {
      userAgent: navigator.userAgent,
      appCodeName: navigator.appCodeName,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      languages: navigator.languages,
      pointerEnabled: navigator.pointerEnabled,
      maxTouchPoints: navigator.maxTouchPoints,
      platform: navigator.platform,
      product: navigator.product,
      productSub: navigator.productSub,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub,
    },
    view: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      availHeight: screen.availHeight,
      availWidth: screen.availWidth,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      screenWidth: screen.width,
      screenHeight: screen.height,
    },
    location: {
      href: location.href,
      referrer: document.referrer,
      domain: document.domain,
    },
  };
  return nullToString(info);
}
