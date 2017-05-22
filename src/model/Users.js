import bcrypt from 'bcrypt';
import MongoCollection from '../lib/mongo';

const SALT_ROUNDS = 10;

class Users extends MongoCollection {

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const id = (await this.collection.insertOne(docToInsert)).insertedId;

    this.pubsub.publish('userInserted', await this.findOneById(id));

    return id;
  }
}

export default Users;
