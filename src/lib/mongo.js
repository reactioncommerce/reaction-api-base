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

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    this.pubsub.publish(`${this.typeSingular}Inserted`, await this.findOneById(id));
    return id;
  }

  async update(query, doc) {
    const result = await this.collection.update(query, {
      $set: Object.assign({}, doc, {
        updatedAt: new Date().toISOString()
      })
    });
    this.loader.clear(id);
    this.pubsub.publish(`${this.typeSingular}Updated`, await this.findOneById(id));
    return result;
  }

  async updateById(id, doc) {
    const result = await this.collection.update({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: new Date().toISOString()
      })
    });
    this.loader.clear(id);
    this.pubsub.publish(`${this.typeSingular}Updated`, await this.findOneById(id));
    return result;
  }

  async remove(query) {
    const result = await this.collection.findOneAndDelete(query);
    this.loader.clear(result.value._id);
    this.pubsub.publish(`${this.typeSingular}Removed`, result.value._id);
    return result;
  }

  async removeById(_id) {
    const result = await this.collection.deleteOne({ _id });
    this.loader.clear(_id);
    this.pubsub.publish(`${this.typeSingular}Removed`, _id);
    return result;
  }

  find(query = {}, options = { limit: 50, skip: 0, sort: { createdAt: 1 } }) {
    const { limit, skip, sort } = options;
    return this.collection.find(query).limit(limit).skip(skip).sort(sort).toArray();
  }

  findOne(query = {}, options = {}) {
    return this.collection.findOne(query, options);
  }

  findOneById(id) {
    return this.loader.load(id);
  }
}
