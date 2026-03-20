export const cacheServices = (cache) => {
    if (!cache.data) return false;
    const now = Date.now();
    
    return now - cache.lastTtl < cache.ttl;
}