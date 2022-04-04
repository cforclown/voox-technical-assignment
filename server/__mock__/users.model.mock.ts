export class MockUsersModel {
  static mockModelAggregate: jest.Mock = jest.fn();
  static mockModelDeleteOne: jest.Mock = jest.fn();
  static mockModelExec: jest.Mock = jest.fn();
  static mockModelFindById: jest.Mock = jest.fn();
  static mockModelFindOne: jest.Mock = jest.fn();
  static mockModelPopulate: jest.Mock = jest.fn();
  static mockModelSave: jest.Mock= jest.fn();
  static mockModelCreate: jest.Mock= jest.fn();
  static mockModelSelect: jest.Mock = jest.fn();
  static mockModelUpdateMany: jest.Mock = jest.fn();
  static mockModelUpdateOne: jest.Mock = jest.fn();
  payload: any;

  constructor (payload: any) {
    this.payload = payload;
  }

  public save = (): void => MockUsersModel.mockModelSave();

  static exec = (payload: any): void => this.mockModelExec(payload);
  static select = (payload: any): void => this.mockModelSelect(payload);
  static findOne = (payload: any): void => this.mockModelFindOne(payload);
  static findById = (payload: any): void => this.mockModelFindById(payload);
  static updateOne = (payload: any): void => this.mockModelUpdateOne(payload);
  static updateMany = (payload: any): void => this.mockModelUpdateMany(payload);
  static aggregate = (payload: any): void => this.mockModelAggregate(payload);
  static populate = (payload: any): void => this.mockModelPopulate(payload);
  static save = (payload: any): void => this.mockModelSave(payload);
  static create = (payload: any): void => this.mockModelCreate(payload);
  static deleteOne = (payload: any): void => this.mockModelDeleteOne(payload);
}
