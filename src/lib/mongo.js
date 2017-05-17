import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';

export default class MongoCollection {

  constructor(type, context) {
    if (!type || !context) {
      throw new Error('MongoCollection constructor requires a type string and context object');
    }
    this.type = type;
    this.typeSingular = type.slice(-1) === 's' ? type.slice(0, -1) : type;
    this.context = context;
    this.pubsub = context.pubsub;
    this.collection = context.db.collection(type);
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    this.pubsub.publish(`${this.typeSingular}Inserted`, await this.findOneById(id));
    return id;
  }

  async update(query, doc) {
    const result = await this.collection.update(query, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now()
      })
    });
    this.loader.clear(id);
    this.pubsub.publish(`${this.typeSingular}Updated`, await this.findOneById(id));
    return result;
  }

  async updateById(id, doc) {
    const result = await this.collection.update({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now()
      })
    });
    this.loader.clear(id);
    this.pubsub.publish(`${this.typeSingular}Updated`, await this.findOneById(id));
    return result;
  }

  async removeById(id) {
    const result = await this.collection.remove({ _id: id });
    this.loader.clear(id);
    this.pubsub.publish(`${this.typeSingular}Removed`, id);
    return result;
  }

  find(query = {}, options = { limit: 50 }) {
    return this.collection.find(query).sort({ createdAt: 1 }).limit(options.limit).toArray();
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  all({ lastCreatedAt = 0, limit = 20 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt }
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }
}
