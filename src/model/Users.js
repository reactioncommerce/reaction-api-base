import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

class Users {

  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('users');
    this.pubsub = context.pubsub;
    this.loader = new DataLoader((ids) => findByIds(this.collection, ids));
  }

  async insert(doc) {
    const { email, password, ...rest } = doc;

    const user = await this.collection.findOne({ email: email.toLowerCase() });

    if (user) {
      throw new Error(`User with email ${email} already exists`);
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const docToInsert = Object.assign({}, rest, {
      hash,
      email: email.toLowerCase(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    const id = (await this.collection.insertOne(docToInsert)).insertedId;

    this.pubsub.publish('userInserted', await this.findOneById(id));

    return id;
  }

  async updateById(_id, doc) {
    const result = await this.collection.update({ _id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now()
      })
    });
    this.loader.clear(_id);
    this.pubsub.publish('userUpdated', await this.findOneById(_id));
    return result;
  }

  async removeById(_id) {
    const result = this.collection.remove({ _id });
    this.loader.clear(_id);
    this.pubsub.publish('userRemoved', _id);
    return result;
  }

  find(query = {}, options = { limit: 50 }) {
    return this.collection.find(query).sort({ createdAt: 1 }).limit(options.limit).toArray();
  }

  findOneById(_id) {
    return this.loader.load(_id);
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt }
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }
}

export default Users;
