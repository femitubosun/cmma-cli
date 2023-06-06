import DbTransactionOptions from 'App/Common/TypeChecking/GeneralPurpose/DbTransactionOptions'

/*
|-------------------------------------------------------------------------------
| The Generic Shape of the object passed into the create method of Action Classes
|-------------------------------------------------------------------------------
*/
type DeleteRecordGeneric<RecordIdentifierOptions, DeletePayloadType> = {
  /**
   * This value defines the data to fetch the record with.
   */
  identifierOptions: RecordIdentifierOptions

  /**
   * This value defines the data to delete the record with.
   */
  deletePayload?: DeletePayloadType

  /**
   * This value defines the database transaction options.
   */
  dbTransactionOptions: DbTransactionOptions
}

export default DeleteRecordGeneric
