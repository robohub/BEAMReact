import isArray from 'lodash/isArray'
import isPlainObject from 'lodash/isPlainObject'
import { InMemoryCache } from 'apollo-cache-inmemory'

/**
 * Recursively delete all properties matching with the given predicate function in the given value
 * @param {Object} value
 * @param {Function} predicate
 * @return the number of deleted properties or indexes
 */
function deepDeleteAll(value, removeType, predicate) {
  let rels = []
  if (isArray(value)) {
    value.forEach((item, index) => {
    
      if (predicate(item)) {
        value.splice(index, 1)
      } else {
        rels = rels.concat(deepDeleteAll(item, removeType, predicate))
      }
    })
  } else if (isPlainObject(value)) {
    // console.log("-- PLAIN OBJECT --\n" + JSON.stringify(value, null, 2) + "\n")
    Object.keys(value).forEach(key => {
      if (predicate(value[key])) {
        if (removeType !== "BizRelation" && value.id && value.__typename === 'BizRelation') {
//            console.log("HITTADE en BIZRELATION" + JSON.stringify(value, null, 2))
            // Save for deletion later
            rels.push("BizRelation:" + value.id)
            rels.push(value.oppositeRelation.id)
        } else if (value.id && value.__typename === 'BizAttribute') {
            // BizAttribute should be added for delete as well, doesn't affect anything yet!
            // Anything else? Check data model...
        } else {
            console.log("VALUE2: " + JSON.stringify(value, null, 2))
            console.log("Deleting: " + JSON.stringify(value[key], null, 2))   // {"type":"id","generated":false,"id":"BusinessObject:cjvggpg65rx490b22044zd74m","typename":"BusinessObject"}
            delete value[key]
        }
      } else {
        rels= rels.concat(deepDeleteAll(value[key], removeType, predicate))
      }
    })
  }
  return rels
}

export function BODeleteFromCache(cache, entry) {
    const id = cache.config.dataIdFromObject(entry)

    console.log("Id for deletion: In: " + entry + " Converted: " + id);

    // delete all entry references from cache + bizRelations existing in cache
    var bizRelationsToDelete = deepDeleteAll(cache.data.data, "BusinessObject", ref => ref && (ref.type === 'id' && ref.id === id))
    console.log("BizRelationer för borttagning: " + bizRelationsToDelete);

    bizRelationsToDelete.map(brId => {
        deepDeleteAll(cache.data.data, "BizRelation", ref => ref && (ref.type === 'id' && ref.id === brId))
        cache.data.delete(brId)
    })
  
    // delete entry from cache (and trigger UI refresh)
    cache.data.delete(id)
}    

export const removeBusinessObjectsFromCache = (cache) => {
    const { ROOT_QUERY } = cache.data.data
    const newROOT = Object.keys(ROOT_QUERY).reduce((acc, d) => {
        if (d.match(/businessObjects*/)) {
            return acc
      }
      return { ...acc, [d]: ROOT_QUERY[d]}
    }, {})
    cache.data.data.ROOT_QUERY = newROOT
    // return newROOT
    console.log("New ROOT_QUERY: " + JSON.stringify(newROOT, null, 2))                

  }