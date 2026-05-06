/**
 * Revisa la vigencia del cache.
 * 
 * @function cacheServices
 * 
 * @param {Object} cache - Cache
 * @param {Object} cache.data - Informacion del cache
 * @param {Number} cache.ttl - Vigencia del cache
 * @param {Date} cache.lastTtl - Inicio de vigencia del cache
 * 
 * @returns {Boolean} Comparacion de la vigencia
 * - true si el cache sigue vigente
 * - false si el cache no tiene datos o ya vencio
 * 
 * @description
 * - Valida la vigencia del cache
 */
export const cacheServices = (cache) => {
    //Si cache.data esta vacio devuelve false
    if (!cache.data) return false;
    const now = Date.now();
    //Compara la vigencia del cache y devuelve su resultado
    return (now - cache.lastTtl) < cache.ttl;
}