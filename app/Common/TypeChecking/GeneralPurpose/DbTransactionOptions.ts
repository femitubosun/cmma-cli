import { TransactionClientContract } from '@ioc:Adonis/Lucid/Database'

type DbTransactionOptions =
  | {
      /**
       * Defines that the operation uses a database transaction
       */
      useTransaction: true

      /**
       * Transaction Client type
       */
      dbTransaction: TransactionClientContract
    }
  | {
      /**
       * Defines that operation does not use a database transaction
       */
      useTransaction: false
    }

export default DbTransactionOptions
