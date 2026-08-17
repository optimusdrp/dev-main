import dynalite from 'dynalite';
import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
  DescribeTableCommand,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const DYNALITE_PORT = 4567;
let dynaliteServer: any = null;

export const rawDbClient = new DynamoDBClient({
  endpoint: `http://localhost:${DYNALITE_PORT}`,
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
  },
});

export const docClient = DynamoDBDocumentClient.from(rawDbClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export async function initDynaliteDatabase() {
  return new Promise<void>((resolve, reject) => {
    if (dynaliteServer) {
      return resolve();
    }

    dynaliteServer = dynalite({ createTableMs: 0 });
    dynaliteServer.listen(DYNALITE_PORT, async (err: any) => {
      if (err) {
        console.error('[Dynalite DynamoDB] Error starting local database server:', err);
        return reject(err);
      }
      console.log(`[Dynalite DynamoDB] Local DynamoDB server listening on port ${DYNALITE_PORT}`);

      try {
        await createTablesIfNotExist();
        resolve();
      } catch (setupErr) {
        console.error('[Dynalite DynamoDB] Error creating tables:', setupErr);
        reject(setupErr);
      }
    });
  });
}

async function createTablesIfNotExist() {
  const existingTablesResponse = await rawDbClient.send(new ListTablesCommand({}));
  const existingTables = existingTablesResponse.TableNames || [];

  const tablesToCreate = [
    {
      TableName: 'Patients',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'ChatMessages',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'Appointments',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'PriorityRules',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'AutomationRules',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'EHRIntegrations',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'AuditLogs',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'RolePermissions',
      KeySchema: [{ AttributeName: 'role', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'role', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'Webhooks',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
    {
      TableName: 'WebhookLogs',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
  ];

  for (const tableConfig of tablesToCreate) {
    if (!existingTables.includes(tableConfig.TableName)) {
      await rawDbClient.send(new CreateTableCommand(tableConfig as any));
      console.log(`[Dynalite DynamoDB] Created table '${tableConfig.TableName}'`);
    }
  }
}
