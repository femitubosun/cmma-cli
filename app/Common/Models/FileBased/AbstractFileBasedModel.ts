/**
 |--------------------------------------------------------------------------------|
 | Custom Type Definitions
 |--------------------------------------------------------------------------------|
 */
type DataObjectType = Record<string, string | number | boolean>[]
type ObjectValueType = string | number | boolean

abstract class AbstractFileBasedModel {
  protected dataObject: DataObjectType

  constructor(dataObject: DataObjectType) {
    this.dataObject = dataObject
  }

  /**
   |--------------------------------------------------------------------------------|
   | Private Method to fetch All Data from the Data Object
   |--------------------------------------------------------------------------------|
   */
  #getAllData: Function = () => {
    const newDataObject: DataObjectType = JSON.parse(JSON.stringify(this.dataObject))
    return newDataObject
  }

  /**
   |--------------------------------------------------------------------------------|
   | Private Method to fetch a record by the ID key
   |--------------------------------------------------------------------------------|
   */
  #getDataById: Function = (id: number) => {
    return this.#getDataByKeyName('id', id)
  }

  /**
   |--------------------------------------------------------------------------------|
   | Private Method to fetch a record by the custom key & value comparison
   |--------------------------------------------------------------------------------|
   */
  #getDataByKeyName: Function = (keyName: string, value: ObjectValueType) => {
    const newDataObject: DataObjectType = JSON.parse(JSON.stringify(this.dataObject))
    return this.#deepFilter(newDataObject, keyName, value)
  }

  /**
   |--------------------------------------------------------------------------------|
   | Private Method to filter a nested object, one level deep
   |--------------------------------------------------------------------------------|
   */
  #deepFilter: Function = (
    dataObject: DataObjectType,
    fieldKey: string,
    value: ObjectValueType
  ): object => {
    return dataObject.filter((eachObj) => eachObj[fieldKey] === value)[0]
  }

  /**
   * Fetch all Records
   */
  public all: Function = this.#getAllData

  /**
   * Fetch a record by the given ID
   */
  public find: Function = this.#getDataById

  /**
   * Fetch the first record that matches the given Key-Value pair
   */
  public findBy: Function = this.#getDataByKeyName
}

export default AbstractFileBasedModel
