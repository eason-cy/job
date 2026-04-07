const PREFIX = '[job-tracker]'

export const logError = (scope, error, extra = {}) => {
  const payload = {
    scope,
    message: error?.message || String(error),
    stack: error?.stack,
    ...extra
  }
  console.error(`${PREFIX} ${scope}`, payload)
}

export const logInfo = (scope, info = {}) => {
  console.info(`${PREFIX} ${scope}`, info)
}
