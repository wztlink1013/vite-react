/*
 * @Description: 
 * @Author: wzt
 * @Date: 2024-09-03 09:49:26
 * @LastEditors: wzt
 * @LastEditTime: 2024-09-03 18:44:43
 */
// ✔️
const D = Object.defineProperty, // 保存原生的 Object.defineProperty 方法
  // ✔️
  U = (target, property, value) =>
    property in target
      ? D(target, property, {
          enumerable: true,
          configurable: true,
          writable: true,
          value,
        })
      : (target[property] = value), // 设置对象属性，如果属性已存在则使用 Object.defineProperty 重新定义属性，否则直接赋值
  // ✔️
  k = (target, property, value) => (
    U(target, typeof property !== 'symbol' ? property + '' : property, value),
    value
  ), // 设置对象属性并返回设置的值
  // ✔️
  R = (target, property, actionDescription) => {
    if (!property.has(target)) throw TypeError(`Cannot ${actionDescription}`);
  }, // 检查对象是否具有特定属性，否则抛出类型错误
  // ✔️
  x = (target, property, customReader) => (
    R(target, property, 'read from private field'),
    customReader ? customReader.call(target) : property.get(target)
  ), // 在检查对象具有特定属性后读取属性值，可以通过提供回调函数来定制读取方式
  // ✔️
  g = (target, propertySet, value) => {
    if (propertySet.has(target))
      throw TypeError('Cannot add the same private member more than once');
    propertySet instanceof WeakSet
      ? propertySet.add(target)
      : propertySet.set(target, value);
  }, // 添加私有成员到对象，如果对象已具有该成员则抛出错误，支持 WeakSet 和普通 Set 两种存储方式
  // ✔️
  u = (target, propertySet, value, customWriter) => (
    R(target, propertySet, 'write to private field'),
    customWriter
      ? customWriter.call(target, value)
      : propertySet.set(target, value),
    value
  ), // 在检查对象具有特定属性后写入属性值，可以通过提供回调函数来定制写入方式
  // ✔️
  E = (target, propertySet, writeAction, readAction) => ({
    set _(newValue) {
      u(target, propertySet, newValue, writeAction);
    },
    get _() {
      return x(target, propertySet, readAction);
    },
  }), // 创建一个具有读写属性 _ 的对象，通过传入的参数来控制读写操作
  // ${location.origin}
  manifestURL = `/manifest.json`;

let updateInProgress = false,
  isNativeUpdateInProgress = false;

// #region 缓存

// 打开名为“wolai-cache”的缓存
const openWolaiCache = () => caches.open('wolai-cache');

// 打开名为“wolai-meta”的缓存
const openWolaiMeta = () => caches.open('wolai-meta');

// 删除名为“wolai-cache”的缓存
const deleteWolaiCache = () => caches.delete('wolai-cache');

// 删除名为“wolai-meta”的缓存
const deleteWolaiMeta = () => caches.delete('wolai-meta');

// 从“wolai-meta”缓存中获取匹配的资源并解析为 JSON
const getFromMetaCache = async (request) => {
  const metaCache = await openWolaiMeta();
  const response = await metaCache.match(request);
  if (response) {
    const text = await response.text();
    return JSON.parse(text);
  } else {
    return null;
  }
};
// 将数据存入“wolai-meta”缓存
const putInMetaCache = async (request, data) => {
  const metaCache = await openWolaiMeta();
  try {
    return (
      await metaCache.put(
        request,
        new Response(JSON.stringify(data), {
          headers: { 'content-type': 'text/plain' },
        })
      ),
      true
    );
  } catch (error) {
    return console.error('setMetaItem error ' + error), false;
  }
};

// 先从缓存中获取数据，经过处理后再存入缓存
const processAndCache = async (request, processor) => {
  const existingData = await getFromMetaCache(request);
  const processedData = await processor(existingData);
  return (await putInMetaCache(request, processedData)) ? processedData : null;
};

// 清空所有缓存，如果失败打印错误信息
const clearAllCache = async () => {
  try {
    await Promise.all([deleteWolaiMeta(), deleteWolaiCache()]);
    console.error('📛 清空所有的缓存成功');
  } catch (error) {
    console.error('❌ 清空所有的缓存失败', error);
  }
};

// #endregion

// #region 队列调度

// 定义队列节点类
class QueueNode {
  constructor(value) {
    k(this, 'value');
    k(this, 'next');
    this.value = value;
  }
}

// 定义弱引用的私有成员变量
const queueStartMap = new WeakMap();
const queueEndMap = new WeakMap();
const queueSizeMap = new WeakMap();

