import TokenOptionsInterface from 'App/Common/TypeChecking/OtpToken/TokenOptionsInterface'

type EmailOtpTokenCreationOptionsType = Pick<TokenOptionsInterface, 'token' | 'tokenType' | 'email'>

export default EmailOtpTokenCreationOptionsType
