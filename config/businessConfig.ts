import Env from '@ioc:Adonis/Core/Env'
import { DateTime } from 'luxon'

const businessConfig = {
  businessName: Env.get('BUSINESS_NAME'),

  initialCustomerWalletBalance: Env.get('INITIAL_CUSTOMER_WALLET_BALANCE'),

  otpTokenExpirationTimeFrame: Env.get('OTP_TOKEN_EXPIRES_IN_X_MINUTES'),

  accessTokenExpirationTimeFrame: Env.get('ACCESS_TOKEN_EXPIRES_IN_X_MINUTES'),

  otpTokenLength: Env.get('OTP_TOKEN_LENGTH'),

  dateTimeFormat: Env.get('DATE_TIME_FORMAT'),

  emailSenderName: Env.get('DEFAULT_EMAIL_SENDER_NAME'),

  emailSenderAddress: Env.get('DEFAULT_EMAIL_SENDER_ADDRESS'),

  cacheDataValidity: Env.get('CACHE_DATA_VALIDITY'),

  currentDateTime: () => DateTime.now(),

  infrastructureProviders: {
    currentEmailProvider: Env.get('CURRENT_EMAIL_PROVIDER'),

    currentBvnVerificationProvider: Env.get('CURRENT_BVN_VERIFICATION_PROVIDER'),
  },

  customEncryptionKey: Env.get('CUSTOM_ENCRYPTION_KEY'),

  maximumLoginAttempts: Env.get('MAXIMUM_LOGIN_ATTEMPTS'),

  dateOfBirthFormat: Env.get('DATE_OF_BIRTH_FORMAT'),

  walletPrefix: Env.get('WALLET_PREFIX'),

  walletAccountNumberLength: Env.get('WALLET_ACCOUNT_NUMBER_LENGTH'),

  transactionReferencePrefix: Env.get('TRANSACTION_REFERENCE_PREFIX'),

  transactionReferenceCharacterLength: Env.get('TRANSACTION_REFERENCE_CHARACTER_LENGTH'),

  walletPinLength: Env.get('WALLET_PIN_LENGTH'),

  bvnLength: Env.get('BVN_LENGTH'),

  customerCodePrefix: Env.get('CUSTOMER_CODE_PREFIX'),

  customerCodeLength: Env.get('CUSTOMER_CODE_LENGTH'),

  referralCodeLength: Env.get('REFERRAL_CODE_LENGTH'),

  dbConnection: Env.get('DB_CONNECTION'),

  seededAdminPassword: Env.get('SEEDED_ADMIN_PASSWORD'),

  sentry: {
    dsn: Env.get('SENTRY_DSN'),
    environment: Env.get('NODE_ENV'),
    release: `akiba.[${Env.get('NODE_ENV')}]: ${Env.get('CURRENT_PROJECT_RELEASE')}`,
  },
}

export default businessConfig