// 定义队列类
class Queue {
  constructor() {
    // 使用 WeakMap 存储私有成员，避免内存泄漏
    g(this, queueStartMap, void 0);
    g(this, queueEndMap, void 0);
    g(this, queueSizeMap, 0);
    this.clear();
  }

  enqueue(item) {
    const newNode = new QueueNode(item);
    const firstNode = x(this, queueStartMap);
    if (firstNode) {
      // 如果队列不为空，将新节点连接到队尾，并更新队尾指针
      x(this, queueEndMap).next = newNode;
      u(this, queueEndMap, newNode);
    } else {
      // 如果队列为空，新节点既是队首也是队尾
      u(this, queueStartMap, newNode);
      u(this, queueEndMap, newNode);
    }
    // 增加队列长度计数
    E(this, queueSizeMap)._++;
  }

  dequeue() {
    const firstNode = x(this, queueStartMap);
    if (firstNode) {
      // 移除队首节点，更新队首指针，并减少队列长度计数
      u(this, queueStartMap, x(this, queueStartMap).next);
      E(this, queueSizeMap)._--;
      return firstNode.value;
    }
    return null;
  }

  clear() {
    u(this, queueStartMap, void 0);
    u(this, queueEndMap, void 0);
    u(this, queueSizeMap, 0);
  }

  get size() {
    return x(this, queueSizeMap);
  }

  // 实现迭代器，以便遍历队列
  *[Symbol.iterator]() {
    let currentNode = x(this, queueStartMap);
    for (; currentNode; ) {
      yield currentNode.value;
      currentNode = currentNode.next;
    }
  }
}
// class QueueNode {
//   constructor(e) {
//     k(this, 'value');
//     k(this, 'next');
//     this.value = e;
//   }
// }
// var l, f, h;
// class Queue {
//   constructor() {
//     g(this, l, void 0);
//     g(this, f, void 0);
//     g(this, h, void 0);
//     this.clear();
//   }
//   enqueue(e) {
//     const n = new QueueNode(e);
//     x(this, l)
//       ? ((x(this, f).next = n), u(this, f, n))
//       : (u(this, l, n), u(this, f, n)),
//       E(this, h)._++;
//   }
//   dequeue() {
//     const e = x(this, l);
//     if (e) return u(this, l, x(this, l).next), E(this, h)._--, e.value;
//   }
//   clear() {
//     u(this, l, void 0), u(this, f, void 0), u(this, h, 0);
//   }
//   get size() {
//     return x(this, h);
//   }
//   *[Symbol.iterator]() {
//     let e = x(this, l);
//     for (; e; ) yield e.value, (e = e.next);
//   }
// }
// (l = new WeakMap()), (f = new WeakMap()), (h = new WeakMap());

const J = {
  bind(t, e, n) {
    return t.bind(n);
  },
};

// 创建并发控制的任务队列
const createConcurrentQueue = (concurrencyLimit) => {
  if (
    !(
      (Number.isInteger(concurrencyLimit) ||
        concurrencyLimit === Number.POSITIVE_INFINITY) &&
      concurrencyLimit > 0
    )
  ) {
    throw new TypeError('Expected `concurrency` to be a number from 1 and up');
  }
  const taskQueue = new Queue();
  let activeTasksCount = 0;
  const finishTask = () => {
    activeTasksCount--;
    if (taskQueue.size > 0) {
      taskQueue.dequeue()();
    }
  };
  const executeTask = async (taskFunction, onComplete, s) => {
    activeTasksCount++;
    const taskResult = (async () => taskFunction(...s))();
    onComplete(taskResult);
    try {
      await taskResult;
    } catch {}
    finishTask();
  };
  const enqueueTask = (taskFunction, onComplete, args) => {
    // () => executeTask(taskFunction, onComplete, ...args)
    taskQueue.enqueue(J.bind(executeTask.bind(void 0, taskFunction, onComplete, args)));
    (async () => (
      await Promise.resolve(),
      activeTasksCount < concurrencyLimit &&
        taskQueue.size > 0 &&
        taskQueue.dequeue()()
    ))();
  };
  const r = (w, ...i) => new Promise((s) => { enqueueTask(w, s, i) });
  return (
    Object.defineProperties(r, {
      activeCount: {
        get: () => activeTasksCount,
      },
      pendingCount: {
        get: () => taskQueue.size,
      },
      clearQueue: {
        value: () => taskQueue.clear(),
      },
    }),
    r
  )
};

// #endregion

