/* eslint-disable */
import { chromium } from 'playwright';

async function debugLocalAPICalls() {
  console.log('🔍 Starting local API debugging...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const apiCalls = [];

  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('forklift') || url.includes('authorization.k8s.io')) {
      const call = {
        method: request.method(),
        url,
        timestamp: new Date().toISOString(),
      };
      apiCalls.push(call);
      console.log(`📡 API CALL: ${call.method} ${call.url}`);

      if (url.includes('selfsubjectaccessreviews')) {
        console.log('🎯 FOUND SelfSubjectAccessReview call!');
      }

      if (url.includes('providers')) {
        console.log('🎯 FOUND Providers call!');
        if (url.includes('/namespaces/')) {
          const namespace = url.match(/\/namespaces\/([^\/]+)\//)?.[1];
          console.log(`   📂 Namespace: ${namespace}`);
        } else {
          console.log('   🌐 Cluster-wide call (no namespace)');
        }
      }
    }
  });

  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('forklift') || url.includes('authorization.k8s.io')) {
      console.log(`📨 API RESPONSE: ${response.status()} ${url}`);
    }
  });

  try {
    console.log('🌐 Navigating to local console...');
    await page.goto('http://localhost:9000/forklift-console-plugin/plans', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('⏱️ Waiting for API calls to complete...');
    await page.waitForTimeout(5000);

    const button = page.getByTestId('create-plan-button');
    if (await button.isVisible()) {
      const isEnabled = await button.isEnabled();
      const ariaDisabled = await button.getAttribute('aria-disabled');
      console.log(`🔲 Button state: enabled=${isEnabled}, aria-disabled=${ariaDisabled}`);
    } else {
      console.log('🔲 Button not found or not visible');
    }

    console.log('\n📊 API CALLS SUMMARY:');
    console.log(`Total calls: ${apiCalls.length}`);

    const selfSubjectCalls = apiCalls.filter((call) =>
      call.url.includes('selfsubjectaccessreviews'),
    );
    console.log(`SelfSubjectAccessReview calls: ${selfSubjectCalls.length}`);

    const providerCalls = apiCalls.filter((call) => call.url.includes('providers'));
    console.log(`Provider calls: ${providerCalls.length}`);

    if (providerCalls.length > 0) {
      console.log('\n🔍 Provider calls details:');
      providerCalls.forEach((call) => {
        console.log(`  - ${call.url}`);
      });
    }

    if (selfSubjectCalls.length > 0) {
      console.log('\n🔍 SelfSubjectAccessReview calls details:');
      selfSubjectCalls.forEach((call) => {
        console.log(`  - ${call.url}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

debugLocalAPICalls().catch(console.error);
