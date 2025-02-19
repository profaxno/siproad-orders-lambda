export interface Body {
  Type:             string;
  MessageId:        string;
  TopicArn:         string;
  Message:          string;
  Timestamp:        Date;
  UnsubscribeURL:   string;
  SignatureVersion: string;
  Signature:        string;
  SigningCertURL:   string;
}