/**
 * Hardware REST API Service for ESP8266 NodeMCU Helmet Unit
 */

export async function fetchDeviceStatus(baseUrl, timeoutMs = 2500) {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanUrl}/api/status`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    if (!response.ok) {
      let errorText = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.error) errorText = errJson.error;
      } catch (e) {
        // payload wasn't JSON
      }
      return {
        success: false,
        statusCode: response.status,
        latency,
        error: errorText,
        data: null,
      };
    }

    const data = await response.json();
    return {
      success: true,
      statusCode: response.status,
      latency,
      error: null,
      data,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const latency = Math.round(performance.now() - startTime);

    let errorMsg = 'Network Error / Device Unreachable';
    if (err.name === 'AbortError') {
      errorMsg = `Connection Timed Out (${timeoutMs}ms)`;
    } else if (err.message) {
      errorMsg = err.message;
    }

    return {
      success: false,
      statusCode: 0,
      latency,
      error: errorMsg,
      data: null,
    };
  }
}

export async function fetchDeviceHealth(baseUrl, timeoutMs = 2500) {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanUrl}/api/health`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }
    return { success: false, data: null };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, error: err.message };
  }
}
