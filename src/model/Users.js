import bcrypt from 'bcrypt';
import MongoCollection from '../lib/mongo';
import { Logger } from '../server/logger';

class Users extends MongoCollection {

  async insertOne({ email, password, ...rest }) {
    // make sure this email doesn't already exist
    const user = await this.collection.findOne({ email: email.toLowerCase() });

    if (user) {
      const msg = `User with email ${email} already exists`;
      Logger.error(msg);
      throw new Error(msg);
    }

    // hash the password
    const hash = await bcrypt.hash(password, 10);

    const docToInsert = Object.assign({}, rest, {
      hash,
      email: email.toLowerCase()
    });

    // do the rest of the standard insert
    return super.insertOne(docToInsert);
  }
}

export default Users;
