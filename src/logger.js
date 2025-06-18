function addTimestamp(originalFn) {
  return (...args) => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    originalFn(`[${timestamp}]`, ...args);
  };
}

export function enableTimestampLogging() {
  console.log = addTimestamp(console.log);
  console.error = addTimestamp(console.error);
  console.warn = addTimestamp(console.warn);
  console.info = addTimestamp(console.info);
}