import mongoose from 'mongoose';
import { Environment } from '../common';
import { IssuesModel, RolesModel, UsersModel } from '../resources';

class Database {
  constructor () {
    this.connect = this.connect.bind(this);
  }

  async connect (): Promise<void> {
    await mongoose.connect(Environment.getDBUri(), {
      dbName: Environment.getDBName(),
      user: Environment.getDBUsername(),
      pass: Environment.getDBPassword()
    });

    this.registerModels();
  }

  close (): void {
    mongoose.disconnect();
  }

  registerModels (): void {
    mongoose.model('users', UsersModel);
    mongoose.model('roles', RolesModel);
    mongoose.model('issues', IssuesModel);
  }
}

export default Database;
