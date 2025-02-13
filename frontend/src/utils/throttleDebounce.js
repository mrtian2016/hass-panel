// 防抖函数 - 支持异步
export const debounce = (func, wait = 1000) => {
  let timeout;
  let currentPromise = null;

  return function executedFunction(...args) {
    // 如果已经有一个Promise在进行中，直接返回它
    if (currentPromise) {
      return currentPromise;
    }

    // 创建新的Promise
    currentPromise = new Promise((resolve, reject) => {
      const later = async () => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          currentPromise = null;
        }
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    });

    return currentPromise;
  };
};

// 节流函数 - 支持异步
export const throttle = (func, limit = 1000) => {
  let inThrottle = false;
  let currentPromise = null;

  return function executedFunction(...args) {
    // 如果已经有一个Promise在进行中，直接返回它
    if (currentPromise) {
      return currentPromise;
    }

    // 如果在节流时间内
    if (!inThrottle) {
      // 创建新的Promise
      currentPromise = new Promise(async (resolve, reject) => {
        try {
          const result = await func.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          inThrottle = true;
          currentPromise = null;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      });

      return currentPromise;
    }

    // 如果在节流时间内，返回一个被拒绝的Promise
    return Promise.reject(new Error('请求被节流限制'));
  };
}; 