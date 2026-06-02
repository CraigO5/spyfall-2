import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { WebSocketApi, WebSocketStage } from "aws-cdk-lib/aws-apigatewayv2";
import { WebSocketLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a dynamoDB table belonging to this stack
    // Connections used by CDK to track the resource (the name of the table)
    // Const table saves a reference to the table in a variable
    const table = new dynamodb.Table(this, "Connections", {
      // partitionKey shows how each row is uniquely identified
      partitionKey: {
        name: "connectionId",
        type: dynamodb.AttributeType.STRING,
      },
      // Billing mode enables on demand pricing
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // When you tear down the stack, delete the table
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Second way to query the same table with a different key (by lobbyCode)
    // CDK auto builds the index
    table.addGlobalSecondaryIndex({
      indexName: "byLobby",
      partitionKey: { name: "lobbyCode", type: dynamodb.AttributeType.STRING },
    });

    // When a player connects to a lobby
    const connectFn = new NodejsFunction(this, "ConnectFn", {
      entry: path.join(__dirname, "../lambda/connect.ts"),
      runtime: Runtime.NODEJS_20_X,
      // Passes table's real name (auto generated) into function as env variable
      // Handler processes it via
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // When a player disconnects from a lobby
    const disconnectFn = new NodejsFunction(this, "DisconnectFn", {
      entry: path.join(__dirname, "../lambda/disconnect.ts"),
      runtime: Runtime.NODEJS_20_X,
      // Passes table's real name (auto generated) into function as env variable
      // Handler processes it via
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // When a player sends a message
    const defaultFn = new NodejsFunction(this, "DefaultFn", {
      entry: path.join(__dirname, "../lambda/default.ts"),
      runtime: Runtime.NODEJS_20_X,
      // Passes table's real name (auto generated) into function as env variable
      // Handler processes it via
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Function read/write only to this table
    table.grantReadWriteData(connectFn);
    table.grantReadWriteData(disconnectFn);

    // Websocket API
    const wsApi = new WebSocketApi(this, "LobbyWs", {
      // When $connect fires, run connectFn
      connectRouteOptions: {
        // WebSocketLambdaIntegration: Wire from route to lambda
        integration: new WebSocketLambdaIntegration(
          "ConnectIntegration",
          connectFn,
        ),
      },
      // When $disconnect fires, run disconnectFn
      disconnectRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DisconnectIntegration",
          disconnectFn,
        ),
      },
      defaultRouteOptions: {
        integration: new WebSocketLambdaIntegration(
          "DefaultIntegration",
          defaultFn,
        ),
      },
    });

    // Creates deployment at a URL path
    const stage = new WebSocketStage(this, "ProdStage", {
      webSocketApi: wsApi,
      stageName: "prod",
      // Route changes live automatically, giving you the wss:// address
      autoDeploy: true,
    });

    table.grantReadWriteData(defaultFn);
    wsApi.grantManageConnections(defaultFn); // Lets our message websocket api push to connections
    wsApi.grantManageConnections(connectFn); // Lets our connect websocket push to connections
    wsApi.grantManageConnections(disconnectFn); // Lets our connect websocket push to connections
    defaultFn.addEnvironment("WS_ENDPOINT", stage.callbackUrl); // Tells it where to push (WS_ENDPOINT)
    connectFn.addEnvironment("WS_ENDPOINT", stage.callbackUrl);
    disconnectFn.addEnvironment("WS_ENDPOINT", stage.callbackUrl);

    // Prints the websocket URL value for ease of use
    new cdk.CfnOutput(this, "WebSocketURL", { value: stage.url });
  }
}
