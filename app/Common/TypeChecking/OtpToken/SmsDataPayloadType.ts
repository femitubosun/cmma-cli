type SmsDataPayloadType = {
  /**
   * The Mobile Number to receive the SMS
   */
  recipientMobileNumber: string

  /**
   * The Actual SMS Message
   */
  smsMessage: string
}

export default SmsDataPayloadType
