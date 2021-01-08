'use strict';

import * as AWS from 'aws-sdk';

import { Constants } from './Constants';
import { AWSError } from 'aws-sdk';

class DDBController {

    private ddbService = new AWS.DynamoDB({
        endpoint: 'http://localhost:8000'
    });

    private documentClient = new AWS.DynamoDB.DocumentClient(Constants.useLocalDB ? {
        service: this.ddbService
    } : {});

    async getFromDDB(userId): Promise<AWS.DynamoDB.Types.DocumentClient.GetItemOutput> {
        return new Promise<AWS.DynamoDB.Types.DocumentClient.GetItemOutput>((resolve, reject) => {
            var params : AWS.DynamoDB.Types.DocumentClient.GetItemInput = {
                TableName: Constants.jingle.databaseTable,
                Key: {
                    userId: userId
                }
            };

            this.documentClient.get(params, (err : AWSError, data : AWS.DynamoDB.Types.DocumentClient.GetItemOutput) => {
                if (err) {
                    if ( ! (err.code == 'ResourceNotFoundException' && Constants.useLocalDB) ) {
                        console.log("Error when calling DynamoDB");
                        console.log(err, err.stack); // an error occurred
                    }
                    reject(err);
                } else {
                    //console.log(data); // successful response
                    resolve(data);
                }
            });
        });
    }

    async insertOrUpdateDDB(userId): Promise<AWS.DynamoDB.Types.DocumentClient.UpdateItemOutput> {

        return new Promise<AWS.DynamoDB.Types.DocumentClient.UpdateItemOutput>((resolve, reject) => {

            var params : AWS.DynamoDB.Types.DocumentClient.UpdateItemInput = {
                TableName: Constants.jingle.databaseTable,
                Key: {
                    userId: userId
                },
                UpdateExpression: "SET lastPlayed = :time ADD playedCount :val",
                ExpressionAttributeValues: {
                    ":val": 1,
                    ":time": Math.round(new Date().getTime())
                }
            };

            this.documentClient.update(params, (err : AWSError, data : AWS.DynamoDB.Types.DocumentClient.UpdateItemOutput) => {
                if (err) {
                    console.log("Error when calling DynamoDB");
                    console.log(err, err.stack); // an error occurred
                    reject(err);
                } else {
                    // console.log(data); // successful response
                    resolve(data);
                }
            });
        });
    }

    /*
     * Used for unit testing only, to prepare the database before the test
     */
    async deleteFromDDB(userId): Promise<AWS.DynamoDB.Types.DocumentClient.DeleteItemOutput> {

        return new Promise<AWS.DynamoDB.Types.DocumentClient.DeleteItemOutput>((resolve, reject) => {

            var params : AWS.DynamoDB.Types.DocumentClient.DeleteItemInput = {
                TableName: Constants.jingle.databaseTable,
                Key: {
                    userId: userId
                }
            };

            this.documentClient.delete(params, (err : AWSError, data : AWS.DynamoDB.Types.DocumentClient.DeleteItemOutput) => {
                if (err) {
                    console.log("Error when deleting item from DynamoDB");
                    console.log(err, err.stack); // an error occurred
                    reject(err);
                } else {
                    // console.log(data); // successful response
                    resolve(data);
                }
            });
        });
    }

    /*
     * Used for unit testing only, to prepare the database before the test
     */
    async createTable() : Promise<AWS.DynamoDB.Types.CreateTableOutput> {

        return new Promise<AWS.DynamoDB.Types.CreateTableOutput>((resolve, reject) => {
            
            var params : AWS.DynamoDB.Types.CreateTableInput = {
                TableName: Constants.jingle.databaseTable,
                AttributeDefinitions: [{
                        AttributeName: 'userId',
                        AttributeType: 'S'
                }],
                KeySchema: [{
                        KeyType: 'HASH',
                        AttributeName: 'userId'
                }],
                BillingMode: "PAY_PER_REQUEST"
            };

            this.ddbService.createTable(params, (err : AWSError, data : AWS.DynamoDB.CreateTableOutput) => {
                if (err) {
                    console.log("Error when creating table");
                    console.log(err, err.stack); // an error occurred
                    reject(err);
                } else {
                    // console.log(data); // successful response
                    resolve(data);
                }
            });
        });
    }
}

export const ddb = new DDBController();
