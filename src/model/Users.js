import bcrypt from 'bcrypt';
import MongoCollection from '../lib/mongo';

class Users extends MongoCollection {

  async insertOne({ email, password, ...rest }) {
    // make sure this email doesn't already exist
    const user = await this.collection.findOne({ email: email.toLowerCase() });

    if (user) {
      throw new Error(`User with email ${email} already exists`);
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
