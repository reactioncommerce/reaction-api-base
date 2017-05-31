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
    this.loader = new DataLoader((ids) => findByIds(this.collection, ids));
  }

  async insertOne(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    this.pubsub.publish(
      `${this.typeSingular}Created`,
      { [`${this.typeSingular}Created`]: await this.findOneById(id) }
    );
    return id;
  }

  async insertMany(docs) {
    const docsToInsert = [];
    docs.forEach((doc) => {
      docsToInsert.push(Object.assign({}, doc, {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    });
    const ids = (await this.collection.insertMany(docsToInsert)).insertedIds;
    ids.forEach(async (id) => {
      this.pubsub.publish(
        `${this.typeSingular}Created`,
        { [`${this.typeSingular}Created`]: await this.findOneById(id) }
      );
    });
    return ids;
  }

  async updateOne(query, updates) {
    const result = await this.collection.findOneAndUpdate(query, {
      $set: Object.assign({}, updates, {
        updatedAt: new Date().toISOString()
      })
    });
    this.loader.clear(result.value._id);
    this.pubsub.publish(
      `${this.typeSingular}Updated`,
      { [`${this.typeSingular}Updated`]: await this.findOneById(result.value._id) }
    );
    return result;
  }

  async updateMany(query, updates) {
    const docs = await this.find(query);
    const result = await this.collection.updateMany(query, {
      $set: Object.assign({}, updates, {
        updatedAt: new Date().toISOString()
      })
    });
    this.loader.clearAll();
    const ids = docs.map((d) => d._id);
    this.findManyById(ids);
    ids.forEach(async (id) => {
      this.pubsub.publish(
        `${this.typeSingular}Updated`,
        { [`${this.typeSingular}Updated`]: await this.findOneById(id) }
      );
    });
    return result;
  }

  async updateById(_id, updates) {
    const result = await this.collection.updateOne({ _id }, {
      $set: Object.assign({}, updates, {
        updatedAt: new Date().toISOString()
      })
    });
    this.loader.clear(_id);
    this.pubsub.publish(
      `${this.typeSingular}Updated`,
      { [`${this.typeSingular}Updated`]: await this.findOneById(_id) }
    );
    return result;
  }

  async removeOne(filter, options) {
    const result = await this.collection.findOneAndDelete(filter, options);
    this.loader.clear(result.value._id);
    this.pubsub.publish(
      `${this.typeSingular}Removed`,
      { [`${this.typeSingular}Removed`]: result.value._id }
    );
    return result;
  }

  async removeMany(filter, options) {
    const docs = await this.find(filter, options);
    const result = await this.collection.deleteMany(filter, options);
    docs.forEach((d) => {
      this.loader.clear(d._id);
      this.pubsub.publish(
        `${this.typeSingular}Removed`,
        { [`${this.typeSingular}Removed`]: d._id }
      );
    });
    return result;
  }

  async removeById(_id) {
    const result = await this.collection.deleteOne({ _id });
    this.loader.clear(_id);
    this.pubsub.publish(
      `${this.typeSingular}Removed`,
      { [`${this.typeSingular}Removed`]: _id }
    );
    return result;
  }

  find(query = {}, options = { limit: 50, skip: 0, sort: { createdAt: 1 } }) {
    const { limit, skip, sort } = options;
    return this.collection.find(query).limit(limit).skip(skip).sort(sort).toArray();
  }

  findOne(query = {}, options = {}) {
    if (query._id) {
      return this.findOneById(query._id);
    }
    return this.collection.findOne(query, options);
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  findManyById(ids) {
    return this.loader.loadMany(ids);
  }
}