// #region 工具函数
// 检查字符串是否匹配给定的规则
function checkAgainstRules(input, rules) {
  try {
    return rules.some((rule) =>
      typeof rule === 'string' ? rule === input : rule.test(input)
    );
  } catch (error) {
    return console.error('💀 匹配规则失败', error), false;
  }
}
function checkURLForManifestRule(url) {
  const { host, protocol, pathname } = new URL(url);
  const allowedProtocols = ['http:', 'https:'];
  const allowedHosts = [
    'wolai.com',
    'www.wolai.com',
    'pre.wolai.com',
    'www1.wolai.com',
    'www2.wolai.com',
    'www3.wolai.com',
    'www-uat.wolai.com',
    'previous.wolai.com',
    'www-test.wolai.com',
    'www-test1.wolai.com',
    'www-test2.wolai.com',
    'www-test3.wolai.com',
    'www-test4.wolai.com',
    'www-test5.wolai.com',
    'www-test-mobile.wolai.com',
    'pre-workspace.dingtalk.com',
    'pre-test-workspace.dingtalk.com',
    'pre-test1-workspace.dingtalk.com',
    '.com',
    'pre-test2-workspace.dingtalk.com',
    'pre-test3-workspace.dingtalk.com',
    'pre-test4-workspace.dingtalk.com',
    'pre-test5-workspace.dingtalk.com',
    'workspace.dingtalk.com',
  ];
  const allowedPaths = [
    '/',
    '/day',
    '/dev',
    '/downloads',
    '/email_activate',
    '/enter',
    '/first',
    '/invitation',
    '/invitationLanding',
    '/login',
    '/logout',
    '/messages',
    '/nav',
    '/new-form',
    '/new',
    '/pricing',
    '/product',
    '/random',
    '/reset_password',
    '/signOutFinish',
    '/signup',
  ]; //  /^/component//, /^/invitation//, /^/public-invitation//, /^/wolai_poster//, /^/wolai_share//, /^/[0-9A-Za-z]{16,32}/?/];
  return (
    checkAgainstRules(protocol, allowedProtocols) &&
    checkAgainstRules(host, allowedHosts) &&
    checkAgainstRules(pathname, allowedPaths)
  );
}
function checkURLForResourceRule(url) {
  const { host, protocol, pathname } = new URL(url);
  const allowedProtocols = ['http:', 'https:'];
  const allowedHosts = [
    'vcdn.wostatic.cn',
    'cdn.wostatic.cn',
    'static-test.wolai.com',
    'cdn.wol-static.com',
    'dev.g.alicdn.com',
    'g.alicdn.com',
  ];
  const allowedPaths = [/.(eot|ttf|woff|woff2|css|js|json)$/i];
  return (
    checkAgainstRules(protocol, allowedProtocols) &&
    checkAgainstRules(host, allowedHosts) &&
    checkAgainstRules(pathname, allowedPaths)
  );
}

