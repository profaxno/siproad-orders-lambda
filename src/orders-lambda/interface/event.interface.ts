export interface Event {
    Records: Record[];
}

export interface Record {
    messageId:         string;
    receiptHandle:     string;
    body:              string;
    attributes:        Attributes;
    messageAttributes: MessageAttributes;
    md5OfBody:         string;
    eventSourceARN:    string;
    eventSource:       string;
    awsRegion:         string;
}

export interface Attributes {
    SenderId:                         string;
    SentTimestamp:                    string;
    ApproximateReceiveCount:          string;
    ApproximateFirstReceiveTimestamp: string;
}

export interface MessageAttributes {
}
