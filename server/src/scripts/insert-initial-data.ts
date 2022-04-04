import { model } from 'mongoose';
import { Logger } from '../common';
import Database from '../database';
import { admin, adminRole } from '../templates/initial-data';
import data from './data.json';

/**
 * this scripts will do nothing when there already role in roles collection
 */
async function insertInitialData (): Promise<void> {
  try {
    const database = new Database();
    await database.connect();

    const rolesModel = model('roles');
    const usersModel = model('users');
    const issuesModel = model('issues');
    if ((await rolesModel.find({}).exec()).length === 0) {
      const roleDoc = await rolesModel.create(adminRole);
      const userDoc = await usersModel.create(admin);
      await Promise.all([roleDoc.save(), userDoc.save()]);
      await issuesModel.create(data);
    }
    Logger.success('Done !');
  } catch (err) {
    Logger.error('Insert initial data failed!');
    if (err instanceof Error) {
      Logger.error(err.message);
    }
  }
}

insertInitialData().then(() => process.exit());
