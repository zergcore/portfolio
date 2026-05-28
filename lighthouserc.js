/** @type {import('@lhci/utils/src/types').LighthouseRcConfig} */
module.exports = {
  ci: {
    collect: {
      url: [process.env.LHCI_URL ?? 'http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
        },
        throttlingMethod: 'simulate',
        extraHeaders: {
          'x-vercel-protection-bypass': process.env.LHCI_BYPASS || '',
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
