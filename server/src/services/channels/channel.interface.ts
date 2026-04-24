export interface AlertPayload {
    incidentId: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    targetData: Record<string, any>;
}

export interface DeliveryReceipt {
    success: boolean;
    provider: string;
    timestamp: Date;
    error?: string;
    metadata?: any;
}

export interface AlertChannel {
    name: string;
    send(payload: AlertPayload): Promise<DeliveryReceipt>;
    healthCheck(): Promise<boolean>;
}