// 从远端获取资源并解析为 JSON，如果获取失败返回 null
const fetchFromRemote = async (request, options) => {
  try {
    const response = await fetch(request, options);
    return response.ok ? await response.json() : null;
  } catch (error) {
    return console.log('❌ 获取远端 manifest 失败 ' + error), null;
  }
};
// 根据传入的参数进行强制清理缓存操作
const forceCleanCache = async (params) => {
  if (params.forceClean) {
    console.log(
      '🚜 开始强制清空缓存, 保留版本 ' + params.version + ' ' + params.date
    );
    const cachedVersions = (await getFromMetaCache('cached-versions')) || [];
    const targetVersion = cachedVersions.find(
      (item) =>
        item.manifest.date === params.date &&
        item.manifest.version === params.version
    );
    if (targetVersion) {
      await putInMetaCache('cached-versions', [
        { ...targetVersion, active: true },
      ]);
      await cleanObsoleteCache();
    } else {
      console.log('📛 清空所有的缓存');
      await clearAllCache();
    }
  }
};
// 从本地获取特定的 manifest，如果获取失败返回 null
const getLocalManifest = async (version) => {
  try {
    const cachedVersions = (await getFromMetaCache('cached-versions')) || [];
    const manifest =
      cachedVersions.find((item) =>
        version ? item.version === version : item.active
      ) || null;
    return manifest ? manifest.manifest : null;
  } catch (error) {
    return console.log('❌ 获取本地 manifest 失败 ' + error), null;
  }
};
// 并发地将多个资源存入缓存，如果有任何一个缓存失败则返回 false
const cacheRemoteFiles = async (fileList) => {
  const cache = await openWolaiCache();
  const queue = createConcurrentQueue(12);
  let success = true;
  const tasks = fileList.map((file) =>
    queue(async () => {
      const fileRequest = file.path;
      console.warn('>>> 进得来吗1 >>>', fileRequest)
      if (!(await cache.match(fileRequest))) {
        try {
          console.warn('>>> 进得来吗2 >>>', fileRequest)
          const response = await fetch(fileRequest);
          if (response.ok) {
            cache.put(fileRequest, response);
          } else {
            throw new Error('❌ 加载文件失败 ' + fileRequest);
          }
        } catch (error) {
          console.error('❌ 缓存失败 ' + error + ' ' + fileRequest);
          success = false;
        }
      }
    })
  );
  return await Promise.all(tasks), success;
};
// 切换特定版本的 manifest 为 active 状态，如果失败返回 false
const switchManifestVersion = async (version) => {
  const cachedVersions = (await getFromMetaCache('cached-versions')) || [];
  console.warn('>>> 切换特定版本的 manifest 为 active 状态，如果失败返回 false >>>', cachedVersions)
  if (!cachedVersions.find((item) => item.version === version)) {
    return console.error('❌ 目标版本未完整缓存 ' + version), false;
  }
  if (cachedVersions.find((item) => item.version === version && item.active)) {
    return (
      console.log('当前版本已经是 active 状态，不需要切换 ' + version), false
    );
  }
  const updatedVersions = cachedVersions.map((item) => ({
    ...item,
    active: false,
  }));
  const targetVersionItem = updatedVersions
    .slice()
    .reverse()
    .find((item) => item.version === version);
  if (targetVersionItem) {
    targetVersionItem.active = true;
    return await putInMetaCache('cached-versions', updatedVersions);
  } else {
    return false;
  }
};
// 清理过时的缓存，如果清理成功返回 true，否则返回 false
const cleanObsoleteCache = async () => {
  const cachedVersions = (await getFromMetaCache('cached-versions')) || [];
  const activeIndex = cachedVersions.findIndex((item) => item.active);
  if (activeIndex === -1) {
    return true;
  }
  const recentVersions = cachedVersions.slice(Math.max(activeIndex - 1, 0));
  if (!(await putInMetaCache('cached-versions', recentVersions))) {
    return console.log('❌ 清理 versions 失败，等待下次清理'), false;
  }
  const fileMap = recentVersions.reduce(
    (acc, item) =>
      item.manifest.files.reduce(
        (innerAcc, file) => ((innerAcc[file.path] = 1), innerAcc),
        acc
      ),
    {}
  );
  const cache = await openWolaiCache();
  const cacheKeys = await cache.keys();
  const deletionPromises = await Promise.all(
    cacheKeys.map((key) => (fileMap[key.url] ? true : cache.delete(key)))
  );
  const allDeleted = deletionPromises.every((item) => item);
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('pwa'))
        .map((name) => caches.delete(name))
    );
  } catch (error) {
    console.log('移除老版本的 sw 缓存文件失败', error);
  }
  return (
    allDeleted
      ? console.log('🧹 清理过时缓存成功')
      : console.error('❌ 清理过时缓存失败'),
    allDeleted
  );
};
// 获取远端 manifest，根据情况更新缓存、切换版本或打印错误信息
const updateCacheFromRemote = async (optionalParam) => {
  console.log('🔄 开始获取远端 manifest');
  const remoteManifest = await fetchFromRemote(optionalParam);
  if (!remoteManifest) {
    return console.error('❌ 获取远端 manifest 失败'), false;
  } else {
    console.warn('✅ 获取远端 manifest 成功', remoteManifest)
  }
  remoteManifest.forceClean && (await forceCleanCache(remoteManifest));
  console.log('💡 获取远端 manifest 成功, version: ' + remoteManifest.version);
  const localManifest = await getLocalManifest();
  if (!localManifest || localManifest.date !== remoteManifest.date) {
    const dateStr = new Date(remoteManifest.date || 0).toLocaleString();
    console.log(`🌀 有新版本，开始更新缓存 ${remoteManifest.version} ${dateStr}`, localManifest);
    const cacheSuccess = await cacheRemoteFiles(remoteManifest.files);
    if (!cacheSuccess) {
      return console.error('❌ 装载远端文件到本地缓存缓存失败'), false;
    } else {
      console.warn('✅ 装载远端文件到本地缓存缓存成功', cacheSuccess)
    }
    console.log('💯 新版本缓存成功 ' + remoteManifest.version);
    const switchSuccess = await switchManifestVersion(remoteManifest.version);
    console.warn('>>> 新版本缓存成功 >>>', switchSuccess)
    if (switchSuccess) {
      console.log(
        '🚀 切换新版本成功 ' + remoteManifest.version + ' ' + dateStr
      );
    } else {
      console.error('❌ 切换新版本失败 ' + remoteManifest.version);
    }
    await cleanObsoleteCache();
  } else {
    await cacheRemoteFiles(localManifest.files);
    const dateStr = new Date(localManifest.date || 0).toLocaleString();
    console.log(
      '✨ 当前为最新版本的缓存 ' + remoteManifest.version + ' ' + dateStr
    );
  }
  return true;
};
// 一个用于更新缓存的函数，确保只有一个更新任务在运行
const updateCacheSafely = async (optionalParam) => {
  if (updateInProgress) {
    console.log('🕛 已经有更新缓存任务在运行中');
    return;
  }
  try {
    updateInProgress = true;
    const success = await updateCacheFromRemote(optionalParam);
    return (
      !success && console.error('❌ 更新缓存失败'),
      (updateInProgress = false),
      success
    );
  } catch (error) {
    return (
      console.error('❌ 更新缓存失败', error), (updateInProgress = false), false
    );
  }
};
// #endregion

// #region fetch

// 查找特定的文件路径，如果找不到返回 null
const findIndexFilePath = async () => {
  const localManifest = await getLocalManifest();
  if (localManifest) {
    const indexFile = localManifest.files.find((item) =>
      /index\.[^.]+\.html/.test(item.path)
    );
    if (indexFile) {
      return indexFile.path;
    }
  }
  return null;
};
// 获取资源，如果本地缓存中有则返回缓存的资源，否则从网络获取并缓存
const fetchResource = async (request) => {
  const cache = await openWolaiCache();
  const responseFromCache = await cache.match(request);
  if (responseFromCache) {
    return responseFromCache;
  } else {
    const responseFromNetwork = await fetch(request);
    cache.put(request, responseFromNetwork.clone());
    return responseFromNetwork;
  }
};

// 获取特定资源，如果本地缓存中有则返回缓存的资源，否则返回默认资源并尝试从网络获取并缓存
const fetchSpecificResource = async (defaultResource) => {
  const indexFilePath = await findIndexFilePath();
  return fetchResource(indexFilePath || defaultResource);
};
// NOTE: 处理 fetch 事件
self.addEventListener('fetch', async (event) => {
  const request = event.request;
  const url = request.url;
  try {
    const { searchParams } = new URL(url);
    if (searchParams.get('sw-bypass')) {
      return;
    }
    if (checkURLForResourceRule(url)) {
      return event.respondWith(fetchResource(request));
    }
    if (!isNativeUpdateInProgress && checkURLForManifestRule(url)) {
      setTimeout(() => updateCacheSafely(manifestURL), 10 * 1000);
      return event.respondWith(fetchSpecificResource(request));
    }
  } catch (error) {
    console.error('💀 请求处理失败', error);
  }
});
// #endregion

// #region install
// NOTE: 处理 install 事件
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});
// #endregion

// #region activate
// NOTE: 处理 activate 事件
self.addEventListener('activate', (event) => {
  console.log('🥳 新 sw 激活成功');
  setTimeout(() => updateCacheSafely(manifestURL), 10 * 1000);
  event.waitUntil(self.clients.claim());
});

// #endregion

// #region message
// 遍历所有窗口客户端并发送消息
const broadcastMessage = async (message) => {
  try {
    (
      await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })
    ).forEach((client) => client.postMessage(message));
  } catch (error) {
    console.error('broadcast error: ', error);
  }
};
const activateNativeVersion = async (data) => {
  isNativeUpdateInProgress = true;
  const cacheVersions = await processAndCache('cached-versions', (versions) =>
    (versions || []).concat({
      version: data.version,
      date: data.date,
      manifest: data,
      active: false,
    })
  );
  await switchManifestVersion(data.version);
  broadcastMessage({ type: 'NATIVE_CACHED' });
  console.log('🎉 成功激活 native 版本' + data.version);
  isNativeUpdateInProgress = false;
};
// NOTE: 处理 message 事件
self.addEventListener('message', async (event) => {
  const message = event.data;
  try {
    switch (message.type) {
      case 'SERVER_INFO':
        await activateNativeVersion(message.body);
        break;
      default:
        console.log('未处理的 sw 消息类型' + message.type);
        break;
    }
  } catch (error) {
    console.error('💀 sw 消息处理失败', error);
  }
});
// #endregion

// 定时执行更新缓存任务
setTimeout(() => updateCacheSafely(manifestURL), 1000 * 60 * 0.5);
